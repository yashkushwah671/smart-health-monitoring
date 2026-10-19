import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { MapPin, Plus, Edit2, Trash2, CheckCircle, Search, ShieldCheck } from 'lucide-react';

export const VillageManagementPage = () => {
  const [villages, setVillages] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    villageName: '',
    villageCode: '',
    districtId: '',
    subCentre: '',
    latitude: 26.9632,
    longitude: 94.2185,
    estimatedPopulation: 1500,
    primaryWaterSource: 'Tube Well / Hand Pump',
    sanitationCoveragePct: 65.0,
    floodVulnerabilityIndex: 'HIGH',
  });

  const loadData = async () => {
    setLoading(true);
    try {
      const [vData, dData] = await Promise.all([
        api.getVillages(),
        api.getDistricts(),
      ]);
      setVillages(vData);
      setDistricts(dData);
      if (dData.length > 0 && !formData.districtId) {
        setFormData((prev) => ({ ...prev, districtId: dData[0].id }));
      }
    } catch (err) {
      console.error('Failed to load village registry', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreateVillage = async (e) => {
    e.preventDefault();
    try {
      await api.createVillage(
        {
          villageName: formData.villageName,
          villageCode: formData.villageCode,
          subCentre: formData.subCentre,
          latitude: Number(formData.latitude),
          longitude: Number(formData.longitude),
          estimatedPopulation: Number(formData.estimatedPopulation),
          primaryWaterSource: formData.primaryWaterSource,
          sanitationCoveragePct: Number(formData.sanitationCoveragePct),
          floodVulnerabilityIndex: formData.floodVulnerabilityIndex,
        },
        Number(formData.districtId)
      );
      setShowModal(false);
      loadData();
    } catch (err) {
      window.alert('Failed to create village: ' + (err.response?.data?.message || err.message));
    }
  };

  const filteredVillages = villages.filter(
    (v) =>
      v.villageName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.villageCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.district?.districtName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            <MapPin className="w-6 h-6 text-teal-400" />
            <span>Northeast India Village & Catchment Registry</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Maintain geospatial coordinates, sub-centres, baseline sanitation, and primary water sources.
          </p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-1.5 rounded-xl bg-teal-500 px-4 py-2.5 text-xs font-bold text-slate-950 shadow-md shadow-teal-500/20 hover:bg-teal-400 transition"
        >
          <Plus className="w-4 h-4" />
          <span>Register New Village</span>
        </button>
      </div>

      {/* Search Bar */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-4 shadow-xl backdrop-blur-md flex items-center justify-between gap-4">
        <div className="relative w-full max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search village name, code, or district..."
            className="w-full rounded-xl border border-slate-700 bg-slate-950 py-2 pl-9 pr-3 text-xs text-white placeholder-slate-500 focus:border-teal-500 focus:outline-none"
          />
        </div>

        <div className="text-xs text-slate-400 font-mono">
          Total Villages: <strong className="text-teal-400">{villages.length}</strong>
        </div>
      </div>

      {/* Village Registry Table */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-5 shadow-xl backdrop-blur-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950/70 text-slate-400 font-mono uppercase text-[11px] border-b border-slate-800">
              <tr>
                <th className="py-3 px-3">Village Code</th>
                <th className="py-3 px-3">Village Name</th>
                <th className="py-3 px-3">District</th>
                <th className="py-3 px-3">State</th>
                <th className="py-3 px-3">Coordinates</th>
                <th className="py-3 px-3">Est. Population</th>
                <th className="py-3 px-3">Primary Water Source</th>
                <th className="py-3 px-3">Sanitation Cov</th>
                <th className="py-3 px-3">Flood Vulnerability</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredVillages.map((v) => (
                <tr key={v.id} className="hover:bg-slate-800/40 transition">
                  <td className="py-3 px-3 font-mono text-teal-400 font-semibold">{v.villageCode}</td>
                  <td className="py-3 px-3 font-bold text-white">{v.villageName}</td>
                  <td className="py-3 px-3">{v.district?.districtName}</td>
                  <td className="py-3 px-3 text-slate-400">{v.district?.state}</td>
                  <td className="py-3 px-3 font-mono text-slate-400">
                    {Number(v.latitude).toFixed(4)}°N, {Number(v.longitude).toFixed(4)}°E
                  </td>
                  <td className="py-3 px-3 font-mono">{v.estimatedPopulation?.toLocaleString()}</td>
                  <td className="py-3 px-3 text-slate-300">{v.primaryWaterSource}</td>
                  <td className="py-3 px-3 font-mono">{v.sanitationCoveragePct}%</td>
                  <td className="py-3 px-3">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        v.floodVulnerabilityIndex === 'VERY_HIGH' || v.floodVulnerabilityIndex === 'HIGH'
                          ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                          : 'bg-emerald-500/10 text-emerald-400'
                      }`}
                    >
                      {v.floodVulnerabilityIndex}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Registration Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-lg rounded-2xl border border-slate-700 bg-slate-900 p-6 shadow-2xl space-y-4">
            <h3 className="font-bold text-white text-base border-b border-slate-800 pb-2">
              Register New Village Catchment
            </h3>

            <form onSubmit={handleCreateVillage} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Village Name</label>
                  <input
                    type="text"
                    required
                    value={formData.villageName}
                    onChange={(e) => setFormData({ ...formData, villageName: e.target.value })}
                    className="w-full rounded-xl border border-slate-700 bg-slate-950 p-2 text-white"
                    placeholder="e.g. Borbari Gaon"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Village Code</label>
                  <input
                    type="text"
                    required
                    value={formData.villageCode}
                    onChange={(e) => setFormData({ ...formData, villageCode: e.target.value })}
                    className="w-full rounded-xl border border-slate-700 bg-slate-950 p-2 text-white font-mono"
                    placeholder="e.g. AS-MJL-005"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">District</label>
                <select
                  value={formData.districtId}
                  onChange={(e) => setFormData({ ...formData, districtId: e.target.value })}
                  aria-label="Select District"
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 p-2 text-white"
                >
                  {districts.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.districtName} ({d.state})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Latitude</label>
                  <input
                    type="number"
                    step="0.0001"
                    required
                    value={formData.latitude}
                    onChange={(e) => setFormData({ ...formData, latitude: e.target.value })}
                    className="w-full rounded-xl border border-slate-700 bg-slate-950 p-2 text-white font-mono"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Longitude</label>
                  <input
                    type="number"
                    step="0.0001"
                    required
                    value={formData.longitude}
                    onChange={(e) => setFormData({ ...formData, longitude: e.target.value })}
                    className="w-full rounded-xl border border-slate-700 bg-slate-950 p-2 text-white font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Population</label>
                  <input
                    type="number"
                    required
                    value={formData.estimatedPopulation}
                    onChange={(e) => setFormData({ ...formData, estimatedPopulation: e.target.value })}
                    className="w-full rounded-xl border border-slate-700 bg-slate-950 p-2 text-white font-mono"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Sanitation Cov (%)</label>
                  <input
                    type="number"
                    required
                    value={formData.sanitationCoveragePct}
                    onChange={(e) => setFormData({ ...formData, sanitationCoveragePct: e.target.value })}
                    className="w-full rounded-xl border border-slate-700 bg-slate-950 p-2 text-white font-mono"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="rounded-xl border border-slate-700 px-4 py-2 text-slate-300 hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-teal-500 px-5 py-2 font-bold text-slate-950 hover:bg-teal-400"
                >
                  Save Village
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default VillageManagementPage;
