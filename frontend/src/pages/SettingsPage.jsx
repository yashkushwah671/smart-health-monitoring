import React from 'react';
import { Settings, ShieldCheck, Database, Cpu, ExternalLink, RefreshCw, Trash2, Info } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { getOfflineQueue, clearOfflineQueue } from '../services/api';

export const SettingsPage = () => {
  const { user, isOnline, offlineCount, triggerManualSync, updateOfflineCount } = useAuth();

  const handleClearOffline = () => {
    if (window.confirm('Are you sure you want to clear cached offline drafts?')) {
      clearOfflineQueue();
      updateOfflineCount();
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="border-b border-slate-800 pb-4">
        <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
          <Settings className="w-6 h-6 text-teal-400" />
          <span>System Settings & Architecture Diagnostics</span>
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Surveillance engine configurations, machine learning model versioning, and API health telemetry.
        </p>
      </div>

      {/* Model & Surveillance Thresholds */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-5 shadow-xl backdrop-blur-md space-y-4">
        <h2 className="text-sm font-bold uppercase tracking-wider text-teal-400 border-b border-slate-800 pb-2 flex items-center gap-2">
          <Cpu className="w-4 h-4" />
          <span>Surveillance Engine & Model Configuration</span>
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
          <div className="rounded-xl bg-slate-950/60 p-3.5 border border-slate-800 space-y-1">
            <span className="text-slate-500 uppercase font-mono text-[10px]">Model Architecture</span>
            <div className="font-bold text-white text-sm">Ensemble (RF + Gradient Boosting)</div>
            <div className="text-slate-400 text-[11px]">Calibrated on Northeast epidemiological dynamics</div>
          </div>

          <div className="rounded-xl bg-slate-950/60 p-3.5 border border-slate-800 space-y-1">
            <span className="text-slate-500 uppercase font-mono text-[10px]">High Outbreak Threshold</span>
            <div className="font-bold text-rose-400 text-sm font-mono">&ge; 70.0 Risk Index</div>
            <div className="text-slate-400 text-[11px]">Triggers automatic emergency alert</div>
          </div>

          <div className="rounded-xl bg-slate-950/60 p-3.5 border border-slate-800 space-y-1">
            <span className="text-slate-500 uppercase font-mono text-[10px]">Permissible Turbidity</span>
            <div className="font-bold text-cyan-400 text-sm font-mono">&le; 5.0 NTU (BIS Standard)</div>
            <div className="text-slate-400 text-[11px]">Critical runoff hazard at &ge; 15.0 NTU</div>
          </div>
        </div>
      </div>

      {/* Developer & Academic API Links */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-5 shadow-xl backdrop-blur-md space-y-4">
        <h2 className="text-sm font-bold uppercase tracking-wider text-cyan-400 border-b border-slate-800 pb-2 flex items-center gap-2">
          <Database className="w-4 h-4" />
          <span>Backend APIs & Database Telemetry</span>
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <a
            href="http://localhost:8080/swagger-ui.html"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-between rounded-xl border border-slate-700 bg-slate-950 p-4 hover:border-teal-500 hover:bg-slate-900 transition"
          >
            <div>
              <div className="font-bold text-white flex items-center gap-1.5">
                <span>Swagger OpenAPI 3.0 Documentation</span>
                <ExternalLink className="w-3.5 h-3.5 text-teal-400" />
              </div>
              <div className="text-slate-400 text-[11px] mt-0.5">
                Explore interactive REST API endpoints, DTOs, and schemas
              </div>
            </div>
          </a>

          <a
            href="http://localhost:8080/h2-console"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-between rounded-xl border border-slate-700 bg-slate-950 p-4 hover:border-teal-500 hover:bg-slate-900 transition"
          >
            <div>
              <div className="font-bold text-white flex items-center gap-1.5">
                <span>Database Console (H2 / MySQL)</span>
                <ExternalLink className="w-3.5 h-3.5 text-teal-400" />
              </div>
              <div className="text-slate-400 text-[11px] mt-0.5">
                Inspect live tables, SQL queries, and seed records
              </div>
            </div>
          </a>
        </div>
      </div>

      {/* Offline Storage & Sync Controls */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-5 shadow-xl backdrop-blur-md space-y-4">
        <h2 className="text-sm font-bold uppercase tracking-wider text-amber-400 border-b border-slate-800 pb-2">
          Offline Storage & Connectivity Cache
        </h2>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs bg-slate-950/60 p-4 rounded-xl border border-slate-800">
          <div>
            <div className="font-bold text-white">
              Cached Drafts in Local Storage: <strong className="text-teal-400 font-mono">{offlineCount}</strong>
            </div>
            <div className="text-slate-400 mt-0.5">
              Network Status: <span className={isOnline ? 'text-emerald-400 font-bold' : 'text-rose-400 font-bold'}>{isOnline ? 'Online (Connected)' : 'Offline (Disconnected)'}</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={triggerManualSync}
              disabled={offlineCount === 0 || !isOnline}
              className="flex items-center gap-1.5 rounded-xl bg-teal-500 px-4 py-2 font-bold text-slate-950 hover:bg-teal-400 transition disabled:opacity-40"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Sync Queue Now</span>
            </button>

            <button
              onClick={handleClearOffline}
              disabled={offlineCount === 0}
              className="flex items-center gap-1.5 rounded-xl border border-slate-700 bg-slate-800 px-3 py-2 font-semibold text-rose-400 hover:bg-rose-500/20 transition disabled:opacity-40"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear Cache</span>
            </button>
          </div>
        </div>
      </div>

      {/* Academic Project Metadata */}
      <div className="rounded-2xl border border-slate-800 bg-slate-950/70 p-5 text-xs text-slate-400 space-y-2">
        <div className="flex items-center gap-2 font-bold text-white">
          <Info className="w-4 h-4 text-teal-400" />
          <span>Major Project Academic Information</span>
        </div>
        <p className="leading-relaxed">
          <strong>Title:</strong> Smart Community Health Monitoring and Early Warning System for Water-Borne Diseases in Rural Northeast India.
        </p>
        <p className="leading-relaxed">
          <strong>USP:</strong> An explainable, rainfall-aware, GIS-based early-warning decision-support system that predicts community-level water-borne disease risk and helps health workers understand why an area is at risk.
        </p>
        <p className="leading-relaxed text-[11px] text-slate-500">
          * Built with Java Spring Boot, Python ML microservice, React.js, Leaflet GIS, and MySQL/H2.
        </p>
      </div>
    </div>
  );
};

export default SettingsPage;
