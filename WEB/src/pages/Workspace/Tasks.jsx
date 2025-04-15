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
  const { taskTypes, taskStatuses } = useContext(ProjectContext);
  const [selectedTaskUuid, setSelectedTaskUuid] = useState(null);
  const [avatars, setAvatars] = useState({});

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
    setTasks((prevTasks) => [...prevTasks, newTask]);
    loadAvatars([newTask]);
  };

  if (loading) return <Loader />;
  if (error) return <div>Ошибка: {error}</div>;

  return (
    <div className="tasks-container" style={{ padding: "20px" }}>
      <CreateTaskButton onTaskCreated={handleTaskCreated} />
      <div className="tasks-header">
        <div className="task-cell">Название</div>
        <div className="task-cell">Статус</div>
        <div className="task-cell">Приоритет</div>
        <div className="task-cell">Тип</div>
        <div className="task-cell">Дата</div>
        <div className="task-cell">Исполнители</div>
      </div>
      <div className="tasks-list">
        {tasks && tasks.length > 0 ? (
          tasks.map((task, index) => {
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
          <div className="empty-tasks-message" style={{ 
            padding: "20px", 
            textAlign: "center", 
            gridColumn: "1 / -1",
            color: "#666"
          }}>
            Нет доступных задач
          </div>
        )}
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