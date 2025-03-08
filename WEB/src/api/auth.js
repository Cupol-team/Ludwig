import axios from './axios';

export async function loginApi(email, password) {
    try {
        const params = new URLSearchParams();
        params.append('username', email);
        params.append('password', password);

        const { data } = await axios.post('/auth/login', params, {
            skipAuthRedirect: true,
        });
        
        // Сохраняем оба токена
        localStorage.setItem('token', data.access_token);
        localStorage.setItem('refreshToken', data.refresh_token);
        
        return data;
    } catch (error) {
        if (error.response && error.response.status === 401) {
            throw new Error('Неверный логин или пароль');
        }
        throw error;
    }
}

// Добавляем функцию для обновления токена
export async function refreshToken() {
    try {
        const refreshToken = localStorage.getItem('refreshToken');
        
        if (!refreshToken) {
            throw new Error('Refresh token not found');
        }
        
        // Изменяем формат запроса в соответствии с ожиданиями API
        const { data } = await axios.post(
            '/auth/refresh',
            null,  // Тело запроса пустое
            { 
                params: { refresh_token: refreshToken },  // Передаем токен как query параметр
                skipAuthRedirect: true,
                skipTokenRefresh: true // Предотвращаем бесконечный цикл
            }
        );
        
        // Сохраняем новые токены
        localStorage.setItem('token', data.access_token);
        localStorage.setItem('refreshToken', data.refresh_token);
        
        return data;
    } catch (error) {
        // Если не удалось обновить токен, очищаем хранилище
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
        throw error;
    }
}

// Новая функция для получения профиля пользователя
export async function getProfile() {
    try {
        const { data } = await axios.get('/user/', {
            skipAuthRedirect: true,
        });
        return data.response;
    } catch (error) {
        throw error;
    }
}

export function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    return Promise.resolve();
}

// export const getProfile = async () => {
//     try {
//         const response = await api.get('/auth/profile');
//         return response.data;
//     } catch (error) {
//         throw error;
//     }
// };