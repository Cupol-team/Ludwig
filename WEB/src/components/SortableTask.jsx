import React, { useState, useContext } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import '../styles/TaskCard.css';
import { ProjectContext } from '../context/ProjectContext';
import PriorityIcon from './PriorityIcon';

const SortableTask = ({ task, containerId, avatars }) => {
  const { taskTypes } = useContext(ProjectContext);
  const taskTypeObj = taskTypes ? taskTypes.find(t => t.uuid === task.type) : null;
  const taskTypeName = taskTypeObj ? taskTypeObj.name : task.type;

  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: task.id.toString(),
    data: { sortable: { containerId } },
    activationConstraint: {
      delay: 200,
      tolerance: 5,
    },
  });

  const [menuOpen, setMenuOpen] = useState(false);

  const handleMenuToggle = (e) => {
    e.stopPropagation();
    setMenuOpen(prev => !prev);
  };

  const style = {
    '--transform': CSS.Transform.toString(transform),
    '--transition': transition,
    '--opacity': isDragging ? 0.8 : 1,
    '--zIndex': isDragging ? 1000 : 'auto',
  };

  return (
    <div 
      ref={setNodeRef} 
      style={style} 
      {...attributes} 
      {...listeners} 
      className={`task-card ${isDragging ? 'is-dragging' : ''}`}
      data-drop-parent={containerId}
      id={task.id.toString()}
    >
      <div className="task-card-content">
        <div className="task-card-header">
          <h4 className="task-card-title">{task.name}</h4>
          <div className="task-card-actions">
            <div className="task-card-menu">
              <button className="menu-toggle" onClick={handleMenuToggle} onMouseDown={(e) => e.stopPropagation()}>⋮</button>
              {menuOpen && (
                <div className="menu-dropdown">
                  <button className="menu-action" onClick={(e) => { e.stopPropagation(); alert("Действие 1") }}>Действие 1</button>
                  <button className="menu-action" onClick={(e) => { e.stopPropagation(); alert("Действие 2") }}>Действие 2</button>
                </div>
              )}
            </div>
            <div className="task-card-badge">#{String(task.id).slice(0, 4)}</div>
          </div>
        </div>
      </div>
      
      <div className="task-card-footer">
        <div className="footer-left">
          <span className="task-type-text" title={taskTypeName}>{taskTypeName}</span>
          <span className="task-priority">
            <PriorityIcon priority={task.priority} />
          </span>
        </div>
        { task.executors && task.executors.length > 0 && (
          <div className="task-card-avatars">
            {task.executors.slice(0, 2).map((executorId, index) => (
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
            {task.executors.length > 2 && (
              <div className="more-executors">+{task.executors.length - 2}</div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default SortableTask; 