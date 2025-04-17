import React from 'react';
import PropTypes from 'prop-types';

function FileItem({ file, onDownload, onDelete, profileUuid }) {
  // Функция для форматирования размера файла в Б, КБ или МБ
  const formatFileSize = (bytes) => {
    if (bytes < 1024) return `${bytes} Б`;
    else if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} КБ`;
    else return `${(bytes / (1024 * 1024)).toFixed(1)} МБ`;
  };

  // Функция определения типа файла по расширению
  const getFileTypeIcon = (extension) => {
    if (!extension) return '📄'; // По умолчанию документ
    
    const ext = extension.toLowerCase().replace('.', '');
    
    // Изображения
    if (['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp', 'svg'].includes(ext)) {
      return '🖼️';
    }
    // Документы
    if (['doc', 'docx', 'txt', 'rtf', 'odt', 'pdf'].includes(ext)) {
      return '📝';
    }
    // Презентации
    if (['ppt', 'pptx', 'odp'].includes(ext)) {
      return '📊';
    }
    // Таблицы
    if (['xls', 'xlsx', 'csv', 'ods'].includes(ext)) {
      return '📈';
    }
    // Архивы
    if (['zip', 'rar', '7z', 'tar', 'gz'].includes(ext)) {
      return '🗂️';
    }
    // Аудио
    if (['mp3', 'wav', 'ogg', 'flac', 'aac'].includes(ext)) {
      return '🎵';
    }
    // Видео
    if (['mp4', 'avi', 'mov', 'wmv', 'mkv', 'webm'].includes(ext)) {
      return '🎬';
    }
    // Код
    if (['js', 'jsx', 'ts', 'tsx', 'py', 'java', 'c', 'cpp', 'php', 'html', 'css', 'json'].includes(ext)) {
      return '💻';
    }
    
    return '📄'; // Для всех остальных типов
  };

  // Форматирование даты в более читаемый формат
  const formatDate = (dateString) => {
    if (!dateString) return '';
    
    // Преобразуем строку даты в объект Date
    const date = new Date(dateString);
    const now = new Date();
    const isToday = date.toDateString() === now.toDateString();
    
    const options = { 
      hour: '2-digit', 
      minute: '2-digit'
    };
    
    if (isToday) {
      return `Сегодня, ${date.toLocaleTimeString('ru-RU', options)}`;
    } else {
      return date.toLocaleString('ru-RU', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    }
  };

  // Получаем расширение файла без точки для отображения
  const getExtensionWithoutDot = (extension) => {
    if (!extension) return '';
    return extension.startsWith('.') ? extension.substring(1) : extension;
  };

  return (
    <li className="file-item">
      <div className="file-name-container">
        <p className="file-name">
          {getFileTypeIcon(file.extension)} {file.name}
          {file.extension && !file.name.endsWith(file.extension) ? `.${getExtensionWithoutDot(file.extension)}` : ''}
        </p>
        <small style={{ color: '#888', marginTop: '4px', display: 'block' }}>
          Загружен: {formatDate(file.time_upload)}
        </small>
      </div>
      <div className="file-details">
        <p className="file-size">{formatFileSize(file.size)}</p>
        {file.max_downloads && (
          <p className="file-max-downloads">{file.number_downloads || 0}/{file.max_downloads}</p>
        )}
        {file.expire_time && (
          <p className="file-expire-time">
            До: {formatDate(file.expire_time)}
          </p>
        )}
      </div>
      <button
        type="button"
        className="download-button"
        onClick={() => onDownload && onDownload(file)}
        title="Скачать файл"
      >
        Скачать
      </button>
      {profileUuid === file.who_upload && (
        <button
          type="button"
          className="delete-button"
          onClick={() => onDelete && onDelete(file)}
          title="Удалить файл"
        >
          Удалить
        </button>
      )}
    </li>
  );
}

FileItem.propTypes = {
  file: PropTypes.object.isRequired,
  onDownload: PropTypes.func,
  onDelete: PropTypes.func,
  profileUuid: PropTypes.string,
};

export default FileItem;