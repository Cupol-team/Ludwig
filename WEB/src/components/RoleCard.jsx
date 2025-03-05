import React from 'react';
import '../styles/role-card.css';

function RoleCard({ role }) {
  const { name, description } = role;
  return (
    <div className="role-card">
      <div className="role-card-header">
        <div className="role-avatar">
          {name.charAt(0).toUpperCase()}
        </div>
        <div className="role-title-wrapper">
          <h3 className="role-title">{name}</h3>
          <span className="role-badge">Роль</span>
        </div>
      </div>
      <p className="role-description">{description ? description : "Нет описания"}</p>
    </div>
  );
}

export default RoleCard; 