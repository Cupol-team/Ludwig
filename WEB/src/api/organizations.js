import api from './axios';

/**
 * Получение списка организаций.
 * @param {AbortSignal} signal - сигнал для отмены запроса.
 * @returns {Promise<Object[]>} - данные с сервера.
 */
export async function getOrganizations(signal) {
    try {
        const { data } = await api.get('/organizations/', { signal });
        return data;
    } catch (error) {
        throw error;
    }
}

/**
 * Создание организации.
 * @param {Object} payload - объект с данными организации.
 * @param {string} payload.name - название организации.
 * @param {string} [payload.description] - описание организации (может быть пустым).
 *
 * @returns {Promise} - ответ от сервера.
 */
export async function createOrganization({ name, description }) {
    // Отправляем объект с данными в формате JSON.
    return api.put(
        '/organizations/create',
        { name, description },
        { headers: { 'Content-Type': 'application/json' } }
    );
} 