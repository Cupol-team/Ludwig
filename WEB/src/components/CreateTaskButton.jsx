import React, { useState, useContext } from 'react';
import { useParams } from 'react-router-dom';
import { createTask } from '../api/tasks';
import { ProjectContext } from '../context/ProjectContext';
import axios from 'axios';
import '../styles/TaskCreationModal.css';

const CreateTaskButton = ({ onTaskCreated }) => {
  const { orgId, projectUuid } = useParams();
  const { taskTypes, taskStatuses, members } = useContext(ProjectContext);
  
  // Инициализируем форму: если в контексте есть типы/статусы - выбираем первый из списков по умолчанию.
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    type: taskTypes && taskTypes.length > 0 ? taskTypes[0].uuid : '',
    priority: 0,
    status: taskStatuses && taskStatuses.length > 0 ? taskStatuses[0].uuid : '',
    date: new Date().toISOString().slice(0, 10),
    executors: [] // Массив UUID исполнителей
  });
  
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleExecutorsSelectChange = (e) => {
    const selectedOptions = Array.from(e.target.selectedOptions, option => option.value);
    setFormData(prev => ({ ...prev, executors: selectedOptions }));
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const controller = new AbortController();
    try {
      const data = await createTask(orgId, projectUuid, formData, controller.signal);
      setOpen(false);
      // Вызываем callback, если требуется обновление списка задач
      if(onTaskCreated) onTaskCreated(data);
    } catch (err) {
      if (!axios.isCancel(err)) {
        setError(err.message);
      }
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <>
      <button className="create-task-button" onClick={() => setOpen(true)}>
        Создать задачу
      </button>
      {open && (
        <div className="task-creation-modal-overlay" onClick={() => setOpen(false)}>
          <div className="task-creation-modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setOpen(false)}>
              &times;
            </button>
            <h2>Создание задачи</h2>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Название</label>
                <input 
                  type="text" 
                  name="name" 
                  value={formData.name} 
                  onChange={handleChange} 
                  required 
                />
              </div>
              <div className="form-group">
                <label>Описание</label>
                <textarea 
                  name="description" 
                  value={formData.description} 
                  onChange={handleChange}
                />
              </div>
              <div className="form-group">
                <label>Тип</label>
                <select name="type" value={formData.type} onChange={handleChange}>
                  {taskTypes && taskTypes.map((t) => (
                    <option key={t.uuid} value={t.uuid}>{t.name}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Приоритет</label>
                <select name="priority" value={formData.priority} onChange={handleChange}>
                  <option value={-2}>Минимальный</option>
                  <option value={-1}>Низкий</option>
                  <option value={0}>Средний</option>
                  <option value={1}>Высокий</option>
                  <option value={2}>Критичный</option>
                </select>
              </div>
              <div className="form-group">
                <label>Статус</label>
                <select name="status" value={formData.status} onChange={handleChange}>
                  {taskStatuses && taskStatuses.map((s) => (
                    <option key={s.uuid} value={s.uuid}>{s.name}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Дата</label>
                <input 
                  type="date" 
                  name="date" 
                  value={formData.date} 
                  onChange={handleChange} 
                  required 
                />
              </div>
              <div className="form-group">
                <label>Исполнители</label>
                <select
                  name="executors"
                  multiple
                  value={formData.executors}
                  onChange={handleExecutorsSelectChange}
                >
                  {members && members.map(member => (
                    <option key={member.uuid} value={member.uuid}>
                      {member.name}
                    </option>
                  ))}
                </select>
              </div>
              {error && <div className="error">{error}</div>}
              <button type="submit" disabled={loading}>
                {loading ? 'Создание...' : 'Создать'}
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default CreateTaskButton; 