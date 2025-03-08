import { useEffect, useState, useRef, useCallback } from 'react';
import { getOrganizations } from '../api/organizations';
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

    useEffect(() => {
        fetchOrganizations();
        
        return () => {
            if (controllerRef.current) {
                controllerRef.current.abort();
            }
        };
    }, [fetchOrganizations]);

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
                            avatarUrl={org.avatar || "favicon.png"}
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