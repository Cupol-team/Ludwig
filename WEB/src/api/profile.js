import api from './axios';

/**
 * Обновление профиля пользователя.
 * @param {string} uuid - UUID пользователя.
 * @param {Object} profileData - Данные профиля.
 * @returns {Promise<Object>} - Ответ от сервера.
 */
export async function updateUserProfile(uuid, { name = null, surname = null, gender = null, date_of_birthday = null, email = null, password = null }) {
    try {
        const response = await api.put('/user/update', {
            name,
            surname,
            gender,
            date_of_birthday,
            email,
            password
        }, {
            params: { uuid }
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
 * @returns {Promise<Object>} - Ответ от сервера.
 */
export async function uploadUserAvatar(uuid, file) {
    const formData = new FormData();
    formData.append('avatar', file);

    try {
        const response = await api.post('/files/avatar_upload', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
            params: { uuid }
        });
        return response.data;
    } catch (error) {
        throw error;
    }
}

/**
 * Получение организаций пользователя.
 * @param {string} uuid - UUID пользователя.
 * @returns {Promise<Object[]>} - Массив объектов с именами и UUID организаций.
 */
export async function getUserOrganizations(uuid) {
    try {
        const { data } = await api.get('/user/organizations');
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
 * @returns {Promise<Object[]>} - Массив объектов с именами и UUID проектов.
 */
export async function getUserProjects(uuid) {
    try {
        const { data } = await api.get('/user/projects');
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
 * @returns {Promise<Object>} - Объект с данными профиля.
 */
export async function getUserProfile(uuid) {
    try {
        const { data } = await api.get('/user/profile');
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