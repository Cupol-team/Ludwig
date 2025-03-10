import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { getTaskStatuses, createTaskStatus } from '../../api/taskStatuses';
import Loader from '../../components/Loader';
import Notification from '../../components/Notification';
import '../../styles/taskStatuses.css'; // При необходимости создайте/подключите стили

function TaskStatuses() {
  const { orgId, projectUuid } = useParams();
  const [statuses, setStatuses] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [newStatus, setNewStatus] = useState({ name: '', description: '' });
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

  const handleCreateStatus = async (e) => {
    e.preventDefault();
    if (newStatus.name.trim() === '') return;
    const controller = new AbortController();
    try {
      const created = await createTaskStatus(orgId, projectUuid, newStatus, controller.signal);
      setStatuses(prev => [...prev, created]);
      setNewStatus({ name: '', description: '' });
      setIsCreating(false);
    } catch (err) {
      setError(err.message);
    }
  };

  if (isLoading) return <Loader />;
  if (error) return <Notification message={error} type="error" />;

  return (
    <div className="task-statuses-container">
      <h2>Статусы задач</h2>
      <button className="create-status-btn" onClick={() => setIsCreating(true)}>
        Создать статус
      </button>
      {isCreating && (
        <div className="modal-overlay">
          <div className="modal-container">
            <div className="modal-header">
              <h3>Создание нового статуса</h3>
              <button 
                className="close-modal" 
                onClick={() => setIsCreating(false)}
              >
                &times;
              </button>
            </div>
            <form onSubmit={handleCreateStatus} className="modal-form">
              <div className="form-group">
                <label>Название</label>
                <input
                  type="text"
                  value={newStatus.name}
                  onChange={e => setNewStatus({ ...newStatus, name: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label>Описание</label>
                <textarea
                  value={newStatus.description}
                  onChange={e => setNewStatus({ ...newStatus, description: e.target.value })}
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