import React, { useState, useEffect, useContext } from 'react';
import { useParams } from 'react-router-dom';
import { getTasks } from '../../api/tasks';
import TaskItem from '../../components/TaskItem';
import '../../styles/Tasks.css';
import axios from 'axios';
import { ProjectContext } from '../../context/ProjectContext';
import TaskDetailsModal from '../../components/TaskDetailsModal';
import CreateTaskButton from '../../components/CreateTaskButton';
import Loader from '../../components/Loader';
import { getUserAvatar } from '../../api/profile';

const Tasks = () => {
  const { orgId, projectUuid } = useParams();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { taskTypes, taskStatuses, project } = useContext(ProjectContext);
  const [selectedTaskUuid, setSelectedTaskUuid] = useState(null);
  const [avatars, setAvatars] = useState({});
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('');

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    getTasks(orgId, projectUuid, controller.signal)
      .then((data) => {
        if (data && data.response && data.response.items) {
          setTasks(data.response.items);
          loadAvatars(data.response.items);
        } else {
          setTasks([]);
        }
      })
      .catch((err) => {
        if (axios.isCancel(err)) {
          return;
        }
        setError(err.message);
      })
      .finally(() => {
        setLoading(false);
      });
    return () => controller.abort();
  }, [orgId, projectUuid]);

  const loadAvatars = (tasks) => {
    const avatarPromises = [];
    const avatarMap = {};

    tasks.forEach(task => {
      if (task.executors && task.executors.length > 0) {
        task.executors.forEach(executorId => {
          if (!avatarMap[executorId]) {
            avatarPromises.push(
              getUserAvatar(executorId)
                .then(url => {
                  avatarMap[executorId] = url !== '/default-avatar.png' ? url : null;
                })
                .catch(error => {
                  console.error(`Failed to load avatar for executor ${executorId}:`, error);
                  avatarMap[executorId] = null;
                })
            );
          }
        });
      }
    });

    Promise.all(avatarPromises).then(() => {
      setAvatars(avatarMap);
    });
  };

  const handleTaskCreated = (newTask) => {
    // Преобразуем задачу для отображения в списке
    const formattedTask = {
      ...newTask,
      // Если API не вернул UUID, используем временный
      uuid: newTask.uuid || newTask.id || `temp-${Date.now()}`,
    };
    
    // Добавляем задачу в начало списка
    setTasks((prevTasks) => [formattedTask, ...prevTasks]);
    
    // Загружаем аватары исполнителей, если они есть
    if (newTask.executors && newTask.executors.length > 0) {
      loadAvatars([newTask]);
    }
  };

  // Фильтрация задач
  const filteredTasks = tasks.filter(task => {
    const nameMatch = task.name?.toLowerCase().includes(searchQuery.toLowerCase()) || false;
    const statusMatch = !filterStatus || task.status === filterStatus;
    return nameMatch && statusMatch;
  });

  // Сортировка задач (по умолчанию новые сверху)
  const sortedTasks = [...filteredTasks].sort((a, b) => {
    const dateA = new Date(a.date || 0);
    const dateB = new Date(b.date || 0);
    return dateB - dateA;
  });

  if (loading) return <Loader />;
  if (error) return <div className="error-message">Ошибка: {error}</div>;

  return (
    <div className="tasks-container">
      <div className="tasks-header-section">
        <div className="tasks-title-row">
          <div className="tasks-title">
            {project?.name ? `Задачи проекта: ${project.name}` : 'Список задач'}
          </div>
          <CreateTaskButton onTaskCreated={handleTaskCreated} />
        </div>
        
        <div className="tasks-toolbar">
          <div className="search-filter">
            <input
              type="text"
              placeholder="Поиск задач..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="search-input"
            />
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="filter-select"
            >
              <option value="">Все статусы</option>
              {taskStatuses && taskStatuses.map((status) => (
                <option key={status.uuid} value={status.uuid}>
                  {status.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>
      
      <div className="tasks-table">
        <div className="tasks-header">
          <div className="task-cell">Название</div>
          <div className="task-cell">Статус</div>
          <div className="task-cell">Приоритет</div>
          <div className="task-cell">Тип</div>
          <div className="task-cell">Дата</div>
          <div className="task-cell">Исполнители</div>
        </div>
        
        <div className="tasks-list">
          {sortedTasks && sortedTasks.length > 0 ? (
            sortedTasks.map((task, index) => {
              const completeTask = { ...task };
              const foundType = taskTypes.find((t) => t.uuid === task.type);
              const foundStatus = taskStatuses.find((s) => s.uuid === task.status);
              if (foundType) completeTask.type = foundType.name;
              if (foundStatus) completeTask.status = foundStatus.name;
              return (
                <TaskItem
                  key={task.uuid || index}
                  task={completeTask}
                  avatars={avatars}
                  onClick={(uuid) => setSelectedTaskUuid(uuid)}
                />
              );
            })
          ) : (
            <div className="empty-tasks-message">
              {searchQuery || filterStatus 
                ? 'Нет задач, соответствующих заданным критериям' 
                : 'Нет доступных задач. Создайте новую задачу, нажав на кнопку "Создать задачу"'}
            </div>
          )}
        </div>
      </div>
      
      {selectedTaskUuid && (
        <TaskDetailsModal
          taskUuid={selectedTaskUuid}
          onClose={() => setSelectedTaskUuid(null)}
          avatars={avatars}
        />
      )}
    </div>
  );
};

export default Tasks; 