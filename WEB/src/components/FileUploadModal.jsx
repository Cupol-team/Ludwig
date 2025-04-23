import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import '../styles/FileUploadModal.css'; // Импорт стилей из папки src/styles
import CustomDatePicker from './CustomDatePicker';
import Notification from './Notification';

// Создаем уникальный id для модальных окон, чтобы избежать конфликтов стилей
const uniqueModalId = `modal-${Date.now()}`;

const FileUploadModal = ({ isOpen, onClose, onSubmit }) => {
  const [file, setFile] = useState(null);
  const [selectedFileName, setSelectedFileName] = useState('');
  const [maxDownloads, setMaxDownloads] = useState('');
  const [availableUntil, setAvailableUntil] = useState(null);
  const [enableMaxDownloads, setEnableMaxDownloads] = useState(false);
  const [enableAvailableUntil, setEnableAvailableUntil] = useState(false);

  // При монтировании компонента добавляем класс к body для блокировки прокрутки
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      
      return () => {
        document.body.style.overflow = 'auto';
      };
    }
    
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [isOpen]);

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

  // Inline-стили для чекбоксов для преодоления проблем с CSS наследованием
  const checkboxLabelStyle = {
    display: 'flex',
    alignItems: 'center',
    margin: '0 0 8px 0'
  };

  // Используем портал для рендеринга модального окна вне компонента
  // Это помогает избежать проблем с вложенными стилями и z-index
  const modalContent = (
    <div className={`modal-overlay ${uniqueModalId}`}>
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
            <label style={checkboxLabelStyle}>
              <input
                type="checkbox"
                className="custom-checkbox"
                checked={enableMaxDownloads}
                onChange={(e) => setEnableMaxDownloads(e.target.checked)}
              />
              <span>Макс. количество скачиваний (необязательно)</span>
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
            <label style={checkboxLabelStyle}>
              <input
                type="checkbox"
                className="custom-checkbox"
                checked={enableAvailableUntil}
                onChange={(e) => setEnableAvailableUntil(e.target.checked)}
              />
              <span>Доступен до (необязательно)</span>
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

  // Используем ReactDOM.createPortal для рендеринга модального окна непосредственно в body
  return ReactDOM.createPortal(
    modalContent,
    document.body
  );
};

export default FileUploadModal;