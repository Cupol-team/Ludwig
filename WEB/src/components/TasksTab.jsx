import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { getTasks } from '../api/tasks';
import CreateTaskButton from './CreateTaskButton';
import '../styles/TasksTab.css';

const TasksTab = () => {
  const { orgId, projectUuid } = useParams();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Загрузка задач при монтировании компонента
  useEffect(() => {
    const fetchTasks = async () => {
      const controller = new AbortController();
      setLoading(true);
      
      try {
        const data = await getTasks(orgId, projectUuid, controller.signal);
        // Предполагаем, что API возвращает объект { tasks: [...] } или { response: { items: [...] } }
        let tasksList = [];
        
        if (data.tasks) {
          tasksList = data.tasks;
        } else if (data.response && data.response.items) {
          tasksList = data.response.items;
        } else if (Array.isArray(data)) {
          tasksList = data;
        }
        
        setTasks(tasksList);
      } catch (err) {
        if (!err.name === 'AbortError') {
          console.error('Ошибка загрузки задач:', err);
          setError(err.message);
        }
      } finally {
        setLoading(false);
      }
      
      return () => controller.abort();
    };
    
    fetchTasks();
  }, [orgId, projectUuid]);

  // Callback для обновления списка после создания задачи
  const handleTaskCreated = (newTask) => {
    // Проверяем, что задача имеет необходимые поля
    if (!newTask) return;
    
    // Добавляем задачу в начало списка
    setTasks((prevTasks) => [newTask, ...(prevTasks || [])]);
  };

  return (
    <div className="tasks-tab">
      <div className="tasks-toolbar">
        <div className="toolbar-left">
          <h2>Задачи</h2>
        </div>
        <div className="toolbar-right">
          <CreateTaskButton onTaskCreated={handleTaskCreated} />
        </div>
      </div>
      <div className="tasks-content">
        {loading && <p>Загрузка задач...</p>}
        {error && <p className="error">Ошибка: {error}</p>}
        {!loading && (!tasks || tasks.length === 0) && <p>Нет задач</p>}
        <ul className="tasks-list">
          {tasks && tasks.length > 0 && tasks.map((task) => (
            <li key={task.uuid || `task-${Math.random()}`} className="task-item">
              <h4>{task.name || 'Без названия'}</h4>
              <p>{task.description || 'Нет описания'}</p>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default TasksTab; 