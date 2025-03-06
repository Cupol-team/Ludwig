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
  HiddenInput
} from '../styles/ProfileCardStyles';
import CustomDatePicker from './CustomDatePicker';
import { getUserAvatar } from '../api/profile';

const ProfileCard = ({ profile, isCurrentUser, onProfileUpdate, onAvatarUpload }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedProfile, setEditedProfile] = useState({ ...profile });
  const [avatarUrl, setAvatarUrl] = useState('/default-avatar.png');
  
  useEffect(() => {
    setEditedProfile({ ...profile });
    
    // Загружаем аватар при монтировании компонента и при изменении UUID профиля
    if (profile && profile.uuid) {
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
      setAvatarUrl(url);
    } catch (error) {
      console.error('Failed to load avatar:', error);
      setAvatarUrl('/default-avatar.png');
    }
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

  return (
    <Card>
      <AvatarContainer>
        <Avatar src={avatarUrl} alt="Аватар пользователя" />
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
          selected={editedProfile.date_of_birthday ? new Date(editedProfile.date_of_birthday) : null}
          onChange={handleDateChange}
          disabled={!isEditing}
          showTimeSelect={false} // Убираем отображение времени
        />
      </ProfileField>

      {isCurrentUser && isEditing && ( // Поле для пароля только для текущего пользователя в режиме редактирования
        <ProfileField>
          <Label>Пароль</Label>
          <Input 
            name="password"
            type="password"
            onChange={handleInputChange}
            placeholder="Введите новый пароль"
          />
        </ProfileField>
      )}
      
      {isCurrentUser && (
        <Button onClick={handleEditToggle}>
          {isEditing ? 'Сохранить' : 'Редактировать'}
        </Button>
      )}
    </Card>
  );
};

export default ProfileCard; 