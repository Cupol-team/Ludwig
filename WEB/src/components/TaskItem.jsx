import React from 'react';
import PropTypes from 'prop-types';
import '../styles/TaskItem.css';

const TaskItem = ({ task, avatars, onClick }) => {
  const { name, status, priority, type, date, executors, uuid } = task;

  // Приоритет может быть null или undefined, используем значение по умолчанию 0 (Средний)
  const taskPriority = typeof priority === 'number' ? priority : 0;

  // Форматирование даты
  const formatDate = (dateString) => {
    if (!dateString) return 'Нет даты';
    try {
      const dateObj = new Date(dateString);
      return dateObj.toLocaleDateString('ru-RU', { 
        day: '2-digit', 
        month: '2-digit', 
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      console.error('Ошибка форматирования даты:', error);
      return dateString;
    }
  };

  // Получение сокращенного текста для типа задачи
  const getShortType = (typeName) => {
    if (!typeName) return 'Н/Д';
    
    // Если тип короче 15 символов, возвращаем как есть
    if (typeName.length <= 15) return typeName;
    
    // Иначе делаем сокращение: первые 12 символов + "..."
    return `${typeName.substring(0, 12)}...`;
  };

  // Получение сокращенного текста для статуса задачи
  const getShortStatus = (statusName) => {
    if (!statusName) return 'Н/Д';
    
    // Если статус короче 15 символов, возвращаем как есть
    if (statusName.length <= 15) return statusName;
    
    // Иначе делаем сокращение: первые 12 символов + "..."
    return `${statusName.substring(0, 12)}...`;
  };

  // Определение класса для приоритета
  const getPriorityClass = (priorityValue) => {
    switch (priorityValue) {
      case 2:
        return 'critical';
      case 1:
        return 'high';
      case 0:
        return 'medium';
      case -1:
        return 'low';
      case -2:
        return 'minimal';
      default:
        return 'medium';
    }
  };

  // Получение текста для приоритета
  const getPriorityText = (priorityValue) => {
    switch (priorityValue) {
      case 2:
        return 'Критичный';
      case 1:
        return 'Высокий';
      case 0:
        return 'Средний';
      case -1:
        return 'Низкий';
      case -2:
        return 'Минимальный';
      default:
        return 'Средний';
    }
  };

  return (
    <div className="task-row" onClick={() => onClick(uuid)}>
      <div className="task-cell">
        <span className="task-name">{name || 'Без названия'}</span>
      </div>
      <div className="task-cell">
        <span className={`task-status ${status ? `status-${status.toLowerCase().replace(/\s+/g, '-')}` : ''}`} title={status}>
          {getShortStatus(status) || 'Нет статуса'}
        </span>
      </div>
      <div className="task-cell">
        <div className={`priority-badge ${getPriorityClass(taskPriority)}`}>
          {getPriorityText(taskPriority)}
        </div>
      </div>
      <div className="task-cell">
        <span className="task-type" title={type}>{getShortType(type)}</span>
      </div>
      <div className="task-cell">
        <span className="task-date">{formatDate(date)}</span>
      </div>
      <div className="task-cell">
        {executors && executors.length > 0 ? (
          <div className="executors-list">
            {executors.map((executorId, index) => (
              <div key={`${executorId}-${index}`} className="executor-avatar" title={`Исполнитель: ${executorId}`}>
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
          <span className="no-executors">Нет исполнителей</span>
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