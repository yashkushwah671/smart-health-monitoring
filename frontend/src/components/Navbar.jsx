import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Activity, RefreshCw, LogOut } from 'lucide-react';
import { Link } from 'react-router-dom';

export const Navbar = ({ toggleSidebar }) => {
  const { user, logout, isOnline, offlineCount, syncing, triggerManualSync, syncMessage } = useAuth();

  return (
    <header className="sticky top-0 z-40 flex h-16 w-full items-center justify-between border-b border-slate-800 bg-slate-900/90 px-4 lg:px-8 backdrop-blur-md">
      {/* Brand & Mobile Toggle */}
      <div className="flex items-center gap-3">
        <button
          onClick={toggleSidebar}
          className="lg:hidden rounded-lg p-2 text-slate-400 hover:bg-slate-800 hover:text-white"
          aria-label="Toggle Menu"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>

        <Link to="/dashboard" className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-tr from-cyan-600 to-teal-400 shadow-md shadow-teal-500/20">
            <Activity className="h-5 w-5 text-slate-950 font-bold" />
          </div>
          <div>
            <span className="font-bold text-base tracking-tight text-white flex items-center gap-1.5">
              Smart Health <span className="text-xs px-1.5 py-0.5 rounded bg-teal-500/20 text-teal-300 border border-teal-500/30">Northeast India</span>
            </span>
            <span className="hidden sm:block text-[11px] text-slate-400 leading-none">
              Water-Borne Disease Early Warning System
            </span>
          </div>
        </Link>
      </div>

      {/* Sync banner message popup */}
      {syncMessage && (
        <div className="hidden md:flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-xs animate-bounce">
          <span>{syncMessage}</span>
        </div>
      )}

      {/* Right Controls: Offline queue, Role Badge, User Profile */}
      <div className="flex items-center gap-3">

        {/* Offline Queue Syncer */}
        {offlineCount > 0 && (
          <button
            onClick={triggerManualSync}
            disabled={syncing || !isOnline}
            className="flex items-center gap-1.5 rounded-full bg-amber-500/15 border border-amber-500/30 px-3 py-1 text-xs font-medium text-amber-300 hover:bg-amber-500/25 transition disabled:opacity-50"
            title="Click to sync offline observations"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${syncing ? 'animate-spin text-amber-200' : ''}`} />
            <span>{offlineCount} Pending Sync</span>
          </button>
        )}

        {/* User Info & Role Pill */}
        {user && (
          <div className="flex items-center gap-2.5 pl-2 border-l border-slate-800">
            <div className="hidden text-right lg:block">
              <div className="text-xs font-semibold text-white">{user.fullName}</div>
              <div className="text-[10px] text-teal-400 uppercase font-mono tracking-wider">
                {user.role.replace('ROLE_', '').replace('_', ' ')}
                {user.districtName ? ` • ${user.districtName}` : ''}
              </div>
            </div>

            <button
              onClick={logout}
              className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-800 text-slate-300 hover:bg-rose-500/20 hover:text-rose-400 transition"
              title="Sign Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </header>
  );
};

export default Navbar;
