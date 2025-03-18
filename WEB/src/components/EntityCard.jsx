import React from 'react';
import { Link } from 'react-router-dom';
import '../styles/entity-card.css';

const EntityCard = ({ title, description, avatarUrl, initial, linkTo, role, extraContent, onClick }) => {
    // Если есть onClick, используем div вместо Link
    const CardComponent = onClick ? 'div' : Link;
    const cardProps = onClick 
        ? { className: "entity-card", onClick } 
        : { to: linkTo, className: "entity-card" };

    return (
        <CardComponent {...cardProps}>
            <div className="entity-card-header">
                {avatarUrl ? (
                    <img src={avatarUrl} alt={title} className="entity-avatar" />
                ) : (
                    <div className="entity-avatar-initials">
                        <span>{initial}</span>
                    </div>
                )}
                <div className="entity-title-wrapper">
                    <h3 className="entity-title">{title}</h3>
                    {role && <span className="entity-role-badge">{role}</span>}
                </div>
            </div>
            <p className="entity-description">{description}</p>
            {extraContent && <div className="entity-extra">{extraContent}</div>}
        </CardComponent>
    );
};

export default EntityCard; 