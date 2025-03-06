import React, { useState, useEffect, useContext } from 'react';
import ProfileCard from '../components/ProfileCard';
import ProjectsList from '../components/ProjectsList';
import OrganizationsList from '../components/OrganizationsList';
import { useParams, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { ProfileContainer } from '../styles/ProfileComponentStyles';
import { updateUserProfile, uploadUserAvatar, getUserOrganizations, getUserProjects, getUserProfile } from '../api/profile';

const ProfilePage = () => {
  const { userId } = useParams();
  const { profile: currentUserProfile } = useContext(AuthContext);
  const navigate = useNavigate();
  
  const [profile, setProfile] = useState(null);
  const [projects, setProjects] = useState([]);
  const [organizations, setOrganizations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isCurrentUser, setIsCurrentUser] = useState(false);
  const [userNotFound, setUserNotFound] = useState(false);
  
  useEffect(() => {
    // Если нет текущего пользователя, ждем его загрузки
    if (!currentUserProfile) return;
    
    // Определяем, является ли это профилем текущего пользователя
    // Это происходит если:
    // 1. URL - /profile (без userId)
    // 2. URL - /profile/{uuid}, где uuid совпадает с uuid текущего пользователя
    const isOwnProfile = !userId || userId === currentUserProfile.uuid;
    setIsCurrentUser(isOwnProfile);
    
    // Если URL /profile, но без userId, перенаправляем на /profile/{currentUserUuid}
    if (!userId && currentUserProfile.uuid) {
      navigate(`/profile/${currentUserProfile.uuid}`, { replace: true });
      return;
    }
    
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Определяем, какой профиль загружать
        const profileId = isOwnProfile ? currentUserProfile.uuid : userId;
        
        // Загружаем данные профиля
        const profileData = await getUserProfile(profileId);
        
        if (!profileData) {
          setUserNotFound(true);
          setLoading(false);
          return;
        }
        
        setProfile(profileData);
        
        // Загружаем проекты для своего профиля или организации для чужого
        if (isOwnProfile) {
          const projectsData = await getUserProjects(profileId);
          setProjects(projectsData);
        } else {
          const orgsData = await getUserOrganizations(profileId);
          setOrganizations(orgsData);
        }
        
        setUserNotFound(false);
      } catch (error) {
        console.error('Error fetching profile data:', error);
        setUserNotFound(true);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [userId, currentUserProfile, navigate]);
  
  const handleProfileUpdate = async (updatedProfile) => {
    try {
      // Отладочный вывод
      console.log('ProfilePage sending update:', updatedProfile);
      
      // Создаем объект с правильным порядком полей
      const orderedProfile = {
        name: updatedProfile.name,
        surname: updatedProfile.surname,
        gender: updatedProfile.gender,
        date_of_birthday: updatedProfile.date_of_birthday,
        email: updatedProfile.email,
        password: updatedProfile.password
      };
      
      await updateUserProfile(profile.uuid, orderedProfile);
      // Обновляем профиль после успешного обновления
      const refreshedProfile = await getUserProfile(profile.uuid);
      setProfile(refreshedProfile);
    } catch (error) {
      console.error('Error updating profile:', error);
    }
  };
  
  const handleAvatarUpload = async (file) => {
    try {
      await uploadUserAvatar(profile.uuid, file);
      // После загрузки аватара не нужно обновлять профиль,
      // так как аватар загружается отдельно в ProfileCard
    } catch (error) {
      console.error('Error uploading avatar:', error);
    }
  };
  
  // Показываем загрузку, если данные еще не получены или нет текущего пользователя
  if (loading || !currentUserProfile) {
    return <div>Загрузка...</div>;
  }
  
  // Показываем сообщение, если пользователь не найден
  if (userNotFound) {
    return (
      <div style={{ textAlign: 'center', marginTop: '50px' }}>
        <h2>😢</h2>
        <p>Похоже, такого пользователя нет</p>
      </div>
    );
  }
  
  return (
    <ProfileContainer>
      <ProfileCard 
        profile={profile} 
        isCurrentUser={isCurrentUser}
        onProfileUpdate={handleProfileUpdate}
        onAvatarUpload={handleAvatarUpload}
      />
      
      {isCurrentUser ? (
        <ProjectsList projects={projects} />
      ) : (
        <OrganizationsList organizations={organizations} />
      )}
    </ProfileContainer>
  );
};

export default ProfilePage;