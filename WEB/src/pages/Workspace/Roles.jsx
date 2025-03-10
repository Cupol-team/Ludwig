import React, { useEffect, useState, useCallback, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { getRoles as getProjectRoles, createProjectRole } from '../../api/roles';
import Loader from '../../components/Loader';
import Notification from '../../components/Notification';
import '../../styles/roles.css';

function Roles() {
  const { orgId, projectUuid } = useParams();
  const [roles, setRoles] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [newRole, setNewRole] = useState({ name: '', description: '' });
  const controllerRef = useRef(null);

  const fetchRoles = useCallback(async () => {
    controllerRef.current = new AbortController();
    try {
      setIsLoading(true);
      const data = await getProjectRoles(orgId, projectUuid, controllerRef.current.signal);
      setRoles(data);
      setError('');
    } catch (err) {
      setError(err.message || 'Ошибка загрузки ролей проекта');
    } finally {
      setIsLoading(false);
    }
  }, [orgId, projectUuid]);

  useEffect(() => {
    fetchRoles();
    return () => {
      if (controllerRef.current) {
        controllerRef.current.abort();
      }
    };
  }, [fetchRoles]);

  const handleCreateRole = async (e) => {
    e.preventDefault();
    if (newRole.name.trim() === '') return;
    const controller = new AbortController();
    try {
      const created = await createProjectRole(orgId, projectUuid, newRole, controller.signal);
      setRoles(prev => [...prev, created]);
      setNewRole({ name: '', description: '' });
      setIsCreating(false);
    } catch (err) {
      setError(err.message);
    }
  };

  if (isLoading) return <Loader />;
  if (error) return <Notification message={error} type="error" />;

  return (
    <div className="roles-container">
      <h2>Роли проекта</h2>
      <button className="create-role-btn" onClick={() => setIsCreating(true)}>
        Создать роль
      </button>
      {isCreating && (
        <div className="modal-overlay">
          <div className="modal-container">
            <div className="modal-header">
              <h3>Создание новой роли</h3>
              <button 
                className="close-modal" 
                onClick={() => setIsCreating(false)}
              >
                &times;
              </button>
            </div>
            <form onSubmit={handleCreateRole} className="modal-form">
              <div className="form-group">
                <label>Название</label>
                <input
                  type="text"
                  value={newRole.name}
                  onChange={e => setNewRole({ ...newRole, name: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label>Описание</label>
                <textarea
                  value={newRole.description}
                  onChange={e => setNewRole({ ...newRole, description: e.target.value })}
                />
              </div>
              <div className="modal-actions">
                <button type="submit" className="submit-btn">Создать</button>
                <button 
                  type="button" 
                  className="cancel-btn" 
                  onClick={() => setIsCreating(false)}
                >
                  Отмена
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      <ul className="roles-list">
        {roles.map(role => (
          <li key={role.uuid} className="role-item">
            <div className="role-name">{role.name}</div>
            <div className="role-description">{role.description || 'Нет описания'}</div>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default Roles; 