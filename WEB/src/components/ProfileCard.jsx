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

const ProfileCard = ({ profile, isCurrentUser, onProfileUpdate }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedProfile, setEditedProfile] = useState({ ...profile });
  
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditedProfile(prev => ({
      ...prev,
      [name]: value
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
          onChange={() => {}} // Обработчик для изменения аватара
        />
      </AvatarContainer>
      
      <ProfileField>
        <Label>ЛОГИН</Label>
        <Input 
          name="login"
          value={editedProfile.login || ''}
          onChange={handleInputChange}
          readOnly={!isEditing}
        />
      </ProfileField>
      
      <ProfileField>
        <Label>ПОЧТА</Label>
        <Input 
          name="email"
          value={editedProfile.email || ''}
          onChange={handleInputChange}
          readOnly={!isEditing}
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