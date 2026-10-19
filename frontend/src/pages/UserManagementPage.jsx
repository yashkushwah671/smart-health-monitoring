import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { Users, Plus, UserPlus, Shield, CheckCircle, Mail, Phone, MapPin } from 'lucide-react';

export const UserManagementPage = () => {
  const [users, setUsers] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  const [formData, setFormData] = useState({
    username: '',
    fullName: '',
    email: '',
    phone: '',
    role: 'ROLE_ASHA_WORKER',
    state: 'Assam',
    districtId: '',
    subCentre: '',
    password: 'password123',
  });

  const loadUsers = async () => {
    setLoading(true);
    try {
      const [uData, dData] = await Promise.all([
        api.getAllUsers(),
        api.getDistricts(),
      ]);
      setUsers(uData);
      setDistricts(dData);
      if (dData.length > 0 && !formData.districtId) {
        setFormData((prev) => ({ ...prev, districtId: dData[0].id }));
      }
    } catch (err) {
      console.error('Failed to load users', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const handleCreateUser = async (e) => {
    e.preventDefault();
    try {
      await api.createUser({
        ...formData,
        districtId: Number(formData.districtId),
      });
      setShowModal(false);
      loadUsers();
    } catch (err) {
      window.alert('Failed to register user: ' + (err.response?.data?.message || err.message));
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            <Users className="w-6 h-6 text-teal-400" />
            <span>Health Surveillance User Management</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Manage system access for State Administrators, District Health Officers (DHO), and ASHA/ANM field workers.
          </p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-1.5 rounded-xl bg-teal-500 px-4 py-2.5 text-xs font-bold text-slate-950 shadow-md shadow-teal-500/20 hover:bg-teal-400 transition"
        >
          <UserPlus className="w-4 h-4" />
          <span>Register New Health Worker / Officer</span>
        </button>
      </div>

      {/* Users Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {users.map((u) => (
          <div
            key={u.id}
            className="rounded-2xl border border-slate-800 bg-slate-900/80 p-5 shadow-xl backdrop-blur-md space-y-3 flex flex-col justify-between"
          >
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-white text-base">{u.fullName}</span>
                <span className="font-mono text-[10px] px-2 py-0.5 rounded font-semibold bg-teal-500/20 text-teal-300 border border-teal-500/30">
                  {u.role.replace('ROLE_', '')}
                </span>
              </div>

              <div className="text-xs text-slate-400 font-mono">
                username: <strong className="text-slate-200">{u.username}</strong>
              </div>

              <div className="text-xs text-slate-300 space-y-1 pt-1 border-t border-slate-800/80">
                <div className="flex items-center gap-2">
                  <Mail className="w-3.5 h-3.5 text-slate-500" />
                  <span className="truncate">{u.email}</span>
                </div>
                {u.phone && (
                  <div className="flex items-center gap-2">
                    <Phone className="w-3.5 h-3.5 text-slate-500" />
                    <span>{u.phone}</span>
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <MapPin className="w-3.5 h-3.5 text-slate-500" />
                  <span>{u.subCentre || 'Central Health Cell'}</span>
                </div>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-800/80 text-[11px] text-slate-400 flex justify-between items-center">
              <span>{u.state} • {u.districtName || 'State HQ'}</span>
              <span className="text-emerald-400 font-medium flex items-center gap-1">
                <CheckCircle className="w-3 h-3" /> Active
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* User Create Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-lg rounded-2xl border border-slate-700 bg-slate-900 p-6 shadow-2xl space-y-4">
            <h3 className="font-bold text-white text-base border-b border-slate-800 pb-2">
              Register Health Personnel
            </h3>

            <form onSubmit={handleCreateUser} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Username</label>
                  <input
                    type="text"
                    required
                    value={formData.username}
                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                    className="w-full rounded-xl border border-slate-700 bg-slate-950 p-2 text-white font-mono"
                    placeholder="e.g. asha_dhemaji_1"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Full Name</label>
                  <input
                    type="text"
                    required
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    className="w-full rounded-xl border border-slate-700 bg-slate-950 p-2 text-white"
                    placeholder="e.g. Minoti Doley"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Email</label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full rounded-xl border border-slate-700 bg-slate-950 p-2 text-white"
                    placeholder="name@nhm.gov.in"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Phone</label>
                  <input
                    type="text"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full rounded-xl border border-slate-700 bg-slate-950 p-2 text-white"
                    placeholder="+91 9435000000"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Role</label>
                  <select
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                    aria-label="Select Role"
                    className="w-full rounded-xl border border-slate-700 bg-slate-950 p-2 text-white"
                  >
                    <option value="ROLE_ASHA_WORKER">ASHA / ANM Worker</option>
                    <option value="ROLE_DISTRICT_OFFICER">District Health Officer (DHO)</option>
                    <option value="ROLE_ADMIN">State Administrator</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Assigned District</label>
                  <select
                    value={formData.districtId}
                    onChange={(e) => setFormData({ ...formData, districtId: e.target.value })}
                    aria-label="Select Assigned District"
                    className="w-full rounded-xl border border-slate-700 bg-slate-950 p-2 text-white"
                  >
                    {districts.map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.districtName} ({d.state})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">Sub-Centre Catchment</label>
                <input
                  type="text"
                  value={formData.subCentre}
                  onChange={(e) => setFormData({ ...formData, subCentre: e.target.value })}
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 p-2 text-white"
                  placeholder="e.g. Jonai Health Sub-Centre"
                />
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
                  Register Account
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManagementPage;
