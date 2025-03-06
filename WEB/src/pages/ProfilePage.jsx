import React, { useState, useEffect, useContext } from 'react';
import ProfileCard from '../components/ProfileCard';
import ProjectsList from '../components/ProjectsList';
import OrganizationsList from '../components/OrganizationsList';
import { useParams } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { ProfileContainer } from '../styles/ProfileComponentStyles';
import { updateUserProfile, uploadUserAvatar, getUserOrganizations, getUserProjects, getUserProfile } from '../api/profile';

const ProfilePage = () => {
  const { userId } = useParams();
  const { profile: currentUserProfile } = useContext(AuthContext);
  
  const [profile, setProfile] = useState(null);
  const [projects, setProjects] = useState([]);
  const [organizations, setOrganizations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isCurrentUser, setIsCurrentUser] = useState(false);
  const [userNotFound, setUserNotFound] = useState(false);
  
  useEffect(() => {
    const isOwnProfile = !userId || userId === currentUserProfile?.uuid;
    setIsCurrentUser(isOwnProfile);
    
    const fetchData = async () => {
      try {
        setLoading(true);
        
        const profileId = isOwnProfile ? currentUserProfile.uuid : userId;
        
        const profileData = await getUserProfile(profileId);
        console.log('Profile Data:', profileData);
        
        if (!profileData) {
            setUserNotFound(true);
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
        setUserNotFound(true);
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
      const response = await updateUserProfile(profile.uuid, updatedProfile);
      setProfile(response);
    } catch (error) {
      console.error('Error updating profile:', error);
    }
  };
  
  const handleAvatarUpload = async (file) => {
    try {
      const response = await uploadUserAvatar(profile.uuid, file);
      setProfile(prev => ({ ...prev, avatarUrl: response.avatarUrl }));
    } catch (error) {
      console.error('Error uploading avatar:', error);
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