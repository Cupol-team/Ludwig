import api from './axios';

/**
 * Обновление профиля пользователя.
 * @param {string} uuid - UUID пользователя.
 * @param {Object} profileData - Данные профиля.
 * @param {AbortSignal} [signal] - Сигнал для отмены запроса.
 * @returns {Promise<Object>} - Ответ от сервера.
 */
export async function updateUserProfile(uuid, { name = null, surname = null, gender = null, date_of_birthday = null, email = null, password = null }, signal) {
    try {
        const response = await api.put('/user/update', {
            name,
            surname,
            gender,
            date_of_birthday,
            email,
            password
        }, {
            params: { uuid },
            signal
        });
        return response.data;
    } catch (error) {
        throw error;
    }
}

/**
 * Загрузка аватара пользователя.
 * @param {string} uuid - UUID пользователя.
 * @param {File} file - Файл изображения аватара.
 * @param {AbortSignal} [signal] - Сигнал для отмены запроса.
 * @returns {Promise<Object>} - Ответ от сервера.
 */
export async function uploadUserAvatar(uuid, file, signal) {
    const formData = new FormData();
    formData.append('avatar', file);

    try {
        const response = await api.post('/files/avatar_upload', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
            params: { uuid },
            signal
        });
        return response.data;
    } catch (error) {
        throw error;
    }
}

/**
 * Получение организаций пользователя.
 * @param {string} uuid - UUID пользователя.
 * @param {AbortSignal} [signal] - Сигнал для отмены запроса.
 * @returns {Promise<Object[]>} - Массив объектов с именами и UUID организаций.
 */
export async function getUserOrganizations(uuid, signal) {
    try {
        const { data } = await api.get('/user/organizations', { signal });
        return data.response.map(org => ({
            uuid: org.uuid,
            name: org.name
        }));
    } catch (error) {
        throw error;
    }
}

/**
 * Получение проектов пользователя.
 * @param {string} uuid - UUID пользователя.
 * @param {AbortSignal} [signal] - Сигнал для отмены запроса.
 * @returns {Promise<Object[]>} - Массив объектов с именами и UUID проектов.
 */
export async function getUserProjects(uuid, signal) {
    try {
        const { data } = await api.get('/user/projects', { signal });
        return data.response.items.map(project => ({
            project_uuid: project.project_uuid,
            project_name: project.project_name,
            organizationId: project.organization_uuid
        }));
    } catch (error) {
        throw error;
    }
}

/**
 * Получение профиля пользователя.
 * @param {string} uuid - UUID пользователя.
 * @param {AbortSignal} [signal] - Сигнал для отмены запроса.
 * @returns {Promise<Object>} - Объект с данными профиля.
 */
export async function getUserProfile(uuid, signal) {
    try {
        const { data } = await api.get('/user/profile', { signal });
        console.log('data');
        console.log(data);

        if (!data.response || !data.response.profiles) {
            throw new Error('Profile data is not available');
        }

        const profile = data.response.profiles;
        return {
            uuid: profile.uuid,
            email: profile.email,
            name: profile.name,
            surname: profile.surname,
            gender: profile.gender,
            date_of_birthday: profile.date_of_birthday
        };
    } catch (error) {
        console.error('Error fetching user profile:', error);
        throw error;
    }
}

/**
 * Получение аватара пользователя.
 * @param {string} uuid - UUID пользователя.
 * @param {AbortSignal} [signal] - Сигнал для отмены запроса.
 * @returns {Promise<string>} - URL объект для отображения аватара.
 */
export async function getUserAvatar(uuid, signal) {
    try {
        // Проверяем, что UUID не пустой
        if (!uuid) {
            console.warn('Empty UUID provided for avatar');
            return '/default-avatar.png';
        }
        
        // Удаляем дефисы из UUID
        const cleanUuid = uuid.replace(/-/g, '');
        
        // Используем UUID без дефисов в запросе
        const response = await api.get(`/files/${cleanUuid}`, {
            params: { file_uuid: cleanUuid, mode: 'avatar' },
            responseType: 'blob',
            signal
        });
        
        // Получаем тип контента из заголовков
        const contentType = response.headers['content-type'] || 'image/jpeg';
        
        // Создаем Blob из полученных данных
        const blob = new Blob([response.data], { type: contentType });
        
        // Создаем URL объект из blob для использования в src атрибуте img
        const imageUrl = URL.createObjectURL(blob);
        
        return imageUrl;
    } catch (error) {
        console.error('Error fetching user avatar:', error);
        return '/default-avatar.png';
    }
}