import React, { useEffect, useState, useRef, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getProjects } from '../api/projects';
import Loader from '../components/Loader';
import Notification from '../components/Notification';
import axios from 'axios';
import EntityCard from '../components/EntityCard';
import CreateEntityButton from '../components/CreateEntityButton';
import '../styles/organization-details.css';

const OrganizationDetailsPage = () => {
    const { orgId } = useParams();
    const [projects, setProjects] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const controllerRef = useRef(null);

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

    useEffect(() => {
        fetchProjects();
        return () => {
            if (controllerRef.current) {
                controllerRef.current.abort();
            }
        };
    }, [fetchProjects]);

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
                            avatarUrl={project.avatar || "../favicon.png"}
                            linkTo={`/organizations/${orgId}/project/${project.uuid}/workspace`}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
};

export default OrganizationDetailsPage; 