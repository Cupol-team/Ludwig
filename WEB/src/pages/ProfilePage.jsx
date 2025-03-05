import React, { useState, useEffect, useContext } from 'react';
import ProfileCard from '../components/ProfileCard';
import ProjectsList from '../components/ProjectsList';
import OrganizationsList from '../components/OrganizationsList';
import { useParams } from 'react-router-dom';
// Заменяем импорты на заглушки
// import { getUserProfile, getUserProjects, getUserOrganizations } from '../api/users';
import { AuthContext } from '../context/AuthContext';
import { ProfileContainer } from '../styles/ProfileComponentStyles';

// Заглушки для API-функций
const getUserProfile = async (userId) => {
  console.log(`Fetching profile for user ${userId}`);
  // Здесь можно добавить логику для проверки существования пользователя
  if (userId === 'notfound') {
    return null; // Симулируем, что пользователь не найден
  }
  return {
    uuid: userId,
    login: 'user123',
    email: 'user@example.com',
    avatarUrl: '/default-avatar.png'
  };
};

const getUserProjects = async (userId) => {
  console.log(`Fetching projects for user ${userId}`);
  return [
    {
      uuid: 'proj-1',
      name: 'Проект разработки',
      organizationId: 'org-1'
    },
    {
      uuid: 'proj-2',
      name: 'Маркетинговая кампания',
      organizationId: 'org-1'
    },
    {
      uuid: 'proj-3',
      name: 'Исследование рынка',
      organizationId: 'org-2'
    }
  ];
};

const getUserOrganizations = async (userId) => {
  console.log(`Fetching organizations for user ${userId}`);
  return [
    {
      uuid: 'org-1',
      name: 'Компания А'
    },
    {
      uuid: 'org-2',
      name: 'Стартап Б'
    }
  ];
};

const ProfilePage = () => {
  const { userId } = useParams();
  const { profile: currentUserProfile } = useContext(AuthContext);
  
  const [profile, setProfile] = useState(null);
  const [projects, setProjects] = useState([]);
  const [organizations, setOrganizations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isCurrentUser, setIsCurrentUser] = useState(false);
  const [userNotFound, setUserNotFound] = useState(false); // Состояние для отслеживания отсутствия пользователя
  
  useEffect(() => {
    const isOwnProfile = !userId || userId === currentUserProfile?.uuid;
    setIsCurrentUser(isOwnProfile);
    
    const fetchData = async () => {
      try {
        setLoading(true);
        
        const profileId = isOwnProfile ? currentUserProfile.uuid : userId;
        
        const profileData = await getUserProfile(profileId);
        
        if (!profileData) {
          setUserNotFound(true); // Устанавливаем состояние, если пользователь не найден
          return;
        }
        
        setProfile(profileData);
        
        if (isOwnProfile) {
          const projectsData = await getUserProjects(profileId);
          setProjects(projectsData);
        } else {
          const orgsData = await getUserOrganizations(profileId);
          setOrganizations(orgsData);
        }
      } catch (error) {
        console.error('Error fetching profile data:', error);
      } finally {
        setLoading(false);
      }
    };
    
    if (currentUserProfile) {
      fetchData();
    }
  }, [userId, currentUserProfile]);
  
  const handleProfileUpdate = async (updatedProfile) => {
    try {
      console.log('Updating profile with:', updatedProfile);
      setProfile(updatedProfile);
    } catch (error) {
      console.error('Error updating profile:', error);
    }
  };
  
  if (loading || !currentUserProfile) {
    return <div>Загрузка...</div>;
  }
  
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
