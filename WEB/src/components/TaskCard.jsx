import React from 'react';
import PropTypes from 'prop-types';
import '../styles/TaskCard.css';

const TaskCard = ({ task, onDragStart }) => {
  return (
    <div
      className="board-task-card"
      draggable="true"
      onDragStart={(e) => onDragStart(e, task)}
    >
      <h4 className="board-task-card-title">{task.title}</h4>
      <p className="board-task-card-description">{task.description}</p>
    </div>
  );
};

TaskCard.propTypes = {
  task: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    title: PropTypes.string.isRequired,
    description: PropTypes.string,
    status: PropTypes.string.isRequired,
  }).isRequired,
  onDragStart: PropTypes.func.isRequired,
};

export default TaskCard; 