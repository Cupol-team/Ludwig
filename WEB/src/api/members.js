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

/**
 * Получение всех участников организации.
 * @param {string} orgId - Идентификатор организации.
 * @param {AbortSignal} signal - сигнал для отмены запроса.
 * @returns {Promise<Object[]>} - массив участников организации.
 */
export async function getOrganizationMembers(orgId, signal) {
  try {
    const { data } = await api.get(`/organizations/${orgId}/members/get`, { signal });
    return data.response?.items || [];
  } catch (error) {
    if (axios.isCancel(error)) {
      return [];
    }
    throw error;
  }
}

/**
 * Добавление участника в проект.
 * @param {string} orgId - Идентификатор организации.
 * @param {string} projectUuid - Идентификатор проекта.
 * @param {string} memberUuid - Идентификатор участника.
 * @param {string} roleUuid - Идентификатор роли участника.
 * @param {AbortSignal} signal - сигнал для отмены запроса.
 * @returns {Promise<Object>} - результат операции.
 */
export async function addMemberToProject(orgId, projectUuid, memberUuid, roleUuid, signal) {
  try {
    const { data } = await api.post(
      `/organizations/${orgId}/project/${projectUuid}/members/add`,
      { user_uuid: memberUuid, role_uuid: roleUuid },
      { 
        signal,
        headers: { 'Content-Type': 'application/json' }
      }
    );
    return data;
  } catch (error) {
    if (axios.isCancel(error)) {
      return null;
    }
    throw error;
  }
}

// Добавляем функцию для обновления роли участника проекта
export async function updateMemberRole(organizationUuid, projectUuid, memberUuid, roleUuid, signal) {
  try {
    const { data } = await api.put(
      `/organizations/${organizationUuid}/project/${projectUuid}/members/${memberUuid}/edit`,
      {}, // Пустое тело запроса
      {
        signal,
        params: { role_uuid: roleUuid }, // Передаем role_uuid как query-параметр
        headers: { 'Content-Type': 'application/json' }
      }
    );
    return data;
  } catch (error) {
    throw error;
  }
}

/**
 * Добавление участника в организацию.
 * @param {string} orgId - Идентификатор организации.
 * @param {string} memberUuid - Идентификатор участника.
 * @param {string} roleUuid - Идентификатор роли участника.
 * @param {AbortSignal} signal - сигнал для отмены запроса.
 * @returns {Promise<Object>} - результат операции.
 */
export async function addMemberToOrganization(orgId, memberUuid, roleUuid, signal) {
  try {
    const { data } = await api.put(
      `/organizations/${orgId}/members/add_member`,
      { 
        member_uuid: memberUuid, 
        role_uuid: roleUuid 
      },
      {
        signal,
        headers: { 'Content-Type': 'application/json' }
      }
    );
    return data;
  } catch (error) {
    if (axios.isCancel(error)) {
      return null;
    }
    throw error;
  }
} 