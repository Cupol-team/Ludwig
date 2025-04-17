import React from 'react';
import PropTypes from 'prop-types';
import '../styles/TaskColumn.css';
import { useDroppable } from '@dnd-kit/core';
import { SortableContext, rectSortingStrategy } from '@dnd-kit/sortable';
// Вместо TaskCard будем использовать уже готовый компонент для сортировки
import SortableTask from './SortableTask';

// Убираем обработку нативного drag & drop
const TaskColumn = ({ status, tasks, avatars }) => {
  // Делаем колонку droppable-областью с id равным статусу и передаём data для идентификации
  const { setNodeRef, isOver, active } = useDroppable({ 
    id: status.uuid, 
    data: { container: status.uuid } 
  });

  // Стили для колонки могут быть определены через классы, а не инлайн-стили
  const columnContentClassName = `kanban-column-content ${isOver ? 'drop-target' : ''}`;
  
  // Создаем отдельный компонент для пустого состояния, чтобы увеличить видимую зону для перетаскивания
  const EmptyPlaceholder = () => (
    <div className="kanban-empty">
      <p>Нет задач</p>
      <p className="drag-hint">Перетащите задачу сюда</p>
    </div>
  );

  // Получаем полное название колонки для отображения в title
  const fullColumnName = status.name;

  return (
    <div className="kanban-column">
      <div className="kanban-column-header">
        {/* Используем div вместо h3 для лучшего контроля стилей */}
        <div className="column-name" title={fullColumnName}>{fullColumnName}</div>
        <div className="task-count">{tasks.length}</div>
      </div>
      <div 
        ref={setNodeRef} 
        className={columnContentClassName}
        data-droppable-id={status.uuid}
      >
        {tasks.length > 0 ? (
          <SortableContext
            items={tasks.map(task => task.id.toString())}
            strategy={rectSortingStrategy}
          >
            {tasks.map((task) => (
              <SortableTask 
                key={task.id} 
                task={task} 
                containerId={status.uuid}
                avatars={avatars}
              />
            ))}
          </SortableContext>
        ) : (
          <EmptyPlaceholder />
        )}
        
        {/* Добавляем дополнительную зону для перетаскивания в конце колонки */}
        <div className="drop-zone-spacer"></div>
      </div>
    </div>
  );
};

TaskColumn.propTypes = {
  status: PropTypes.shape({
    uuid: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
  }).isRequired,
  tasks: PropTypes.array.isRequired,
  avatars: PropTypes.object.isRequired,
};

export default TaskColumn; 