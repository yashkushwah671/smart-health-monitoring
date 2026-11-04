import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import StatCard from '../components/StatCard';
import RiskBadge from '../components/RiskBadge';
import {
  MapPin,
  ShieldCheck,
  AlertTriangle,
  AlertOctagon,
  Activity,
  ArrowUpRight,
  RefreshCw,
  PlusCircle,
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
  Legend
} from 'recharts';

export const DashboardPage = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchDashboard = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.getDashboardSummary();
      setData(res);
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to fetch dashboard data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  const handleAlertUpdated = (updated) => {
    fetchDashboard();
  };

  if (loading && !data) {
    return (
      <div className="flex h-[70vh] items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <RefreshCw className="h-8 w-8 animate-spin text-teal-400" />
          <p className="text-sm font-medium text-slate-400">Loading Surveillance Telemetry...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-2xl border border-rose-500/30 bg-rose-500/10 p-6 text-center">
        <AlertOctagon className="mx-auto h-10 w-10 text-rose-400 mb-2" />
        <h3 className="text-lg font-bold text-white">Connection to Backend Unavailable</h3>
        <p className="text-sm text-slate-300 mt-1">{error}</p>
        <button
          onClick={fetchDashboard}
          className="mt-4 rounded-xl bg-teal-500 px-4 py-2 text-xs font-bold text-slate-950 hover:bg-teal-400"
        >
          Retry Connection
        </button>
      </div>
    );
  }

  const pieData = [
    { name: 'Low Risk', value: data.lowRiskVillagesCount || 0, color: '#10b981' },
    { name: 'Medium Warning', value: data.mediumRiskVillagesCount || 0, color: '#f59e0b' },
    { name: 'High Outbreak', value: data.highRiskVillagesCount || 0, color: '#ef4444' },
  ];

  return (
    <div className="space-y-6">
      {/* Header & Quick Action Buttons */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-white">
            Northeast India Health Surveillance Dashboard
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Real-time rainfall-aware early warning & water-borne disease risk intelligence.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={fetchDashboard}
            className="flex items-center gap-1.5 rounded-xl border border-slate-700 bg-slate-800/80 px-3 py-2 text-xs font-medium text-slate-300 hover:bg-slate-700 transition"
            title="Refresh Data"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Refresh</span>
          </button>

          <Link
            to="/data-entry"
            className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-teal-500 to-cyan-500 px-3.5 py-2 text-xs font-bold text-slate-950 shadow-md shadow-teal-500/20 hover:from-teal-400 hover:to-cyan-400 transition"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Record Observation</span>
          </Link>
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Monitored Villages"
          value={data.totalVillagesMonitored}
          subtext={`${data.totalObservationsRecorded} field submissions logged`}
          icon={MapPin}
          color="teal"
          badge={<span>Across 8 Northeast Districts</span>}
        />

        <StatCard
          title="High Outbreak Risk"
          value={data.highRiskVillagesCount}
          subtext="Urgent boil-water & chlorination"
          icon={AlertOctagon}
          color="rose"
          badge={<span className="text-rose-400 font-semibold">{data.highRiskVillagesCount > 0 ? 'Surveillance Alert Active' : 'Normal'}</span>}
        />

        <StatCard
          title="Medium Risk Warning"
          value={data.mediumRiskVillagesCount}
          subtext="Precautionary halogen distribution"
          icon={AlertTriangle}
          color="amber"
          badge={<span>Increased monitoring</span>}
        />

        <StatCard
          title="Low Risk Baseline"
          value={data.lowRiskVillagesCount}
          subtext="Safe residual disinfection"
          icon={ShieldCheck}
          color="emerald"
          badge={<span>Optimal indicators</span>}
        />
      </div>

      {/* Analytics & Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Temporal Rainfall vs Risk Correlation Chart */}
        <div className="lg:col-span-8 rounded-2xl border border-slate-800 bg-slate-900/80 p-5 shadow-xl backdrop-blur-md">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="font-bold text-white text-base">Rainfall & Disease Risk Correlation Trend</h2>
              <p className="text-xs text-slate-400">7-day aggregated surveillance telemetry</p>
            </div>
            <div className="flex items-center gap-3 text-xs">
              <span className="flex items-center gap-1 text-cyan-400">
                <span className="w-2.5 h-2.5 rounded-full bg-cyan-400" /> Rainfall (mm)
              </span>
              <span className="flex items-center gap-1 text-rose-400">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-400" /> Avg Risk Score
              </span>
            </div>
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data.temporalTrends || []} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="rainGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#06b6d4" stopOpacity={0.0} />
                  </linearGradient>
                  <linearGradient id="riskGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.5} />
                    <stop offset="95%" stopColor="#f43f5e" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="date" stroke="#64748b" textAnchor="middle" tick={{ fontSize: 11 }} />
                <YAxis stroke="#64748b" tick={{ fontSize: 11 }} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '0.75rem', color: '#fff' }}
                  labelStyle={{ color: '#38bdf8', fontWeight: 'bold' }}
                />
                <Area type="monotone" dataKey="rainfallMm" stroke="#06b6d4" strokeWidth={2} fillOpacity={1} fill="url(#rainGrad)" name="Rainfall (mm)" />
                <Area type="monotone" dataKey="averageRiskScore" stroke="#f43f5e" strokeWidth={2.5} fillOpacity={1} fill="url(#riskGrad)" name="Risk Score (0-100)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Risk Distribution Donut & Secondary Metrics */}
        <div className="lg:col-span-4 rounded-2xl border border-slate-800 bg-slate-900/80 p-5 shadow-xl backdrop-blur-md flex flex-col justify-between">
          <div>
            <h2 className="font-bold text-white text-base">Surveillance Risk Breakdown</h2>
            <p className="text-xs text-slate-400">Current village classification</p>

            <div className="h-52 w-full mt-2">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={75}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '0.5rem', color: '#fff' }}
                  />
                  <Legend verticalAlign="bottom" height={36} formatter={(value) => <span className="text-xs text-slate-300">{value}</span>} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 pt-3 border-t border-slate-800 text-xs">
            <div className="rounded-xl bg-slate-950/60 p-2.5 text-center">
              <span className="block text-slate-400 text-[10px] uppercase font-mono">Avg Turbidity</span>
              <span className="text-base font-bold text-cyan-400 font-mono">{data.averageTurbidityNtu} NTU</span>
            </div>
            <div className="rounded-xl bg-slate-950/60 p-2.5 text-center">
              <span className="block text-slate-400 text-[10px] uppercase font-mono">Active Cases</span>
              <span className="text-base font-bold text-rose-400 font-mono">{data.totalActiveGastroCases} reported</span>
            </div>
          </div>
        </div>
      </div>


      {/* Recent Observations Table */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-5 shadow-xl backdrop-blur-md">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="font-bold text-white text-base">Recent Field Surveillance Submissions</h2>
            <p className="text-xs text-slate-400">Latest water quality & rainfall telemetry from ASHA workers</p>
          </div>
          <Link
            to="/reports"
            className="text-xs font-semibold text-teal-400 hover:text-teal-300 flex items-center gap-1"
          >
            <span>Full History & Export</span>
            <ArrowUpRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950/60 text-slate-400 font-mono uppercase text-[11px] border-b border-slate-800">
              <tr>
                <th className="py-3 px-4">Village</th>
                <th className="py-3 px-4">District</th>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4">Rainfall</th>
                <th className="py-3 px-4">Turbidity</th>
                <th className="py-3 px-4">E. Coli</th>
                <th className="py-3 px-4">Cases</th>
                <th className="py-3 px-4">Risk Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {data.recentObservations && data.recentObservations.length > 0 ? (
                data.recentObservations.slice(0, 7).map((obs) => (
                  <tr key={obs.id} className="hover:bg-slate-800/40 transition">
                    <td className="py-3 px-4 font-semibold text-white">
                      {obs.villageName}
                    </td>
                    <td className="py-3 px-4 text-slate-400">{obs.districtName}</td>
                    <td className="py-3 px-4 font-mono">{obs.observationDate}</td>
                    <td className="py-3 px-4 font-mono text-cyan-400">{obs.rainfallMm} mm</td>
                    <td className="py-3 px-4 font-mono">{obs.turbidityNtu} NTU</td>
                    <td className="py-3 px-4">
                      {obs.eColiDetected ? (
                        <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-rose-500/20 text-rose-400">
                          POSITIVE
                        </span>
                      ) : (
                        <span className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-emerald-500/10 text-emerald-400">
                          NEGATIVE
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 font-mono font-bold text-slate-200">
                      {obs.totalGastroCases}
                    </td>
                    <td className="py-3 px-4">
                      {obs.prediction ? (
                        <RiskBadge
                          category={obs.prediction.riskCategory}
                          score={obs.prediction.riskScore}
                          size="sm"
                        />
                      ) : (
                        <span className="text-slate-500">Evaluating...</span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-right">
                      {obs.prediction && (
                        <Link
                          to={`/prediction/${obs.prediction.id}`}
                          className="font-semibold text-teal-400 hover:text-teal-300 underline text-xs"
                        >
                          View XAI
                        </Link>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="9" className="py-6 text-center text-slate-500">
                    No field observations recorded yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};

export default DashboardPage;
