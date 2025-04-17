import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { addMemberToOrganization } from '../api/members';
import { getOrganizationByInvite } from '../api/organizations';
import '../styles/InvitePage.css';

const InvitePage = () => {
    const { inviteId } = useParams();
    const navigate = useNavigate();
    const { profile } = useContext(AuthContext);
    
    const [loading, setLoading] = useState(true);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState(null);
    const [animationComplete, setAnimationComplete] = useState(false);
    const [organization, setOrganization] = useState(null);
    
    useEffect(() => {
        const processInvite = async () => {
            try {
                setLoading(true);
                setError(null);
                
                // Получаем информацию об организации по коду приглашения
                const controller = new AbortController();
                console.log(inviteId);
                const orgData = await getOrganizationByInvite(inviteId, controller.signal);
                
                if (!orgData || !orgData.uuid) {
                    throw new Error("Недействительное приглашение");
                }
                
                setOrganization(orgData);
                
                // Искусственная задержка для демонстрации анимации (можно убрать в продакшене)
                await new Promise(resolve => setTimeout(resolve, 1000));
                
                // Добавляем пользователя в организацию
                await addMemberToOrganization(orgData.uuid, profile.uuid, null);
                
                setSuccess(true);
            } catch (err) {
                console.error("Error processing invite:", err);
                setError(err.message || "Произошла ошибка при добавлении в организацию");
            } finally {
                setLoading(false);
                // Через полсекунды отмечаем, что анимация завершена
                setTimeout(() => setAnimationComplete(true), 500);
            }
        };
        
        processInvite();
    }, [inviteId, navigate, profile]);
    
    const renderStatus = () => {
        if (loading) {
            return (
                <div className="invite-status">
                    <div className="loading-spinner"></div>
                    <p>Обработка приглашения...</p>
                </div>
            );
        }
        
        if (success) {
            return (
                <div className="invite-status success">
                    <div className={`status-icon success ${animationComplete ? 'complete' : ''}`}>
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M20 6L9 17l-5-5" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                    </div>
                    <p>Вы успешно добавлены в организацию{organization ? ` «${organization.name}»` : ''}</p>
                    <button 
                        className="action-button"
                        onClick={() => navigate('/')}
                    >
                        Перейти к организациям
                    </button>
                </div>
            );
        }
        
        return (
            <div className="invite-status error">
                <div className={`status-icon error ${animationComplete ? 'complete' : ''}`}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M18 6L6 18M6 6l12 12" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                </div>
                <p>Произошла ошибка! Возможно вы уже состоите в этой организации</p>
                <button 
                    className="action-button"
                    onClick={() => navigate('/')}
                >
                    Вернуться на главную
                </button>
            </div>
        );
    };
    
    return (
        <div className="invite-page">
            <div className="invite-container">
                <h1>Приглашение в организацию</h1>
                {renderStatus()}
            </div>
        </div>
    );
};

export default InvitePage; 