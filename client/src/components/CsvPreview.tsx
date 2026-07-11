'use client';

import { ParsedCsv } from '@/types';
import { formatFileSize } from '@/lib/csv-parser';

interface CsvPreviewProps {
  data: ParsedCsv;
}

const MAX_PREVIEW_ROWS = 100;

export default function CsvPreview({ data }: CsvPreviewProps) {
  const { headers, rows, fileName, fileSize, rowCount } = data;
  const displayRows = rows.slice(0, MAX_PREVIEW_ROWS);
  const hasMore = rowCount > MAX_PREVIEW_ROWS;

  return (
    <div className="preview-container fade-in" id="csv-preview">
      {/* Header with metadata */}
      <div className="preview-header">
        <h3 className="preview-title">📋 {fileName}</h3>
        <div className="preview-meta">
          <span className="preview-badge">📊 {rowCount} rows</span>
          <span className="preview-badge">📐 {headers.length} columns</span>
          <span className="preview-badge">💾 {formatFileSize(fileSize)}</span>
        </div>
      </div>

      {/* Table */}
      <div className="table-wrapper">
        <div className="table-scroll">
          <table className="preview-table" id="preview-table">
            <thead>
              <tr>
                <th>#</th>
                {headers.map((header, i) => (
                  <th key={i}>{header}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {displayRows.map((row, rowIndex) => (
                <tr key={rowIndex}>
                  <td className="row-number">{rowIndex + 1}</td>
                  {headers.map((header, colIndex) => (
                    <td key={colIndex} title={row[header] || ''}>
                      {row[header] || '—'}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>

          {hasMore && (
            <div className="more-rows-indicator">
              ... and {rowCount - MAX_PREVIEW_ROWS} more rows
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
