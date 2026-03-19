import axios from 'axios';

const api = axios.create({
  baseURL: 'https://suraksha-pay-backend.onrender.com/api',
  headers: { 'Content-Type': 'application/json' }
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

export default api;