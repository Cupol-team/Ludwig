import { NavLink, Outlet, useParams } from "react-router-dom";
import { ProjectProvider } from "../../context/ProjectContext";
import "./Workspace.css";

function Workspace() {
  const { orgId, projectUuid } = useParams();
  const baseUrl = `/organizations/${orgId}/project/${projectUuid}/workspace`;

  return (
    <div className="workspace-container">
      <nav className="workspace-tabs">
        <NavLink 
          to={`${baseUrl}/board`} 
          className={({ isActive }) => isActive ? "active-tab" : ""}
        >
          Доска
        </NavLink>
        <NavLink 
          to={`${baseUrl}/tasks`} 
          className={({ isActive }) => isActive ? "active-tab" : ""}
        >
          Таски
        </NavLink>
        <NavLink 
          to={`${baseUrl}/task-statuses`} 
          className={({ isActive }) => isActive ? "active-tab" : ""}
        >
          Статусы Тасков
        </NavLink>
        <NavLink 
          to={`${baseUrl}/task-types`} 
          className={({ isActive }) => isActive ? "active-tab" : ""}
        >
          Типы Тасков
        </NavLink>
        <NavLink 
          to={`${baseUrl}/members`} 
          className={({ isActive }) => isActive ? "active-tab" : ""}
        >
          Участники
        </NavLink>
        <NavLink 
          to={`${baseUrl}/roles`} 
          className={({ isActive }) => isActive ? "active-tab" : ""}
        >
          Роли проекта
        </NavLink>
        <NavLink
            to={`${baseUrl}/files`}
            className={({ isActive }) => isActive ? "active-tab" : ""}
        >
          Файлообменник
        </NavLink>
        <NavLink
            to={`${baseUrl}/calls`}
            className={({ isActive }) => isActive ? "active-tab" : ""}
        >
          Звонки
        </NavLink>
      </nav>
      <div className="workspace-content">
        <ProjectProvider>
          <Outlet />
        </ProjectProvider>
      </div>
    </div>
  );
}

export default Workspace; 