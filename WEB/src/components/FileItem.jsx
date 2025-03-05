import React from 'react';
import PropTypes from 'prop-types';

function FileItem({ file, onDownload, onDelete, profileUuid }) {
  // Функция для форматирования размера файла в Б, КБ или МБ
  const formatFileSize = (bytes) => {
    if (bytes < 1024) return `${bytes} Б`;
    else if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} КБ`;
    else return `${(bytes / (1024 * 1024)).toFixed(1)} МБ`;
  };

  return (
    <li className="file-item">
      <div className="file-name-container">
        <p className="file-name">
          {file.name}{file.extension ? `${file.extension}` : ''}
        </p>
      </div>
      <div className="file-details">
        <p className="file-size">Размер: {formatFileSize(file.size)}</p>
        {file.max_downloads && (
          <p className="file-max-downloads">Макс скачиваний: {file.max_downloads}</p>
        )}
        {file.expire_time && (
          <p className="file-expire-time">
            Доступен до: {new Date(file.expire_time * 1000).toLocaleString()}
          </p>
        )}
      </div>
      <button
        type="button"
        className="download-button"
        onClick={() => onDownload && onDownload(file)}
      >
        Скачать
      </button>
      {profileUuid === file.who_upload && (
        <button
          type="button"
          className="delete-button"
          onClick={() => onDelete && onDelete(file)}
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