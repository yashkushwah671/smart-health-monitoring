import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import api from '../services/api';
import RiskBadge from '../components/RiskBadge';
import { MapPin, Filter, AlertTriangle, ShieldCheck, Droplets, Info, Sparkles, PlusCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

// Fix default leaflet icon issues in React
delete L.Icon.Default.prototype._getIconUrl;

const createCustomIcon = (riskCategory, hasActiveAlert) => {
  let color = '#10b981'; // Green
  let pulseClass = '';

  if (riskCategory === 'HIGH') {
    color = '#ef4444';
    pulseClass = hasActiveAlert ? 'pulse-high-risk' : '';
  } else if (riskCategory === 'MEDIUM') {
    color = '#f59e0b';
  }

  const svgHtml = `
    <div class="relative flex items-center justify-center">
      <div class="w-7 h-7 rounded-full flex items-center justify-center shadow-lg border-2 border-slate-900 ${pulseClass}" style="background-color: ${color};">
        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <path d="M12 22s-8-4.5-8-11.8A8 8 0 0 1 12 2a8 8 0 0 1 8 8.2c0 7.3-8 11.8-8 11.8z"/>
          <circle cx="12" cy="10" r="3"/>
        </svg>
      </div>
    </div>
  `;

  return L.divIcon({
    html: svgHtml,
    className: 'custom-map-pin',
    iconSize: [28, 28],
    iconAnchor: [14, 28],
    popupAnchor: [0, -28],
  });
};

function ChangeMapView({ coords, zoom }) {
  const map = useMap();
  map.setView(coords, zoom);
  return null;
}

export const GisMapPage = () => {
  const [villages, setVillages] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [selectedDistrict, setSelectedDistrict] = useState('ALL');
  const [selectedRisk, setSelectedRisk] = useState('ALL');
  const [loading, setLoading] = useState(true);
  const [selectedVillage, setSelectedVillage] = useState(null);

  // Map center default: Northeast India (Assam / Meghalaya border region)
  const [mapCenter, setMapCenter] = useState([26.2006, 92.9376]);
  const [mapZoom, setMapZoom] = useState(7);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const [dashRes, distRes] = await Promise.all([
          api.getDashboardSummary(),
          api.getDistricts(),
        ]);
        setVillages(dashRes.villageRiskMap || []);
        setDistricts(distRes || []);
      } catch (err) {
        console.error('Failed to load GIS data:', err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const filteredVillages = villages.filter((v) => {
    const matchDist = selectedDistrict === 'ALL' || v.districtName === selectedDistrict;
    const matchRisk = selectedRisk === 'ALL' || v.latestRiskCategory === selectedRisk;
    return matchDist && matchRisk;
  });

  const handleDistrictChange = (distName) => {
    setSelectedDistrict(distName);
    if (distName !== 'ALL') {
      const match = villages.find((v) => v.districtName === distName);
      if (match) {
        setMapCenter([parseFloat(match.latitude), parseFloat(match.longitude)]);
        setMapZoom(9);
      }
    } else {
      setMapCenter([26.2006, 92.9376]);
      setMapZoom(7);
    }
  };

  return (
    <div className="space-y-4">
      {/* Top Filter Bar */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-4 shadow-xl backdrop-blur-md flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <div className="rounded-lg bg-teal-500/20 p-2 text-teal-400">
            <MapPin className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-white">GIS Risk Surveillance Map</h1>
            <p className="text-xs text-slate-400">Northeast India Water-Borne Disease Hazard Mapping</p>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3 text-xs">
          {/* District Filter */}
          <div className="flex items-center gap-1.5 bg-slate-950 border border-slate-700 rounded-xl px-3 py-1.5">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={selectedDistrict}
              onChange={(e) => handleDistrictChange(e.target.value)}
              aria-label="Filter by District"
              className="bg-transparent text-slate-200 focus:outline-none cursor-pointer"
            >
              <option value="ALL">All Northeast Districts</option>
              {districts.map((d) => (
                <option key={d.id} value={d.districtName}>
                  {d.districtName} ({d.state})
                </option>
              ))}
            </select>
          </div>

          {/* Risk Level Filter */}
          <div className="flex items-center gap-1 bg-slate-950 border border-slate-700 rounded-xl p-1">
            {['ALL', 'HIGH', 'MEDIUM', 'LOW'].map((risk) => (
              <button
                key={risk}
                onClick={() => setSelectedRisk(risk)}
                className={`px-2.5 py-1 rounded-lg font-medium transition ${
                  selectedRisk === risk
                    ? 'bg-teal-500 text-slate-950 font-bold'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {risk === 'ALL' ? 'All Risk' : risk}
              </button>
            ))}
          </div>

          <div className="text-slate-400 font-mono">
            Showing <strong className="text-teal-400">{filteredVillages.length}</strong> villages
          </div>
        </div>
      </div>

      {/* Main Map + Side Details Split View */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 h-[650px]">
        {/* Leaflet Map Frame */}
        <div className="lg:col-span-8 rounded-2xl border border-slate-800 overflow-hidden shadow-2xl relative">
          <MapContainer
            center={mapCenter}
            zoom={mapZoom}
            scrollWheelZoom={true}
            className="w-full h-full"
          >
            <ChangeMapView coords={mapCenter} zoom={mapZoom} />
            
            {/* OpenStreetMap Layer with Dark Tile Filter */}
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />

            {filteredVillages.map((village) => (
              <Marker
                key={village.villageId}
                position={[parseFloat(village.latitude), parseFloat(village.longitude)]}
                icon={createCustomIcon(village.latestRiskCategory, village.hasActiveAlert)}
                eventHandlers={{
                  click: () => setSelectedVillage(village),
                }}
              >
                <Popup>
                  <div className="p-1 space-y-2 text-xs">
                    <div className="flex items-center justify-between gap-2 border-b border-slate-700 pb-1.5">
                      <span className="font-bold text-white text-sm">{village.villageName}</span>
                      <RiskBadge category={village.latestRiskCategory} score={village.latestRiskScore} size="sm" />
                    </div>

                    <div className="text-slate-300 space-y-1">
                      <div><strong>District:</strong> {village.districtName} ({village.state})</div>
                      <div><strong>Water Source:</strong> {village.primaryWaterSource}</div>
                      <div><strong>Estimated Pop:</strong> {village.estimatedPopulation.toLocaleString()}</div>
                      <div><strong>Last Reading:</strong> {village.latestObservationDate}</div>
                    </div>

                    <div className="pt-2 flex gap-2">
                      <Link
                        to={`/data-entry?villageId=${village.villageId}`}
                        className="w-full py-1 text-center font-semibold rounded bg-teal-500 text-slate-950 hover:bg-teal-400 text-[11px]"
                      >
                        Submit Observation
                      </Link>
                    </div>
                  </div>
                </Popup>
              </Marker>
            ))}
          </MapContainer>

          {/* Map Legend Floating Tag */}
          <div className="absolute bottom-4 left-4 z-[400] rounded-xl border border-slate-800 bg-slate-900/90 p-3 backdrop-blur-md text-xs space-y-1.5 shadow-lg">
            <div className="font-bold text-white text-[11px] uppercase tracking-wider">GIS Risk Legend</div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-rose-500 animate-pulse" />
              <span className="text-slate-300">High Risk Outbreak Surge</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-amber-500" />
              <span className="text-slate-300">Medium Warning Level</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-emerald-500" />
              <span className="text-slate-300">Low Risk Baseline</span>
            </div>
          </div>
        </div>

        {/* Village Inspector Panel */}
        <div className="lg:col-span-4 rounded-2xl border border-slate-800 bg-slate-900/90 p-5 shadow-xl backdrop-blur-md flex flex-col justify-between overflow-y-auto">
          {selectedVillage ? (
            <div className="space-y-4">
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-[10px] font-mono text-teal-400 uppercase tracking-wider">
                    {selectedVillage.villageCode}
                  </span>
                  <h3 className="text-xl font-bold text-white">{selectedVillage.villageName}</h3>
                  <p className="text-xs text-slate-400">
                    {selectedVillage.districtName} District, {selectedVillage.state}
                  </p>
                </div>
                <RiskBadge
                  category={selectedVillage.latestRiskCategory}
                  score={selectedVillage.latestRiskScore}
                  size="md"
                />
              </div>

              {/* Geo & Demographic Card */}
              <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-3.5 space-y-2 text-xs">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <span className="text-slate-500 block text-[10px] uppercase">GPS Coordinates</span>
                    <span className="font-mono text-slate-200">
                      {parseFloat(selectedVillage.latitude).toFixed(4)}°N, {parseFloat(selectedVillage.longitude).toFixed(4)}°E
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[10px] uppercase">Est. Population</span>
                    <span className="font-mono text-slate-200 font-semibold">
                      {selectedVillage.estimatedPopulation.toLocaleString()}
                    </span>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-800/80">
                  <span className="text-slate-500 block text-[10px] uppercase">Primary Water Source</span>
                  <span className="text-teal-300 font-medium">{selectedVillage.primaryWaterSource}</span>
                </div>
              </div>

              {/* Status & Alerts Callout */}
              {selectedVillage.hasActiveAlert ? (
                <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 p-3 text-xs text-rose-300 space-y-1">
                  <div className="font-bold flex items-center gap-1.5 text-rose-400">
                    <AlertTriangle className="w-4 h-4" />
                    <span>Active Surveillance Alert Triggered</span>
                  </div>
                  <p className="text-[11px] text-slate-300">
                    Elevated monsoon runoff & water contamination detected. Boil-water guidance issued.
                  </p>
                </div>
              ) : (
                <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-3 text-xs text-emerald-300 space-y-1">
                  <div className="font-bold flex items-center gap-1.5 text-emerald-400">
                    <ShieldCheck className="w-4 h-4" />
                    <span>Normal Surveillance Baseline</span>
                  </div>
                  <p className="text-[11px] text-slate-300">
                    No active contamination alerts. Routine health tracking recommended.
                  </p>
                </div>
              )}

              {/* Action Buttons */}
              <div className="space-y-2 pt-2">
                <Link
                  to={`/data-entry?villageId=${selectedVillage.villageId}`}
                  className="w-full flex items-center justify-center gap-2 rounded-xl bg-teal-500 py-2.5 text-xs font-bold text-slate-950 hover:bg-teal-400 transition"
                >
                  <PlusCircle className="w-4 h-4" />
                  <span>Submit Field Observation</span>
                </Link>

                <Link
                  to={`/simulation?villageId=${selectedVillage.villageId}`}
                  className="w-full flex items-center justify-center gap-2 rounded-xl border border-slate-700 bg-slate-800 py-2 text-xs font-semibold text-teal-300 hover:bg-slate-700 transition"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Run What-If Rainfall Simulation</span>
                </Link>
              </div>
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-400">
              <MapPin className="w-10 h-10 text-teal-500/40 mb-3" />
              <h4 className="text-sm font-bold text-slate-200">Select a Village Marker</h4>
              <p className="text-xs text-slate-400 mt-1 max-w-xs">
                Click on any map marker across Assam, Meghalaya, Tripura, or Mizoram to view water parameters & risk factors.
              </p>
            </div>
          )}

          {/* Academic Coordinate Notice */}
          <div className="mt-4 pt-3 border-t border-slate-800/80 text-[10px] text-slate-500">
            * Geographic coordinates represent illustrative rural Northeast Indian catchment centroids for demonstration.
          </div>
        </div>
      </div>
    </div>
  );
};

export default GisMapPage;
