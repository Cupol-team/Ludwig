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

/**
 * Создание новой роли проекта.
 * @param {string} orgId - Идентификатор организации.
 * @param {string} projectUuid - Идентификатор проекта.
 * @param {Object} roleData - Данные роли: { name: string, description: string }
 * @param {AbortSignal} [signal] - Сигнал для отмены запроса.
 * @returns {Promise<Object>} - Объект с данными созданной роли.
 */
export async function createProjectRole(orgId, projectUuid, roleData, signal) {
    try {
        const { data } = await api.post(
            `/organizations/${orgId}/project/${projectUuid}/role/new`,
            JSON.stringify(roleData),
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

/**
 * Получение всех прав для списка ролей.
 * @param {string} orgId - UUID организации.
 * @param {string} projectUuid - UUID проекта.
 * @param {string[]} roleUuids - массив UUID ролей.
 * @param {AbortSignal} signal - сигнал для отмены запроса.
 * @returns {Promise<string[]>} - массив уникальных прав.
 */
export async function getAllPermissions(orgId, projectUuid, roleUuids, signal) {
    const permissionsSet = new Set();
    try {
        for (const roleUuid of roleUuids) {
            const { data } = await api.get(`/organizations/${orgId}/project/${projectUuid}/role/${roleUuid}/get_permissions/`, { signal });
            const permissions = data.permissions || [];
            permissions.forEach(permission => permissionsSet.add(permission));
        }
    } catch (error) {
        if (axios.isCancel(error)) {
            return [];
        }
        console.error('Error fetching permissions:', error);
        throw error;
    }

    return Array.from(permissionsSet);
}