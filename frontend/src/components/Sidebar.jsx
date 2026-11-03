import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard,
  MapPin,
  FilePlus,
  AlertTriangle,
  FileText,
  Map,
  Users,
  Settings,
  ShieldAlert,
} from 'lucide-react';

export const Sidebar = ({ isOpen, closeSidebar }) => {
  const { user, hasRole } = useAuth();

  const navItems = [
    {
      to: '/dashboard',
      label: 'Main Dashboard',
      icon: LayoutDashboard,
      roles: ['ROLE_ADMIN', 'ROLE_DISTRICT_OFFICER', 'ROLE_ASHA_WORKER'],
    },
    {
      to: '/gis-map',
      label: 'GIS Risk Map',
      icon: Map,
      roles: ['ROLE_ADMIN', 'ROLE_DISTRICT_OFFICER', 'ROLE_ASHA_WORKER'],
    },
    {
      to: '/data-entry',
      label: 'Field Data Entry',
      icon: FilePlus,
      roles: ['ROLE_ADMIN', 'ROLE_ASHA_WORKER', 'ROLE_DISTRICT_OFFICER'],
    },
    {
      to: '/alerts',
      label: 'Early-Warning Alerts',
      icon: AlertTriangle,
      roles: ['ROLE_ADMIN', 'ROLE_DISTRICT_OFFICER', 'ROLE_ASHA_WORKER'],
    },
    {
      to: '/reports',
      label: 'Reports & History',
      icon: FileText,
      roles: ['ROLE_ADMIN', 'ROLE_DISTRICT_OFFICER', 'ROLE_ASHA_WORKER'],
    },
    {
      to: '/villages',
      label: 'Village Registry',
      icon: MapPin,
      roles: ['ROLE_ADMIN', 'ROLE_DISTRICT_OFFICER'],
    },
    {
      to: '/users',
      label: 'User Management',
      icon: Users,
      roles: ['ROLE_ADMIN'],
    },
    {
      to: '/settings',
      label: 'System Settings',
      icon: Settings,
      roles: ['ROLE_ADMIN'],
    },
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          onClick={closeSidebar}
          className="fixed inset-0 z-40 bg-slate-950/80 backdrop-blur-sm lg:hidden"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-64 flex-col justify-between border-r border-slate-800 bg-slate-900/95 p-4 transition-transform duration-300 ease-in-out backdrop-blur-xl lg:static lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="space-y-6">
          {/* Mobile Header */}
          <div className="flex items-center justify-between lg:hidden pb-3 border-b border-slate-800">
            <span className="font-bold text-teal-400">Navigation Menu</span>
            <button
              onClick={closeSidebar}
              className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white"
            >
              ✕
            </button>
          </div>


          {/* Navigation Links */}
          <nav className="space-y-1.5">
            {navItems
              .filter((item) => item.roles.some((r) => hasRole(r)))
              .map((item) => {
                const Icon = item.icon;
                return (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    onClick={closeSidebar}
                    className={({ isActive }) =>
                      `flex items-center gap-3 rounded-lg px-3.5 py-2.5 text-xs lg:text-sm font-medium transition-all ${
                        isActive
                          ? 'bg-gradient-to-r from-teal-500/20 to-cyan-500/10 text-teal-300 border border-teal-500/30 font-semibold shadow-sm'
                          : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                      }`
                    }
                  >
                    <Icon className="w-4 h-4 text-teal-400" />
                    <span>{item.label}</span>
                  </NavLink>
                );
              })}
          </nav>
        </div>

        {/* Academic / Non-diagnostic Disclaimer Card */}
        <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-3 text-[11px] text-slate-400">
          <div className="flex items-center gap-1.5 font-semibold text-slate-300 mb-1">
            <ShieldAlert className="w-3.5 h-3.5 text-amber-400" />
            <span>Decision-Support System</span>
          </div>
          <p className="leading-tight text-[10px]">
            Early warning risk estimation only. Non-diagnostic community surveillance protocol.
          </p>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
