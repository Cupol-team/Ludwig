import React from 'react';
import PropTypes from 'prop-types';
import '../styles/TaskItem.css';
import PriorityIcon from './PriorityIcon';

const TaskItem = ({ task, avatars, onClick }) => {
  const { name, status, priority, type, date, executors } = task;

  return (
    <div className="task-row" onClick={() => onClick(task.uuid)}>
      <div className="task-cell">{name}</div>
      <div className="task-cell">{status}</div>
      <div className="task-cell">
        <PriorityIcon priority={priority} />
      </div>
      <div className="task-cell">{type}</div>
      <div className="task-cell">{new Date(date).toLocaleString()}</div>
      <div className="task-cell">
        {executors && executors.length > 0 ? (
          <div className="executors-list">
            {executors.map((executorId, index) => (
              <div key={index} className="executor-avatar">
                {avatars[executorId] ? (
                  <img src={avatars[executorId]} alt="Executor Avatar" />
                ) : (
                  <div className="avatar-placeholder">
                    {executorId ? executorId.charAt(0) : '?'}
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
    name: PropTypes.string.isRequired,
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