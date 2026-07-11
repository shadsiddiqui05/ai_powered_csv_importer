import Papa from 'papaparse';
import * as XLSX from 'xlsx';
import { ParsedCsv } from '@/types';

/**
 * Parse a CSV or Excel file on the client side for preview.
 * Returns headers, rows, and metadata.
 */
export async function parseCsvFile(file: File): Promise<ParsedCsv> {
  const name = file.name.toLowerCase();

  // Handle Excel Files
  if (name.endsWith('.xlsx') || name.endsWith('.xls')) {
    try {
      const arrayBuffer = await file.arrayBuffer();
      const workbook = XLSX.read(arrayBuffer, { type: 'array' });

      if (workbook.SheetNames.length === 0) {
        throw new Error('Excel file is empty.');
      }

      const firstSheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[firstSheetName];

      // Convert sheet to JSON array
      const rawData = XLSX.utils.sheet_to_json<Record<string, any>>(worksheet, { defval: '' });

      if (rawData.length === 0) {
        return {
          headers: [],
          rows: [],
          fileName: file.name,
          fileSize: file.size,
          rowCount: 0,
        };
      }

      const headers = Object.keys(rawData[0]).map((h) => h.trim());
      const rows = rawData.map((row) => {
        const formattedRow: Record<string, string> = {};
        for (const key of Object.keys(row)) {
          formattedRow[key.trim()] = String(row[key] ?? '').trim();
        }
        return formattedRow;
      });

      // Filter out completely empty rows
      const filteredRows = rows.filter((row) =>
        Object.values(row).some((val) => val !== '' && val !== undefined)
      );

      return {
        headers,
        rows: filteredRows,
        fileName: file.name,
        fileSize: file.size,
        rowCount: filteredRows.length,
      };
    } catch (error) {
      throw new Error(
        `Failed to parse Excel file: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  // Handle CSV Files
  return new Promise((resolve, reject) => {
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      transformHeader: (header: string) => header.trim(),
      complete: (result) => {
        const headers = result.meta.fields || [];
        const rows = result.data as Record<string, string>[];

        // Filter out completely empty rows
        const filteredRows = rows.filter((row) =>
          Object.values(row).some((val) => val !== '' && val !== undefined)
        );

        resolve({
          headers,
          rows: filteredRows,
          fileName: file.name,
          fileSize: file.size,
          rowCount: filteredRows.length,
        });
      },
      error: (error) => {
        reject(new Error(`Failed to parse CSV: ${error.message}`));
      },
    });
  });
}

/**
 * Format file size in human readable format.
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}
