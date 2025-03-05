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

const Tasks = () => {
  const { orgId, projectUuid } = useParams();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { taskTypes, taskStatuses } = useContext(ProjectContext);
  const [selectedTaskUuid, setSelectedTaskUuid] = useState(null);

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    getTasks(orgId, projectUuid, controller.signal)
      .then((data) => {
        if (data && data.response && data.response.items) {
          setTasks(data.response.items);
        } else {
          setTasks([]);
        }
      })
      .catch((err) => {
        if (axios.isCancel(err)) {
          // Ошибка вызвана отменой запроса, не устанавливаем состояние ошибки
          return;
        }
        setError(err.message);
      })
      .finally(() => {
        setLoading(false);
      });
    return () => controller.abort();
  }, [orgId, projectUuid]);

  const handleTaskCreated = (newTask) => {
    setTasks((prevTasks) => [...prevTasks, newTask]);
  };

  if (loading) return <Loader />;
  if (error) return <div>Error: {error}</div>;
  if (!tasks || tasks.length === 0) return <div>No tasks available.</div>;

  return (
    <div className="tasks-container" style={{ padding: "20px" }}>
      <h1 className="tasks-title">Tasks</h1>
      <CreateTaskButton onTaskCreated={handleTaskCreated} />
      <div className="tasks-header">
        <div className="task-cell">Name</div>
        <div className="task-cell">Status</div>
        <div className="task-cell">Priority</div>
        <div className="task-cell">Type</div>
        <div className="task-cell">Date</div>
        <div className="task-cell">Executors</div>
      </div>
      <div className="tasks-list">
        {tasks.map((task, index) => {
          // Преобразуем данные задачи, заменяя идентификаторы типа и статуса на соответствующие имена из контекста.
          const completeTask = { ...task };
          const foundType = taskTypes.find((t) => t.uuid === task.type);
          const foundStatus = taskStatuses.find((s) => s.uuid === task.status);
          if (foundType) completeTask.type = foundType.name;
          if (foundStatus) completeTask.status = foundStatus.name;
          return (
            <TaskItem
              key={task.uuid || index}
              task={completeTask}
              onClick={(uuid) => setSelectedTaskUuid(uuid)}
            />
          );
        })}
      </div>
      {selectedTaskUuid && (
        <TaskDetailsModal
          taskUuid={selectedTaskUuid}
          onClose={() => setSelectedTaskUuid(null)}
        />
      )}
    </div>
  );
};

export default Tasks; 