import React, { useEffect, useState, useContext } from 'react';
import { useParams } from 'react-router-dom';
import { DndContext, closestCenter, DragOverlay } from '@dnd-kit/core';
import { arrayMove } from '@dnd-kit/sortable';
import { getTasks, editTask } from '../../api/tasks';
import { getTaskStatuses } from '../../api/taskStatuses';
import { ProjectContext } from '../../context/ProjectContext';
import TaskColumn from '../../components/TaskColumn';
import Loader from '../../components/Loader';
import '../../styles/KanbanBoard.css'; // Добавьте стили для канбан доски по необходимости
import SortableTask from '../../components/SortableTask';
import Notification from '../../components/Notification';
import { getUserAvatar } from '../../api/profile';

const Board = () => {
    const { orgId, projectUuid } = useParams();
    const { taskStatuses, loadingTaskStatuses, taskStatusesError } = useContext(ProjectContext);
    const [tasks, setTasks] = useState([]);
    const [statuses, setStatuses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeId, setActiveId] = useState(null);
    const [avatars, setAvatars] = useState({});

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

    useEffect(() => {
        const fetchData = async () => {
            try {
                const statusesData = await getTaskStatuses(orgId, projectUuid);
                const tasksData = await getTasks(orgId, projectUuid);
                const rawTasks = tasksData.response?.items || tasksData;
                const tasksArray = rawTasks.map(task => ({
                    ...task,
                    id: task.id || task.uuid,
                }));
                setStatuses(statusesData);
                setTasks(tasksArray);
                loadAvatars(tasksArray);
            } catch (error) {
                console.error("Error fetching tasks or statuses:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [orgId, projectUuid]);

    // Группируем задачи по статусам
    const tasksByStatus = statuses.reduce((acc, status) => {
        acc[status.uuid] = tasks.filter(task => task.status === status.uuid);
        return acc;
    }, {});

    const handleDragStart = (event) => {
        setActiveId(event.active.id);
    };

    const handleDragEnd = async (event) => {
        const { active, over } = event;
        
        // Если элемент перемещён за пределы допустимой области
        if (!over) {
            setActiveId(null);
            return;
        }

        const oldStatus = active.data.current.sortable?.containerId;
        const newStatus = over.id;

        // Если статус не изменился
        if (!oldStatus || oldStatus === newStatus) {
            setActiveId(null);
            return;
        }

        const movedTask = tasks.find(task => task.id.toString() === active.id);
        if (!movedTask) {
            setActiveId(null);
            return;
        }

        // Сохраняем копию предшествующего состояния задач для возможности отката
        const previousTasks = [...tasks];

        const updatedTask = { ...movedTask, status: newStatus };
        const updatedTasks = tasks.map(task =>
            task.id.toString() === active.id ? updatedTask : task
        );
        setTasks(updatedTasks);

        const payload = {
            status: newStatus
        };

        try {
            await editTask(orgId, projectUuid, active.id, payload);
        } catch (error) {
            console.error("Ошибка обновления задачи:", error);
            // Если ошибка – откатываем состояние
            setTasks(previousTasks);
        } finally {
            setActiveId(null);
        }
    };

    // Найдём данные для активной задачи, используя id
    const activeTask = tasks.find(task => task.id.toString() === activeId);

    if (loading) return <Loader />;
    if (taskStatusesError)
        return <div>Ошибка при загрузке статусов.</div>;

    // Если группировка пуста, можно вывести сообщение для отладки
    const isEmpty = Object.keys(tasksByStatus).length === 0;
    if (isEmpty) {
        return <div>Нет данных для отображения. Проверьте API и данные в консоли.</div>;
    }

    return (
        <div className="workspace-container">
            <DndContext
                collisionDetection={closestCenter}
                onDragStart={handleDragStart}
                onDragEnd={(event) => {
                    handleDragEnd(event);
                }}
                onDragCancel={() => setActiveId(null)}
            >
                <div className="kanban-board">
                    {statuses.map(status => (
                        <TaskColumn
                            key={status.uuid}
                            status={status}
                            tasks={tasksByStatus[status.uuid] || []}
                            avatars={avatars}
                        />
                    ))}
                </div>
                <DragOverlay>
                    {activeTask ? (
                        <div className="drag-overlay-wrapper">
                            <SortableTask task={activeTask} containerId={activeTask.status} avatars={avatars} />
                        </div>
                    ) : null}
                </DragOverlay>
            </DndContext>
        </div>
    );
};

export default Board; 