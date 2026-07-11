'use client';

import { useState, useCallback } from 'react';
import { ImportResult, CrmRecord } from '@/types';
import StatsCard from './StatsCard';

interface ResultsViewProps {
  result: ImportResult;
  onReset: () => void;
}

export default function ResultsView({ result, onReset }: ResultsViewProps) {
  const [activeTab, setActiveTab] = useState<'imported' | 'skipped'>('imported');

  if (!result || !result.success || !result.data) {
    return <div>Error displaying results.</div>;
  }

  const { records, skipped: skippedRecords, stats } = result.data;
  const { totalRows, imported, skipped, successRate } = stats;

  const downloadCsv = useCallback((type: 'imported' | 'skipped') => {
    let csvContent = '';
    let dataToExport: any[] = [];
    let headers: string[] = [];

    if (type === 'imported') {
      if (records.length === 0) return;
      headers = Object.keys(records[0]);
      dataToExport = records;
    } else {
      if (skippedRecords.length === 0) return;
      // For skipped, export the original data + reason
      const allOriginalKeys = new Set<string>();
      skippedRecords.forEach((sr) =>
        Object.keys(sr.originalData).forEach((k) => allOriginalKeys.add(k))
      );
      headers = ['Skip Reason', 'Row Number', ...Array.from(allOriginalKeys)];
      dataToExport = skippedRecords.map((sr) => ({
        'Skip Reason': sr.reason,
        'Row Number': sr.row,
        ...sr.originalData,
      }));
    }

    // Add headers row
    csvContent += headers.join(',') + '\r\n';

    // Add data rows
    dataToExport.forEach((item) => {
      const row = headers.map((header) => {
        const val = item[header] === null || item[header] === undefined ? '' : String(item[header]);
        // Escape quotes and wrap in quotes if contains comma
        const escaped = val.replace(/"/g, '""');
        return val.includes(',') || val.includes('"') || val.includes('\n')
          ? `"${escaped}"`
          : escaped;
      });
      csvContent += row.join(',') + '\r\n';
    });

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `groweasy-${type}-leads.csv`;
    link.style.display = 'none';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setTimeout(() => URL.revokeObjectURL(url), 100);
  }, [records, skippedRecords]);

  // Helper for rendering CRM status badges
  const renderStatusBadge = (status: CrmRecord['crm_status']) => {
    const statusClasses: Record<string, string> = {
      'Good Lead': 'bg-[var(--status-good-lead-bg)] text-[var(--status-good-lead)]',
      'Did Not Connect': 'bg-[var(--status-did-not-connect-bg)] text-[var(--status-did-not-connect)]',
      'Bad Lead': 'bg-[var(--status-bad-lead-bg)] text-[var(--status-bad-lead)]',
      'Sale Done': 'bg-[var(--status-sale-done-bg)] text-[var(--status-sale-done)]',
    };

    const className = statusClasses[status] || 'bg-gray-100 text-gray-800';

    return (
      <span
        style={{
          padding: '2px 8px',
          borderRadius: '9999px',
          fontSize: 'var(--text-xs)',
          fontWeight: 'bold',
          whiteSpace: 'nowrap',
          backgroundColor:
            status === 'Good Lead'
              ? 'var(--status-good-lead-bg)'
              : status === 'Did Not Connect'
              ? 'var(--status-did-not-connect-bg)'
              : status === 'Bad Lead'
              ? 'var(--status-bad-lead-bg)'
              : status === 'Sale Done'
              ? 'var(--status-sale-done-bg)'
              : 'var(--color-bg-hover)',
          color:
            status === 'Good Lead'
              ? 'var(--status-good-lead)'
              : status === 'Did Not Connect'
              ? 'var(--status-did-not-connect)'
              : status === 'Bad Lead'
              ? 'var(--status-bad-lead)'
              : status === 'Sale Done'
              ? 'var(--status-sale-done)'
              : 'var(--color-text-secondary)',
          border: '1px solid',
          borderColor:
            status === 'Good Lead'
              ? 'var(--status-good-lead)'
              : status === 'Did Not Connect'
              ? 'var(--status-did-not-connect)'
              : status === 'Bad Lead'
              ? 'var(--status-bad-lead)'
              : status === 'Sale Done'
              ? 'var(--status-sale-done)'
              : 'var(--color-border)',
        }}
      >
        {status}
      </span>
    );
  };

  return (
    <div className="results-container slide-up" id="results-view">
      {/* Summary Header */}
      <div style={{ textAlign: 'center', marginBottom: 'var(--space-6)' }}>
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '64px',
            height: '64px',
            borderRadius: '50%',
            background: 'var(--color-success-bg)',
            color: 'var(--color-success)',
            fontSize: '2rem',
            marginBottom: 'var(--space-4)',
          }}
        >
          ✓
        </div>
        <h2 style={{ fontSize: 'var(--text-2xl)', marginBottom: 'var(--space-2)' }}>
          Import Complete!
        </h2>
        <p style={{ color: 'var(--color-text-secondary)' }}>
          AI successfully processed {totalRows} rows from your CSV file.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="stats-grid">
        <StatsCard
          icon="✅"
          value={imported}
          label="Imported Leads"
          variant="success"
        />
        <StatsCard
          icon="⚠️"
          value={skipped}
          label="Skipped Rows"
          variant={skipped > 0 ? 'warning' : 'default'}
        />
        <StatsCard
          icon="📈"
          value={`${successRate}%`}
          label="Success Rate"
          variant="info"
        />
      </div>

      {/* Details Section */}
      <div className="glass-card" style={{ marginTop: 'var(--space-6)' }}>
        {/* Tabs */}
        <div className="tabs">
          <button
            className={`tab ${activeTab === 'imported' ? 'active' : ''}`}
            onClick={() => setActiveTab('imported')}
            id="tab-imported"
          >
            Imported Records
            <span
              style={{
                marginLeft: '8px',
                background: 'var(--color-bg-hover)',
                padding: '2px 8px',
                borderRadius: '9999px',
                fontSize: 'var(--text-xs)',
              }}
            >
              {imported}
            </span>
          </button>
          <button
            className={`tab ${activeTab === 'skipped' ? 'active' : ''}`}
            onClick={() => setActiveTab('skipped')}
            id="tab-skipped"
          >
            Skipped Rows
            {skipped > 0 && (
              <span
                style={{
                  marginLeft: '8px',
                  background: 'var(--color-warning-bg)',
                  color: 'var(--color-warning)',
                  padding: '2px 8px',
                  borderRadius: '9999px',
                  fontSize: 'var(--text-xs)',
                }}
              >
                {skipped}
              </span>
            )}
          </button>
        </div>

        {/* Tab Content */}
        <div style={{ padding: '0' }}>
          {activeTab === 'imported' && (
            <div>
              <div
                style={{
                  padding: 'var(--space-4)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  borderBottom: '1px solid var(--color-border)',
                }}
              >
                <span style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-secondary)' }}>
                  Showing all {imported} imported records mapped to CRM format.
                </span>
                <button
                  className="btn btn-secondary"
                  onClick={() => downloadCsv('imported')}
                  disabled={imported === 0}
                >
                  📥 Export CSV
                </button>
              </div>

              <div className="table-wrapper" style={{ borderRadius: '0', border: 'none' }}>
                <div className="table-scroll">
                  {imported > 0 ? (
                    <table className="preview-table">
                      <thead>
                        <tr>
                          <th>Name</th>
                          <th>Email</th>
                          <th>Phone</th>
                          <th>Company</th>
                          <th>City</th>
                          <th>Status</th>
                          <th>Data Source</th>
                        </tr>
                      </thead>
                      <tbody>
                        {records.map((record, i) => (
                          <tr key={i}>
                            <td>{record.name || '—'}</td>
                            <td>{record.email || '—'}</td>
                            <td>
                              {(record.country_code ? record.country_code + ' ' : '') + 
                               (record.mobile_without_country_code || '—')}
                            </td>
                            <td>{record.company || '—'}</td>
                            <td>{record.city || '—'}</td>
                            <td>{renderStatusBadge(record.crm_status)}</td>
                            <td>
                              <span
                                style={{
                                  fontSize: 'var(--text-xs)',
                                  color: 'var(--color-text-tertiary)',
                                  background: 'var(--color-bg-tertiary)',
                                  padding: '2px 6px',
                                  borderRadius: '4px',
                                }}
                              >
                                {record.data_source}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  ) : (
                    <div style={{ padding: 'var(--space-8)', textAlign: 'center', color: 'var(--color-text-tertiary)' }}>
                      <p>No valid records were imported.</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'skipped' && (
            <div>
              <div
                style={{
                  padding: 'var(--space-4)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  borderBottom: '1px solid var(--color-border)',
                }}
              >
                <span style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-secondary)' }}>
                  Rows skipped because they lacked essential contact info or were flagged by AI.
                </span>
                <button
                  className="btn btn-secondary"
                  onClick={() => downloadCsv('skipped')}
                  disabled={skipped === 0}
                >
                  📥 Export Skipped
                </button>
              </div>

              <div className="table-wrapper" style={{ borderRadius: '0', border: 'none' }}>
                <div className="table-scroll">
                  {skipped > 0 ? (
                    <table className="preview-table">
                      <thead>
                        <tr>
                          <th>Row #</th>
                          <th>Reason</th>
                          <th>Original Data Snippet</th>
                        </tr>
                      </thead>
                      <tbody>
                        {skippedRecords.map((sr, i) => {
                          const dataSnippet = Object.entries(sr.originalData)
                            .slice(0, 3)
                            .map(([k, v]) => `${k}: ${v}`)
                            .join(' | ');

                          return (
                            <tr key={i}>
                              <td className="row-number">{sr.row}</td>
                              <td>
                                <span
                                  style={{
                                    fontSize: 'var(--text-xs)',
                                    color: 'var(--color-error)',
                                    background: 'var(--color-error-bg)',
                                    padding: '2px 6px',
                                    borderRadius: '4px',
                                  }}
                                >
                                  {sr.reason}
                                </span>
                              </td>
                              <td
                                style={{
                                  fontSize: 'var(--text-xs)',
                                  color: 'var(--color-text-tertiary)',
                                  fontFamily: 'var(--font-mono)',
                                }}
                              >
                                {dataSnippet}
                                {Object.keys(sr.originalData).length > 3 && ' ...'}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  ) : (
                    <div style={{ padding: 'var(--space-8)', textAlign: 'center', color: 'var(--color-text-tertiary)' }}>
                      <p>Great job! No rows were skipped.</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Action Footer */}
      <div style={{ textAlign: 'center', marginTop: 'var(--space-8)' }}>
        <button
          className="btn btn-primary"
          onClick={onReset}
          id="new-import-btn"
          type="button"
        >
          🔄 Start New Import
        </button>
      </div>
    </div>
  );
}
