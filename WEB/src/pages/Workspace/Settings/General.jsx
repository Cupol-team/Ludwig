import React, { useContext, useState, useEffect } from 'react';
import '../../../styles/General.css';
import { ProjectContext } from '../../../context/ProjectContext';
import { useParams, useNavigate } from 'react-router-dom';
import Loader from '../../../components/Loader';
import { uploadUserAvatar, getUserAvatar } from '../../../api/profile';
import { editProject, deleteProject } from '../../../api/projects';

// Создаем уникальный идентификатор для компонента
const uniqueComponentId = `general-settings-${Date.now()}`;

// Иконка редактирования для индикатора режима
const EditIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M16.4745 5.40768L18.5923 7.52547M17.8358 3.54L9.29826 12.0775C9.0723 12.3035 8.92425 12.5978 8.87601 12.9161L8.50474 15.0386L10.6273 14.6673C10.9456 14.6191 11.2399 14.471 11.4659 14.2451L19.96 5.75102C20.0876 5.62346 20.1894 5.47275 20.26 5.30655C20.3305 5.14036 20.3688 4.96132 20.3726 4.78037C20.3764 4.59942 20.3457 4.41879 20.2824 4.25043C20.219 4.08207 20.1239 3.92863 20.0018 3.79799C19.8797 3.66736 19.7329 3.56251 19.5705 3.48783C19.4081 3.41315 19.232 3.36963 19.0533 3.36117C18.8746 3.35271 18.6955 3.37946 18.5274 3.44046C18.3593 3.50145 18.2043 3.59446 18.0716 3.71465L9.55544 12.2308C9.32948 12.4568 9.18143 12.7511 9.13319 13.0694L8.76192 15.1919L10.8844 14.8206C11.2028 14.7724 11.497 14.6243 11.723 14.3984L20.2171 5.9043C20.3447 5.77673 20.4465 5.62602 20.517 5.45983C20.5876 5.29363 20.6259 5.1146 20.6297 4.93365C20.6335 4.7527 20.6027 4.57207 20.5394 4.40371C20.476 4.23535 20.3809 4.0819 20.2589 3.95127C20.1368 3.82063 19.99 3.71579 19.8276 3.64111C19.6652 3.56643 19.4891 3.5229 19.3104 3.51444C19.1317 3.50599 18.9526 3.53274 18.7844 3.59373C18.6163 3.65473 18.4614 3.74774 18.3287 3.86793L9.81254 12.3846C9.58658 12.6105 9.43853 12.9048 9.39029 13.2232L9.01903 15.3456L11.1416 14.9744C11.4599 14.9261 11.7542 14.778 11.9802 14.5521L20.4742 5.98862C20.7348 5.72868 20.8808 5.38112 20.8808 5.019C20.8808 4.65688 20.7348 4.30931 20.4742 4.04938C20.2143 3.78882 19.8667 3.64282 19.5046 3.64282C19.1425 3.64282 18.7949 3.78882 18.535 4.04938L9.99898 12.5856C9.77302 12.8115 9.62497 13.1058 9.57673 13.4241L9.20546 15.5466L11.328 15.1753C11.6464 15.1271 11.9406 14.979 12.1666 14.7531L20.6607 6.25952C21.1893 5.73094 21.1893 4.86951 20.6607 4.34093C20.1322 3.81235 19.2707 3.81235 18.7422 4.34093L10.2481 12.8345C10.0222 13.0605 9.87411 13.3548 9.82587 13.6731L9.4546 15.7956L11.5772 15.4243C11.8955 15.3761 12.1898 15.228 12.4157 15.0021L20.9098 6.50802C21.2168 6.20035 21.3904 5.7865 21.3873 5.35653C21.3841 4.92656 21.2045 4.51516 20.8932 4.21217C20.582 3.90918 20.1649 3.72935 19.732 3.72616C19.299 3.72298 18.8795 3.89732 18.5644 4.19568L10.0703 12.6892C9.84432 12.9152 9.69627 13.2095 9.64803 13.5278L9.27676 15.6503L11.3993 15.279C11.7176 15.2308 12.0119 15.0827 12.2378 14.8568L20.7319 6.36272" stroke="#8a63d2" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

function GeneralSettings() {
  const { 
    projectName, 
    projectDescription, 
    projectPhoto,
    setProjectName,
    setProjectDescription,
    setProjectPhoto,
    loadingProjectInfo,
    projectInfoError 
  } = useContext(ProjectContext);
  const { projectUuid, orgId } = useParams();
  const navigate = useNavigate();
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarUrl, setAvatarUrl] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: ''
  });
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Обновляем локальное состояние при изменении данных проекта
  useEffect(() => {
    setFormData({
      name: projectName || '',
      description: projectDescription || ''
    });
  }, [projectName, projectDescription]);

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

  // Обработка изменения полей формы
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  // Сохранение изменений проекта
  const handleSaveChanges = async () => {
    // Проверяем, что данные действительно изменились
    if (formData.name === projectName && formData.description === projectDescription) {
      setIsEditing(false);
      return;
    }

    try {
      setIsSaving(true);
      setError(null);
      
      // Вызываем API для сохранения изменений
      await editProject(orgId, projectUuid, {
        name: formData.name !== projectName ? formData.name : null,
        description: formData.description !== projectDescription ? formData.description : null,
      });
      
      // Обновляем контекст
      setProjectName(formData.name);
      setProjectDescription(formData.description);
      
      // Обновляем состояние успешного сохранения и выходим из режима редактирования
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
      setIsEditing(false);
    } catch (error) {
      console.error('Ошибка при сохранении изменений:', error);
      setError('Не удалось сохранить изменения. Пожалуйста, попробуйте позже.');
    } finally {
      setIsSaving(false);
    }
  };

  // Отмена редактирования и сброс формы
  const handleCancelEdit = () => {
    setFormData({
      name: projectName || '',
      description: projectDescription || ''
    });
    setIsEditing(false);
  };

  // Обработка удаления проекта
  const handleDeleteProject = async () => {
    try {
      setIsDeleting(true);
      setError(null);
      
      // Вызываем API для удаления проекта
      await deleteProject(orgId, projectUuid);
      
      // Показываем успех в консоли
      console.log('Проект успешно удален');
    } catch (error) {
      console.error('Ошибка при удалении проекта:', error);
      setError('Не удалось удалить проект. Пожалуйста, попробуйте позже.');
    } finally {
      // В любом случае перенаправляем пользователя на страницу организации
      navigate(`/organizations/${orgId}`);
      setIsDeleting(false);
      setShowDeleteModal(false);
    }
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
      <div className="header-actions">
        <h2 className="general-header">Основные настройки</h2>
        {!isEditing && (
          <button 
            className="edit-button"
            onClick={() => setIsEditing(true)}
          >
            Редактировать проект
          </button>
        )}
      </div>

      {isEditing && (
        <div className="editing-mode-indicator">
          <EditIcon /> Режим редактирования активен
        </div>
      )}

      <div className={`general-main ${isEditing ? 'editing-mode' : ''}`}>
        <div className="project-info">
          <h3>Название проекта</h3>
          <input
            type="text"
            placeholder="Введите название проекта"
            className="project-input"
            value={formData.name}
            name="name"
            onChange={handleInputChange}
            disabled={!isEditing}
          />

          <div className="project-description">
            <h3>Описание проекта</h3>
            <textarea
              placeholder="Введите описание проекта"
              className="project-textarea"
              value={formData.description}
              name="description"
              onChange={handleInputChange}
              disabled={!isEditing}
              rows={4}
            />
          </div>

          {error && <div className="error-message">{error}</div>}
          {saveSuccess && <div className="success-message">Изменения успешно сохранены!</div>}

          <div className="project-actions">
            {isEditing ? (
              <>
                <button 
                  className="cancel-button"
                  onClick={handleCancelEdit}
                  disabled={isSaving}
                >
                  Отмена
                </button>
                <button 
                  className="save-button"
                  onClick={handleSaveChanges}
                  disabled={isSaving}
                >
                  {isSaving ? 'Сохранение...' : 'Сохранить изменения'}
                </button>
              </>
            ) : null}
          </div>
        </div>

        <div className="project-photo">
          <h3>Фотография проекта</h3>
          <div 
            className="photo-preview" 
            style={{ borderRadius: '8px' }}
            onClick={isEditing ? () => document.getElementById('avatar-input').click() : undefined}
          >
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
          {isEditing && (
            <p className="photo-edit-hint">
              <EditIcon /> Нажмите на фото для {avatarUrl ? 'изменения' : 'загрузки'} изображения
            </p>
          )}
          {error && <div className="error-message">{error}</div>}
          <input
            id="avatar-input"
            type="file"
            accept="image/*"
            onChange={handleAvatarChange}
            style={{ display: 'none' }}
          />
          {isEditing && (
            <button 
              className="upload-avatar-button"
              onClick={() => document.getElementById('avatar-input').click()}
            >
              {avatarUrl ? 'Изменить аватарку' : 'Загрузить аватарку'}
            </button>
          )}
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
          <button 
            className="delete-project-button"
            onClick={() => setShowDeleteModal(true)}
          >
            Удалить проект
          </button>
        </div>
      </div>

      {/* Модальное окно подтверждения удаления */}
      {showDeleteModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>Подтверждение удаления</h3>
            <p>
              Вы действительно хотите удалить проект <strong>{projectName}</strong>?
            </p>
            <p className="warning-text">
              Это действие невозможно отменить! Будут удалены все данные проекта, включая задачи, файлы и другую информацию.
            </p>
            {error && <div className="error-message">{error}</div>}
            <div className="modal-actions">
              <button 
                className="cancel-button"
                onClick={() => setShowDeleteModal(false)}
                disabled={isDeleting}
              >
                Отмена
              </button>
              <button 
                className="delete-button"
                onClick={handleDeleteProject}
                disabled={isDeleting}
              >
                {isDeleting ? 'Удаление...' : 'Удалить проект'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default GeneralSettings; 