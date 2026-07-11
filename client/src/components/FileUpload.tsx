'use client';

import { useRef, useState, useCallback } from 'react';

interface FileUploadProps {
  onFileSelect: (file: File) => void;
  isLoading: boolean;
}

export default function FileUpload({ onFileSelect, isLoading }: FileUploadProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dragCountRef = useRef(0);

  const handleFile = useCallback(
    (file: File) => {
      if (isLoading) return;
      onFileSelect(file);
    },
    [onFileSelect, isLoading]
  );

  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dragCountRef.current++;
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dragCountRef.current--;
    if (dragCountRef.current === 0) {
      setIsDragOver(false);
    }
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      dragCountRef.current = 0;
      setIsDragOver(false);

      const files = e.dataTransfer.files;
      if (files.length > 0) {
        handleFile(files[0]);
      }
    },
    [handleFile]
  );

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files;
      if (files && files.length > 0) {
        handleFile(files[0]);
      }
      // Reset input so the same file can be re-selected
      e.target.value = '';
    },
    [handleFile]
  );

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div
      id="upload-zone"
      className={`upload-zone glass-card ${isDragOver ? 'drag-over' : ''}`}
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      onClick={handleClick}
      role="button"
      tabIndex={0}
      aria-label="Upload CSV or Excel file"
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          handleClick();
        }
      }}
    >
      <input
        ref={fileInputRef}
        type="file"
        accept=".csv,.xlsx,.xls"
        onChange={handleInputChange}
        style={{ display: 'none' }}
        id="csv-file-input"
      />

      <div className="upload-icon">
        {isLoading ? '⏳' : isDragOver ? '📥' : '📄'}
      </div>

      <h2 className="upload-title">
        {isLoading
          ? 'Reading your file...'
          : isDragOver
            ? 'Drop your file here!'
            : 'Upload your CSV or Excel file'}
      </h2>

      <p className="upload-subtitle">
        {isLoading
          ? 'Parsing columns and rows...'
          : 'Drag & drop your CSV or Excel file here, or click to browse'}
      </p>

      {!isLoading && (
        <button
          className="upload-btn"
          onClick={(e) => {
            e.stopPropagation();
            handleClick();
          }}
          type="button"
        >
          📁 Browse Files
        </button>
      )}

      <p className="upload-hint">
        Supports CSV and Excel files — Facebook Leads, Google Ads, CRM exports, and more
      </p>
    </div>
  );
}
