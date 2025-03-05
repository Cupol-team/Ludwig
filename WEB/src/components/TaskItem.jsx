import React from 'react';
import '../styles/TaskItem.css';
import PriorityIcon from './PriorityIcon';

const TaskItem = ({ task, onClick }) => {
  const { name, status, priority, type, date, executors } = task;
  return (
    <div className="task-row" onClick={() => onClick(task.uuid)} style={{ cursor: 'pointer' }}>
      <div className="task-cell">{name}</div>
      <div className="task-cell">{status}</div>
      <div className="task-cell">
        <PriorityIcon priority={priority} />
      </div>
      <div className="task-cell">{type}</div>
      <div className="task-cell">{new Date(date).toLocaleString()}</div>
      <div className="task-cell">
        {executors && executors.length > 0 ? (
          <>
            {executors.slice(0, 2).map((executor, index) => (
              <img
                key={index}
                src="/favicon.png"
                alt="executor avatar"
                className="executor-avatar"
              />
            ))}
          </>
        ) : null}
      </div>
    </div>
  );
};

export default TaskItem; 