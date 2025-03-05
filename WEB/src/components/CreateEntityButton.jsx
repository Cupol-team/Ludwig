import React from 'react';
import { Link } from 'react-router-dom';
import compactButtonStyle from '../../src/styles/compactButtonStyle';

const CreateEntityButton = ({ type, orgId, onClick }) => {
    let to = '';
    let buttonText = '';

    switch (type) {
        case 'organization':
            to = '/organizations/create';
            buttonText = 'Создать организацию';
            break;
        case 'project':
            if (!orgId) {
                console.error('orgId is required for project creation.');
            }
            to = `/organizations/${orgId}/project/new`;
            buttonText = 'Создать проект';
            break;
        case 'upload file':
            buttonText = 'Загрузить файл';
            break;
        default:
            console.error('Unknown type for CreateEntityButton');
    }

    if (type === 'upload file') {;
        return (
            <button type="button" className="create-entity-button" onClick={onClick} style={compactButtonStyle}>
                <span className="create-icon">+</span>
                <span className="create-text">{buttonText}</span>
            </button>
        );
    }

    return (
        <Link to={to} className="create-entity-button" onClick={onClick}>
            <span className="create-icon">+</span>
            <span className="create-text">{buttonText}</span>
        </Link>
    );
};

export default CreateEntityButton; 