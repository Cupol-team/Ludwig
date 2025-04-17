import React, { useEffect, useState, useRef, useCallback, useContext } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { getProjects } from '../api/projects';
import { getUserAvatar } from '../api/profile';
import { getOrganizationInviteLink, updateOrganizationInviteLink } from '../api/organizations';
import Loader from '../components/Loader';
import Notification from '../components/Notification';
import axios from 'axios';
import EntityCard from '../components/EntityCard';
import CreateEntityButton from '../components/CreateEntityButton';
import '../styles/organization-details.css';
import '../styles/invite-modal.css';
import { ProjectContext } from '../context/ProjectContext';

const OrganizationDetailsPage = () => {
    const { orgId } = useParams();
    const [projects, setProjects] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [avatars, setAvatars] = useState({});
    const [inviteLoading, setInviteLoading] = useState(false);
    const [inviteError, setInviteError] = useState(null);
    const controllerRef = useRef(null);
    const { setProjectName, setProjectDescription } = useContext(ProjectContext);
    const navigate = useNavigate();
    const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
    const [inviteLink, setInviteLink] = useState('');

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

    // Функция для загрузки текущей ссылки приглашения
    const fetchInviteLink = useCallback(async () => {
        try {
            const controller = new AbortController();
            const data = await getOrganizationInviteLink(orgId, controller.signal);
            if (data && data.invite) {
                // Формируем полную ссылку для отображения пользователю
                const baseUrl = window.location.origin;
                const fullInviteLink = `${baseUrl}/invite/${data.invite}`;
                setInviteLink(fullInviteLink);
            }
            return () => controller.abort();
        } catch (error) {
            console.error('Error fetching invite link:', error);
        }
    }, [orgId]);

    // Загружаем ссылку приглашения при открытии модального окна
    useEffect(() => {
        if (isInviteModalOpen) {
            fetchInviteLink();
        }
    }, [isInviteModalOpen, fetchInviteLink]);

    const navigateToProject = (project) => {
        setProjectName(project.name);
        setProjectDescription(project.description || '');
        
        navigate(`/organizations/${orgId}/project/${project.uuid}/workspace`);
    };

    const handleCopyLink = () => {
        navigator.clipboard.writeText(inviteLink)
            .then(() => {
                console.log('Ссылка скопирована в буфер обмена');
            })
            .catch(() => {
                console.error('Не удалось скопировать ссылку');
            });
    };

    const handleGenerateLink = async () => {
        setInviteLoading(true);
        setInviteError(null);
        
        try {
            // Генерируем уникальный идентификатор для ссылки приглашения
            const uniqueId = Math.random().toString(36).substring(2, 15) + 
                             Math.random().toString(36).substring(2, 15);
            
            // Формируем полную ссылку приглашения
            const baseUrl = window.location.origin;
            
            // Отправляем только ID на сервер для сохранения (без базового URL)
            const controller = new AbortController();
            const data = await updateOrganizationInviteLink(orgId, uniqueId, controller.signal);
            
            // Обновляем ссылку в состоянии компонента, показывая полный URL пользователю
            if (data && data.invite) {
                // Формируем полную ссылку для отображения
                const fullInviteLink = `${baseUrl}/invite/${data.invite}`;
                setInviteLink(fullInviteLink);
            } else {
                // Если что-то пошло не так, используем сгенерированный ID
                const fullInviteLink = `${baseUrl}/invite/${uniqueId}`;
                setInviteLink(fullInviteLink);
            }
        } catch (err) {
            console.error('Error generating invite link:', err);
            setInviteError('Не удалось сгенерировать ссылку. Пожалуйста, попробуйте снова.');
        } finally {
            setInviteLoading(false);
        }
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
                    <h1>Страничка организации</h1>
                    <div className="header-actions">
                        <Link to="/">← Вернуться к списку организаций</Link>
                        <button 
                            className="invite-button"
                            onClick={() => setIsInviteModalOpen(true)}
                        >
                            <svg 
                                viewBox="0 0 24 24" 
                                fill="currentColor" 
                                width="16" 
                                height="16" 
                                style={{marginRight: '8px'}}
                            >
                                <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/>
                            </svg>
                            Пригласить
                        </button>
                    </div>
                </header>
                <div className="projects-grid">
                    <CreateEntityButton type="project" orgId={orgId} />
                    {projects.length === 0 && (
                        <div className="empty-project-card">
                            <p>В этой организации пока нет проектов.</p>
                            <p>Свяжитесь со своим лидом</p>
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

                {isInviteModalOpen && (
                    <div className="invite-modal-overlay">
                        <div className="invite-modal">
                            <h2>
                                <svg 
                                    viewBox="0 0 24 24" 
                                    fill="currentColor" 
                                    width="22" 
                                    height="22" 
                                    style={{marginRight: '10px', verticalAlign: 'middle'}}
                                >
                                    <path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5s-3 1.34-3 3 1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z"/>
                                </svg>
                                Пригласить участника
                            </h2>
                            <p className="invite-description">
                                Сгенерируйте ссылку для приглашения нового участника в вашу организацию.
                            </p>
                            <div className="invite-link-container">
                                <input
                                    type="text"
                                    value={inviteLink}
                                    readOnly
                                    placeholder="Ссылка для приглашения появится здесь"
                                />
                                <button 
                                    className="copy-link-button"
                                    onClick={handleCopyLink}
                                    disabled={!inviteLink}
                                    title="Копировать ссылку"
                                >
                                    <svg viewBox="0 0 24 24" fill="currentColor">
                                        <path d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z"/>
                                    </svg>
                                </button>
                            </div>
                            <div className="modal-actions">
                                <button
                                    className="generate-link-button"
                                    onClick={handleGenerateLink}
                                    disabled={inviteLoading}
                                >
                                    <svg 
                                        viewBox="0 0 24 24" 
                                        fill="currentColor" 
                                        width="16" 
                                        height="16" 
                                        style={{marginRight: '8px'}}
                                    >
                                        <path d="M19.35 10.04C18.67 6.59 15.64 4 12 4 9.11 4 6.6 5.64 5.35 8.04 2.34 8.36 0 10.91 0 14c0 3.31 2.69 6 6 6h13c2.76 0 5-2.24 5-5 0-2.64-2.05-4.78-4.65-4.96zM17 13l-5 5-5-5h3V9h4v4h3z"/>
                                    </svg>
                                    {inviteLoading ? 'Генерация...' : 'Сгенерировать ссылку'}
                                </button>
                                <button
                                    className="close-modal-button"
                                    onClick={() => setIsInviteModalOpen(false)}
                                >
                                    Закрыть
                                </button>
                            </div>
                            {inviteError && (
                                <div className="invite-error-message">
                                    {inviteError}
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default OrganizationDetailsPage; 