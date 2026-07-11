import { GoogleGenAI } from '@google/genai';
import { config } from '../config';
import { CrmRecord, CsvRow, SkippedRecord } from '../types';
import { buildExtractionPrompt } from '../prompts/extraction.prompt';
import { sanitizeCrmRecord, shouldSkipRecord } from '../utils/validation';

interface ExtractionResult {
  records: CrmRecord[];
  skipped: SkippedRecord[];
}

/**
 * AI extraction service using Google Gemini.
 * Processes CSV records in batches with retry mechanism.
 */
export class AiService {
  private client: GoogleGenAI;
  private model = 'gemini-2.5-flash-lite';

  constructor() {
    if (!config.geminiApiKey) {
      throw new Error(
        'GEMINI_API_KEY is not set. Please add it to your .env file.'
      );
    }
    this.client = new GoogleGenAI({ apiKey: config.geminiApiKey });
  }

  /**
   * Process all CSV records through AI extraction in batches.
   */
  async extractRecords(
    rows: CsvRow[],
    headers: string[]
  ): Promise<ExtractionResult> {
    const allRecords: CrmRecord[] = [];
    const allSkipped: SkippedRecord[] = [];

    // Use first few rows as samples for context
    const sampleRows = rows.slice(0, 5);

    // Process in batches
    const batches = this.createBatches(rows, config.batchSize);
    console.log(
      `Processing ${rows.length} rows in ${batches.length} batches of up to ${config.batchSize}...`
    );

    for (let i = 0; i < batches.length; i++) {
      const batch = batches[i];
      const batchStartRow = i * config.batchSize;

      console.log(
        `  Batch ${i + 1}/${batches.length} (${batch.length} rows)...`
      );

      try {
        const result = await this.processBatchWithRetry(
          batch,
          headers,
          sampleRows,
          batchStartRow,
          config.maxRetries
        );
        allRecords.push(...result.records);
        allSkipped.push(...result.skipped);
      } catch (error) {
        // If a batch completely fails after retries, skip all its records
        console.error(`  Batch ${i + 1} failed completely:`, error);
        batch.forEach((row, idx) => {
          allSkipped.push({
            row: batchStartRow + idx + 1, // 1-indexed
            reason: 'AI processing failed for this batch after all retries',
            originalData: row,
          });
        });
      }
    }

    return { records: allRecords, skipped: allSkipped };
  }

  /**
   * Process a single batch with exponential backoff retry.
   */
  private async processBatchWithRetry(
    batch: CsvRow[],
    headers: string[],
    sampleRows: CsvRow[],
    batchStartRow: number,
    maxRetries: number
  ): Promise<ExtractionResult> {
    let lastError: Error | null = null;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        return await this.processBatch(
          batch,
          headers,
          sampleRows,
          batchStartRow
        );
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));
        console.warn(
          `    Attempt ${attempt}/${maxRetries} failed: ${lastError.message}`
        );

        if (attempt < maxRetries) {
          const delay = Math.pow(2, attempt) * 1000; // 2s, 4s, 8s
          console.log(`    Retrying in ${delay / 1000}s...`);
          await this.sleep(delay);
        }
      }
    }

    throw lastError || new Error('All retries exhausted');
  }

  /**
   * Process a single batch through the AI model.
   */
  private async processBatch(
    batch: CsvRow[],
    headers: string[],
    sampleRows: CsvRow[],
    batchStartRow: number
  ): Promise<ExtractionResult> {
    const prompt = buildExtractionPrompt(headers, sampleRows, batch);

    const response = await this.client.models.generateContent({
      model: this.model,
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        temperature: 0.1, // Low temperature for consistent extraction
      },
    });

    const text = response.text;
    if (!text) {
      throw new Error('Empty response from AI model');
    }

    // Parse the AI response
    let parsed: any[];
    try {
      parsed = JSON.parse(text);
    } catch {
      // Try to extract JSON from the response
      const jsonMatch = text.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        parsed = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('Failed to parse AI response as JSON');
      }
    }

    if (!Array.isArray(parsed)) {
      throw new Error('AI response is not an array');
    }

    const records: CrmRecord[] = [];
    const skipped: SkippedRecord[] = [];

    parsed.forEach((item, idx) => {
      const rowNum = batchStartRow + idx + 1; // 1-indexed

      // Check if AI flagged it for skipping
      if (item._skip === true) {
        skipped.push({
          row: rowNum,
          reason: item._skip_reason || 'Flagged by AI for skipping',
          originalData: batch[idx] || {},
        });
        return;
      }

      // Sanitize and validate
      const sanitized = sanitizeCrmRecord(item);

      // Check skip criteria: no email AND no mobile
      if (shouldSkipRecord(sanitized)) {
        skipped.push({
          row: rowNum,
          reason: 'No email or mobile number found',
          originalData: batch[idx] || {},
        });
        return;
      }

      records.push(sanitized);
    });

    return { records, skipped };
  }

  /**
   * Split rows into batches of specified size.
   */
  private createBatches(rows: CsvRow[], batchSize: number): CsvRow[][] {
    const batches: CsvRow[][] = [];
    for (let i = 0; i < rows.length; i += batchSize) {
      batches.push(rows.slice(i, i + batchSize));
    }
    return batches;
  }

  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
