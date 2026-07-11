import Papa from 'papaparse';
import { ParsedCsv } from '@/types';

/**
 * Parse a CSV file on the client side for preview.
 * Returns headers, rows, and metadata.
 */
export function parseCsvFile(file: File): Promise<ParsedCsv> {
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
