// ── CRM Types (shared with server) ──

export interface CrmRecord {
  created_at: string;
  name: string;
  email: string;
  country_code: string;
  mobile_without_country_code: string;
  company: string;
  city: string;
  state: string;
  country: string;
  lead_owner: string;
  crm_status: string;
  crm_note: string;
  data_source: string;
  possession_time: string;
  description: string;
}

export interface SkippedRecord {
  row: number;
  reason: string;
  originalData: Record<string, string>;
}

export interface ImportStats {
  totalRows: number;
  imported: number;
  skipped: number;
  successRate: number;
}

export interface ImportResult {
  success: boolean;
  data: {
    records: CrmRecord[];
    skipped: SkippedRecord[];
    stats: ImportStats;
  };
}

export interface ApiError {
  success: false;
  error: string;
  details?: string;
}

// ── App State ──

export type AppStep = 'upload' | 'preview' | 'processing' | 'results';

export interface ParsedCsv {
  headers: string[];
  rows: Record<string, string>[];
  fileName: string;
  fileSize: number;
  rowCount: number;
}
