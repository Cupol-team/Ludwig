import api from './axios';

/**
 * Получение задач для проекта.
 * @param {string} orgId - UUID организации.
 * @param {string} projectUuid - UUID проекта.
 * @param {AbortSignal} [signal] - сигнал для отмены запроса.
 * @returns {Promise<Object>} - объект с данными задач.
 */
export async function getTasks(orgId, projectUuid, signal) {
    try {
        const { data } = await api.get(`/organizations/${orgId}/project/${projectUuid}/tasks/`, { signal });
        return data;
    } catch (error) {
        throw error;
    }
}

/**
 * Изменяет (редактирует) задачу.
 * @param {string} organizationId - UUID организации.
 * @param {string} projectUuid - UUID проекта.
 * @param {string} taskUuid - UUID задачи.
 * @param {Object} payload - Объект с обновляемыми данными задачи.
 *        Допустимые поля: name, description, type, priority, status, date, executors.
 * @returns {Promise<Object>} - Ответ от API.
 */
export async function editTask(organizationId, projectUuid, taskUuid, payload) {
    try {
        const { data } = await api.post(
            `/organizations/${organizationId}/project/${projectUuid}/tasks/${taskUuid}/edit`,
            payload,
            { headers: { 'Content-Type': 'application/json' } }
        );
        return data;
    } catch (error) {
        throw error;
    }
}

export const getTaskDetail = (orgId, projectUuid, taskUuid, signal) => {
    return api.get(`/organizations/${orgId}/project/${projectUuid}/tasks/${taskUuid}/get`, { signal });
};

export async function createTask(orgId, projectUuid, payload, signal) {
    try {
        const { data } = await api.put(
            `/organizations/${orgId}/project/${projectUuid}/tasks/new`,
            payload,
            {
                signal,
                headers: { 'Content-Type': 'application/json' }
            }
        );
        return data;
    } catch (error) {
        throw error;
    }
} 