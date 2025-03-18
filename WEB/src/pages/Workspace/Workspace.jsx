import { NavLink, Outlet, useParams } from "react-router-dom";
import { ProjectProvider, ProjectContext } from "../../context/ProjectContext";
import "./Workspace.css";
import { useContext, useEffect } from "react";

function Workspace() {
  const { orgId, projectUuid } = useParams();
  const baseUrl = `/organizations/${orgId}/project/${projectUuid}/workspace`;
  const { projectName, projectDescription } = useContext(ProjectContext);
  
  useEffect(() => {
    if (!projectName && projectUuid) {
      // Здесь можно добавить код для загрузки данных проекта, если они не были переданы через контекст
      // Например, запрос к API для получения деталей проекта
    }
  }, [projectName, projectUuid]);

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
          to={`${baseUrl}/settings`} 
          className={({ isActive }) => isActive ? "active-tab" : ""}
        >
          Настройки
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