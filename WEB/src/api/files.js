import axios from 'axios';
import api from './axios';

/**
 * Загружает файл на сервер.
 * @param {Object} params - Параметры загрузки.
 * @param {File} params.file - Файл для загрузки.
 * @param {string} params.organization_uuid - UUID организации.
 * @param {string} params.project_uuid - UUID проекта.
 * @param {string} [params.expire_time] - Опциональное время истечения срока действия.
 * @param {string|number} [params.max_downloads] - Опциональное максимальное количество скачиваний.
 * @param {AbortSignal} [params.signal] - Сигнал для отмены запроса.
 * @returns {Promise<Object>} - Ответ от API.
 */
export async function uploadFile({ file, organization_uuid, project_uuid, expire_time, max_downloads, signal }) {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('organization_uuid', organization_uuid);
  formData.append('project_uuid', project_uuid);
  if (expire_time) {
    // Преобразуем expire_time (ISO строку или Date) в UNIX timestamp (секунды)
    const unixExpire = Math.floor(new Date(expire_time).getTime() / 1000);
    formData.append('expire_time', unixExpire);
  }
  if (max_downloads) {
    formData.append('max_downloads', max_downloads);
  }

  try {
    const { data } = await api.post('/files/upload', formData, {
      signal,
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return data;
  } catch (error) {
    if (axios.isCancel(error)) {
      return;
    }
    throw error;
  }
} 


/**
 * Получает список файлов для заданного project_uuid.
 * @param {Object} params - Параметры запроса.
 * @param {string} params.project_uuid - UUID проекта.
 * @param {AbortSignal} [params.signal] - Сигнал для отмены запроса.
 * @returns {Promise<Object[]>} - Ответ с данными файлов.
 */
export async function getFiles({ project_uuid, signal }) {
    try {
      const { data } = await api.get('/files', {
        params: { project_uuid },
        signal,
      });
      return data;
    } catch (error) {
      throw error;
    }
  } 



/**
 * Скачивает файл по заданному file_id (uuid файла) с сервера.
 * @param {Object} params - Параметры запроса.
 * @param {string} params.file_id - UUID файла.
 * @param {string} [params.fileName] - Запасное имя файла с расширением.
 * @param {AbortSignal} [params.signal] - Сигнал для отмены запроса (опционально).
 * @returns {Promise<void>}
 */
export async function downloadFile({ file_id, signal, fileName: overrideFileName }) {
  try {
    // Отправляем GET запрос и получаем файл в виде blob.
    // В URL включаем file_id (так как в роутере FastAPI используется префикс "/{file_id}"),
    // а также передаем его как query-параметр file_uuid.
    const response = await api.get(`/files/${file_id}`, {
      params: { file_uuid: file_id },
      responseType: 'blob',
      signal,
    });

    // Попытка извлечь имя файла из заголовка Content-Disposition
    const disposition = response.headers['content-disposition'];
    let fileNameFromHeader = null;
    if (disposition && disposition.indexOf('filename=') !== -1) {
      const fileNameMatch = disposition.match(/filename\*?=(?:UTF-8'')?["']?([^"';\n]+)["']?/);
      if (fileNameMatch && fileNameMatch[1]) {
         fileNameFromHeader = decodeURIComponent(fileNameMatch[1]);
      }
    }

    // Используем имя из заголовков, либо запасное имя, либо стандартное значение
    const fileName = fileNameFromHeader || overrideFileName || 'downloaded_file';

    // Используем полученный Blob напрямую
    const url = window.URL.createObjectURL(response.data);

    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', fileName);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  } catch (error) {
    console.error('Error downloading file:', error);
    throw error;
  }
} 


/**
 * Удаляет файл по заданному file_id (uuid файла) с сервера.
 * @param {Object} params - Параметры запроса.
 * @param {string} params.file_id - UUID файла.
 * @param {AbortSignal} [params.signal] - Сигнал для отмены запроса (опционально).
 * @returns {Promise<Object>} - Ответ от API об удалении файла.
 */
export async function deleteFile({ file_id, signal }) {
    try {
      const response = await api.delete(`/files/${file_id}`, {
        params: { file_uuid: file_id },
        signal,
      });
      return response.data;
    } catch (error) {
      console.error('Error deleting file:', error);
      throw error;
    }
  } 