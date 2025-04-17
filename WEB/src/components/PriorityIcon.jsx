import React from 'react';
import '../styles/TaskItem.css'; // Импортируем стили для priority-badge

const priorityConfig = {
  "-2": { color: "#9ca3af", bgColor: "rgba(156, 163, 175, 0.2)", label: "Минимальный" },
  "-1": { color: "#10b981", bgColor: "rgba(16, 185, 129, 0.2)", label: "Низкий" },
  "0":  { color: "#8B5CF6", bgColor: "rgba(139, 92, 246, 0.2)", label: "Средний" },
  "1":  { color: "#f59e0b", bgColor: "rgba(245, 158, 11, 0.2)", label: "Высокий" },
  "2":  { color: "#ef4444", bgColor: "rgba(239, 68, 68, 0.2)", label: "Критичный" }
};

const PriorityIcon = ({ priority = 0, showLabel = true, className = '' }) => {
  const config = priorityConfig[priority.toString()] || priorityConfig["0"];
  const priorityClass = getPriorityClass(priority);
  
  return (
    <div 
      className={`priority-badge ${priorityClass} ${className}`}
      title={config.label}
    >
      <svg
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M12 2L18.2894 7.57071C19.4708 8.597 20.2933 9.95558 20.6894 11.4699L22 17L16.4699 18.3106C14.9556 18.7067 13.597 19.5292 12.5707 20.7106L7 27L1.73057 21.1585C0.63679 19.9418 0 18.3979 0 16.8036V13L5.5301 11.6894C7.04437 11.2933 8.40296 10.4708 9.42929 9.28944L12 2Z"
          fill={config.color}
        />
      </svg>
      {showLabel && <span>{config.label}</span>}
    </div>
  );
};

// Функция для получения класса приоритета
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

export default PriorityIcon; 