import React from 'react';

const priorityMapping = {
  "-2": { src: '/minimal.png', label: "Minimal" },
  "-1": { src: '/low.png', label: "Low" },
  "0":  { src: '/medium.png', label: "Medium" },
  "1":  { src: '/high.png', label: "High" },
  "2":  { src: '/critical.png', label: "Critical" }
};

const PriorityIcon = ({ priority = 0 }) => {
  const item = priorityMapping[priority.toString()] || priorityMapping["0"];
  return (
    <img
      src={item.src}
      alt={item.label}
      title={item.label}
      style={{ width: '18px', height: '18px', objectFit: 'cover' }}
    />
  );
};

export default PriorityIcon; 