import axios from 'axios';
import api from './axios';

/**
 * Получение списка ролей проекта.
 * @param {string} orgId - UUID организации.
 * @param {string} projectUuid - UUID проекта.
 * @param {AbortSignal} signal - сигнал для отмены запроса.
 * @returns {Promise<Object[]>} - массив ролей проекта.
 */
export async function getRoles(orgId, projectUuid, signal) {
    try {
        const { data } = await api.get(`/organizations/${orgId}/project/${projectUuid}/role/`, { signal });
        return data.response?.items || [];
    } catch (error) {
        if (axios.isCancel(error)) {
            return [];
        }
        throw error;
    }
} 