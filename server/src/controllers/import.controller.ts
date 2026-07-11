import { Request, Response } from 'express';
import { parseCsv } from '../services/csv.service';
import { AiService } from '../services/ai.service';
import { validateCsvFile } from '../utils/validation';
import { ImportResult, ApiError } from '../types';

let aiService: AiService | null = null;

function getAiService(): AiService {
  if (!aiService) {
    aiService = new AiService();
  }
  return aiService;
}

/**
 * Handle CSV import: parse file, extract with AI, return structured results.
 */
export async function handleImport(
  req: Request,
  res: Response<ImportResult | ApiError>
): Promise<void> {
  try {
    // 1. Validate file
    const file = req.file;
    const validationError = validateCsvFile(file);
    if (validationError || !file) {
      res.status(400).json({
        success: false,
        error: validationError || 'No file uploaded',
      });
      return;
    }

    console.log(
      `Received file: ${file.originalname} (${(file.size / 1024).toFixed(1)}KB)`
    );

    // 2. Parse CSV
    const { rows, headers, errors } = parseCsv(file.buffer);

    if (rows.length === 0) {
      res.status(400).json({
        success: false,
        error: 'CSV file is empty or could not be parsed',
        details: errors.length > 0 ? errors.join('; ') : undefined,
      });
      return;
    }

    console.log(
      `Parsed ${rows.length} rows with ${headers.length} columns: [${headers.join(', ')}]`
    );

    if (errors.length > 0) {
      console.warn(`Parse warnings: ${errors.join('; ')}`);
    }

    // 3. AI Extraction
    console.log('Starting AI extraction...');
    const startTime = Date.now();

    const { records, skipped } = await getAiService().extractRecords(rows, headers);

    const duration = ((Date.now() - startTime) / 1000).toFixed(1);
    console.log(
      `AI extraction complete in ${duration}s: ${records.length} imported, ${skipped.length} skipped`
    );

    // 4. Build response
    const totalRows = rows.length;
    const imported = records.length;
    const skippedCount = skipped.length;
    const successRate =
      totalRows > 0 ? Math.round((imported / totalRows) * 100) : 0;

    const result: ImportResult = {
      success: true,
      data: {
        records,
        skipped,
        stats: {
          totalRows,
          imported,
          skipped: skippedCount,
          successRate,
        },
      },
    };

    res.json(result);
  } catch (error) {
    console.error('Import error:', error);

    const message =
      error instanceof Error ? error.message : 'Unknown error occurred';

    res.status(500).json({
      success: false,
      error: 'Failed to process CSV import',
      details: message,
    });
  }
}
