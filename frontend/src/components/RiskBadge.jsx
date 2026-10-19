import React from 'react';
import { ShieldCheck, AlertTriangle, AlertOctagon } from 'lucide-react';

export const RiskBadge = ({ category, score, showIcon = true, size = 'md' }) => {
  const cat = (category || 'LOW').toUpperCase();
  
  let bg = 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30';
  let Icon = ShieldCheck;
  let label = 'Low Risk';

  if (cat === 'HIGH') {
    bg = 'bg-rose-500/15 text-rose-400 border-rose-500/40 animate-pulse';
    Icon = AlertOctagon;
    label = 'High Outbreak Risk';
  } else if (cat === 'MEDIUM') {
    bg = 'bg-amber-500/15 text-amber-400 border-amber-500/30';
    Icon = AlertTriangle;
    label = 'Medium Warning';
  }

  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-1 text-xs font-medium',
    lg: 'px-3.5 py-1.5 text-sm font-semibold',
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border ${bg} ${sizeClasses[size]} transition-all`}
    >
      {showIcon && <Icon className={size === 'lg' ? 'w-4 h-4' : 'w-3.5 h-3.5'} />}
      <span>{label}</span>
      {score !== undefined && score !== null && (
        <span className="opacity-80 font-mono">({Number(score).toFixed(1)})</span>
      )}
    </span>
  );
};

export default RiskBadge;
