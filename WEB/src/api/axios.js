import axios from 'axios';

// Используем переменную окружения для базового URL API
const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:8000/api";

const api = axios.create({
    baseURL: apiUrl,
    headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
    }
});

api.interceptors.request.use(config => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

api.interceptors.response.use(
    response => response,
    error => {
        if (error.config && error.config.skipAuthRedirect) {
            return Promise.reject(error);
        }
        if (error.response?.status === 401) {
            localStorage.removeItem('token');
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

export default api; 