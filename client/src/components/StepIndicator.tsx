'use client';

import { AppStep } from '@/types';

interface StepIndicatorProps {
  currentStep: AppStep;
}

const STEPS: { key: AppStep; label: string; number: number }[] = [
  { key: 'upload', label: 'Upload', number: 1 },
  { key: 'preview', label: 'Preview', number: 2 },
  { key: 'processing', label: 'Processing', number: 3 },
  { key: 'results', label: 'Results', number: 4 },
];

const STEP_ORDER: AppStep[] = ['upload', 'preview', 'processing', 'results'];

export default function StepIndicator({ currentStep }: StepIndicatorProps) {
  const currentIndex = STEP_ORDER.indexOf(currentStep);

  return (
    <div className="step-indicator" id="step-indicator">
      {STEPS.map((step, index) => {
        const isCompleted = index < currentIndex;
        const isActive = index === currentIndex;

        return (
          <div key={step.key} style={{ display: 'flex', alignItems: 'center' }}>
            <div className="step-item">
              <div
                className={`step-circle ${isActive ? 'active' : ''} ${isCompleted ? 'completed' : ''}`}
              >
                {isCompleted ? '✓' : step.number}
              </div>
              <span
                className={`step-label ${isActive ? 'active' : ''} ${isCompleted ? 'completed' : ''}`}
              >
                {step.label}
              </span>
            </div>
            {index < STEPS.length - 1 && (
              <div
                className={`step-connector ${isCompleted ? 'completed' : ''}`}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
