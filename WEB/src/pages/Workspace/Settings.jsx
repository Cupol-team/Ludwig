import React from 'react';
import { NavLink, Outlet, useParams } from 'react-router-dom';
import '../../styles/WorkspaceSettings.css';

const Settings = () => {
  const { orgId, projectUuid } = useParams();
  const baseSettingsUrl = `/organizations/${orgId}/project/${projectUuid}/workspace/settings`;

  return (
    <div className="workspace-settings">
      <h2 className="settings-header">Настройки проекта</h2>
      <div className="settings-container">
        <div className="sidebar">
          <NavLink className="sidebar-item" to={`${baseSettingsUrl}/roles`}>
            Роли
          </NavLink>
          <NavLink className="sidebar-item" to={`${baseSettingsUrl}/task-types`}>
            Типы задач
          </NavLink>
          <NavLink className="sidebar-item" to={`${baseSettingsUrl}/task-statuses`}>
            Статусы задач
          </NavLink>
          <NavLink className="sidebar-item" to={`${baseSettingsUrl}/members`}>
            Участники
          </NavLink>
        </div>
        <div className="settings-content">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default Settings; 