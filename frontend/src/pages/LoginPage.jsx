import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Activity, Lock, User, ShieldCheck, ArrowRight, Info } from 'lucide-react';

export const LoginPage = () => {
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('password123');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await login(username, password);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid credentials or backend unavailable');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickLogin = (demoUser) => {
    setUsername(demoUser);
    setPassword('password123');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-4 sm:p-6 lg:p-8">
      <div className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-12 rounded-3xl border border-slate-800 bg-slate-900/80 shadow-2xl overflow-hidden backdrop-blur-xl">
        
        {/* Left Hero & Academic Info */}
        <div className="lg:col-span-6 p-8 lg:p-10 flex flex-col justify-between bg-gradient-to-br from-teal-950/40 via-slate-900 to-slate-950 border-b lg:border-b-0 lg:border-r border-slate-800">
          <div>
            <div className="flex items-center gap-2.5 mb-6">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-tr from-cyan-600 to-teal-400 shadow-lg shadow-teal-500/20">
                <Activity className="h-6 w-6 text-slate-950 font-bold" />
              </div>
              <div>
                <span className="text-xl font-bold tracking-tight text-white">Smart Health</span>
                <span className="block text-xs font-semibold text-teal-400 uppercase tracking-widest">Northeast India Surveillance</span>
              </div>
            </div>

            <h1 className="text-2xl lg:text-3xl font-bold text-white tracking-tight leading-snug">
              Explainable Early-Warning & Health Monitoring System
            </h1>

            <p className="mt-4 text-sm text-slate-300 leading-relaxed">
              Empowering ASHA/ANM health workers and District Health Officers (DHO) across rural Assam, Meghalaya, Tripura, Arunachal Pradesh, and Mizoram with explainable, rainfall-aware disease risk predictions.
            </p>

            {/* Core USPs */}
            <div className="mt-6 space-y-3">
              <div className="flex items-start gap-2.5 text-xs text-slate-300">
                <div className="rounded-md bg-teal-500/20 p-1 text-teal-400 mt-0.5">
                  <ShieldCheck className="w-3.5 h-3.5" />
                </div>
                <span><strong>Explainable AI (XAI):</strong> Understand why a village is at risk before outbreaks escalate.</span>
              </div>
              <div className="flex items-start gap-2.5 text-xs text-slate-300">
                <div className="rounded-md bg-teal-500/20 p-1 text-teal-400 mt-0.5">
                  <ShieldCheck className="w-3.5 h-3.5" />
                </div>
                <span><strong>Rainfall-Aware Hydrological Modeling:</strong> Real-time monsoon flood runoff correlation.</span>
              </div>
              <div className="flex items-start gap-2.5 text-xs text-slate-300">
                <div className="rounded-md bg-teal-500/20 p-1 text-teal-400 mt-0.5">
                  <ShieldCheck className="w-3.5 h-3.5" />
                </div>
                <span><strong>GIS Heat Mapping:</strong> Interactive village level geospatial risk classification.</span>
              </div>
            </div>
          </div>

          <div className="mt-8 pt-6 border-t border-slate-800/80 text-[11px] text-slate-400">
            <div className="flex items-center gap-1.5 font-semibold text-slate-300 mb-1">
              <Info className="w-3.5 h-3.5 text-teal-400" />
              <span>Academic Notice</span>
            </div>
            Non-diagnostic early-warning decision support system. Never diagnoses individuals.
          </div>
        </div>

        {/* Right Form & 1-Click Demo Profiles */}
        <div className="lg:col-span-6 p-8 lg:p-10 flex flex-col justify-center">
          <div className="mb-6">
            <h2 className="text-xl font-bold text-white">Surveillance Portal Sign In</h2>
            <p className="text-xs text-slate-400 mt-1">Select a pre-seeded demo role or enter your credentials.</p>
          </div>

          {error && (
            <div className="mb-4 rounded-xl bg-rose-500/15 border border-rose-500/30 p-3 text-xs text-rose-400">
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Username</label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full rounded-xl border border-slate-700 bg-slate-950/80 py-2.5 pl-10 pr-4 text-sm text-white placeholder-slate-500 focus:border-teal-500 focus:outline-none"
                  placeholder="e.g. admin"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-xl border border-slate-700 bg-slate-950/80 py-2.5 pl-10 pr-4 text-sm text-white placeholder-slate-500 focus:border-teal-500 focus:outline-none"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-teal-500 to-cyan-500 py-3 text-sm font-bold text-slate-950 shadow-lg shadow-teal-500/20 hover:from-teal-400 hover:to-cyan-400 transition disabled:opacity-50"
            >
              <span>{loading ? 'Authenticating...' : 'Sign In to Surveillance'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* 1-Click Demo Logins */}
          <div className="mt-6 pt-5 border-t border-slate-800">
            <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2.5">
              1-Click Demo Accounts (Academic Review)
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleQuickLogin('admin')}
                className={`p-2 rounded-lg border text-left text-xs transition ${
                  username === 'admin'
                    ? 'border-teal-500 bg-teal-500/10 text-teal-300'
                    : 'border-slate-800 bg-slate-950/50 text-slate-300 hover:border-slate-700'
                }`}
              >
                <div className="font-semibold">State Admin</div>
                <div className="text-[10px] text-slate-400">username: admin</div>
              </button>

              <button
                type="button"
                onClick={() => handleQuickLogin('dho_majuli')}
                className={`p-2 rounded-lg border text-left text-xs transition ${
                  username === 'dho_majuli'
                    ? 'border-teal-500 bg-teal-500/10 text-teal-300'
                    : 'border-slate-800 bg-slate-950/50 text-slate-300 hover:border-slate-700'
                }`}
              >
                <div className="font-semibold">DHO (Majuli District)</div>
                <div className="text-[10px] text-slate-400">username: dho_majuli</div>
              </button>

              <button
                type="button"
                onClick={() => handleQuickLogin('asha_majuli_1')}
                className={`p-2 rounded-lg border text-left text-xs transition ${
                  username === 'asha_majuli_1'
                    ? 'border-teal-500 bg-teal-500/10 text-teal-300'
                    : 'border-slate-800 bg-slate-950/50 text-slate-300 hover:border-slate-700'
                }`}
              >
                <div className="font-semibold">ASHA Worker (Majuli)</div>
                <div className="text-[10px] text-slate-400">username: asha_majuli_1</div>
              </button>

              <button
                type="button"
                onClick={() => handleQuickLogin('dho_khasi')}
                className={`p-2 rounded-lg border text-left text-xs transition ${
                  username === 'dho_khasi'
                    ? 'border-teal-500 bg-teal-500/10 text-teal-300'
                    : 'border-slate-800 bg-slate-950/50 text-slate-300 hover:border-slate-700'
                }`}
              >
                <div className="font-semibold">DHO (East Khasi Hills)</div>
                <div className="text-[10px] text-slate-400">username: dho_khasi</div>
              </button>
            </div>
            <div className="text-[10px] text-slate-400 mt-2 text-center">
              Default demo password for all accounts: <code className="text-teal-300">password123</code>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default LoginPage;
