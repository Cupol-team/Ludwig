import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { getTaskStatuses } from '../../api/taskStatuses';
import Loader from '../../components/Loader';
import Notification from '../../components/Notification';
import '../../styles/taskStatuses.css'; // При необходимости создайте/подключите стили

function TaskStatuses() {
  const { orgId, projectUuid } = useParams();
  const [statuses, setStatuses] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const controllerRef = useRef(null);

  const fetchTaskStatuses = useCallback(async () => {
    controllerRef.current = new AbortController();
    try {
      setIsLoading(true);
      const data = await getTaskStatuses(orgId, projectUuid, controllerRef.current.signal);
      setStatuses(data);
      setError('');
    } catch (err) {
      setError(err.message || 'Ошибка загрузки статусов задач');
    } finally {
      setIsLoading(false);
    }
  }, [orgId, projectUuid]);

  useEffect(() => {
    fetchTaskStatuses();
    return () => {
      if (controllerRef.current) {
        controllerRef.current.abort();
      }
    };
  }, [fetchTaskStatuses]);

  if (isLoading) return <Loader />;
  if (error) return <Notification message={error} type="error" />;

  return (
    <div className="task-statuses-container">
      <h2>Статусы задач</h2>
      <ul className="task-statuses-list">
        {statuses.map((status) => (
          <li key={status.uuid} className="task-status-item">
            <div className="task-status-name">{status.name}</div>
            <div className="task-status-description">{status.description || 'Нет описания'}</div>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default TaskStatuses; 