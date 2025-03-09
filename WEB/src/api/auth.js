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

/**
 * Функция для регистрации нового пользователя
 * @param {Object} userData - Данные пользователя для регистрации
 * @param {string} userData.name - Имя пользователя
 * @param {string} userData.surname - Фамилия пользователя
 * @param {string} userData.email - Email пользователя
 * @param {string} userData.password - Пароль пользователя
 * @param {string} userData.gender - Пол пользователя (1 - мужской, 0 - женский)
 * @param {Date} userData.date_of_birthday - Дата рождения пользователя
 * @returns {Promise<Object>} - Объект с токенами доступа
 */
export async function registerApi(userData) {
    try {
        // Форматируем дату рождения в формат YYYY-MM-DD
        const formattedDate = userData.date_of_birthday instanceof Date 
            ? userData.date_of_birthday.toISOString().split('T')[0]
            : userData.date_of_birthday;

        // Создаем объект с данными для отправки
        const requestData = {
            name: userData.name,
            surname: userData.surname,
            email: userData.email,
            password: userData.password,
            gender: userData.gender,
            date_of_birthday: formattedDate
        };

        // Отправляем запрос на регистрацию с данными в теле запроса
        const { data } = await axios.post('/auth/register', requestData, {
            skipAuthRedirect: true,
            headers: {
                'Content-Type': 'application/json'
            }
        });
        
        // Сохраняем полученные токены  
        localStorage.setItem('token', data.access_token);
        localStorage.setItem('refreshToken', data.refresh_token);
        
        return data;
    } catch (error) {
        // Обработка различных ошибок
        if (error.response) {
            if (error.response.status === 400) {
                throw new Error('Некорректные данные для регистрации');
            } else if (error.response.status === 409) {
                throw new Error('Пользователь с таким email уже существует');
            }
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