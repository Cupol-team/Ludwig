import React, { useEffect, useState, useRef, useCallback, useContext } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { getProjects } from '../api/projects';
import { getUserAvatar } from '../api/profile';
import Loader from '../components/Loader';
import Notification from '../components/Notification';
import axios from 'axios';
import EntityCard from '../components/EntityCard';
import CreateEntityButton from '../components/CreateEntityButton';
import '../styles/organization-details.css';
import { ProjectContext } from '../context/ProjectContext';

const OrganizationDetailsPage = () => {
    const { orgId } = useParams();
    const [projects, setProjects] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [avatars, setAvatars] = useState({});
    const controllerRef = useRef(null);
    const { setProjectName, setProjectDescription } = useContext(ProjectContext);
    const navigate = useNavigate();

    const fetchProjects = useCallback(async () => {
        controllerRef.current = new AbortController();
        try {
            setIsLoading(true);
            const projectsData = await getProjects(orgId, controllerRef.current.signal);
            setProjects(projectsData);
            setError(null);
        } catch (err) {
            if (!axios.isCancel(err)) {
                setError(err.message || 'Ошибка загрузки проектов');
            }
        } finally {
            setIsLoading(false);
        }
    }, [orgId]);

    const loadProjectAvatars = useCallback(async (projectsList) => {
        if (!projectsList || projectsList.length === 0) return;
        
        const controller = new AbortController();
        const avatarPromises = projectsList.map(async (project) => {
            try {
                const avatarUrl = await getUserAvatar(project.uuid, controller.signal);
                return { uuid: project.uuid, url: avatarUrl };
            } catch (error) {
                console.error(`Error loading avatar for project ${project.name}:`, error);
                return { uuid: project.uuid, url: null };
            }
        });
        
        const results = await Promise.all(avatarPromises);
        const avatarMap = {};
        results.forEach(result => {
            avatarMap[result.uuid] = result.url;
        });
        
        setAvatars(avatarMap);
        
        return () => {
            controller.abort();
            Object.values(avatarMap).forEach(url => {
                if (url && url.startsWith('blob:')) {
                    URL.revokeObjectURL(url);
                }
            });
        };
    }, []);

    const getProjectInitial = (name) => {
        return name ? name.charAt(0).toUpperCase() : '?';
    };

    useEffect(() => {
        fetchProjects();
        return () => {
            if (controllerRef.current) {
                controllerRef.current.abort();
            }
        };
    }, [fetchProjects]);

    useEffect(() => {
        if (projects && projects.length > 0) {
            const cleanup = loadProjectAvatars(projects);
            return () => {
                if (cleanup && typeof cleanup === 'function') {
                    cleanup();
                }
            };
        }
    }, [projects, loadProjectAvatars]);

    // Функция для перехода к проекту с сохранением данных в контексте
    const navigateToProject = (project) => {
        // Сохраняем имя и описание проекта в контексте
        setProjectName(project.name);
        setProjectDescription(project.description || '');
        
        // Переходим на страницу проекта
        navigate(`/organizations/${orgId}/project/${project.uuid}/workspace`);
    };

    if (isLoading) return <Loader />;

    if (error) {
        return (
            <div className="error-message" style={{ padding: '20px', textAlign: 'center' }}>
                <Notification message={error} type="error" duration={5000} />
                <div style={{ marginTop: '20px' }}>
                    <button onClick={fetchProjects} className="retry-button">
                        Повторить попытку
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="org-details-page">
            <div className="org-details-wrapper">
                <header className="org-details-header">
                    <h1>Проекты организации</h1>
                    <Link to="/">← Вернуться к списку организаций</Link>
                </header>
                <div className="projects-grid">
                    <CreateEntityButton type="project" orgId={orgId} />
                    {projects.length === 0 && (
                        <div className="empty-project-card">
                            <p>В этой организации пока нет проектов.</p>
                            <p>Свяжитесь со своим лиду</p>
                        </div>
                    )}
                    {projects.map(project => (
                        <EntityCard 
                            key={project.uuid}
                            title={project.name}
                            description={project.description || "Тестовое описание проекта"}
                            avatarUrl={avatars[project.uuid] && avatars[project.uuid] !== '/default-avatar.png' ? avatars[project.uuid] : null}
                            initial={getProjectInitial(project.name)}
                            linkTo="#"
                            onClick={(e) => {
                                e.preventDefault();
                                navigateToProject(project);
                            }}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
};

export default OrganizationDetailsPage; 