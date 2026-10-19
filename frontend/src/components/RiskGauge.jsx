import React from 'react';

export const RiskGauge = ({ score = 0, category = 'LOW', confidence = 85 }) => {
  const numScore = Math.min(Math.max(Number(score) || 0, 0), 100);
  const strokeDashoffset = 440 - (440 * (numScore * 0.75)) / 100;

  let strokeColor = '#10b981'; // Green
  if (numScore >= 70) {
    strokeColor = '#ef4444'; // Red
  } else if (numScore >= 35) {
    strokeColor = '#f59e0b'; // Amber
  }

  return (
    <div className="flex flex-col items-center justify-center p-4">
      <div className="relative w-48 h-48 flex items-center justify-center">
        {/* SVG Arc Meter */}
        <svg className="w-full h-full transform -rotate-90" viewBox="0 0 160 160">
          <circle
            cx="80"
            cy="80"
            r="70"
            stroke="currentColor"
            strokeWidth="12"
            fill="transparent"
            className="text-slate-800"
            strokeDasharray="440"
            strokeDashoffset="110"
            strokeLinecap="round"
          />
          <circle
            cx="80"
            cy="80"
            r="70"
            stroke={strokeColor}
            strokeWidth="12"
            fill="transparent"
            strokeDasharray="440"
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            className="transition-all duration-1000 ease-out"
          />
        </svg>

        {/* Center Score & Details */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
          <span className="text-4xl font-extrabold font-mono tracking-tight text-white">
            {numScore.toFixed(1)}
          </span>
          <span className="text-xs uppercase font-bold tracking-wider mt-0.5" style={{ color: strokeColor }}>
            {category} RISK
          </span>
          <span className="text-[10px] text-slate-400 mt-1">
            {confidence}% Confidence
          </span>
        </div>
      </div>

      <div className="w-full grid grid-cols-3 gap-2 mt-3 pt-3 border-t border-slate-800 text-center text-xs">
        <div>
          <span className="block text-emerald-400 font-medium">0 - 34</span>
          <span className="text-[10px] text-slate-400">Low</span>
        </div>
        <div>
          <span className="block text-amber-400 font-medium">35 - 69</span>
          <span className="text-[10px] text-slate-400">Medium</span>
        </div>
        <div>
          <span className="block text-rose-400 font-medium">70 - 100</span>
          <span className="text-[10px] text-slate-400">High</span>
        </div>
      </div>
    </div>
  );
};

export default RiskGauge;
