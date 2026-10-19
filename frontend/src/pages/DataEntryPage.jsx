import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import RiskGauge from '../components/RiskGauge';
import RiskBadge from '../components/RiskBadge';
import {
  FilePlus,
  CloudRain,
  Droplets,
  Activity,
  ShieldCheck,
  AlertTriangle,
  CheckCircle,
  Sparkles,
  Info,
  Save,
  WifiOff
} from 'lucide-react';

export const DataEntryPage = () => {
  const [searchParams] = useSearchParams();
  const initialVillageId = searchParams.get('villageId') || '';

  const { user, isOnline, updateOfflineCount } = useAuth();
  const navigate = useNavigate();

  const [villages, setVillages] = useState([]);
  const [loadingVillages, setLoadingVillages] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [successResult, setSuccessResult] = useState(null);

  // Form State
  const [formData, setFormData] = useState({
    villageId: initialVillageId,
    observationDate: new Date().toISOString().split('T')[0],
    rainfallMm: 45.0,
    waterSourceType: 'Tube Well / Hand Pump',
    turbidityNtu: 4.5,
    phLevel: 7.2,
    eColiDetected: false,
    residualChlorinePpm: 0.25,
    chlorinationDone: true,
    latrineCoveragePct: 68.0,
    openDrainageFlag: false,
    reportedDiarrheaCases: 1,
    reportedCholeraSuspects: 0,
    reportedTyphoidSuspects: 0,
    notes: '',
  });

  useEffect(() => {
    const fetchVillages = async () => {
      try {
        const data = await api.getVillages(user?.districtId);
        setVillages(data);
        if (!formData.villageId && data.length > 0) {
          setFormData((prev) => ({
            ...prev,
            villageId: data[0].id,
            waterSourceType: data[0].primaryWaterSource || 'Tube Well / Hand Pump',
            latrineCoveragePct: data[0].sanitationCoveragePct || 65.0,
          }));
        }
      } catch (err) {
        console.error('Failed to load villages', err);
      } finally {
        setLoadingVillages(false);
      }
    };
    fetchVillages();
  }, [user]);

  const handleVillageSelect = (villageId) => {
    const v = villages.find((item) => item.id.toString() === villageId.toString());
    setFormData((prev) => ({
      ...prev,
      villageId: villageId,
      waterSourceType: v?.primaryWaterSource || prev.waterSourceType,
      latrineCoveragePct: v?.sanitationCoveragePct || prev.latrineCoveragePct,
    }));
  };

  const applyPreset = (presetName) => {
    if (presetName === 'FLOOD_HIGH_RISK') {
      setFormData((prev) => ({
        ...prev,
        rainfallMm: 165.0,
        turbidityNtu: 26.5,
        phLevel: 7.8,
        eColiDetected: true,
        residualChlorinePpm: 0.0,
        chlorinationDone: false,
        openDrainageFlag: true,
        reportedDiarrheaCases: 16,
        reportedCholeraSuspects: 2,
        reportedTyphoidSuspects: 1,
        notes: 'Monsoon floodwaters overtopped river bank. High turbidity & gastro cases.',
      }));
    } else if (presetName === 'CLEAN_BASELINE') {
      setFormData((prev) => ({
        ...prev,
        rainfallMm: 20.0,
        turbidityNtu: 2.1,
        phLevel: 7.1,
        eColiDetected: false,
        residualChlorinePpm: 0.40,
        chlorinationDone: true,
        openDrainageFlag: false,
        reportedDiarrheaCases: 0,
        reportedCholeraSuspects: 0,
        reportedTyphoidSuspects: 0,
        notes: 'Clear spring tank water. Disinfection maintained.',
      }));
    } else if (presetName === 'POST_STORM_WARNING') {
      setFormData((prev) => ({
        ...prev,
        rainfallMm: 95.0,
        turbidityNtu: 12.0,
        phLevel: 7.3,
        eColiDetected: false,
        residualChlorinePpm: 0.10,
        chlorinationDone: false,
        openDrainageFlag: true,
        reportedDiarrheaCases: 5,
        reportedCholeraSuspects: 0,
        reportedTyphoidSuspects: 0,
        notes: 'Moderate runoff after heavy thunderstorm.',
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const payload = {
        ...formData,
        villageId: Number(formData.villageId),
        rainfallMm: Number(formData.rainfallMm),
        turbidityNtu: Number(formData.turbidityNtu),
        phLevel: Number(formData.phLevel),
        residualChlorinePpm: Number(formData.residualChlorinePpm),
        latrineCoveragePct: Number(formData.latrineCoveragePct),
        reportedDiarrheaCases: Number(formData.reportedDiarrheaCases),
        reportedCholeraSuspects: Number(formData.reportedCholeraSuspects),
        reportedTyphoidSuspects: Number(formData.reportedTyphoidSuspects),
      };

      const result = await api.submitObservation(payload);
      setSuccessResult(result);
      updateOfflineCount();
    } catch (err) {
      window.alert('Submission Error: ' + (err.response?.data?.message || err.message));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            <FilePlus className="w-6 h-6 text-teal-400" />
            <span>Community Health & Water Quality Data Entry</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            ASHA / ANM field surveillance submission with automated ML risk stratification.
          </p>
        </div>

        {/* Quick Scenario Fill Buttons for academic demo */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-[11px] text-slate-400">Demo Presets:</span>
          <button
            type="button"
            onClick={() => applyPreset('FLOOD_HIGH_RISK')}
            className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-rose-500/20 text-rose-300 border border-rose-500/30 hover:bg-rose-500/30 transition"
          >
            Flood Outbreak Surge
          </button>
          <button
            type="button"
            onClick={() => applyPreset('POST_STORM_WARNING')}
            className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-amber-500/20 text-amber-300 border border-amber-500/30 hover:bg-amber-500/30 transition"
          >
            Post-Storm Warning
          </button>
          <button
            type="button"
            onClick={() => applyPreset('CLEAN_BASELINE')}
            className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 hover:bg-emerald-500/30 transition"
          >
            Clean Baseline
          </button>
        </div>
      </div>

      {!isOnline && (
        <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-3.5 text-xs text-amber-300 flex items-center gap-2.5">
          <WifiOff className="w-4 h-4 text-amber-400 shrink-0" />
          <div>
            <strong>Offline Mode Detected:</strong> Your observation will be cached locally in secure browser storage and synchronized automatically when network connectivity returns.
          </div>
        </div>
      )}

      {/* Main Submission Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Section 1: Location & Date */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-5 shadow-xl backdrop-blur-md space-y-4">
          <h2 className="text-sm font-bold uppercase tracking-wider text-teal-400 border-b border-slate-800 pb-2">
            1. Geographic Location & Observation Date
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-300 mb-1">Select Village</label>
              <select
                required
                value={formData.villageId}
                onChange={(e) => handleVillageSelect(e.target.value)}
                aria-label="Select Village"
                className="w-full rounded-xl border border-slate-700 bg-slate-950 p-2.5 text-sm text-white focus:border-teal-500 focus:outline-none"
              >
                {villages.map((v) => (
                  <option key={v.id} value={v.id}>
                    {v.villageName} ({v.villageCode}) — {v.district?.districtName || 'Northeast'}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-300 mb-1">Observation Date</label>
              <input
                type="date"
                required
                value={formData.observationDate}
                onChange={(e) => setFormData({ ...formData, observationDate: e.target.value })}
                className="w-full rounded-xl border border-slate-700 bg-slate-950 p-2.5 text-sm text-white focus:border-teal-500 focus:outline-none font-mono"
              />
            </div>
          </div>
        </div>

        {/* Section 2: Hydrological & Water Quality Parameters */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-5 shadow-xl backdrop-blur-md space-y-4">
          <h2 className="text-sm font-bold uppercase tracking-wider text-cyan-400 border-b border-slate-800 pb-2 flex items-center justify-between">
            <span>2. Hydrological & Water Quality Indicators</span>
            <span className="text-[10px] text-slate-400 font-normal">Standard BIS IS 10500:2012 Reference</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
            {/* Rainfall mm */}
            <div>
              <label className="block font-semibold text-slate-300 mb-1">
                Rainfall Amount (mm)
              </label>
              <input
                type="number"
                step="0.1"
                min="0"
                max="500"
                required
                value={formData.rainfallMm}
                onChange={(e) => setFormData({ ...formData, rainfallMm: e.target.value })}
                className="w-full rounded-xl border border-slate-700 bg-slate-950 p-2.5 text-sm text-white font-mono focus:border-teal-500 focus:outline-none"
              />
              <span className="text-[10px] text-slate-400 mt-1 block">
                Rain gauge reading in mm (Monsoon baseline: 40-150mm)
              </span>
            </div>

            {/* Water Source Type */}
            <div>
              <label className="block font-semibold text-slate-300 mb-1">Water Source Type</label>
              <select
                value={formData.waterSourceType}
                onChange={(e) => setFormData({ ...formData, waterSourceType: e.target.value })}
                className="w-full rounded-xl border border-slate-700 bg-slate-950 p-2.5 text-sm text-white focus:border-teal-500 focus:outline-none"
              >
                <option value="Tube Well / Hand Pump">Tube Well / Hand Pump</option>
                <option value="River / Shallow Borewell">River / Shallow Borewell</option>
                <option value="Natural Mountain Spring">Natural Mountain Spring</option>
                <option value="Ring Well / Stream">Ring Well / Stream</option>
                <option value="River / Pond Sand Filter">River / Pond Sand Filter</option>
                <option value="Piped Water Supply (JJM)">Piped Water Supply (JJM)</option>
              </select>
            </div>

            {/* Turbidity NTU */}
            <div>
              <label className="block font-semibold text-slate-300 mb-1">
                Turbidity (NTU) <span className="text-teal-400 font-normal">(Safe limit &lt; 5.0)</span>
              </label>
              <input
                type="number"
                step="0.1"
                min="0"
                max="200"
                required
                value={formData.turbidityNtu}
                onChange={(e) => setFormData({ ...formData, turbidityNtu: e.target.value })}
                className="w-full rounded-xl border border-slate-700 bg-slate-950 p-2.5 text-sm text-white font-mono focus:border-teal-500 focus:outline-none"
              />
              <span className="text-[10px] text-slate-400 mt-1 block">
                Field nephelometer / turbidity tube
              </span>
            </div>

            {/* pH Level */}
            <div>
              <label className="block font-semibold text-slate-300 mb-1">
                pH Level (Range 6.5 - 8.5)
              </label>
              <input
                type="number"
                step="0.1"
                min="0"
                max="14"
                required
                value={formData.phLevel}
                onChange={(e) => setFormData({ ...formData, phLevel: e.target.value })}
                className="w-full rounded-xl border border-slate-700 bg-slate-950 p-2.5 text-sm text-white font-mono focus:border-teal-500 focus:outline-none"
              />
            </div>

            {/* E. Coli Biomarker */}
            <div>
              <label className="block font-semibold text-slate-300 mb-1">
                E. Coli / Coliform Strip Test
              </label>
              <div className="grid grid-cols-2 gap-2 mt-1">
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, eColiDetected: false })}
                  className={`py-2 text-xs font-bold rounded-xl border transition ${
                    !formData.eColiDetected
                      ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300'
                      : 'border-slate-700 bg-slate-950 text-slate-400'
                  }`}
                >
                  Negative (Safe)
                </button>
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, eColiDetected: true })}
                  className={`py-2 text-xs font-bold rounded-xl border transition ${
                    formData.eColiDetected
                      ? 'bg-rose-500/20 border-rose-500 text-rose-300'
                      : 'border-slate-700 bg-slate-950 text-slate-400'
                  }`}
                >
                  Positive (Bio-Hazard)
                </button>
              </div>
            </div>

            {/* Residual Chlorine ppm */}
            <div>
              <label className="block font-semibold text-slate-300 mb-1">
                Residual Chlorine (ppm)
              </label>
              <input
                type="number"
                step="0.05"
                min="0"
                max="5"
                value={formData.residualChlorinePpm}
                onChange={(e) => setFormData({ ...formData, residualChlorinePpm: e.target.value })}
                className="w-full rounded-xl border border-slate-700 bg-slate-950 p-2.5 text-sm text-white font-mono focus:border-teal-500 focus:outline-none"
              />
              <span className="text-[10px] text-slate-400 mt-1 block">
                Target: &gt; 0.20 ppm free chlorine
              </span>
            </div>
          </div>
        </div>

        {/* Section 3: Syndromic Cases & Sanitation */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-5 shadow-xl backdrop-blur-md space-y-4">
          <h2 className="text-sm font-bold uppercase tracking-wider text-amber-400 border-b border-slate-800 pb-2">
            3. Syndromic Case Counts & Village Sanitation
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-300 mb-1">
                Reported Diarrhea Cases
              </label>
              <input
                type="number"
                min="0"
                value={formData.reportedDiarrheaCases}
                onChange={(e) => setFormData({ ...formData, reportedDiarrheaCases: e.target.value })}
                className="w-full rounded-xl border border-slate-700 bg-slate-950 p-2.5 text-sm text-white font-mono font-bold focus:border-teal-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-300 mb-1">
                Suspected Cholera Cases
              </label>
              <input
                type="number"
                min="0"
                value={formData.reportedCholeraSuspects}
                onChange={(e) => setFormData({ ...formData, reportedCholeraSuspects: e.target.value })}
                className="w-full rounded-xl border border-slate-700 bg-slate-950 p-2.5 text-sm text-white font-mono font-bold focus:border-teal-500 focus:outline-none text-rose-400"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-300 mb-1">
                Suspected Typhoid Cases
              </label>
              <input
                type="number"
                min="0"
                value={formData.reportedTyphoidSuspects}
                onChange={(e) => setFormData({ ...formData, reportedTyphoidSuspects: e.target.value })}
                className="w-full rounded-xl border border-slate-700 bg-slate-950 p-2.5 text-sm text-white font-mono font-bold focus:border-teal-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs pt-2">
            <div>
              <label className="block font-semibold text-slate-300 mb-1">
                Household Latrine Coverage (%)
              </label>
              <input
                type="number"
                min="0"
                max="100"
                value={formData.latrineCoveragePct}
                onChange={(e) => setFormData({ ...formData, latrineCoveragePct: e.target.value })}
                className="w-full rounded-xl border border-slate-700 bg-slate-950 p-2.5 text-sm text-white font-mono focus:border-teal-500 focus:outline-none"
              />
            </div>

            <div className="flex items-center gap-3 pt-6">
              <label className="flex items-center gap-2 text-slate-300 font-semibold cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.openDrainageFlag}
                  onChange={(e) => setFormData({ ...formData, openDrainageFlag: e.target.checked })}
                  className="w-4 h-4 rounded text-teal-500 bg-slate-950 border-slate-700 focus:ring-teal-500"
                />
                <span>Open / Overflowing Drainage Present Near Water Source</span>
              </label>
            </div>
          </div>

          <div className="text-xs pt-2">
            <label className="block font-semibold text-slate-300 mb-1">Field Health Worker Notes</label>
            <textarea
              rows={2}
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="e.g. Floodwater entered community well; halogen tablets distributed..."
              className="w-full rounded-xl border border-slate-700 bg-slate-950 p-2.5 text-xs text-white placeholder-slate-500 focus:border-teal-500 focus:outline-none"
            />
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex justify-end gap-3">
          <button
            type="submit"
            disabled={submitting}
            className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-teal-500 to-cyan-500 px-8 py-3.5 text-sm font-bold text-slate-950 shadow-lg shadow-teal-500/25 hover:from-teal-400 hover:to-cyan-400 transition disabled:opacity-50"
          >
            <Sparkles className="w-5 h-5" />
            <span>{submitting ? 'Analyzing Risk Vector...' : 'Submit & Compute Risk Prediction'}</span>
          </button>
        </div>
      </form>

      {/* Success & XAI Output Modal */}
      {successResult && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-md animate-fade-in">
          <div className="w-full max-w-2xl rounded-3xl border border-teal-500/30 bg-slate-900 p-6 shadow-2xl overflow-hidden space-y-5">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <div className="rounded-xl bg-teal-500/20 p-2 text-teal-400">
                  <CheckCircle className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">Observation Successfully Recorded</h3>
                  <p className="text-xs text-slate-400">
                    AI/ML Risk Prediction & Explainability Analysis Generated
                  </p>
                </div>
              </div>
            </div>

            {successResult.prediction ? (
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center bg-slate-950/70 rounded-2xl p-4 border border-slate-800">
                  <RiskGauge
                    score={successResult.prediction.riskScore}
                    category={successResult.prediction.riskCategory}
                    confidence={successResult.prediction.confidencePct}
                  />

                  <div className="space-y-2 text-xs">
                    <div className="font-semibold text-slate-300">Factor Sub-Score Breakdown:</div>
                    <div className="space-y-1.5 text-slate-400">
                      <div className="flex justify-between">
                        <span>Water Contamination:</span>
                        <span className="font-mono text-white font-bold">
                          {successResult.prediction.waterQualityFactorPct}%
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Rainfall Hazard:</span>
                        <span className="font-mono text-white font-bold">
                          {successResult.prediction.rainfallFactorPct}%
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Active Case Clustering:</span>
                        <span className="font-mono text-white font-bold">
                          {successResult.prediction.caseTrendFactorPct}%
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Sanitation Vulnerability:</span>
                        <span className="font-mono text-white font-bold">
                          {successResult.prediction.sanitationFactorPct}%
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Non-Diagnostic Recommendations */}
                <div className="rounded-xl border border-teal-500/20 bg-teal-500/5 p-3.5 space-y-1 text-xs">
                  <span className="font-bold text-teal-400 uppercase tracking-wider block">
                    Public Health Action Advisory:
                  </span>
                  <pre className="text-slate-300 font-sans whitespace-pre-wrap leading-relaxed">
                    {successResult.prediction.summaryRecommendation}
                  </pre>
                </div>

                <div className="flex justify-end gap-3 pt-2">
                  <button
                    onClick={() => setSuccessResult(null)}
                    className="rounded-xl border border-slate-700 px-5 py-2 text-xs font-semibold text-slate-300 hover:bg-slate-800"
                  >
                    Enter Another Observation
                  </button>
                  <button
                    onClick={() => navigate(`/prediction/${successResult.prediction.id}`)}
                    className="rounded-xl bg-teal-500 px-5 py-2 text-xs font-bold text-slate-950 hover:bg-teal-400"
                  >
                    View Detailed XAI Report
                  </button>
                </div>
              </div>
            ) : (
              <div className="p-4 text-center text-xs text-slate-400">
                Observation saved in offline queue.
                <div className="mt-4">
                  <button
                    onClick={() => setSuccessResult(null)}
                    className="rounded-xl bg-teal-500 px-5 py-2 text-xs font-bold text-slate-950"
                  >
                    OK
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default DataEntryPage;
