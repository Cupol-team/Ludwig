import React, { useState, useEffect } from 'react';
import {
  Card,
  AvatarContainer,
  Avatar,
  AvatarOverlay,
  OverlayText,
  ProfileField,
  Label,
  Input,
  Button,
  HiddenInput,
  AvatarInitials
} from '../styles/ProfileCardStyles';
import CustomDatePicker from './CustomDatePicker';
import { getUserAvatar } from '../api/profile';

const ProfileCard = ({ profile, isCurrentUser, onProfileUpdate, onAvatarUpload }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedProfile, setEditedProfile] = useState({ ...profile });
  const [avatarUrl, setAvatarUrl] = useState(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    setEditedProfile({ ...profile });
    
    // Загружаем аватар при монтировании компонента и при изменении UUID профиля
    if (profile && profile.uuid) {
      setLoading(true);
      loadAvatar(profile.uuid);
    }
    
    // Очистка URL объекта при размонтировании компонента
    return () => {
      // Проверяем, что URL начинается с blob:, чтобы не пытаться освободить статические ресурсы
      if (avatarUrl && avatarUrl.startsWith('blob:')) {
        URL.revokeObjectURL(avatarUrl);
      }
    };
  }, [profile]);
  
  // Функция для загрузки аватара
  const loadAvatar = async (uuid) => {
    try {
      const url = await getUserAvatar(uuid);
      if (url !== '/default-avatar.png') {
        setAvatarUrl(url);
      } else {
        setAvatarUrl(null); // Если получен дефолтный аватар, устанавливаем null для отображения инициалов
      }
      setLoading(false);
    } catch (error) {
      console.error('Failed to load avatar:', error);
      setAvatarUrl(null); // При ошибке загрузки аватара устанавливаем null
      setLoading(false);
    }
  };
  
  // Получаем инициалы из имени и фамилии пользователя
  const getInitials = () => {
    if (profile && profile.name && profile.surname) {
      return `${profile.name.charAt(0)}${profile.surname.charAt(0)}`;
    } else if (profile && profile.email) {
      return profile.email.charAt(0).toUpperCase();
    }
    return '?';
  };
  
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditedProfile(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleDateChange = (date) => {
    setEditedProfile(prev => ({
      ...prev,
      date_of_birthday: date
    }));
  };
  
  const handleEditToggle = () => {
    if (isEditing) {
      // Создаем копию профиля для обновления
      const updatedProfile = { ...editedProfile };
      
      // Отладочный вывод для проверки данных перед отправкой
      console.log('Sending profile update:', updatedProfile);
      
      // Отправляем обновление
      onProfileUpdate(updatedProfile);
    } else {
      setEditedProfile({ ...profile });
    }
    setIsEditing(!isEditing);
  };
  
  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      onAvatarUpload(file)
        .then(() => {
          // После успешной загрузки аватара обновляем его отображение
          if (profile && profile.uuid) {
            // Очищаем текущий URL объект, если он существует
            if (avatarUrl && avatarUrl.startsWith('blob:')) {
              URL.revokeObjectURL(avatarUrl);
            }
            // Загружаем новый аватар
            loadAvatar(profile.uuid);
          }
        })
        .catch(error => {
          console.error('Failed to upload avatar:', error);
        });
    }
  };
  
  // Преобразуем гендер в строку
  const genderText = editedProfile.gender === '1' ? 'Мужской' : 'Женский';

  // Рендерим содержимое аватара в зависимости от состояния
  const renderAvatarContent = () => {
    if (loading) {
      return <AvatarInitials>...</AvatarInitials>;
    } else if (avatarUrl) {
      return <Avatar src={avatarUrl} alt="Аватар пользователя" />;
    } else {
      return <AvatarInitials>{getInitials()}</AvatarInitials>;
    }
  };

  return (
    <Card>
      <AvatarContainer>
        {renderAvatarContent()}
        {isCurrentUser && isEditing && (
          <AvatarOverlay onClick={() => document.getElementById('avatar-input').click()}>
            <OverlayText>Изменить</OverlayText>
          </AvatarOverlay>
        )}
        <HiddenInput 
          id="avatar-input" 
          type="file" 
          accept="image/*" 
          onChange={handleAvatarChange}
        />
      </AvatarContainer>
      
      <ProfileField>
        <Label>Имя</Label>
        <Input 
          name="name"
          value={editedProfile.name || ''}
          onChange={handleInputChange}
          readOnly={!isEditing}
        />
      </ProfileField>

      <ProfileField>
        <Label>Фамилия</Label>
        <Input 
          name="surname"
          value={editedProfile.surname || ''}
          onChange={handleInputChange}
          readOnly={!isEditing}
        />
      </ProfileField>

      <ProfileField>
        <Label>Почта</Label>
        <Input 
          name="email"
          value={editedProfile.email || ''}
          onChange={handleInputChange}
          readOnly={!isEditing}
        />
      </ProfileField>

      <ProfileField>
        <Label>Пол</Label>
        <Input 
          name="gender"
          value={genderText} // Отображаем текст гендера
          readOnly
        />
      </ProfileField>

      <ProfileField>
        <Label>Дата рождения</Label>
        <CustomDatePicker
          selectedDate={editedProfile.date_of_birthday}
          onChange={handleDateChange}
          disabled={!isEditing}
        />
      </ProfileField>

      {isCurrentUser && (
        <Button onClick={handleEditToggle}>
          {isEditing ? 'Сохранить' : 'Редактировать'}
        </Button>
      )}
    </Card>
  );
};

export default ProfileCard; 