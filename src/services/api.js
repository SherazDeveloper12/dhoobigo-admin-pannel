import axios from 'axios';

// --- THE ONLY PLACE YOU EVER CHANGE THE IP ---
export const BASE_IP = 'dhoobigo-dotnet-backend.onrender.com';
export const BASE_PORT = '5286';

export const API_BASE_URL = `https://${BASE_IP}/api`;
export const SOCKET_URL = `https://${BASE_IP}`;

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// --- GLOBAL SECURITY INTERCEPTOR ---
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export const adminService = {
  getStats: () => api.get('/admin/stats'),
  getOrders: () => api.get('/admin/orders'),
  getUsers: () => api.get('/users'),
  deleteUser: (id) => api.delete(`/admin/users/${id}`),
  updateOrderStatus: (id, status) => api.put(`/orders/${id}/status`, status),
  verifyUser: (id) => api.post(`/admin/verify-user/${id}`),
  assignRider: (orderId, riderId) => api.post('/admin/assign-rider', { orderId, riderId }),
  
  // Finance Management
  getUserWallet: (id) => api.get(`/payments/wallet/${id}`),
  adjustUserBalance: (userId, amount, description) => api.post('/payments/topup', { userId, amount, description }),
  
  // Tier Upgrades
  getPendingUpgrades: () => api.get('/admin/pending-upgrades'),
  approveUpgrade: (id, approve) => api.post(`/admin/approve-upgrade/${id}?approve=${approve}`),
};

export const authService = {
  login: (data) => api.post('/auth/login', data),
};

export const userService = {
  getProfile: () => api.get('/users/profile'),
  updateProfile: (id, data) => api.put(`/users/${id}/profile`, data),
};

export const paymentService = {
  getWalletOverview: () => api.get('/payments/wallet'),
  topUp: (amount) => api.post('/payments/topup', { amount }),
  withdraw: (data) => api.post('/payments/withdraw', data),
};

export default api;
