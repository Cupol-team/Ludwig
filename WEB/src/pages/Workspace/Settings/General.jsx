import React from 'react';
import '../../../styles/General.css';

function GeneralSettings() {
  return (
    <div className="general-container">
      <h2 className="general-header">Основные настройки</h2>

      <div className="general-main">
        <div className="project-info">
          <h3>Название проекта</h3>
          <input
            type="text"
            placeholder="Введите название проекта"
            className="project-input"
          />

          <div className="project-description">
            <h3>Описание проекта</h3>
            <textarea
              placeholder="Введите описание проекта"
              className="project-textarea"
            />
          </div>
        </div>

        <div className="project-photo">
          <h3>Фотография проекта</h3>
          <div className="photo-preview">
            <span>Превью фото</span>
          </div>
          <button className="upload-avatar-button">
            Загрузить аватарку
          </button>
        </div>
      </div>

      <div className="project-management">
        <h3>Управление проектом</h3>
        <div className="delete-project">
          <div className="delete-info">
            <h4>Удаление проекта</h4>
            <p>
              Полностью удаляет проект со всеми данными. Это действие невозможно отменить!
            </p>
          </div>
          <button className="delete-project-button">
            Удалить проект
          </button>
        </div>
      </div>
    </div>
  );
}

export default GeneralSettings; 