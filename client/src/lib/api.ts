const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

/**
 * Send a CSV file to the backend for AI-powered import.
 */
export async function importCsv(file: File): Promise<any> {
  const formData = new FormData();
  formData.append('file', file);

  const response = await fetch(`${API_BASE}/api/import`, {
    method: 'POST',
    body: formData,
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || `Import failed with status ${response.status}`);
  }

  if (!data.success) {
    throw new Error(data.error || 'Import failed');
  }

  return data;
}
