import React, { useContext, useEffect, useState } from 'react';
import { ProjectContext } from '../context/ProjectContext';
import { getAllPermissions } from '../api/roles';
import { useParams } from 'react-router-dom';

const RestrictedComponent = ({ children, permissions }) => {
    const { roles } = useContext(ProjectContext);
    const { orgId, projectUuid } = useParams();
    const [hasPermission, setHasPermission] = useState(false);
    useEffect(() => {
        const checkPermissions = async () => {
            const controller = new AbortController();
            try {
                const roleUuids = roles.map(role => role.uuid);
                const userPermissions = await getAllPermissions(orgId, projectUuid, roleUuids, controller.signal);
                const hasAllPermissions = permissions.every(permission => userPermissions.includes(permission));
                setHasPermission(hasAllPermissions);
            } catch (error) {
                console.error('Error checking permissions:', error);
                setHasPermission(false);
            }
        };

        checkPermissions();
    }, [roles, permissions, orgId, projectUuid]);

    return hasPermission ? children : null;
};

export default RestrictedComponent;