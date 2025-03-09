import { useEffect, useState, useRef, useCallback } from 'react';
import { getOrganizations } from '../api/organizations';
import { getUserAvatar } from '../api/profile';
import Loader from '../components/Loader';
import '../styles/organizations.css';
import axios from 'axios';
import Notification from '../components/Notification';
import EntityCard from '../components/EntityCard';
import CreateEntityButton from '../components/CreateEntityButton';
import Header from '../components/Header';

const OrganizationsPage = () => {
    const [organizations, setOrganizations] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [avatars, setAvatars] = useState({});
    const controllerRef = useRef(null);

    const fetchOrganizations = useCallback(async () => {
        controllerRef.current = new AbortController();
        
        try {
            setIsLoading(true);
            const data = await getOrganizations(controllerRef.current.signal);
            const organizationsArray = data.items || data;
            setOrganizations(organizationsArray);
            setError(null);
        } catch (error) {
            if (!axios.isCancel(error)) {
                setError(error.response?.data?.message || 'Ошибка загрузки организаций');
            }
        } finally {
            setIsLoading(false);
        }
    }, []);

    const loadOrganizationAvatars = useCallback(async (orgs) => {
        if (!orgs || orgs.length === 0) return;
        
        const controller = new AbortController();
        const avatarPromises = orgs.map(async (org) => {
            try {
                const avatarUrl = await getUserAvatar(org.uuid, controller.signal);
                return { uuid: org.uuid, url: avatarUrl };
            } catch (error) {
                console.error(`Error loading avatar for organization ${org.name}:`, error);
                return { uuid: org.uuid, url: null };
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

    useEffect(() => {
        fetchOrganizations();
        
        return () => {
            if (controllerRef.current) {
                controllerRef.current.abort();
            }
        };
    }, [fetchOrganizations]);

    useEffect(() => {
        if (organizations) {
            const cleanup = loadOrganizationAvatars(organizations);
            return () => {
                if (cleanup && typeof cleanup === 'function') {
                    cleanup();
                }
            };
        }
    }, [organizations, loadOrganizationAvatars]);

    const getOrganizationInitial = (name) => {
        return name ? name.charAt(0).toUpperCase() : '?';
    };

    if (isLoading || organizations === null) {
        return <Loader />;
    }

    if (error) {
        return (
            <div className="organizations-error" style={{ padding: '20px', textAlign: 'center' }}>
                <Notification message={error} type="error" duration={5000} />
                <div style={{ marginTop: '20px' }}>
                    <button onClick={fetchOrganizations} className="retry-button">
                        Повторить попытку
                    </button>
                </div>
            </div>
        );
    }
    
    return (
        <div className="organizations-page">
            <div className="organization-list">
                <CreateEntityButton type="organization" />
                {organizations && organizations.length > 0 ? (
                    organizations.map(org => (
                        <EntityCard
                            key={org.uuid}
                            title={org.name}
                            description={org.description}
                            avatarUrl={avatars[org.uuid] && avatars[org.uuid] !== '/default-avatar.png' ? avatars[org.uuid] : null}
                            initial={getOrganizationInitial(org.name)}
                            linkTo={`/organizations/${org.uuid}`}
                            role={org.role || "Участник"}
                        />
                    ))
                ) : (
                    <div>Нет организаций для отображения</div>
                )}
            </div>
        </div>
    );
};

export default OrganizationsPage; 