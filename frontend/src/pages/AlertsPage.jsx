import React, { useState, useEffect } from 'react';
import api from '../services/api';
import AlertModal from '../components/AlertModal';
import { AlertTriangle, AlertOctagon, CheckCircle2, Clock, Filter, RefreshCw, Eye } from 'lucide-react';
import { Link } from 'react-router-dom';

export const AlertsPage = () => {
  const [alerts, setAlerts] = useState([]);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedAlert, setSelectedAlert] = useState(null);

  const fetchAlerts = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.getAlerts(statusFilter === 'ALL' ? null : statusFilter);
      setAlerts(data);
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to fetch alerts');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAlerts();
  }, [statusFilter]);

  const handleAlertUpdated = () => {
    fetchAlerts();
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header & Filter Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            <AlertTriangle className="w-6 h-6 text-rose-400" />
            <span>Early-Warning Public Health Alert Center</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Automated outbreak surveillance alerts triggered by compound water contamination and monsoon surge events.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 bg-slate-900 border border-slate-700 rounded-xl p-1 text-xs">
            {['ALL', 'NEW', 'REVIEWED', 'RESOLVED'].map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-3 py-1.5 rounded-lg font-semibold transition ${
                  statusFilter === st
                    ? 'bg-teal-500 text-slate-950 font-bold'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {st}
              </button>
            ))}
          </div>

          <button
            onClick={fetchAlerts}
            className="rounded-xl border border-slate-700 bg-slate-850 p-2 text-slate-300 hover:bg-slate-700"
            title="Refresh Alerts"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Alert Cards Grid */}
      <div className="space-y-3">
        {alerts && alerts.length > 0 ? (
          alerts.map((alert) => {
            const isNew = alert.status === 'NEW';
            const isResolved = alert.status === 'RESOLVED';

            return (
              <div
                key={alert.id}
                className={`rounded-2xl border p-5 shadow-lg backdrop-blur-md transition-all ${
                  isNew
                    ? 'border-rose-500/40 bg-gradient-to-r from-rose-950/30 to-slate-900'
                    : isResolved
                    ? 'border-emerald-500/20 bg-slate-900/60 opacity-80'
                    : 'border-slate-800 bg-slate-900/80'
                }`}
              >
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  <div className="space-y-1.5 max-w-3xl">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-bold text-white text-base">{alert.villageName}</span>
                      <span className="text-xs text-slate-400">({alert.districtName} District)</span>
                      <span className="font-mono text-[11px] text-teal-400 px-2 py-0.5 rounded bg-slate-950 border border-slate-800">
                        {alert.alertCode}
                      </span>
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                          isNew
                            ? 'bg-rose-500/20 text-rose-400 border border-rose-500/40 animate-pulse'
                            : isResolved
                            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                            : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                        }`}
                      >
                        {alert.status}
                      </span>
                    </div>

                    <p className="text-xs text-slate-300 leading-relaxed">
                      {alert.triggerReason}
                    </p>

                    <div className="flex items-center gap-4 text-[11px] text-slate-400 pt-1 font-mono">
                      <span>Created: {new Date(alert.createdAt).toLocaleString()}</span>
                      {alert.reviewedByUserName && (
                        <span>Reviewed by: <strong className="text-slate-200">{alert.reviewedByUserName}</strong></span>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 shrink-0">
                    <Link
                      to={`/prediction/${alert.predictionId}`}
                      className="flex items-center gap-1 px-3 py-2 rounded-xl border border-slate-700 bg-slate-800 text-xs font-semibold text-teal-300 hover:bg-slate-700 transition"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>View XAI</span>
                    </Link>

                    <button
                      onClick={() => setSelectedAlert(alert)}
                      className="px-4 py-2 rounded-xl bg-teal-500 text-xs font-bold text-slate-950 hover:bg-teal-400 transition"
                    >
                      Review & Resolve
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-12 text-center text-slate-400 space-y-2">
            <CheckCircle2 className="mx-auto w-10 h-10 text-emerald-400/60" />
            <h3 className="font-bold text-white text-base">No Alerts in Selected Queue</h3>
            <p className="text-xs max-w-sm mx-auto">
              All village surveillance indicators in this category are operating within acceptable public health safety thresholds.
            </p>
          </div>
        )}
      </div>

      {/* Review Dialog */}
      {selectedAlert && (
        <AlertModal
          alert={selectedAlert}
          onClose={() => setSelectedAlert(null)}
          onUpdated={handleAlertUpdated}
        />
      )}
    </div>
  );
};

export default AlertsPage;
