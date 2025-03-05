import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { getTaskTypes } from '../../api/taskTypes';
import Loader from '../../components/Loader';
import Notification from '../../components/Notification';
import '../../styles/taskTypes.css'; // При необходимости создайте/подключите стили

function TaskTypes() {
  const { orgId, projectUuid } = useParams();
  const [taskTypes, setTaskTypes] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const controllerRef = useRef(null);

  const fetchTaskTypes = useCallback(async () => {
    controllerRef.current = new AbortController();
    try {
      setIsLoading(true);
      const data = await getTaskTypes(orgId, projectUuid, controllerRef.current.signal);
      setTaskTypes(data);
      setError('');
    } catch (err) {
      setError(err.message || 'Ошибка загрузки типов задач');
    } finally {
      setIsLoading(false);
    }
  }, [orgId, projectUuid]);

  useEffect(() => {
    fetchTaskTypes();
    return () => {
      if (controllerRef.current) {
        controllerRef.current.abort();
      }
    };
  }, [fetchTaskTypes]);

  if (isLoading) return <Loader />;
  if (error) return <Notification message={error} type="error" />;

  return (
    <div className="task-types-container">
      <h2>Типы задач</h2>
      <ul className="task-types-list">
        {taskTypes.map((type) => (
          <li key={type.uuid} className="task-type-item">
            <div className="task-type-name">{type.name}</div>
            <div className="task-type-description">{type.description || 'Нет описания'}</div>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default TaskTypes; 