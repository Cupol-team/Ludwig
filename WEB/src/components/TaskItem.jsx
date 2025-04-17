import React from 'react';
import PropTypes from 'prop-types';
import '../styles/TaskItem.css';
import PriorityIcon from './PriorityIcon';

const TaskItem = ({ task, avatars, onClick }) => {
  const { name, status, priority, type, date, executors, uuid } = task;

  // Приоритет может быть null или undefined, используем значение по умолчанию 0 (Средний)
  const taskPriority = typeof priority === 'number' ? priority : 0;

  // Форматирование даты
  const formatDate = (dateString) => {
    if (!dateString) return 'Нет даты';
    try {
      return new Date(dateString).toLocaleString();
    } catch (error) {
      console.error('Ошибка форматирования даты:', error);
      return dateString;
    }
  };

  return (
    <div className="task-row" onClick={() => onClick(uuid)}>
      <div className="task-cell">{name || 'Без названия'}</div>
      <div className="task-cell">{status || 'Нет статуса'}</div>
      <div className="task-cell">
        <PriorityIcon priority={taskPriority} />
      </div>
      <div className="task-cell">{type || 'Нет типа'}</div>
      <div className="task-cell">{formatDate(date)}</div>
      <div className="task-cell">
        {executors && executors.length > 0 ? (
          <div className="executors-list">
            {executors.map((executorId, index) => (
              <div key={`${executorId}-${index}`} className="executor-avatar">
                {avatars[executorId] ? (
                  <img src={avatars[executorId]} alt="Executor Avatar" />
                ) : (
                  <div className="avatar-placeholder">
                    {executorId ? executorId.charAt(0).toUpperCase() : '?'}
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          'Нет исполнителей'
        )}
      </div>
    </div>
  );
};

TaskItem.propTypes = {
  task: PropTypes.shape({
    uuid: PropTypes.string.isRequired,
    name: PropTypes.string,
    status: PropTypes.string,
    priority: PropTypes.number,
    type: PropTypes.string,
    date: PropTypes.string,
    executors: PropTypes.arrayOf(PropTypes.string),
  }).isRequired,
  avatars: PropTypes.object.isRequired,
  onClick: PropTypes.func.isRequired,
};

export default TaskItem; 