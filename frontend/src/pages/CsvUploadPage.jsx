import React, { useState } from 'react';
import api from '../services/api';
import { UploadCloud, FileSpreadsheet, CheckCircle, AlertOctagon, Download, RefreshCw } from 'lucide-react';
import RiskBadge from '../components/RiskBadge';

export const CsvUploadPage = () => {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setError(null);
      setResult(null);
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) {
      setError('Please select a CSV file to upload.');
      return;
    }

    setUploading(true);
    setError(null);
    try {
      const res = await api.uploadCsvBulk(file);
      setResult(res);
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Bulk upload failed');
    } finally {
      setUploading(false);
    }
  };

  const downloadSampleCsv = () => {
    const csvContent = `village_code,observation_date,rainfall_mm,water_source_type,turbidity_ntu,ph_level,e_coli_detected,residual_chlorine_ppm,chlorination_done,latrine_coverage_pct,open_drainage_flag,reported_diarrhea_cases,reported_cholera_suspects,reported_typhoid_suspects,notes
AS-MJL-001,2026-09-20,85.0,Tube Well / Hand Pump,11.5,7.3,false,0.15,true,68.0,false,4,0,0,Post-monsoon routine reading
AS-MJL-002,2026-09-20,175.0,River / Shallow Borewell,32.0,7.9,true,0.00,false,52.0,true,19,2,1,Flood runoff contamination
AS-BRP-002,2026-09-20,135.0,River Bank Shallow Wells,22.0,7.8,true,0.05,false,36.0,true,12,1,0,Char island river surge
ML-EKH-004,2026-09-20,30.0,Spring Filtered Storage,2.0,7.2,false,0.45,true,98.0,false,0,0,0,Clear filtered spring supply`;

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', 'SmartHealth_Surveillance_Sample_Template.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            <UploadCloud className="w-6 h-6 text-teal-400" />
            <span>Bulk Field Surveillance CSV Ingestion</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Import multi-village water quality and case surveillance records with batch validation and ML prediction.
          </p>
        </div>

        <button
          type="button"
          onClick={downloadSampleCsv}
          className="flex items-center gap-1.5 rounded-xl border border-slate-700 bg-slate-800/80 px-4 py-2 text-xs font-semibold text-teal-300 hover:bg-slate-700 transition"
        >
          <Download className="w-4 h-4" />
          <span>Download Sample CSV Template</span>
        </button>
      </div>

      {/* Upload Box */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-6 shadow-xl backdrop-blur-md">
        <form onSubmit={handleUpload} className="space-y-4">
          <div className="border-2 border-dashed border-slate-700 hover:border-teal-500 rounded-2xl p-8 text-center transition cursor-pointer bg-slate-950/40">
            <input
              type="file"
              accept=".csv"
              id="csv-file-input"
              onChange={handleFileChange}
              className="hidden"
            />
            <label htmlFor="csv-file-input" className="cursor-pointer flex flex-col items-center gap-3">
              <div className="rounded-2xl bg-teal-500/10 p-4 text-teal-400">
                <FileSpreadsheet className="w-8 h-8" />
              </div>
              <div>
                <span className="text-sm font-semibold text-white">
                  {file ? file.name : 'Click to browse or drag & drop CSV file'}
                </span>
                <span className="block text-xs text-slate-400 mt-0.5">
                  Accepts standard UTF-8 encoded .csv format (max 5MB)
                </span>
              </div>
            </label>
          </div>

          {error && (
            <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 p-3.5 text-xs text-rose-300 flex items-center gap-2">
              <AlertOctagon className="w-4 h-4 text-rose-400 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="flex justify-end gap-3">
            <button
              type="submit"
              disabled={!file || uploading}
              className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-teal-500 to-cyan-500 px-6 py-2.5 text-xs font-bold text-slate-950 shadow-md shadow-teal-500/20 hover:from-teal-400 hover:to-cyan-400 transition disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${uploading ? 'animate-spin' : ''}`} />
              <span>{uploading ? 'Validating & Processing Batch...' : 'Process & Ingest CSV'}</span>
            </button>
          </div>
        </form>
      </div>

      {/* Upload Results Summary */}
      {result && (
        <div className="rounded-2xl border border-teal-500/30 bg-slate-900/90 p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-6 h-6 text-teal-400" />
              <div>
                <h3 className="font-bold text-white text-base">Batch Ingestion Completed</h3>
                <p className="text-xs text-slate-400">
                  Imported {result.successfulImports} of {result.totalRows} records successfully
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 text-xs font-mono">
              <span className="px-2.5 py-1 rounded-lg bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                {result.successfulImports} Success
              </span>
              {result.failedRows > 0 && (
                <span className="px-2.5 py-1 rounded-lg bg-rose-500/20 text-rose-300 border border-rose-500/30">
                  {result.failedRows} Errors
                </span>
              )}
            </div>
          </div>

          {/* Error Summary if any */}
          {result.errorMessages && result.errorMessages.length > 0 && (
            <div className="rounded-xl border border-rose-500/20 bg-rose-500/5 p-3 text-xs text-rose-300 space-y-1">
              <span className="font-bold block">Validation Errors:</span>
              <ul className="list-disc list-inside space-y-0.5">
                {result.errorMessages.map((msg, idx) => (
                  <li key={idx}>{msg}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Ingested Records Preview */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950 text-slate-400 font-mono uppercase text-[11px] border-b border-slate-800">
                <tr>
                  <th className="py-2.5 px-3">Village</th>
                  <th className="py-2.5 px-3">Date</th>
                  <th className="py-2.5 px-3">Rainfall</th>
                  <th className="py-2.5 px-3">Turbidity</th>
                  <th className="py-2.5 px-3">E. Coli</th>
                  <th className="py-2.5 px-3">Cases</th>
                  <th className="py-2.5 px-3">Assigned Risk</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {result.importedObservations.map((obs) => (
                  <tr key={obs.id}>
                    <td className="py-2.5 px-3 font-semibold text-white">{obs.villageName}</td>
                    <td className="py-2.5 px-3 font-mono">{obs.observationDate}</td>
                    <td className="py-2.5 px-3 font-mono">{obs.rainfallMm} mm</td>
                    <td className="py-2.5 px-3 font-mono">{obs.turbidityNtu} NTU</td>
                    <td className="py-2.5 px-3">
                      {obs.eColiDetected ? (
                        <span className="px-1.5 py-0.5 rounded text-[10px] bg-rose-500/20 text-rose-400 font-bold">
                          POSITIVE
                        </span>
                      ) : (
                        <span className="px-1.5 py-0.5 rounded text-[10px] bg-emerald-500/10 text-emerald-400">
                          NEGATIVE
                        </span>
                      )}
                    </td>
                    <td className="py-2.5 px-3 font-mono font-bold">{obs.totalGastroCases}</td>
                    <td className="py-2.5 px-3">
                      {obs.prediction && (
                        <RiskBadge
                          category={obs.prediction.riskCategory}
                          score={obs.prediction.riskScore}
                          size="sm"
                        />
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default CsvUploadPage;
