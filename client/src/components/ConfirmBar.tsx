'use client';

interface ConfirmBarProps {
  rowCount: number;
  onConfirm: () => void;
  onCancel: () => void;
  isLoading: boolean;
}

export default function ConfirmBar({
  rowCount,
  onConfirm,
  onCancel,
  isLoading,
}: ConfirmBarProps) {
  return (
    <div className="confirm-bar" id="confirm-bar">
      <div className="confirm-info">
        <strong>{rowCount}</strong> records ready for AI-powered import
      </div>
      <div className="confirm-actions">
        <button
          className="btn btn-secondary"
          onClick={onCancel}
          disabled={isLoading}
          id="cancel-btn"
          type="button"
        >
          ← Re-upload
        </button>
        <button
          className="btn btn-primary"
          onClick={onConfirm}
          disabled={isLoading}
          id="confirm-import-btn"
          type="button"
        >
          ✨ Import {rowCount} Records
        </button>
      </div>
    </div>
  );
}
