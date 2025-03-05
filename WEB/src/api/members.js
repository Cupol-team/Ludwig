import axios from 'axios';
import api from './axios'; // Если используется кастомный экземпляр axios; если нет, можно использовать просто axios

/**
 * Получение всех участников проекта.
 * @param {string} orgId - Идентификатор организации.
 * @param {string} projectUuid - Идентификатор проекта.
 * @param {AbortSignal} signal - сигнал для отмены запроса.
 * @returns {Promise<Object[]>} - массив участников.
 */
export async function getMembers(orgId, projectUuid, signal) {
  try {
    const { data } = await api.get(`/organizations/${orgId}/project/${projectUuid}/members/`, { signal });
    return data.response?.items || [];
  } catch (error) {
    if (axios.isCancel(error)) {
      return [];
    }
    throw error;
  }
} 