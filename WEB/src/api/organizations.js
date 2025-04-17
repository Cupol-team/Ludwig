import api from './axios';

/**
 * Получение списка организаций.
 * @param {AbortSignal} signal - сигнал для отмены запроса.
 * @returns {Promise<Object[]>} - данные с сервера.
 */
export async function getOrganizations(signal) {
    try {
        const { data } = await api.get('/organizations/', { signal });
        // Извлекаем массив организаций из data.items
        return data.items || [];
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

/**
 * Получение ссылки приглашения для организации.
 * @param {string} organizationUuid - UUID организации.
 * @param {AbortSignal} signal - сигнал для отмены запроса.
 * @returns {Promise<Object>} - объект с ссылкой приглашения.
 */
export async function getOrganizationInviteLink(organizationUuid, signal) {
    try {
        const { data } = await api.get(`/organizations/${organizationUuid}/setting/invite`, { signal });
        return data;
    } catch (error) {
        throw error;
    }
}

/**
 * Обновление ссылки приглашения для организации.
 * @param {string} organizationUuid - UUID организации.
 * @param {string} invite - новая ссылка приглашения.
 * @param {AbortSignal} signal - сигнал для отмены запроса.
 * @returns {Promise<Object>} - объект с обновленной ссылкой приглашения.
 */
export async function updateOrganizationInviteLink(organizationUuid, invite, signal) {
    try {
        const { data } = await api.put(
            `/organizations/${organizationUuid}/setting/invite`, 
            { invite },
            { 
                headers: { 'Content-Type': 'application/json' },
                signal 
            }
        );
        return data;
    } catch (error) {
        throw error;
    }
}

/**
 * Получение информации об организации по коду приглашения.
 * @param {string} inviteCode - Код приглашения.
 * @param {AbortSignal} signal - сигнал для отмены запроса.
 * @returns {Promise<Object>} - информация об организации.
 */
export async function getOrganizationByInvite(inviteCode, signal) {
    try {
        const { data } = await api.get(`/organizations/invite/${inviteCode}`, { signal });
        return data;
    } catch (error) {
        throw error;
    }
} 