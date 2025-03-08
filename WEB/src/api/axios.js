import axios from 'axios';
import { refreshToken } from './auth';

const api = axios.create({
    baseURL: "http://localhost:8000/api",
    headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
    }
});

// Добавляем токен к каждому запросу
api.interceptors.request.use(config => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Создаем переменную для отслеживания процесса обновления токена
let isRefreshing = false;
// Массив запросов, ожидающих обновления токена
let failedQueue = [];

// Функция для обработки запросов в очереди
const processQueue = (error, token = null) => {
    failedQueue.forEach(prom => {
        if (error) {
            prom.reject(error);
        } else {
            prom.resolve(token);
        }
    });
    
    failedQueue = [];
};

api.interceptors.response.use(
    response => response,
    async error => {
        const originalRequest = error.config;
        
        // Если это запрос на обновление токена или мы явно указали пропустить обновление
        if (originalRequest.skipTokenRefresh) {
            return Promise.reject(error);
        }
        
        // Если запрос не авторизован (401) и не было попытки обновить токен
        if (error.response?.status === 401 && !originalRequest._retry) {
            // Если уже идет процесс обновления токена
            if (isRefreshing) {
                // Добавляем запрос в очередь
                return new Promise((resolve, reject) => {
                    failedQueue.push({ resolve, reject });
                })
                .then(token => {
                    originalRequest.headers['Authorization'] = `Bearer ${token}`;
                    return api(originalRequest);
                })
                .catch(err => {
                    return Promise.reject(err);
                });
            }
            
            // Помечаем запрос как повторный и начинаем обновление токена
            originalRequest._retry = true;
            isRefreshing = true;
            
            try {
                // Пытаемся обновить токен
                const { access_token } = await refreshToken();
                
                // Обновляем заголовок для текущего запроса
                originalRequest.headers['Authorization'] = `Bearer ${access_token}`;
                
                // Обрабатываем очередь запросов
                processQueue(null, access_token);
                
                // Повторяем оригинальный запрос с новым токеном
                return api(originalRequest);
            } catch (refreshError) {
                // Если не удалось обновить токен, обрабатываем очередь с ошибкой
                processQueue(refreshError);
                
                // Если указано пропустить редирект, просто возвращаем ошибку
                if (originalRequest.skipAuthRedirect) {
                    return Promise.reject(refreshError);
                }
                
                // Иначе перенаправляем на страницу логина
                window.location.href = '/login';
                return Promise.reject(refreshError);
            } finally {
                isRefreshing = false;
            }
        }
        
        // Если это не 401 ошибка или уже была попытка обновить токен
        if (error.config && error.config.skipAuthRedirect) {
            return Promise.reject(error);
        }
        
        // Если это 401 после попытки обновить токен, перенаправляем на логин
        if (error.response?.status === 401) {
            localStorage.removeItem('token');
            localStorage.removeItem('refreshToken');
            window.location.href = '/login';
        }
        
        return Promise.reject(error);
    }
);

export default api; 