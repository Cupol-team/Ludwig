import axios from 'axios';
import api from './axios';

export async function getProjects(organizationId, signal) {
    try {
        const { data } = await api.get(`/organizations/${organizationId}/project/`, { signal });
        // Извлекаем список проектов из ответа:
        // Ожидаемый формат ответа:
        // {
        //   "response": {
        //     "items": [ { "uuid": "...", "name": "...", "description": "..." }, ... ]
        //   }
        // }
        return data.response?.items || [];
    } catch (error) {
        // Проверяем, отменён ли запрос
        if (axios.isCancel(error)) {
            // Если запрос отменён — можно вернуть пустой результат или игнорировать
            return [];
        }
        throw error;
    }
}

/**
 * Создание нового проекта для указанной организации.
 * @param {string} organizationId – UUID организации.
 * @param {Object} payload – данные проекта.
 * @param {string} payload.name – название проекта.
 * @param {string} payload.description – описание проекта (может быть пустым).
 *
 * @returns {Promise} - ответ от сервера.
 */
export async function createProject(organizationId, { name, description }) {
    try {
        return await api.put(
            `/organizations/${organizationId}/project/new`,
            { name, description },
            { headers: { 'Content-Type': 'application/json' } }
        );
    } catch (error) {
        throw error;
    }
} 