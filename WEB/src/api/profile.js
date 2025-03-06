import api from './axios';

/**
 * Очистка UUID от дефисов
 * @param {string} uuid - UUID с дефисами
 * @returns {string} - UUID без дефисов
 */
const cleanUuid = (uuid) => uuid ? uuid.replace(/-/g, '') : uuid;

/**
 * Обновление профиля пользователя.
 * @param {string} uuid - UUID пользователя.
 * @param {Object} profileData - Данные профиля.
 * @param {AbortSignal} [signal] - Сигнал для отмены запроса.
 * @returns {Promise<Object>} - Ответ от сервера.
 */
export async function updateUserProfile(uuid, { name = null, surname = null, gender = null, date_of_birthday = null, email = null, password = null }, signal) {
    try {
        // Подготовка данных для отправки
        const updateData = {};
        
        // Добавляем поля в правильном порядке, как ожидает сервер
        if (name !== null && name !== undefined) updateData.name = String(name);
        if (surname !== null && surname !== undefined) updateData.surname = String(surname);
        if (gender !== null && gender !== undefined) {
            console.log('Input gender value:', gender, 'Type:', typeof gender);
            
            if (gender === 'Мужской' || gender === 'мужской' || gender === '1' || gender === 1) {
                updateData.gender = '1';
            } else if (gender === 'Женский' || gender === 'женский' || gender === '0' || gender === 0) {
                updateData.gender = '0';
            } else {
                console.warn('Unrecognized gender value, not sending:', gender);
            }
        }
        if (date_of_birthday !== null && date_of_birthday !== undefined) {
            if (date_of_birthday instanceof Date) {
                updateData.date_of_birthday = date_of_birthday.toISOString().split('T')[0];
            } else if (typeof date_of_birthday === 'string') {
                const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
                if (dateRegex.test(date_of_birthday)) {
                    updateData.date_of_birthday = date_of_birthday;
                } else {
                    try {
                        const dateObj = new Date(date_of_birthday);
                        if (!isNaN(dateObj.getTime())) {
                            updateData.date_of_birthday = dateObj.toISOString().split('T')[0];
                        }
                    } catch (e) {
                        console.error('Failed to parse date:', e);
                    }
                }
            }
        }
        if (email !== null && email !== undefined) updateData.email = String(email);
        if (password !== null && password !== undefined && password.trim() !== '') {
            updateData.password = String(password);
        }
        
        console.log('Final update data being sent:', JSON.stringify(updateData));
        
        const response = await api.put('/user/update', updateData, { 
            signal,
            headers: {
                'Content-Type': 'application/json'
            }
        });
        return response.data;
    } catch (error) {
        console.error('Error updating profile:', error);
        if (error.response) {
            console.error('Error response data:', error.response.data);
        }
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
    const cleanedUuid = cleanUuid(uuid);
    
    // Добавляем UUID в форму, а не в параметры запроса
    formData.append('subject_uuid', cleanedUuid);
    formData.append('file', file);

    try {
        console.log('Uploading avatar with subject_uuid:', cleanedUuid);
        
        const response = await api.post('/files/avatar_upload', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
            signal
        });
        return response.data;
    } catch (error) {
        console.error('Error uploading avatar:', error);
        if (error.response) {
            console.error('Error response data:', error.response.data);
        }
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
        const cleanedUuid = cleanUuid(uuid);
        const { data } = await api.get('/user/organizations', { 
            params: { uuid: cleanedUuid },
            signal 
        });
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
        const cleanedUuid = cleanUuid(uuid);
        const { data } = await api.get('/user/projects', { 
            params: { uuid: cleanedUuid },
            signal 
        });
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
        const cleanedUuid = cleanUuid(uuid);
        const { data } = await api.get('/user/profile', { 
            params: { uuid: cleanedUuid },
            signal 
        });

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
        const cleanedUuid = cleanUuid(uuid);
        
        // Используем UUID без дефисов в запросе
        const response = await api.get(`/files/${cleanedUuid}`, {
            params: { file_uuid: cleanedUuid, mode: 'avatar' },
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