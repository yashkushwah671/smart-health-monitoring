import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import api from '../services/api';
import RiskGauge from '../components/RiskGauge';
import RiskBadge from '../components/RiskBadge';
import { Sparkles, CloudRain, ArrowRight, RefreshCw, AlertTriangle, ShieldCheck, Info } from 'lucide-react';

export const SimulationPage = () => {
  const [searchParams] = useSearchParams();
  const initialVillageId = searchParams.get('villageId') || '';

  const [villages, setVillages] = useState([]);
  const [selectedVillageId, setSelectedVillageId] = useState(initialVillageId);
  const [deltaPct, setDeltaPct] = useState(30.0);
  const [loading, setLoading] = useState(false);
  const [simulationResult, setSimulationResult] = useState(null);

  useEffect(() => {
    const fetchVillages = async () => {
      try {
        const data = await api.getVillages();
        setVillages(data);
        if (!selectedVillageId && data.length > 0) {
          setSelectedVillageId(data[0].id);
        }
      } catch (err) {
        console.error('Failed to load villages', err);
      }
    };
    fetchVillages();
  }, []);

  const handleRunSimulation = async () => {
    if (!selectedVillageId) return;
    setLoading(true);
    try {
      const res = await api.runSimulation({
        villageId: Number(selectedVillageId),
        rainfallDeltaPct: Number(deltaPct),
      });
      setSimulationResult(res);
    } catch (err) {
      window.alert('Simulation failed: ' + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedVillageId) {
      handleRunSimulation();
    }
  }, [selectedVillageId, deltaPct]);

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="border-b border-slate-800 pb-4">
        <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
          <Sparkles className="w-6 h-6 text-teal-400" />
          <span>What-If Hydrological & Rainfall Simulation Sandbox</span>
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Simulate counterfactual monsoon rainfall fluctuations (+10%, +20%, +30%) to estimate vulnerability shifts and prevent proactive disease surges.
        </p>
      </div>

      {/* Control Sandbox Panel */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-5 shadow-xl backdrop-blur-md space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Village Selector */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Select Surveillance Catchment
            </label>
            <select
              value={selectedVillageId}
              onChange={(e) => setSelectedVillageId(e.target.value)}
              aria-label="Select Surveillance Catchment"
              className="w-full rounded-xl border border-slate-700 bg-slate-950 p-2.5 text-sm text-white focus:border-teal-500 focus:outline-none"
            >
              {villages.map((v) => (
                <option key={v.id} value={v.id}>
                  {v.villageName} ({v.villageCode}) — {v.district?.districtName || 'Northeast'}
                </option>
              ))}
            </select>
          </div>

          {/* Rainfall Alteration Slider */}
          <div className="space-y-2">
            <div className="flex justify-between items-center text-xs">
              <label className="font-semibold text-slate-300">
                Rainfall Scenario Delta:
              </label>
              <span className="font-mono font-bold text-teal-400 text-sm">
                {deltaPct > 0 ? `+${deltaPct}%` : `${deltaPct}%`} Shift
              </span>
            </div>

            <input
              type="range"
              min="-50"
              max="100"
              step="5"
              value={deltaPct}
              onChange={(e) => setDeltaPct(Number(e.target.value))}
              className="w-full h-2 bg-slate-950 rounded-lg appearance-none cursor-pointer accent-teal-400"
            />

            {/* Quick Preset Buttons */}
            <div className="flex justify-between gap-1 text-[11px] pt-1">
              {[-30, -10, 0, 10, 20, 30, 50].map((val) => (
                <button
                  key={val}
                  type="button"
                  onClick={() => setDeltaPct(val)}
                  className={`px-2 py-0.5 rounded font-mono font-medium transition ${
                    deltaPct === val
                      ? 'bg-teal-500 text-slate-950 font-bold'
                      : 'bg-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  {val > 0 ? `+${val}%` : `${val}%`}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Side-by-Side Simulation Comparison */}
      {simulationResult && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Baseline Observation Card */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-5 shadow-xl backdrop-blur-md space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <div>
                <span className="text-[10px] font-mono uppercase text-slate-400">Reference Baseline</span>
                <h3 className="font-bold text-white text-base">{simulationResult.villageName}</h3>
              </div>
              <RiskBadge
                category={simulationResult.baseRiskCategory}
                score={simulationResult.baseRiskScore}
                size="md"
              />
            </div>

            <RiskGauge
              score={simulationResult.baseRiskScore}
              category={simulationResult.baseRiskCategory}
              confidence={85}
            />

            <div className="rounded-xl bg-slate-950/60 p-3 text-xs space-y-1.5 font-mono">
              <div className="flex justify-between text-slate-400">
                <span>Baseline Rainfall:</span>
                <span className="text-white font-bold">{simulationResult.baseRainfallMm} mm</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Risk Status:</span>
                <span className="text-emerald-400">{simulationResult.baseRiskCategory}</span>
              </div>
            </div>
          </div>

          {/* Simulated Scenario Card */}
          <div className="rounded-2xl border border-teal-500/40 bg-gradient-to-br from-teal-950/20 to-slate-900/90 p-5 shadow-2xl backdrop-blur-md space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <div>
                <span className="text-[10px] font-mono uppercase text-teal-400 font-bold">
                  Simulated Scenario ({deltaPct > 0 ? `+${deltaPct}%` : `${deltaPct}%`})
                </span>
                <h3 className="font-bold text-white text-base">Projected Hazard Shift</h3>
              </div>
              <RiskBadge
                category={simulationResult.simulatedRiskCategory}
                score={simulationResult.simulatedRiskScore}
                size="md"
              />
            </div>

            <RiskGauge
              score={simulationResult.simulatedRiskScore}
              category={simulationResult.simulatedRiskCategory}
              confidence={88}
            />

            <div className="rounded-xl bg-slate-950/80 p-3 text-xs space-y-1.5 font-mono border border-teal-500/20">
              <div className="flex justify-between text-slate-400">
                <span>Simulated Rainfall:</span>
                <span className="text-cyan-400 font-bold">{simulationResult.simulatedRainfallMm} mm</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Risk Score Shift (Delta):</span>
                <span
                  className={`font-bold ${
                    simulationResult.deltaScore > 0 ? 'text-rose-400' : 'text-emerald-400'
                  }`}
                >
                  {simulationResult.deltaScore > 0 ? `+${simulationResult.deltaScore}` : simulationResult.deltaScore} points
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Academic Disclaimer Callout */}
      <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-4 text-xs text-slate-400 flex items-start gap-2.5">
        <Info className="w-4 h-4 text-teal-400 shrink-0 mt-0.5" />
        <p className="leading-relaxed">
          <strong>Simulation Sandbox Note:</strong> This module simulates counterfactual scenarios based on empirical runoff and turbidity coefficients. It is intended for public health preparedness drill modeling, not clinical or individual diagnostic forecasting.
        </p>
      </div>
    </div>
  );
};

export default SimulationPage;
