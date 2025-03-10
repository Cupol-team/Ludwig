import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { getTaskTypes, createTaskType } from '../../api/taskTypes';
import Loader from '../../components/Loader';
import Notification from '../../components/Notification';
import '../../styles/taskTypes.css'; // При необходимости создайте/подключите стили

function TaskTypes() {
  const { orgId, projectUuid } = useParams();
  const [types, setTypes] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [newType, setNewType] = useState({ name: '', description: '' });
  const controllerRef = useRef(null);

  const fetchTaskTypes = useCallback(async () => {
    controllerRef.current = new AbortController();
    try {
      setIsLoading(true);
      const data = await getTaskTypes(orgId, projectUuid, controllerRef.current.signal);
      setTypes(data);
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

  const handleCreateType = async (e) => {
    e.preventDefault();
    if (newType.name.trim() === '') return;
    const controller = new AbortController();
    try {
      const created = await createTaskType(orgId, projectUuid, newType, controller.signal);
      setTypes(prev => [...prev, created]);
      setNewType({ name: '', description: '' });
      setIsCreating(false);
    } catch (err) {
      setError(err.message);
    }
  };

  if (isLoading) return <Loader />;
  if (error) return <Notification message={error} type="error" />;

  return (
    <div className="task-types-container">
      <h2>Типы задач</h2>
      <button className="create-type-btn" onClick={() => setIsCreating(true)}>
        Создать тип задачи
      </button>
      {isCreating && (
        <div className="modal-overlay">
          <div className="modal-container">
            <div className="modal-header">
              <h3>Создание нового типа задачи</h3>
              <button 
                className="close-modal" 
                onClick={() => setIsCreating(false)}
              >
                &times;
              </button>
            </div>
            <form onSubmit={handleCreateType} className="modal-form">
              <div className="form-group">
                <label>Название</label>
                <input
                  type="text"
                  value={newType.name}
                  onChange={e => setNewType({ ...newType, name: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label>Описание</label>
                <textarea
                  value={newType.description}
                  onChange={e => setNewType({ ...newType, description: e.target.value })}
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
      <ul className="task-types-list">
        {types.map((type) => (
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