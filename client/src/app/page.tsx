'use client';

import ThemeToggle from '@/components/ThemeToggle';
import StepIndicator from '@/components/StepIndicator';
import FileUpload from '@/components/FileUpload';
import CsvPreview from '@/components/CsvPreview';
import ConfirmBar from '@/components/ConfirmBar';
import ResultsView from '@/components/ResultsView';
import { useCsvImport } from '@/hooks/useCsvImport';

export default function Home() {
  const {
    step,
    parsedCsv,
    result,
    error,
    isLoading,
    handleFileSelect,
    handleConfirmImport,
    handleReset,
  } = useCsvImport();

  return (
    <>
      <ThemeToggle />

      <div className="app-container">
        {/* Header */}
        <header className="app-header">
          <div className="app-logo">
            <div className="app-logo-icon">🚀</div>
            <h1 className="app-title">Ai Powered CSV Importer</h1>
          </div>
          <p className="app-subtitle">
            Upload any CSV file and let AI intelligently map your data into CRM-ready leads
          </p>
        </header>

        {/* Step Indicator */}
        <StepIndicator currentStep={step} />

        {/* Error Alert */}
        {error && (
          <div className="error-alert" id="error-alert">
            <span className="error-alert-icon">⚠️</span>
            <span className="error-alert-text">{error}</span>
            <button
              className="error-alert-dismiss"
              onClick={() => window.location.reload()}
              aria-label="Dismiss error"
              type="button"
            >
              ✕
            </button>
          </div>
        )}

        {/* Step 1: Upload */}
        {step === 'upload' && (
          <FileUpload onFileSelect={handleFileSelect} isLoading={isLoading} />
        )}

        {/* Step 2: Preview + Step 3: Confirm */}
        {step === 'preview' && parsedCsv && (
          <div className="glass-card slide-up">
            <CsvPreview data={parsedCsv} />
            <ConfirmBar
              rowCount={parsedCsv.rowCount}
              onConfirm={handleConfirmImport}
              onCancel={handleReset}
              isLoading={isLoading}
            />
          </div>
        )}

        {/* Step 3: Processing */}
        {step === 'processing' && (
          <div className="glass-card slide-up">
            <div className="processing-container" id="processing-view">
              <div className="processing-spinner" />
              <h3 className="processing-title">AI is analyzing your data...</h3>
              <p className="processing-subtitle">
                Intelligently mapping columns, extracting contacts, and formatting
                records for your CRM. This may take a moment for large files.
              </p>
              <div className="processing-progress">
                <div className="processing-progress-bar" />
              </div>
              <p
                style={{
                  fontSize: 'var(--text-xs)',
                  color: 'var(--color-text-tertiary)',
                }}
              >
                💡 Tip: The AI handles any CSV format — different column names,
                layouts, and structures are all supported.
              </p>
            </div>
          </div>
        )}

        {/* Step 4: Results */}
        {step === 'results' && result && (
          <ResultsView result={result} onReset={handleReset} />
        )}
      </div>
    </>
  );
}
