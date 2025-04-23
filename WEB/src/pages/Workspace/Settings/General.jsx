import React, { useContext, useState, useEffect } from 'react';
import '../../../styles/General.css';
import { ProjectContext } from '../../../context/ProjectContext';
import { useParams } from 'react-router-dom';
import Loader from '../../../components/Loader';
import { uploadUserAvatar, getUserAvatar } from '../../../api/profile';

// Создаем уникальный идентификатор для компонента
const uniqueComponentId = `general-settings-${Date.now()}`;

function GeneralSettings() {
  const { 
    projectName, 
    projectDescription, 
    projectPhoto, 
    setProjectPhoto,
    loadingProjectInfo,
    projectInfoError 
  } = useContext(ProjectContext);
  const { projectUuid, orgId } = useParams();
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarUrl, setAvatarUrl] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Загружаем аватар при монтировании компонента
  useEffect(() => {
    if (projectUuid) {
      loadAvatar();
    }
    
    // Очистка URL объекта при размонтировании
    return () => {
      if (avatarUrl && avatarUrl.startsWith('blob:')) {
        URL.revokeObjectURL(avatarUrl);
      }
    };
  }, [projectUuid]);

  // Функция загрузки аватара
  const loadAvatar = async () => {
    try {
      setLoading(true);
      const url = await getUserAvatar(projectUuid);
      if (url !== '/default-avatar.png') {
        setAvatarUrl(url);
      }
      setLoading(false);
    } catch (error) {
      console.error('Ошибка при загрузке аватара:', error);
      setLoading(false);
    }
  };

  // Функция для обработки выбора файла
  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setAvatarFile(file);
      handleAvatarUpload(file);
    }
  };

  // Функция для загрузки аватара на сервер
  const handleAvatarUpload = async (file) => {
    try {
      setLoading(true);
      setError(null);
      
      await uploadUserAvatar(projectUuid, file);

      // После успешной загрузки обновляем аватарку
      loadAvatar();
      
      // Обновляем информацию в контексте
      if (setProjectPhoto) {
        const url = URL.createObjectURL(file);
        setProjectPhoto(url);
      }
    } catch (error) {
      console.error('Ошибка при загрузке аватара:', error);
      setError('Не удалось загрузить аватар. Пожалуйста, попробуйте позже.');
      setLoading(false);
    }
  };

  // Получаем инициалы из названия проекта
  const getInitials = () => {
    if (projectName) {
      return projectName.charAt(0).toUpperCase();
    }
    return '?';
  };

  if (loadingProjectInfo) {
    return (
      <div className={`general-container ${uniqueComponentId}`}>
        <h2 className="general-header">Основные настройки</h2>
        <div className="loader-container">
          <Loader />
        </div>
      </div>
    );
  }

  if (projectInfoError) {
    return (
      <div className={`general-container ${uniqueComponentId}`}>
        <h2 className="general-header">Основные настройки</h2>
        <div className="error-message">
          Произошла ошибка при загрузке информации о проекте. Пожалуйста, попробуйте позже.
        </div>
      </div>
    );
  }

  return (
    <div className={`general-container ${uniqueComponentId}`}>
      <h2 className="general-header">Основные настройки</h2>

      <div className="general-main">
        <div className="project-info">
          <h3>Название проекта</h3>
          <input
            type="text"
            placeholder="Введите название проекта"
            className="project-input"
            value={projectName || ''}
            disabled
          />

          <div className="project-description">
            <h3>Описание проекта</h3>
            <textarea
              placeholder="Введите описание проекта"
              className="project-textarea"
              value={projectDescription || ''}
              disabled
              rows={4}
            />
          </div>
        </div>

        <div className="project-photo">
          <h3>Фотография проекта</h3>
          <div className="photo-preview" style={{ borderRadius: '8px' }}>
            {loading ? (
              <div className="avatar-loader">
                <Loader size="small" />
              </div>
            ) : avatarUrl ? (
              <img src={avatarUrl} alt="Фото проекта" style={{ borderRadius: '0' }} />
            ) : (
              <div className="avatar-initials" style={{ borderRadius: '0' }}>{getInitials()}</div>
            )}
          </div>
          {error && <div className="error-message">{error}</div>}
          <input
            id="avatar-input"
            type="file"
            accept="image/*"
            onChange={handleAvatarChange}
            style={{ display: 'none' }}
          />
          <button 
            className="upload-avatar-button"
            onClick={() => document.getElementById('avatar-input').click()}
          >
            {avatarUrl ? 'Изменить аватарку' : 'Загрузить аватарку'}
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