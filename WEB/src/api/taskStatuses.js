import axios from 'axios';
import api from './axios';

/**
 * Получение списка статусов задач.
 * @param {string} orgId - Идентификатор организации.
 * @param {string} projectUuid - Идентификатор проекта.
 * @param {AbortSignal} signal - сигнал для отмены запроса.
 * @returns {Promise<Object[]>} - массив статусов задач.
 */
export async function getTaskStatuses(orgId, projectUuid, signal) {
    try {
        const { data } = await api.get(`/organizations/${orgId}/project/${projectUuid}/statuses/`, { signal });
        return data.response.items || data.response?.items || [];
    } catch (error) {
        if (axios.isCancel(error)) {
            return [];
        }
        throw error;
    }
}

/**
 * Создание нового статуса задачи.
 * @param {string} orgId - Идентификатор организации.
 * @param {string} projectUuid - Идентификатор проекта.
 * @param {Object} statusData - Данные статуса задачи: { name: string, description: string }
 * @param {AbortSignal} [signal] - Сигнал для отмены запроса.
 * @returns {Promise<Object>} - Объект с данными созданного статуса задачи.
 */
export async function createTaskStatus(orgId, projectUuid, statusData, signal) {
    try {
        const { data } = await api.put(
            `/organizations/${orgId}/project/${projectUuid}/statuses/new`,
            JSON.stringify(statusData),
            { 
                signal,
                headers: { 'Content-Type': 'application/json' }
            }
        );
        return data.response;
    } catch (error) {
        if (axios.isCancel(error)) {
            return null;
        }
        throw error;
    }
} 