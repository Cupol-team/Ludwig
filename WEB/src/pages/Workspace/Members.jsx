import React, { useEffect, useState, useCallback, useRef, useContext } from 'react';
import { useParams } from 'react-router-dom';
import { getMembers } from '../../api/members';
import { getUserAvatar } from '../../api/profile';
import Loader from '../../components/Loader';
import Notification from '../../components/Notification';
import { ProjectContext } from '../../context/ProjectContext';
import '../../styles/members.css';
import '../../styles/memberAvatars.css';

function Members() {
  const { orgId, projectUuid } = useParams();
  const [members, setMembers] = useState([]);
  const [memberAvatars, setMemberAvatars] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const controllerRef = useRef(null);
  const { roles } = useContext(ProjectContext); // получаем предзагруженные роли

  const fetchMembers = useCallback(async () => {
    controllerRef.current = new AbortController();
    try {
      setIsLoading(true);
      const data = await getMembers(orgId, projectUuid, controllerRef.current.signal);
      setMembers(data);
      setError('');
    } catch (err) {
      setError(err.message || 'Ошибка загрузки участников');
    } finally {
      setIsLoading(false);
    }
  }, [orgId, projectUuid]);

  // Загрузка аватаров для всех участников
  useEffect(() => {
    if (members.length > 0) {
      const avatarControllers = {};
      const avatarPromises = members.map(member => {
        // Создаем контроллер для каждого запроса аватара
        avatarControllers[member.uuid] = new AbortController();
        
        return getUserAvatar(member.uuid, avatarControllers[member.uuid].signal)
          .then(avatarUrl => ({ uuid: member.uuid, avatarUrl }))
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

      // Очистка при размонтировании
      return () => {
        Object.values(avatarControllers).forEach(controller => {
          controller.abort();
        });
        
        // Освобождаем URL объекты
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

  // Функция для поиска роли по UUID и возврата читаемого наименования
  const getRoleName = (roleUuid) => {
    const roleObj = roles.find(role => role.uuid === roleUuid);
    return roleObj ? roleObj.name : roleUuid;
  };

  if (isLoading) return <Loader />;
  if (error) return <Notification message={error} type="error" />;
  return (
    <div className="members-container">
      <h2>Участники</h2>
      <ul className="members-list">
        {members.map(member => (
          <li key={member.uuid} className="member-item">
            <div className="member-avatar">
              {memberAvatars[member.uuid] ? (
                <img 
                  src={memberAvatars[member.uuid]} 
                  alt={`${member.name} ${member.surname}`} 
                  className="member-avatar-img"
                />
              ) : (
                member.name.charAt(0)
              )}
            </div>
            <div className="member-details">
              <p className="member-name">{member.name} {member.surname}</p>
              <p className="member-role">
                Роль: <span className="role-highlight">{getRoleName(member.role)}</span>
              </p>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default Members; 