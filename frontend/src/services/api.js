import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor to inject JWT Bearer Token
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('smart_health_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

// Interceptor for 401 response handling
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      if (window.location.pathname !== '/login') {
        localStorage.removeItem('smart_health_token');
        localStorage.removeItem('smart_health_user');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// Offline Queue Utilities
export const OFFLINE_QUEUE_KEY = 'smart_health_offline_queue';

export const getOfflineQueue = () => {
  try {
    const raw = localStorage.getItem(OFFLINE_QUEUE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

export const saveToOfflineQueue = (observation) => {
  const queue = getOfflineQueue();
  const queueItem = {
    ...observation,
    offlineId: 'DRAFT-' + Date.now(),
    queuedAt: new Date().toISOString(),
  };
  queue.push(queueItem);
  localStorage.setItem(OFFLINE_QUEUE_KEY, JSON.stringify(queue));
  return queueItem;
};

export const clearOfflineQueue = () => {
  localStorage.removeItem(OFFLINE_QUEUE_KEY);
};

// API Services Export
export const api = {
  // Auth
  login: async (credentials) => {
    const res = await apiClient.post('/auth/login', credentials);
    return res.data;
  },
  getCurrentUser: async () => {
    const res = await apiClient.get('/auth/me');
    return res.data;
  },

  // Dashboard
  getDashboardSummary: async () => {
    const res = await apiClient.get('/dashboard/summary');
    return res.data;
  },

  // Villages & Districts
  getVillages: async (districtId) => {
    const params = districtId ? { districtId } : {};
    const res = await apiClient.get('/villages', { params });
    return res.data;
  },
  getVillageById: async (id) => {
    const res = await apiClient.get(`/villages/${id}`);
    return res.data;
  },
  createVillage: async (village, districtId, ashaUserId) => {
    const res = await apiClient.post('/villages', village, {
      params: { districtId, ashaUserId },
    });
    return res.data;
  },
  updateVillage: async (id, village, districtId, ashaUserId) => {
    const res = await apiClient.put(`/villages/${id}`, village, {
      params: { districtId, ashaUserId },
    });
    return res.data;
  },
  deleteVillage: async (id) => {
    const res = await apiClient.delete(`/villages/${id}`);
    return res.data;
  },
  getDistricts: async () => {
    const res = await apiClient.get('/districts');
    return res.data;
  },

  // Observations
  submitObservation: async (data) => {
    if (!navigator.onLine) {
      // Save offline draft
      const draft = saveToOfflineQueue(data);
      return {
        offline: true,
        data: draft,
        message: 'Saved locally in offline queue. Will sync automatically when connected.',
      };
    }
    const res = await apiClient.post('/observations', data);
    return res.data;
  },
  getObservations: async (filters = {}) => {
    const res = await apiClient.get('/observations', { params: filters });
    return res.data;
  },
  uploadCsvBulk: async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    const res = await apiClient.post('/observations/bulk-upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res.data;
  },

  // Predictions
  getPredictionById: async (id) => {
    const res = await apiClient.get(`/predictions/${id}`);
    return res.data;
  },
  getVillagePredictions: async (villageId) => {
    const res = await apiClient.get(`/predictions/village/${villageId}`);
    return res.data;
  },
  getLatestPredictions: async () => {
    const res = await apiClient.get('/predictions/latest');
    return res.data;
  },

  // Alerts
  getAlerts: async (status) => {
    const params = status ? { status } : {};
    const res = await apiClient.get('/alerts', { params });
    return res.data;
  },
  getAlertById: async (id) => {
    const res = await apiClient.get(`/alerts/${id}`);
    return res.data;
  },
  updateAlertStatus: async (id, status, resolutionNotes) => {
    const res = await apiClient.patch(`/alerts/${id}/status`, { status, resolutionNotes });
    return res.data;
  },

  // What-If Simulations
  runSimulation: async (data) => {
    const res = await apiClient.post('/simulations/run', data);
    return res.data;
  },
  getRecentSimulations: async () => {
    const res = await apiClient.get('/simulations/recent');
    return res.data;
  },

  // Reports
  exportCsvUrl: (districtId, villageId, startDate, endDate) => {
    const params = new URLSearchParams();
    if (districtId) params.append('districtId', districtId);
    if (villageId) params.append('villageId', villageId);
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    return `${API_BASE_URL}/reports/export-csv?${params.toString()}`;
  },

  // Offline Sync
  syncOfflineBatch: async () => {
    const queue = getOfflineQueue();
    if (!queue || queue.length === 0) return { totalReceived: 0, successfullySynced: 0 };
    
    const cleanRecords = queue.map(({ offlineId, queuedAt, ...rest }) => rest);
    const res = await apiClient.post('/sync', {
      clientSyncId: 'CLIENT-SYNC-' + Date.now(),
      offlineObservations: cleanRecords,
    });
    
    if (res.data.status === 'SUCCESS' || res.data.successfullySynced > 0) {
      clearOfflineQueue();
    }
    return res.data;
  },

  // Users
  getAllUsers: async () => {
    const res = await apiClient.get('/users');
    return res.data;
  },
  createUser: async (userData) => {
    const res = await apiClient.post('/users', userData);
    return res.data;
  },
};

export default api;
