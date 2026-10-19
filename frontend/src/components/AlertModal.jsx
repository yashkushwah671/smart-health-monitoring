import React, { useState } from 'react';
import { AlertTriangle, CheckCircle, ShieldAlert, X } from 'lucide-react';
import api from '../services/api';

export const AlertModal = ({ alert, onClose, onUpdated }) => {
  const [status, setStatus] = useState(alert.status || 'REVIEWED');
  const [resolutionNotes, setResolutionNotes] = useState(alert.resolutionNotes || '');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const updated = await api.updateAlertStatus(alert.id, status, resolutionNotes);
      onUpdated(updated);
      onClose();
    } catch (err) {
      window.alert('Failed to update alert: ' + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-lg rounded-2xl border border-slate-700 bg-slate-900 shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 p-5 bg-gradient-to-r from-slate-900 to-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="rounded-lg bg-rose-500/20 p-2 text-rose-400">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-white text-base">
                Public Health Alert Review
              </h3>
              <p className="text-xs text-slate-400 font-mono">
                {alert.alertCode} • {alert.villageName} ({alert.districtName})
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4 text-xs lg:text-sm">
          {/* Trigger Details */}
          <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-3.5 space-y-2">
            <div className="text-xs font-semibold uppercase tracking-wider text-teal-400">
              Surveillance Trigger Breakdown
            </div>
            <p className="text-slate-300 leading-relaxed text-xs">
              {alert.triggerReason}
            </p>
          </div>

          {/* Non-diagnostic Intervention Guidance */}
          <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-3.5 space-y-1.5">
            <div className="text-xs font-semibold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
              <ShieldAlert className="w-4 h-4" />
              <span>Recommended Field Interventions</span>
            </div>
            <pre className="text-slate-300 font-sans text-xs whitespace-pre-wrap leading-relaxed">
              {alert.recommendedActions}
            </pre>
          </div>

          {/* Status Selection */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-300">
              Surveillance Action Status
            </label>
            <div className="grid grid-cols-3 gap-2">
              {['NEW', 'REVIEWED', 'RESOLVED'].map((st) => (
                <button
                  type="button"
                  key={st}
                  onClick={() => setStatus(st)}
                  className={`rounded-lg py-2 text-xs font-semibold border transition ${
                    status === st
                      ? 'bg-teal-500/20 border-teal-500 text-teal-300'
                      : 'bg-slate-800/60 border-slate-700 text-slate-400 hover:border-slate-600'
                  }`}
                >
                  {st}
                </button>
              ))}
            </div>
          </div>

          {/* Action Resolution Notes */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-300">
              Reviewer Notes / Field Action Log
            </label>
            <textarea
              rows={3}
              value={resolutionNotes}
              onChange={(e) => setResolutionNotes(e.target.value)}
              placeholder="e.g. Dispatched 500 halogen tablets to ASHA; ordered well super-chlorination on 2026-09-21..."
              className="w-full rounded-lg border border-slate-700 bg-slate-950 p-2.5 text-xs text-white placeholder-slate-500 focus:border-teal-500 focus:outline-none"
            />
          </div>

          {/* Footer Buttons */}
          <div className="flex justify-end gap-2.5 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-slate-700 px-4 py-2 text-xs font-medium text-slate-300 hover:bg-slate-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex items-center gap-1.5 rounded-lg bg-teal-500 px-4 py-2 text-xs font-semibold text-slate-950 hover:bg-teal-400 transition disabled:opacity-50"
            >
              <CheckCircle className="w-4 h-4" />
              <span>{loading ? 'Saving...' : 'Update Alert Status'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AlertModal;
