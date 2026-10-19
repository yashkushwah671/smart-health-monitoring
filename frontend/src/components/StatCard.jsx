import React from 'react';

export const StatCard = ({ title, value, subtext, icon: Icon, color = 'teal', badge }) => {
  const colorMap = {
    teal: 'from-teal-500/10 to-cyan-500/5 text-teal-400 border-teal-500/20',
    blue: 'from-sky-500/10 to-indigo-500/5 text-sky-400 border-sky-500/20',
    emerald: 'from-emerald-500/10 to-teal-500/5 text-emerald-400 border-emerald-500/20',
    amber: 'from-amber-500/10 to-yellow-500/5 text-amber-400 border-amber-500/20',
    rose: 'from-rose-500/10 to-red-500/5 text-rose-400 border-rose-500/20',
  };

  const iconBgMap = {
    teal: 'bg-teal-500/20 text-teal-300',
    blue: 'bg-sky-500/20 text-sky-300',
    emerald: 'bg-emerald-500/20 text-emerald-300',
    amber: 'bg-amber-500/20 text-amber-300',
    rose: 'bg-rose-500/20 text-rose-300',
  };

  return (
    <div
      className={`relative overflow-hidden rounded-xl border bg-gradient-to-br p-5 shadow-lg backdrop-blur-md transition-all hover:scale-[1.01] ${colorMap[color] || colorMap.teal}`}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-medium uppercase tracking-wider text-slate-400">
            {title}
          </p>
          <h3 className="mt-2 text-2xl lg:text-3xl font-bold font-mono tracking-tight text-white">
            {value}
          </h3>
          {subtext && (
            <p className="mt-1 text-xs text-slate-400 flex items-center gap-1">
              {subtext}
            </p>
          )}
        </div>
        {Icon && (
          <div className={`rounded-lg p-3 ${iconBgMap[color] || iconBgMap.teal}`}>
            <Icon className="w-5 h-5" />
          </div>
        )}
      </div>

      {badge && (
        <div className="mt-3 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
          {badge}
        </div>
      )}
    </div>
  );
};

export default StatCard;
