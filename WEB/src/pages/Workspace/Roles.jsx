import React, { useEffect, useState, useCallback, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { getRoles } from '../../api/roles';
import Loader from '../../components/Loader';
import Notification from '../../components/Notification';
import RoleCard from '../../components/RoleCard';
import '../../styles/roles.css';

function Roles() {
  const { orgId, projectUuid } = useParams();
  const [roles, setRoles] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const controllerRef = useRef(null);

  const fetchRoles = useCallback(async () => {
    controllerRef.current = new AbortController();
    try {
      setIsLoading(true);
      const data = await getRoles(orgId, projectUuid, controllerRef.current.signal);
      setRoles(data);
      setError('');
    } catch (err) {
      setError(err.message || 'Ошибка загрузки ролей');
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

  if (isLoading) return <Loader />;
  if (error) return <Notification message={error} type="error" />;

  return (
    <div className="roles-container">
      <h2>Роли проекта</h2>
      <div className="roles-grid">
        {roles.map(role => (
          <RoleCard key={role.uuid} role={role} />
        ))}
      </div>
    </div>
  );
}

export default Roles; 