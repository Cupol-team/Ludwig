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

const Board = () => {
    const { orgId, projectUuid } = useParams();
    const { taskStatuses, loadingTaskStatuses, taskStatusesError } = useContext(ProjectContext);
    const [tasks, setTasks] = useState([]);
    const [statuses, setStatuses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeId, setActiveId] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const statusesData = await getTaskStatuses(orgId, projectUuid);
                const tasksData = await getTasks(orgId, projectUuid);
                // Предполагаем, что задачи приходят либо как tasksData, либо в tasksData.response.items
                const rawTasks = tasksData.response?.items || tasksData;
                // Преобразуем задачи, чтобы гарантировать наличие поля id (используем task.uuid, если task.id отсутствует)
                const tasksArray = rawTasks.map(task => ({
                    ...task,
                    id: task.id || task.uuid,
                }));
                setStatuses(statusesData);
                setTasks(tasksArray);
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
        if (!over) return;

        const oldStatus = active.data.current.sortable?.containerId;
        const newStatus = over.id;

        if (!oldStatus || oldStatus === newStatus) return;

        const movedTask = tasks.find(task => task.id.toString() === active.id);
        if (!movedTask) return;

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
            Notification.error("Ошибка обновления задачи");
            // Если ошибка – откатываем состояние
            setTasks(previousTasks);
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
                    setActiveId(null);
                }}
                onDragCancel={() => setActiveId(null)}
            >
                <div className="kanban-board">
                    {statuses.map(status => (
                        <TaskColumn
                            key={status.uuid}
                            status={status}
                            tasks={tasksByStatus[status.uuid] || []}
                        />
                    ))}
                </div>
                <DragOverlay>
                    {activeTask ? (
                        <div className="drag-overlay-wrapper">
                            <SortableTask task={activeTask} containerId={activeTask.status} />
                        </div>
                    ) : null}
                </DragOverlay>
            </DndContext>
        </div>
    );
};

export default Board; 