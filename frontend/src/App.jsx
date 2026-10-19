import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';

// Pages
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import GisMapPage from './pages/GisMapPage';
import DataEntryPage from './pages/DataEntryPage';
import CsvUploadPage from './pages/CsvUploadPage';
import PredictionViewPage from './pages/PredictionViewPage';
import AlertsPage from './pages/AlertsPage';
import SimulationPage from './pages/SimulationPage';
import ReportsPage from './pages/ReportsPage';
import VillageManagementPage from './pages/VillageManagementPage';
import UserManagementPage from './pages/UserManagementPage';
import SettingsPage from './pages/SettingsPage';

const ProtectedLayout = () => {
  const { user } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col text-slate-100">
      <Navbar toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />
      
      <div className="flex flex-1 overflow-hidden">
        <Sidebar isOpen={isSidebarOpen} closeSidebar={() => setIsSidebarOpen(false)} />
        
        <main className="flex-1 overflow-y-auto p-4 lg:p-8 bg-gradient-to-br from-slate-950 via-slate-900/50 to-slate-950">
          <Routes>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/gis-map" element={<GisMapPage />} />
            <Route path="/data-entry" element={<DataEntryPage />} />
            <Route path="/csv-upload" element={<CsvUploadPage />} />
            <Route path="/prediction/:id" element={<PredictionViewPage />} />
            <Route path="/alerts" element={<AlertsPage />} />
            <Route path="/simulation" element={<SimulationPage />} />
            <Route path="/reports" element={<ReportsPage />} />
            <Route path="/villages" element={<VillageManagementPage />} />
            <Route path="/users" element={<UserManagementPage />} />
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </main>
      </div>
    </div>
  );
};

export function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/*" element={<ProtectedLayout />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
