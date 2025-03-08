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
 * Сжимает изображение до указанного размера
 * @param {File} file - Исходный файл изображения
 * @param {number} maxSizeKB - Максимальный размер в килобайтах
 * @returns {Promise<File>} - Сжатый файл
 */
async function compressImage(file, maxSizeKB = 500) {
    return new Promise((resolve, reject) => {
        // Проверяем, является ли файл изображением
        if (!file.type.startsWith('image/')) {
            reject(new Error('Файл не является изображением'));
            return;
        }

        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = (event) => {
            const img = new Image();
            img.src = event.target.result;
            
            img.onload = () => {
                // Создаем canvas для сжатия изображения
                const canvas = document.createElement('canvas');
                let width = img.width;
                let height = img.height;
                
                // Ограничиваем размеры изображения
                const MAX_WIDTH = 800;
                const MAX_HEIGHT = 800;
                
                if (width > height) {
                    if (width > MAX_WIDTH) {
                        height *= MAX_WIDTH / width;
                        width = MAX_WIDTH;
                    }
                } else {
                    if (height > MAX_HEIGHT) {
                        width *= MAX_HEIGHT / height;
                        height = MAX_HEIGHT;
                    }
                }
                
                canvas.width = width;
                canvas.height = height;
                
                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0, width, height);
                
                // Начинаем с высокого качества
                let quality = 0.9;
                let compressedFile;
                
                // Функция для преобразования canvas в File
                const canvasToFile = (q) => {
                    return new Promise((res) => {
                        canvas.toBlob((blob) => {
                            const newFile = new File([blob], file.name, {
                                type: 'image/jpeg',
                                lastModified: Date.now()
                            });
                            res(newFile);
                        }, 'image/jpeg', q);
                    });
                };
                
                // Рекурсивно уменьшаем качество, пока не достигнем нужного размера
                const compress = async () => {
                    compressedFile = await canvasToFile(quality);
                    
                    // Если размер все еще слишком большой и качество можно еще уменьшить
                    if (compressedFile.size > maxSizeKB * 1024 && quality > 0.1) {
                        quality -= 0.1;
                        await compress();
                    }
                };
                
                compress().then(() => {
                    console.log(`Изображение сжато: ${file.size} -> ${compressedFile.size} байт`);
                    resolve(compressedFile);
                });
            };
            
            img.onerror = (error) => {
                reject(error);
            };
        };
        
        reader.onerror = (error) => {
            reject(error);
        };
    });
}

/**
 * Загрузка аватара пользователя.
 * @param {string} uuid - UUID пользователя.
 * @param {File} file - Файл изображения аватара.
 * @param {AbortSignal} [signal] - Сигнал для отмены запроса.
 * @returns {Promise<Object>} - Ответ от сервера.
 */
export async function uploadUserAvatar(uuid, file, signal) {
    try {
        const cleanedUuid = cleanUuid(uuid);
        
        // Проверяем размер файла
        const MAX_SIZE_KB = 500; // 500 KB
        let fileToUpload = file;
        
        if (file.size > MAX_SIZE_KB * 1024) {
            console.log(`Файл слишком большой (${Math.round(file.size / 1024)} KB), сжимаем...`);
            fileToUpload = await compressImage(file, MAX_SIZE_KB);
        }
        
        const formData = new FormData();
        formData.append('subject_uuid', cleanedUuid);
        formData.append('file', fileToUpload);
        
        console.log('Uploading avatar with subject_uuid:', cleanedUuid);
        console.log('File size after compression:', Math.round(fileToUpload.size / 1024), 'KB');
        
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
            params: { user_id: cleanedUuid },
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
            params: { user_id: cleanedUuid },
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
            params: { user_id: cleanedUuid },
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
        
        // Добавляем временную метку для предотвращения кэширования
        const timestamp = new Date().getTime();
        
        // Используем UUID без дефисов в запросе
        const response = await api.get(`/files/${cleanedUuid}`, {
            params: { 
                file_uuid: cleanedUuid, 
                mode: 'avatar',
                t: timestamp // Добавляем временную метку
            },
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