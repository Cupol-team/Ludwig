import axios from 'axios';
import api from './axios';

/**
 * Получение списка типов задач.
 * @param {string} orgId - Идентификатор организации.
 * @param {string} projectUuid - Идентификатор проекта.
 * @param {AbortSignal} signal - сигнал для отмены запроса.
 * @returns {Promise<Object[]>} - массив типов задач.
 */
export async function getTaskTypes(orgId, projectUuid, signal) {
    try {
        const { data } = await api.get(`/organizations/${orgId}/project/${projectUuid}/type/`, { signal });
        return data.response.items || data.response?.items || [];
    } catch (error) {
        if (axios.isCancel(error)) {
            return [];
        }
        throw error;
    }
}

/**
 * Создание нового типа задачи.
 * @param {string} orgId - Идентификатор организации.
 * @param {string} projectUuid - Идентификатор проекта.
 * @param {Object} typeData - Данные типа задачи: { name: string, description: string }
 * @param {AbortSignal} [signal] - Сигнал для отмены запроса.
 * @returns {Promise<Object>} - Объект с данными созданного типа задачи.
 */
export async function createTaskType(orgId, projectUuid, typeData, signal) {
    try {
        const { data } = await api.put(
            `/organizations/${orgId}/project/${projectUuid}/type/new`,
            JSON.stringify(typeData),
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