import axios from './axios';

export async function loginApi(email, password) {
    try {
        const params = new URLSearchParams();
        params.append('username', email);
        params.append('password', password);

        const { data } = await axios.post('/auth/login', params, {
            skipAuthRedirect: true,
        });
        return data;
    } catch (error) {
        if (error.response && error.response.status === 401) {
            throw new Error('Неверный логин или пароль');
        }
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