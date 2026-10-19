import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../services/api';
import RiskGauge from '../components/RiskGauge';
import RiskBadge from '../components/RiskBadge';
import {
  ShieldAlert,
  ArrowLeft,
  Sparkles,
  CheckCircle,
  AlertTriangle,
  FileText,
  Activity,
  Droplets,
  CloudRain,
  Cpu,
  RefreshCw
} from 'lucide-react';

export const PredictionViewPage = () => {
  const { id } = useParams();
  const [prediction, setPrediction] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPrediction = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await api.getPredictionById(id);
        setPrediction(data);
      } catch (err) {
        setError(err.response?.data?.message || err.message || 'Prediction not found');
      } finally {
        setLoading(false);
      }
    };
    fetchPrediction();
  }, [id]);

  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <div className="flex flex-col items-center gap-2">
          <RefreshCw className="h-8 w-8 animate-spin text-teal-400" />
          <p className="text-xs text-slate-400">Loading Explainable AI Analysis...</p>
        </div>
      </div>
    );
  }

  if (error || !prediction) {
    return (
      <div className="max-w-2xl mx-auto rounded-2xl border border-rose-500/30 bg-rose-500/10 p-6 text-center space-y-3">
        <AlertTriangle className="mx-auto h-8 w-8 text-rose-400" />
        <h3 className="font-bold text-white">Prediction Analysis Not Found</h3>
        <p className="text-xs text-slate-300">{error}</p>
        <Link
          to="/dashboard"
          className="inline-flex items-center gap-1.5 rounded-xl bg-teal-500 px-4 py-2 text-xs font-bold text-slate-950"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Dashboard</span>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
        <div className="flex items-center gap-3">
          <Link
            to="/dashboard"
            className="rounded-xl border border-slate-700 bg-slate-800/80 p-2 text-slate-300 hover:bg-slate-700 transition"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold tracking-tight text-white">
                Explainable Risk Assessment: {prediction.villageName}
              </h1>
              <RiskBadge category={prediction.riskCategory} score={prediction.riskScore} size="md" />
            </div>
            <p className="text-xs text-slate-400 mt-0.5 font-mono">
              {prediction.districtName} District • Model: {prediction.modelVersion} ({prediction.modelType})
            </p>
          </div>
        </div>

        <Link
          to={`/simulation?villageId=${prediction.villageId}`}
          className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-teal-500 to-cyan-500 px-4 py-2 text-xs font-bold text-slate-950 shadow-md shadow-teal-500/20 hover:from-teal-400 hover:to-cyan-400 transition"
        >
          <Sparkles className="w-4 h-4" />
          <span>Simulate Rainfall Anomaly</span>
        </Link>
      </div>

      {/* Main Grid: Gauge & Factor Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Score Gauge & Confidence */}
        <div className="lg:col-span-4 rounded-2xl border border-slate-800 bg-slate-900/80 p-5 shadow-xl backdrop-blur-md flex flex-col justify-between">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Community Risk Index
            </span>
            <RiskGauge
              score={prediction.riskScore}
              category={prediction.riskCategory}
              confidence={prediction.confidencePct}
            />
          </div>

          <div className="space-y-2 pt-3 border-t border-slate-800 text-xs">
            <div className="flex items-center justify-between text-slate-400">
              <span>Model Classification:</span>
              <span className="font-mono text-white font-semibold">{prediction.riskCategory}</span>
            </div>
            <div className="flex items-center justify-between text-slate-400">
              <span>Observation ID:</span>
              <span className="font-mono text-teal-400">#{prediction.observationId}</span>
            </div>
            <div className="flex items-center justify-between text-slate-400">
              <span>Evaluation Timestamp:</span>
              <span className="font-mono text-slate-300">{new Date(prediction.createdAt).toLocaleString()}</span>
            </div>
          </div>
        </div>

        {/* Right: Sub-Score Breakdown Progress Bars */}
        <div className="lg:col-span-8 rounded-2xl border border-slate-800 bg-slate-900/80 p-5 shadow-xl backdrop-blur-md space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <h2 className="font-bold text-white text-base">Contributing Vector Sub-Scores</h2>
            <span className="text-xs text-slate-400 font-mono">Epidemiological Weighting Matrix</span>
          </div>

          <div className="space-y-4 text-xs">
            {/* Water Quality */}
            <div className="space-y-1.5">
              <div className="flex justify-between font-semibold">
                <span className="flex items-center gap-1.5 text-cyan-300">
                  <Droplets className="w-4 h-4" /> Water Quality & Microbial Contamination
                </span>
                <span className="font-mono text-white">{prediction.waterQualityFactorPct}%</span>
              </div>
              <div className="w-full h-2 rounded-full bg-slate-950 overflow-hidden">
                <div
                  className="h-full bg-cyan-400 rounded-full transition-all duration-700"
                  style={{ width: `${prediction.waterQualityFactorPct}%` }}
                />
              </div>
            </div>

            {/* Rainfall Hazard */}
            <div className="space-y-1.5">
              <div className="flex justify-between font-semibold">
                <span className="flex items-center gap-1.5 text-sky-300">
                  <CloudRain className="w-4 h-4" /> Monsoon Rainfall & Surface Runoff Hazard
                </span>
                <span className="font-mono text-white">{prediction.rainfallFactorPct}%</span>
              </div>
              <div className="w-full h-2 rounded-full bg-slate-950 overflow-hidden">
                <div
                  className="h-full bg-sky-400 rounded-full transition-all duration-700"
                  style={{ width: `${prediction.rainfallFactorPct}%` }}
                />
              </div>
            </div>

            {/* Active Cases */}
            <div className="space-y-1.5">
              <div className="flex justify-between font-semibold">
                <span className="flex items-center gap-1.5 text-rose-300">
                  <Activity className="w-4 h-4" /> Active Syndromic Gastroenteritis Clustering
                </span>
                <span className="font-mono text-white">{prediction.caseTrendFactorPct}%</span>
              </div>
              <div className="w-full h-2 rounded-full bg-slate-950 overflow-hidden">
                <div
                  className="h-full bg-rose-400 rounded-full transition-all duration-700"
                  style={{ width: `${prediction.caseTrendFactorPct}%` }}
                />
              </div>
            </div>

            {/* Sanitation Deficit */}
            <div className="space-y-1.5">
              <div className="flex justify-between font-semibold">
                <span className="flex items-center gap-1.5 text-amber-300">
                  <ShieldAlert className="w-4 h-4" /> Village Sanitation & Drainage Vulnerability
                </span>
                <span className="font-mono text-white">{prediction.sanitationFactorPct}%</span>
              </div>
              <div className="w-full h-2 rounded-full bg-slate-950 overflow-hidden">
                <div
                  className="h-full bg-amber-400 rounded-full transition-all duration-700"
                  style={{ width: `${prediction.sanitationFactorPct}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Detailed Plain-English XAI Explanations for Health Workers */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-5 shadow-xl backdrop-blur-md space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-2">
          <div>
            <h2 className="font-bold text-white text-base">Explainable Contributing Factors (XAI)</h2>
            <p className="text-xs text-slate-400">
              Plain-language breakdown of primary drivers influencing this community risk classification.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {prediction.explanations && prediction.explanations.length > 0 ? (
            prediction.explanations.map((exp, idx) => (
              <div
                key={idx}
                className={`rounded-xl border p-4 space-y-2 text-xs transition ${
                  exp.impactDirection === 'INCREASES_RISK'
                    ? 'border-rose-500/20 bg-rose-500/5'
                    : 'border-emerald-500/20 bg-emerald-500/5'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-white text-sm">{exp.factorName}</span>
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-bold font-mono ${
                      exp.impactDirection === 'INCREASES_RISK'
                        ? 'bg-rose-500/20 text-rose-300'
                        : 'bg-emerald-500/20 text-emerald-300'
                    }`}
                  >
                    {exp.impactDirection === 'INCREASES_RISK' ? '+ Risk Driver' : '- Protective Factor'}
                  </span>
                </div>

                {exp.factorValue && (
                  <div className="text-slate-400 font-mono text-[11px]">
                    Observed: <strong className="text-slate-200">{exp.factorValue}</strong>
                  </div>
                )}

                <p className="text-slate-300 leading-relaxed text-xs">
                  {exp.explanationText}
                </p>
              </div>
            ))
          ) : (
            <div className="col-span-2 py-4 text-center text-xs text-slate-500">
              No anomaly factor triggers recorded. Baseline water indicators are within optimal limits.
            </div>
          )}
        </div>
      </div>

      {/* Recommended Non-Diagnostic Public Health Advisory */}
      <div className="rounded-2xl border border-teal-500/30 bg-gradient-to-r from-teal-950/40 to-slate-900 p-5 shadow-xl space-y-3">
        <div className="flex items-center gap-2">
          <div className="rounded-xl bg-teal-500/20 p-2 text-teal-400">
            <CheckCircle className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-white text-base">Recommended Field Response Protocol</h3>
            <p className="text-xs text-slate-300">Non-diagnostic decision-support guidelines for ASHA/ANM workers and DHO</p>
          </div>
        </div>

        <div className="rounded-xl bg-slate-950/70 border border-slate-800 p-4">
          <pre className="text-slate-200 font-sans text-xs sm:text-sm whitespace-pre-wrap leading-relaxed">
            {prediction.summaryRecommendation}
          </pre>
        </div>
      </div>
    </div>
  );
};

export default PredictionViewPage;
