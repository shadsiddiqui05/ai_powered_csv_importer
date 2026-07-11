import Papa from 'papaparse';
import { CsvRow } from '../types';

interface ParseResult {
  rows: CsvRow[];
  headers: string[];
  errors: string[];
}

/**
 * Parses a CSV file buffer into structured rows.
 * Handles various delimiters, encodings, and edge cases.
 */
export function parseCsv(fileBuffer: Buffer): ParseResult {
  const content = fileBuffer.toString('utf-8');

  const result = Papa.parse<CsvRow>(content, {
    header: true,
    skipEmptyLines: true,
    transformHeader: (header: string) => header.trim(),
    transform: (value: string) => value.trim(),
  });

  const errors = result.errors
    .filter((e) => e.type !== 'FieldMismatch') // Allow ragged rows
    .map((e) => `Row ${e.row}: ${e.message}`);

  // Filter out completely empty rows
  const rows = result.data.filter((row) => {
    return Object.values(row).some((val) => val !== '' && val !== undefined);
  });

  const headers = result.meta.fields || [];

  return { rows, headers, errors };
}
