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

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    getTasks(orgId, projectUuid, controller.signal)
      .then((data) => {
        // Предполагаем, что API возвращает объект { tasks: [...] }
        setTasks(data.tasks || []);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));

    return () => controller.abort();
  }, [orgId, projectUuid]);

  // Callback для обновления списка после создания задачи
  const handleTaskCreated = (newTask) => {
    setTasks((prevTasks) => [newTask, ...prevTasks]);
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
        {!loading && tasks.length === 0 && <p>Нет задач</p>}
        <ul className="tasks-list">
          {tasks.map((task) => (
            <li key={task.uuid} className="task-item">
              <h4>{task.name}</h4>
              <p>{task.description}</p>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default TasksTab; 