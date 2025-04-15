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
  const { setNodeRef } = useDroppable({ id: status.uuid, data: { container: status.uuid } });

  return (
    <div className="kanban-column">
      <h3 className="kanban-column-header">
        {status.name} <span className="task-count">({tasks.length})</span>
      </h3>
      <div ref={setNodeRef} className="kanban-column-content">
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
          <div className="kanban-empty">Нет задач</div>
        )}
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