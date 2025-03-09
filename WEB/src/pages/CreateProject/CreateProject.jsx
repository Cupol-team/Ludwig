import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { createProject } from '@/api/projects';
import { uploadUserAvatar } from '@/api/profile';
import styles from '@/styles/pages/CreateProject.module.css';

function CreateProject() {
  const { orgId } = useParams();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    name: '',
    description: ''
  });
  const [error, setError] = useState('');
  const [projectUuid, setProjectUuid] = useState(null);
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFirstStepSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.name.trim()) {
      setError('Название проекта обязательно');
      return;
    }

    try {
      const response = await createProject(orgId, formData);
      if (response.data.response.items.uuid) {
        // Сохраняем UUID проекта для использования на втором шаге
        setProjectUuid(response.data.response.items.uuid);
        // Переходим ко второму шагу
        setStep(2);
      } else {
        setError('Не удалось получить UUID проекта');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Произошла ошибка при создании проекта');
    }
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setAvatarFile(file);
      
      // Создаем URL для предпросмотра изображения
      const previewUrl = URL.createObjectURL(file);
      setAvatarPreview(previewUrl);
    }
  };

  const clearAvatarSelection = () => {
    if (avatarPreview) {
      URL.revokeObjectURL(avatarPreview);
    }
    setAvatarFile(null);
    setAvatarPreview(null);
  };

  const handleCompleteProject = async () => {
    try {
      // Если выбран аватар и есть UUID проекта, загружаем аватар
      if (avatarFile && projectUuid) {
        await uploadUserAvatar(projectUuid, avatarFile);
      }
      
      // Перенаправляем на страницу организации
      navigate(`/organizations/${orgId}`);
    } catch (error) {
      console.error("Ошибка при загрузке аватара:", error);
      setError('Ошибка при загрузке аватара. Вы будете перенаправлены на страницу организации.');
      setTimeout(() => {
        navigate(`/organizations/${orgId}`);
      }, 3000);
    }
  };

  return (
    <div className={styles.container}>
      <h1>Создание проекта</h1>
      
      {step === 1 ? (
        // Шаг 1: Основная информация о проекте
        <form onSubmit={handleFirstStepSubmit} className={styles.form}>
          <div className={styles.formGroup}>
            <label htmlFor="name">Название проекта *</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="description">Описание</label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows="4"
              resize="none"
            />
          </div>

          {error && <div className={styles.error}>{error}</div>}

          <button type="submit" className={styles.submitButton}>
            Продолжить
          </button>
        </form>
      ) : (
        // Шаг 2: Загрузка аватара проекта
        <div className={styles.avatarStep}>
          <h2>Загрузка аватара проекта</h2>
          <p>Вы можете загрузить аватар для вашего проекта или пропустить этот шаг.</p>
          
          <div className={styles.avatarPreviewContainer}>
            {avatarPreview ? (
              <img 
                src={avatarPreview} 
                alt="Предпросмотр аватара" 
                className={styles.avatarPreview} 
              />
            ) : (
              <div className={styles.avatarPlaceholder}>
                <span>{formData.name.charAt(0)}</span>
              </div>
            )}
          </div>
          
          <div className={styles.avatarUpload}>
            {avatarPreview ? (
              <>
                <button 
                  type="button"
                  onClick={() => document.getElementById('avatar-input').click()}
                  className={styles.uploadButton}
                >
                  Изменить
                </button>
                <button 
                  type="button"
                  onClick={clearAvatarSelection} 
                  className={styles.clearButton}
                >
                  Удалить
                </button>
              </>
            ) : (
              <button 
                type="button"
                onClick={() => document.getElementById('avatar-input').click()}
                className={styles.uploadButton}
              >
                Выбрать изображение
              </button>
            )}
            <input
              id="avatar-input"
              type="file"
              accept="image/*"
              onChange={handleAvatarChange}
              style={{ display: 'none' }}
            />
          </div>
          
          {error && <div className={styles.error}>{error}</div>}
          
          <div className={styles.avatarActions}>
            <button 
              onClick={handleCompleteProject}
              className={styles.completeButton}
            >
              {avatarFile ? 'Завершить' : 'Пропустить'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default CreateProject; 