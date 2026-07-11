'use client';

interface StatsCardProps {
  icon: string;
  value: number | string;
  label: string;
  variant?: 'default' | 'success' | 'warning' | 'info';
}

export default function StatsCard({
  icon,
  value,
  label,
  variant = 'default',
}: StatsCardProps) {
  return (
    <div className={`stat-card ${variant !== 'default' ? variant : ''}`}>
      <div className="stat-icon">{icon}</div>
      <div className="stat-value">{value}</div>
      <div className="stat-label">{label}</div>
    </div>
  );
}
