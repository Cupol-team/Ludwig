import axios from 'axios';
import api from './axios';

export async function getProjects(organizationId, signal) {
    try {
        const { data } = await api.get(`/organizations/${organizationId}/project/`, { signal });
        // Извлекаем список проектов из ответа:
        // Ожидаемый формат ответа:
        // {
        //   "items": [ { "uuid": "...", "name": "...", "description": "...", "role": "..." }, ... ]
        // }
        return data.items || [];
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

/**
 * Получение информации о проекте
 * @param {string} organizationId - UUID организации
 * @param {string} projectUuid - UUID проекта
 * @param {AbortSignal} [signal] - Сигнал для отмены запроса
 * @returns {Promise<Object>} - Объект с информацией о проекте
 */
export async function getProjectInfo(organizationId, projectUuid, signal) {
  try {
    const { data } = await api.get(
      `/organizations/${organizationId}/project/${projectUuid}/info/`,
      { signal }
    );
    // Предполагаем, что ответ приходит напрямую, без обертки response/items
    return data;
  } catch (error) {
    if (axios.isCancel(error)) {
      console.log('Запрос был отменен', error.message);
      return null;
    }
    throw error;
  }
}

/**
 * Редактирование существующего проекта
 * @param {string} organizationId - UUID организации
 * @param {string} projectUuid - UUID проекта
 * @param {Object} payload - Данные для обновления
 * @param {string} [payload.name] - Новое название проекта (опционально)
 * @param {string} [payload.description] - Новое описание проекта (опционально)
 * @returns {Promise<boolean>} - true в случае успеха
 */
export async function editProject(organizationId, projectUuid, payload) {
  try {
    // Отправляем только непустые поля
    const updateData = {};
    if (payload.name) updateData.name = payload.name;
    if (payload.description !== undefined) updateData.description = payload.description;
    
    // При успешном запросе сервер возвращает 204 No Content без тела ответа
    await api.put(
      `/organizations/${organizationId}/project/${projectUuid}/setting/edit`,
      updateData,
      { headers: { 'Content-Type': 'application/json' } }
    );
    
    // Если запрос прошел успешно, возвращаем true
    return true;
  } catch (error) {
    console.error('Ошибка при обновлении проекта:', error);
    throw error;
  }
}

/**
 * Удаление проекта
 * @param {string} organizationId - UUID организации
 * @param {string} projectUuid - UUID проекта
 * @returns {Promise<boolean>} - true в случае успеха
 */
export async function deleteProject(organizationId, projectUuid) {
  try {
    // При успешном запросе сервер возвращает 204 No Content без тела ответа
    await api.delete(
      `/organizations/${organizationId}/project/${projectUuid}/setting/delete`
    );
    
    // Если запрос прошел успешно, возвращаем true
    return true;
  } catch (error) {
    console.error('Ошибка при удалении проекта:', error);
    throw error;
  }
} 