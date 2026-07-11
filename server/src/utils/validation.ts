import { VALID_CRM_STATUSES, VALID_DATA_SOURCES, CrmRecord } from '../types';

/**
 * Validates and sanitizes a CRM record after AI extraction.
 * Enforces enum constraints and date format validity.
 */
export function sanitizeCrmRecord(record: Partial<CrmRecord>): CrmRecord {
  return {
    created_at: sanitizeDate(record.created_at),
    name: sanitizeString(record.name),
    email: sanitizeString(record.email),
    country_code: sanitizeCountryCode(record.country_code),
    mobile_without_country_code: sanitizePhone(record.mobile_without_country_code),
    company: sanitizeString(record.company),
    city: sanitizeString(record.city),
    state: sanitizeString(record.state),
    country: sanitizeString(record.country),
    lead_owner: sanitizeString(record.lead_owner),
    crm_status: sanitizeCrmStatus(record.crm_status),
    crm_note: sanitizeString(record.crm_note),
    data_source: sanitizeDataSource(record.data_source),
    possession_time: sanitizeString(record.possession_time),
    description: sanitizeString(record.description),
  };
}

function sanitizeString(value: unknown): string {
  if (value === null || value === undefined) return '';
  return String(value).trim();
}

function sanitizeDate(value: unknown): string {
  if (!value) return '';
  const str = String(value).trim();
  if (!str) return '';

  // Try parsing the date
  const date = new Date(str);
  if (!isNaN(date.getTime())) {
    // Return ISO-like format that works with new Date()
    return date.toISOString().replace('T', ' ').replace('Z', '').slice(0, 19);
  }
  return str; // Return as-is if not parseable — AI gave us something
}

function sanitizeCountryCode(value: unknown): string {
  if (!value) return '';
  let str = String(value).trim();
  // Ensure it starts with +
  if (str && !str.startsWith('+')) {
    str = '+' + str;
  }
  return str;
}

function sanitizePhone(value: unknown): string {
  if (!value) return '';
  // Remove any non-digit characters except leading +
  return String(value).trim().replace(/[^\d]/g, '');
}

function sanitizeCrmStatus(value: unknown): CrmRecord['crm_status'] {
  if (!value) return '';
  const str = String(value).trim().toUpperCase();
  const match = VALID_CRM_STATUSES.find(
    (status) => status === str || status.replace(/_/g, '') === str.replace(/_/g, '')
  );
  return match || '';
}

function sanitizeDataSource(value: unknown): CrmRecord['data_source'] {
  if (!value) return '';
  const str = String(value).trim().toLowerCase();
  const match = VALID_DATA_SOURCES.find(
    (source) => source === str || source.replace(/_/g, '') === str.replace(/_/g, '')
  );
  return match || '';
}

/**
 * Check if a record should be skipped (no email AND no mobile)
 */
export function shouldSkipRecord(record: CrmRecord): boolean {
  return !record.email && !record.mobile_without_country_code;
}

/**
 * Validates an uploaded file
 */
export function validateCsvFile(file: Express.Multer.File | undefined): string | null {
  if (!file) {
    return 'No file uploaded. Please upload a CSV file.';
  }

  const allowedMimeTypes = [
    'text/csv',
    'application/csv',
    'text/plain',
    'application/vnd.ms-excel',
    'text/x-csv',
    'application/x-csv',
  ];

  // Also check file extension
  const ext = file.originalname.toLowerCase().split('.').pop();
  if (ext !== 'csv' && !allowedMimeTypes.includes(file.mimetype)) {
    return 'Invalid file type. Please upload a CSV file.';
  }

  return null;
}
