import React, { useState } from 'react';
import '../styles/FileUploadModal.css'; // Импорт стилей из папки src/styles
import CustomDatePicker from './CustomDatePicker';
import Notification from './Notification';

const FileUploadModal = ({ isOpen, onClose, onSubmit }) => {
  const [file, setFile] = useState(null);
  const [selectedFileName, setSelectedFileName] = useState('');
  const [maxDownloads, setMaxDownloads] = useState('');
  const [availableUntil, setAvailableUntil] = useState(null);
  const [enableMaxDownloads, setEnableMaxDownloads] = useState(false);
  const [enableAvailableUntil, setEnableAvailableUntil] = useState(false);

  if (!isOpen) return null; // Если окно закрыто, возвращаем null

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      const chosenFile = e.target.files[0];
      setFile(chosenFile);
      setSelectedFileName(chosenFile.name);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!file) {
      Notification.error('Пожалуйста, выберите файл.');
      return;
    }
    // Валидация: если включено поле "Доступен до", дата не должна быть меньше текущей
    if (enableAvailableUntil && availableUntil && availableUntil < new Date()) {
      Notification.error("Выбранная дата и время не могут быть в прошлом!");
      return;
    }
    const payload = {
      file,
      maxDownloads: enableMaxDownloads && maxDownloads.trim() ? maxDownloads : null,
      availableUntil: enableAvailableUntil && availableUntil ? availableUntil.toISOString() : null,
    };
    onSubmit(payload);
    // Сброс полей формы и галочек
    setFile(null);
    setSelectedFileName('');
    setMaxDownloads('');
    setAvailableUntil(null);
    setEnableMaxDownloads(false);
    setEnableAvailableUntil(false);
    onClose();
  };

  return (
    <div className="modal-overlay">
      <div className="modal-container">
        <button className="modal-close" onClick={onClose}>
          &times;
        </button>
        <h2 className="modal-title">Загрузить файл</h2>
        <form className="modal-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label>
              Выберите файл <span className="required">*</span>
            </label>
            <label htmlFor="fileInput" className="file-input-label">
              {selectedFileName ? selectedFileName : 'Нажмите для выбора файла'}
            </label>
            <input
              id="fileInput"
              type="file"
              onChange={handleFileChange}
              required
              className="file-input"
            />
          </div>
          <div className="form-group">
            <label>
              <input
                type="checkbox"
                className="custom-checkbox"
                checked={enableMaxDownloads}
                onChange={(e) => setEnableMaxDownloads(e.target.checked)}
              />{' '}
              Макс. количество скачиваний (необязательно)
            </label>
            <input
              type="number"
              min="1"
              placeholder="Например, 5"
              value={maxDownloads}
              onChange={(e) => setMaxDownloads(e.target.value)}
              className="modal-input"
              disabled={!enableMaxDownloads}
            />
          </div>
          <div className="form-group">
            <label>
              <input
                type="checkbox"
                className="custom-checkbox"
                checked={enableAvailableUntil}
                onChange={(e) => setEnableAvailableUntil(e.target.checked)}
              />{' '}
              Доступен до (необязательно)
            </label>
            <CustomDatePicker
              selected={availableUntil}
              onChange={(date) => setAvailableUntil(date)}
              disabled={!enableAvailableUntil}
            />
          </div>
          <button type="submit" className="modal-submit">
            Загрузить
          </button>
        </form>
      </div>
    </div>
  );
};

export default FileUploadModal;