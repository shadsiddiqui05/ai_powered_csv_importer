'use client';

import { useState, useCallback } from 'react';
import { AppStep, ParsedCsv, ImportResult } from '@/types';
import { parseCsvFile } from '@/lib/csv-parser';
import { importCsv } from '@/lib/api';

interface UseCsvImportReturn {
  step: AppStep;
  file: File | null;
  parsedCsv: ParsedCsv | null;
  result: ImportResult | null;
  error: string | null;
  isLoading: boolean;

  handleFileSelect: (file: File) => Promise<void>;
  handleConfirmImport: () => Promise<void>;
  handleReset: () => void;
}

export function useCsvImport(): UseCsvImportReturn {
  const [step, setStep] = useState<AppStep>('upload');
  const [file, setFile] = useState<File | null>(null);
  const [parsedCsv, setParsedCsv] = useState<ParsedCsv | null>(null);
  const [result, setResult] = useState<ImportResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleFileSelect = useCallback(async (selectedFile: File) => {
    setError(null);
    setIsLoading(true);

    try {
      // Validate file type
      if (!selectedFile.name.toLowerCase().endsWith('.csv')) {
        throw new Error('Please upload a valid CSV file.');
      }

      // Parse CSV on client side for preview
      const parsed = await parseCsvFile(selectedFile);

      if (parsed.rowCount === 0) {
        throw new Error('The CSV file is empty or contains no valid data.');
      }

      setFile(selectedFile);
      setParsedCsv(parsed);
      setStep('preview');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to read CSV file');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleConfirmImport = useCallback(async () => {
    if (!file) return;

    setError(null);
    setStep('processing');
    setIsLoading(true);

    try {
      const importResult = await importCsv(file);
      setResult(importResult);
      setStep('results');
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Failed to import CSV. Please try again.'
      );
      setStep('preview'); // Go back to preview on error
    } finally {
      setIsLoading(false);
    }
  }, [file]);

  const handleReset = useCallback(() => {
    setStep('upload');
    setFile(null);
    setParsedCsv(null);
    setResult(null);
    setError(null);
    setIsLoading(false);
  }, []);

  return {
    step,
    file,
    parsedCsv,
    result,
    error,
    isLoading,
    handleFileSelect,
    handleConfirmImport,
    handleReset,
  };
}
