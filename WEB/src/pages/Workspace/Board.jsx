import React, { useEffect, useState, useContext, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { 
    DndContext, 
    rectIntersection,
    DragOverlay,
    pointerWithin,
    getFirstCollision
} from '@dnd-kit/core';
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
    const boardContainerRef = useRef(null);

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
        // Добавляем класс к контейнеру при перетаскивании
        if (boardContainerRef.current) {
            boardContainerRef.current.classList.add('board-is-dragging');
        }
    };

    const handleDragEnd = async (event) => {
        const { active, over } = event;
        
        // Если элемент перемещён за пределы допустимой области
        if (!over) {
            setActiveId(null);
            return;
        }

        const activeTaskId = active.id;
        
        // Извлекаем ID для целевого контейнера
        // Если мы наводим на другую задачу, мы берем атрибут data-drop-parent,
        // иначе используем id, что означает, что мы навели на колонку
        let overColumnId;
        
        const overElement = document.getElementById(over.id.toString());
        if (overElement && overElement.hasAttribute('data-drop-parent')) {
            // Когда навели на задачу, берем значение атрибута data-drop-parent
            overColumnId = overElement.getAttribute('data-drop-parent');
        } else {
            // Когда навели на колонку, используем id
            overColumnId = over.id;
        }
        
        // Найдем задачу, которую перемещаем
        const movedTask = tasks.find(task => task.id.toString() === activeTaskId);
        if (!movedTask) {
            setActiveId(null);
            return;
        }

        const oldStatus = movedTask.status;
        const newStatus = overColumnId;

        // Если статус не изменился, выходим
        if (oldStatus === newStatus) {
            setActiveId(null);
            return;
        }

        // Сохраняем копию предшествующего состояния задач для возможности отката
        const previousTasks = [...tasks];

        // Оптимистично обновляем состояние UI
        const updatedTask = { ...movedTask, status: newStatus };
        const updatedTasks = tasks.map(task =>
            task.id.toString() === activeTaskId ? updatedTask : task
        );
        setTasks(updatedTasks);

        try {
            // Отправляем запрос на сервер для обновления статуса задачи
            await editTask(orgId, projectUuid, activeTaskId, { status: newStatus });
            console.log("Задача успешно перемещена");
        } catch (error) {
            console.error("Ошибка обновления задачи:", error);
            // Если произошла ошибка, откатываем изменения в UI
            setTasks(previousTasks);
            // Можно также показать пользователю уведомление об ошибке
        } finally {
            setActiveId(null);
            // Удаляем класс с контейнера после перетаскивания
            if (boardContainerRef.current) {
                boardContainerRef.current.classList.remove('board-is-dragging');
            }
        }
    };

    // Очистка класса с контейнера при отмене перетаскивания
    const handleDragCancel = () => {
        setActiveId(null);
        if (boardContainerRef.current) {
            boardContainerRef.current.classList.remove('board-is-dragging');
        }
    };

    // Найдём данные для активной задачи, используя id
    const activeTask = tasks.find(task => task.id.toString() === activeId);
    
    // Определяем класс для доски при активном перетаскивании
    const boardClassName = `kanban-board ${activeId ? 'board-is-dragging' : ''}`;

    if (loading) return <Loader />;
    if (taskStatusesError)
        return <div>Ошибка при загрузке статусов.</div>;

    // Если группировка пуста, можно вывести сообщение для отладки
    const isEmpty = Object.keys(tasksByStatus).length === 0;
    if (isEmpty) {
        return (
            <div className="empty-board-container">
                <div className="empty-board-message">
                    <svg width="60" height="60" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M4 6C4 4.89543 4.89543 4 6 4H18C19.1046 4 20 4.89543 20 6V18C20 19.1046 19.1046 20 18 20H6C4.89543 20 4 19.1046 4 18V6Z" stroke="#6f42c1" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M9 9H15" stroke="#6f42c1" strokeWidth="2" strokeLinecap="round"/>
                        <path d="M9 13H15" stroke="#6f42c1" strokeWidth="2" strokeLinecap="round"/>
                        <path d="M9 17H13" stroke="#6f42c1" strokeWidth="2" strokeLinecap="round"/>
                    </svg>
                    <h3>Нет данных для отображения</h3>
                    <p>Не найдены задачи или статусы для этого проекта</p>
                    <p className="hint-text">Проверьте API и настройки проекта</p>
                </div>
            </div>
        );
    }

    return (
        <div className="board-container" ref={boardContainerRef}>
            <div className="mobile-scroll-hint">
                ← Прокрутите влево-вправо для просмотра всех колонок →
            </div>
            <DndContext
                collisionDetection={(args) => {
                    // Используем комбинацию алгоритмов для лучшего определения коллизий
                    const pointerCollisions = pointerWithin(args);
                    const rectCollisions = rectIntersection(args);
                    
                    // Если есть коллизии от указателя, используем их первыми
                    if (pointerCollisions.length > 0) {
                        // Проверяем все коллизии и ищем первую, которая указывает на колонку
                        // Это позволит перетащить задачу на колонку, даже если указатель находится над другой задачей
                        for (const collision of pointerCollisions) {
                            const element = document.getElementById(collision.id);
                            // Если это элемент с атрибутом data-droppable-id, это колонка
                            if (element && element.hasAttribute('data-droppable-id')) {
                                return [collision];
                            }
                        }
                        
                        // Если колонка не найдена, возвращаем коллизию с задачей
                        return [pointerCollisions[0]];
                    }
                    
                    // Если нет коллизий от указателя, используем прямоугольное пересечение
                    if (rectCollisions.length > 0) {
                        return [rectCollisions[0]];
                    }
                    
                    return [];
                }}
                onDragStart={handleDragStart}
                onDragEnd={(event) => {
                    handleDragEnd(event);
                }}
                onDragCancel={handleDragCancel}
            >
                <div className={boardClassName}>
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