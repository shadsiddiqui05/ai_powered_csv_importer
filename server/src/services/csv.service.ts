import Papa from 'papaparse';
import * as XLSX from 'xlsx';
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

/**
 * Parses an Excel file buffer into structured rows.
 * Extracts the first worksheet and converts to JSON.
 */
export function parseExcel(fileBuffer: Buffer): ParseResult {
  let workbook;
  try {
    workbook = XLSX.read(fileBuffer, { type: 'buffer' });
  } catch (error) {
    return { rows: [], headers: [], errors: ['Failed to read Excel file format.'] };
  }

  if (workbook.SheetNames.length === 0) {
    return { rows: [], headers: [], errors: ['Excel file contains no sheets.'] };
  }

  const firstSheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[firstSheetName];
  
  const rawData = XLSX.utils.sheet_to_json<Record<string, any>>(worksheet, { defval: '' });

  if (rawData.length === 0) {
    return { rows: [], headers: [], errors: ['Excel sheet is empty.'] };
  }

  const headers = Object.keys(rawData[0]).map((h) => String(h).trim());
  const rows = rawData.map((row) => {
    const formattedRow: Record<string, string> = {};
    for (const key of Object.keys(row)) {
      formattedRow[String(key).trim()] = String(row[key] ?? '').trim();
    }
    return formattedRow;
  });

  // Filter out completely empty rows
  const filteredRows = rows.filter((row) => {
    return Object.values(row).some((val) => val !== '' && val !== undefined);
  });

  return { rows: filteredRows, headers, errors: [] };
}
