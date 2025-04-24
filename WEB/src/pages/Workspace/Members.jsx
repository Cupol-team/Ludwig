import React, { useEffect, useState, useCallback, useRef, useContext } from 'react';
import { useParams } from 'react-router-dom';
import { getMembers, deleteMemberFromProject } from '../../api/members';
import { getUserAvatar } from '../../api/profile';
import Loader from '../../components/Loader';
import Notification from '../../components/Notification';
import { ProjectContext } from '../../context/ProjectContext';
import AddMemberButton from '../../components/AddMemberButton';
import '../../styles/members.css';
import '../../styles/memberAvatars.css';
import EditMemberRoleModal from '../../components/EditMemberRoleModal';

const Members = () => {
  const { orgId, projectUuid } = useParams();
  const { project } = useContext(ProjectContext);
  const [members, setMembers] = useState([]);
  const [memberAvatars, setMemberAvatars] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const controllerRef = useRef(null);
  const { roles } = useContext(ProjectContext);
  const [activeMenu, setActiveMenu] = useState(null);
  const [selectedMember, setSelectedMember] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(null);

  const fetchMembers = useCallback(async () => {
    controllerRef.current = new AbortController();
    try {
      setLoading(true);
      const data = await getMembers(orgId, projectUuid, controllerRef.current.signal);
      setMembers(data);
      setError('');
    } catch (err) {
      setError(err.message || 'Ошибка загрузки участников');
    } finally {
      setLoading(false);
    }
  }, [orgId, projectUuid]);

  useEffect(() => {
    if (members.length > 0) {
      const avatarControllers = {};
      const avatarPromises = members.map(member => {
        avatarControllers[member.uuid] = new AbortController();
        
        return getUserAvatar(member.uuid, avatarControllers[member.uuid].signal)
          .then(avatarUrl => {
            // Если получен дефолтный аватар, считаем его как null
            if (avatarUrl === '/default-avatar.png') {
              return { uuid: member.uuid, avatarUrl: null };
            }
            return { uuid: member.uuid, avatarUrl };
          })
          .catch(error => {
            console.error(`Failed to load avatar for member ${member.uuid}:`, error);
            return { uuid: member.uuid, avatarUrl: null };
          });
      });

      Promise.all(avatarPromises).then(results => {
        const avatars = {};
        results.forEach(result => {
          avatars[result.uuid] = result.avatarUrl;
        });
        setMemberAvatars(avatars);
      });

      return () => {
        Object.values(avatarControllers).forEach(controller => {
          controller.abort();
        });
        
        Object.values(memberAvatars).forEach(url => {
          if (url && url.startsWith('blob:')) {
            URL.revokeObjectURL(url);
          }
        });
      };
    }
  }, [members]);

  useEffect(() => {
    fetchMembers();
    return () => {
      if (controllerRef.current) {
        controllerRef.current.abort();
      }
    };
  }, [fetchMembers]);

  // Получаем инициалы из имени и фамилии
  const getInitials = (member) => {
    if (member.name && member.surname) {
      return `${member.name.charAt(0)}${member.surname.charAt(0)}`.toUpperCase();
    } else if (member.name) {
      return member.name.charAt(0).toUpperCase();
    } else if (member.surname) {
      return member.surname.charAt(0).toUpperCase();
    }
    return '?';
  };

  const getRoleName = (roleUuid) => {
    if (!roleUuid) return 'UUID роли отсутствует';
    if (!roles) return 'Роли не загружены';
    
    let roleItems = [];
    
    if (Array.isArray(roles)) {
      roleItems = roles;
    } else if (roles && roles.response && roles.response.items) {
      roleItems = roles.response.items;
    } else if (roles && roles.items) {
      roleItems = roles.items;
    }
    
    const role = roleItems.find(r => r && r.uuid === roleUuid);
    
    return role ? role.name : 'Роль не найдена';
  };

  const handleMemberAdded = () => {
    fetchMembers();
  };

  const toggleMenu = (memberId) => {
    setActiveMenu(activeMenu === memberId ? null : memberId);
  };

  const handleClickOutside = (e) => {
    if (!e.target.closest('.member-menu-container')) {
      setActiveMenu(null);
    }
  };

  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const openEditModal = (member) => {
    if (!member || !member.uuid) {
      console.error('Invalid member data:', member);
      return;
    }
    
    setSelectedMember(member);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedMember(null);
  };

  const handleRoleUpdated = (updatedMember) => {
    if (!updatedMember) {
      console.error('Updated member data is undefined');
      return;
    }
    
    setMembers(prevMembers => {
      if (!prevMembers || !Array.isArray(prevMembers)) {
        console.error('Previous members state is invalid:', prevMembers);
        return prevMembers || [];
      }
      
      return prevMembers.map(m => {
        if (m && m.uuid && updatedMember.uuid && m.uuid === updatedMember.uuid) {
          // Безопасное обновление с проверками на null/undefined
          return { 
            ...m, 
            role: updatedMember.role_uuid || updatedMember.role || m.role 
          };
        }
        return m;
      });
    });
    
    closeModal();
    
    // Перезагрузим список участников для обеспечения актуальности данных
    setTimeout(() => {
      fetchMembers();
    }, 500);
  };

  const handleDeleteClick = (member) => {
    setActiveMenu(null);
    setConfirmDelete(member);
  };

  const cancelDelete = () => {
    setConfirmDelete(null);
  };

  const confirmDeleteMember = async () => {
    try {
      setLoading(true);
      const deletedMember = confirmDelete;
      
      console.log('Отправка запроса на удаление участника:', {
        orgId,
        projectUuid,
        memberUuid: confirmDelete.uuid
      });
      
      const response = await deleteMemberFromProject(orgId, projectUuid, confirmDelete.uuid);
      console.log('Ответ сервера:', response);
      
      setConfirmDelete(null);
      
      // Показываем сообщение об успехе
      setSuccess(`Участник ${deletedMember.name || ''} ${deletedMember.surname || ''} успешно удален из проекта`);
      
      // Скрываем сообщение об успехе через 5 секунд
      setTimeout(() => {
        setSuccess(null);
      }, 5000);
      
      setError(null);
      // Обновляем список участников
      await fetchMembers();
    } catch (err) {
      console.error('Ошибка при удалении участника:', err);
      
      // Более информативное сообщение об ошибке
      const errorMessage = err.message || 'Ошибка при удалении участника';
      setError(errorMessage);
      
      // Показываем сообщение об ошибке на 5 секунд, затем скрываем
      setTimeout(() => {
        setError(null);
      }, 5000);
    } finally {
      setLoading(false);
      setConfirmDelete(null);
    }
  };

  if (loading) return <Loader />;
  
  return (
    <div className="project-members-container">
      {success && <div className="success-notification">{success}</div>}
      {error && <div className="error-notification">{error}</div>}
      
      <div className="project-members-header">
        <h2>Участники проекта {project?.name}</h2>
        <AddMemberButton onMemberAdded={handleMemberAdded} />
      </div>
      {members.length === 0 ? (
        <p>В проекте пока нет участников</p>
      ) : (
        <div className="members-list">
          {members.map((member) => {
            if (!member || !member.uuid) {
              console.warn('Invalid member data in list:', member);
              return null; // Пропускаем невалидные данные
            }
            
            return (
              <div key={member.uuid} className="member-item">
                {memberAvatars[member.uuid] ? (
                  <img 
                    src={memberAvatars[member.uuid]} 
                    alt={`${member.name || ''} ${member.surname || ''}`} 
                    className="member-avatar"
                  />
                ) : (
                  <div className="member-avatar member-avatar-initials">
                    <span>{getInitials(member)}</span>
                  </div>
                )}
                <div className="member-info">
                  <span className="member-name">{member.name || ''} {member.surname || ''}</span>
                  <span className="member-role">{getRoleName(member.role)}</span>
                </div>
                <div className="member-menu-container">
                  <button 
                    className="member-menu-button" 
                    onClick={() => toggleMenu(member.uuid)}
                  >
                    ⋮
                  </button>
                  {activeMenu === member.uuid && (
                    <div className="member-menu">
                      <button className="member-menu-option" onClick={() => openEditModal(member)}>Редактировать</button>
                      <button className="member-menu-option delete-option" onClick={() => handleDeleteClick(member)}>Удалить</button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {isModalOpen && selectedMember && (
        <EditMemberRoleModal
          organizationUuid={orgId}
          projectUuid={projectUuid}
          memberUuid={selectedMember.uuid}
          roles={roles}
          currentRoleUuid={selectedMember.role}
          onClose={closeModal}
          onRoleUpdated={handleRoleUpdated}
        />
      )}

      {confirmDelete && (
        <div className="modal-overlay">
          <div className="confirmation-modal">
            <h3>Подтверждение удаления</h3>
            <p>
              Вы действительно хотите удалить пользователя <span className="highlighted-text">{confirmDelete.name || ''} {confirmDelete.surname || ''}</span> из проекта?
            </p>
            <p>Это действие невозможно отменить.</p>
            <div className="confirmation-buttons">
              <button className="cancel-button" onClick={cancelDelete}>Отмена</button>
              <button className="confirm-button" onClick={confirmDeleteMember}>Удалить</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Members; 