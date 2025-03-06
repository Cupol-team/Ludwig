import React, { useState } from 'react';
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

const ProfileCard = ({ profile, isCurrentUser, onProfileUpdate, onAvatarUpload }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedProfile, setEditedProfile] = useState({ ...profile });
  
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
      onProfileUpdate(editedProfile);
    } else {
      setEditedProfile({ ...profile });
    }
    setIsEditing(!isEditing);
  };
  
  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      onAvatarUpload(file); // Вызываем функцию загрузки аватара
    }
  };
  
  // Преобразуем гендер в строку
  const genderText = editedProfile.gender === '1' ? 'Мужской' : 'Женский';

  return (
    <Card>
      <AvatarContainer>
        <Avatar src={editedProfile.avatarUrl || '/default-avatar.png'} alt="Аватар пользователя" />
        {isCurrentUser && isEditing && (
          <AvatarOverlay onClick={() => document.getElementById('avatar-input').click()}>
            <OverlayText>Изменить</OverlayText>
          </AvatarOverlay>
        )}
        <HiddenInput 
          id="avatar-input" 
          type="file" 
          accept="image/*" 
          onChange={handleAvatarChange} // Обработчик для изменения аватара
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
        <Label>Гендер</Label>
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