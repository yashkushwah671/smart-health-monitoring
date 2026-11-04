import React, { useState, useEffect } from 'react';
import api from '../services/api';
import RiskBadge from '../components/RiskBadge';
import { FileText, Filter, Search, RefreshCw, Eye } from 'lucide-react';
import { Link } from 'react-router-dom';

export const ReportsPage = () => {
  const [observations, setObservations] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [villages, setVillages] = useState([]);
  
  const [selectedDistrict, setSelectedDistrict] = useState('');
  const [selectedVillage, setSelectedVillage] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const init = async () => {
      try {
        const [obsData, distData, villData] = await Promise.all([
          api.getObservations(),
          api.getDistricts(),
          api.getVillages(),
        ]);
        setObservations(obsData);
        setDistricts(distData);
        setVillages(villData);
      } catch (err) {
        console.error('Failed to load reports', err);
      } finally {
        setLoading(false);
      }
    };
    init();
  }, []);

  const filteredObservations = observations.filter((obs) => {
    const matchDist = !selectedDistrict || obs.districtName === selectedDistrict;
    const matchVill = !selectedVillage || obs.villageId?.toString() === selectedVillage.toString();
    const matchSearch =
      !searchTerm ||
      obs.villageName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      obs.villageCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
      obs.waterSourceType.toLowerCase().includes(searchTerm.toLowerCase());
    return matchDist && matchVill && matchSearch;
  });

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            <FileText className="w-6 h-6 text-teal-400" />
            <span>Surveillance Reports & Historical Audit Logs</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Filter and inspect longitudinal community health, rainfall, and water quality surveillance records.
          </p>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-4 shadow-xl backdrop-blur-md grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
        {/* Search */}
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search village name / code..."
            className="w-full rounded-xl border border-slate-700 bg-slate-950 py-2.5 pl-9 pr-3 text-white placeholder-slate-500 focus:border-teal-500 focus:outline-none"
          />
        </div>

        {/* District */}
        <select
          value={selectedDistrict}
          onChange={(e) => setSelectedDistrict(e.target.value)}
          aria-label="Filter by District"
          className="rounded-xl border border-slate-700 bg-slate-950 p-2.5 text-white focus:border-teal-500 focus:outline-none"
        >
          <option value="">All Districts</option>
          {districts.map((d) => (
            <option key={d.id} value={d.districtName}>
              {d.districtName} ({d.state})
            </option>
          ))}
        </select>

        {/* Village */}
        <select
          value={selectedVillage}
          onChange={(e) => setSelectedVillage(e.target.value)}
          aria-label="Filter by Village"
          className="rounded-xl border border-slate-700 bg-slate-950 p-2.5 text-white focus:border-teal-500 focus:outline-none"
        >
          <option value="">All Villages</option>
          {villages.map((v) => (
            <option key={v.id} value={v.id}>
              {v.villageName}
            </option>
          ))}
        </select>

        {/* Record Counter */}
        <div className="flex items-center justify-end font-mono text-slate-400 px-2">
          Total: <strong className="text-teal-400 ml-1">{filteredObservations.length}</strong> records
        </div>
      </div>

      {/* Observations Table */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-5 shadow-xl backdrop-blur-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950/70 text-slate-400 font-mono uppercase text-[11px] border-b border-slate-800">
              <tr>
                <th className="py-3 px-3">ID</th>
                <th className="py-3 px-3">Village</th>
                <th className="py-3 px-3">District</th>
                <th className="py-3 px-3">Date</th>
                <th className="py-3 px-3">Rainfall</th>
                <th className="py-3 px-3">Water Source</th>
                <th className="py-3 px-3">Turbidity</th>
                <th className="py-3 px-3">pH</th>
                <th className="py-3 px-3">E. Coli</th>
                <th className="py-3 px-3">Chlorine</th>
                <th className="py-3 px-3">Cases</th>
                <th className="py-3 px-3">Assigned Risk</th>
                <th className="py-3 px-3 text-right">XAI Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredObservations.map((obs) => (
                <tr key={obs.id} className="hover:bg-slate-800/40 transition">
                  <td className="py-3 px-3 font-mono text-slate-500">#{obs.id}</td>
                  <td className="py-3 px-3 font-semibold text-white">{obs.villageName}</td>
                  <td className="py-3 px-3 text-slate-400">{obs.districtName}</td>
                  <td className="py-3 px-3 font-mono">{obs.observationDate}</td>
                  <td className="py-3 px-3 font-mono text-cyan-400">{obs.rainfallMm} mm</td>
                  <td className="py-3 px-3 text-slate-300 truncate max-w-[120px]">{obs.waterSourceType}</td>
                  <td className="py-3 px-3 font-mono">{obs.turbidityNtu} NTU</td>
                  <td className="py-3 px-3 font-mono">{obs.phLevel}</td>
                  <td className="py-3 px-3">
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
                  <td className="py-3 px-3 font-mono">{obs.residualChlorinePpm} ppm</td>
                  <td className="py-3 px-3 font-mono font-bold text-slate-200">{obs.totalGastroCases}</td>
                  <td className="py-3 px-3">
                    {obs.prediction ? (
                      <RiskBadge
                        category={obs.prediction.riskCategory}
                        score={obs.prediction.riskScore}
                        size="sm"
                      />
                    ) : (
                      <span className="text-slate-500 font-mono">N/A</span>
                    )}
                  </td>
                  <td className="py-3 px-3 text-right">
                    {obs.prediction && (
                      <Link
                        to={`/prediction/${obs.prediction.id}`}
                        className="font-semibold text-teal-400 hover:text-teal-300 underline"
                      >
                        Inspect
                      </Link>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ReportsPage;
