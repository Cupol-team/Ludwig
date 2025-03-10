import React, { useState, useContext } from 'react';
import { useParams } from 'react-router-dom';
import { createTask } from '../api/tasks';
import { ProjectContext } from '../context/ProjectContext';
import axios from 'axios';
import '../styles/TaskCreationModal.css';

const CreateTaskButton = ({ onTaskCreated }) => {
  const { orgId, projectUuid } = useParams();
  const { taskTypes, taskStatuses, members } = useContext(ProjectContext);
  
  // Изменили начальное состояние: теперь тип и статус оставляем пустыми, чтобы пользователь мог не выбирать их
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    type: '', // по умолчанию пусто
    priority: 0,
    status: '', // по умолчанию пусто
    date: new Date().toISOString().slice(0, 10),
    executors: [] // Массив UUID исполнителей
  });
  
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // Форма считается валидной, если заполнены "Название" и "Дата"
  // а также в системе есть данные для типов и статусов задач
  const isFormValid =
    formData.name.trim() !== '' &&
    formData.date.trim() !== '' &&
    (taskTypes && taskTypes.length > 0) &&
    (taskStatuses && taskStatuses.length > 0);
  
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
                <label htmlFor="task-name">Название</label>
                <input 
                  id="task-name"
                  type="text" 
                  name="name" 
                  placeholder="Введите название задачи"
                  value={formData.name} 
                  onChange={handleChange} 
                  required 
                />
              </div>
              <div className="form-group">
                <label htmlFor="task-description">Описание</label>
                <textarea 
                  id="task-description"
                  name="description" 
                  placeholder="Введите описание задачи (не обязательно)"
                  value={formData.description} 
                  onChange={handleChange}
                />
              </div>
              <div className="form-group">
                <label htmlFor="task-type">Тип (не обязательно)</label>
                <select 
                  id="task-type"
                  name="type" 
                  value={formData.type} 
                  onChange={handleChange}
                  disabled={!(taskTypes && taskTypes.length > 0)}
                >
                  <option value="">
                    {taskTypes && taskTypes.length > 0 ? "Пусто" : "Типы отсутствуют"}
                  </option>
                  {taskTypes && taskTypes.length > 0 && taskTypes.map((t) => (
                    <option key={t.uuid} value={t.uuid}>{t.name}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label htmlFor="task-priority">Приоритет</label>
                <select 
                  id="task-priority"
                  name="priority" 
                  value={formData.priority} 
                  onChange={handleChange}
                >
                  <option value={-2}>Минимальный</option>
                  <option value={-1}>Низкий</option>
                  <option value={0}>Средний</option>
                  <option value={1}>Высокий</option>
                  <option value={2}>Критичный</option>
                </select>
              </div>
              <div className="form-group">
                <label htmlFor="task-status">Статус (не обязательно)</label>
                <select 
                  id="task-status"
                  name="status" 
                  value={formData.status} 
                  onChange={handleChange}
                  disabled={!(taskStatuses && taskStatuses.length > 0)}
                >
                  <option value="">
                    {taskStatuses && taskStatuses.length > 0 ? "Пусто" : "Статусы отсутствуют"}
                  </option>
                  {taskStatuses && taskStatuses.length > 0 && taskStatuses.map((s) => (
                    <option key={s.uuid} value={s.uuid}>{s.name}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label htmlFor="task-date">Дата</label>
                <input 
                  id="task-date"
                  type="date" 
                  name="date" 
                  value={formData.date} 
                  onChange={handleChange} 
                  required 
                />
              </div>
              <div className="form-group">
                <label htmlFor="task-executors">Исполнители (не обязательно)</label>
                <select
                  id="task-executors"
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
              <button 
                type="submit" 
                disabled={loading || !isFormValid}
                style={{
                  backgroundColor: loading || !isFormValid ? "#ccc" : "#8b5cf6",
                  color: loading || !isFormValid ? "#666" : "#fff",
                  padding: "8px 16px",
                  border: "none",
                  borderRadius: "4px",
                  cursor: loading || !isFormValid ? "not-allowed" : "pointer"
                }}
              >
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