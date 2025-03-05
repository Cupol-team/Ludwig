import React, { createContext, useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { getRoles } from '../api/roles';
import { getTaskTypes } from '../api/taskTypes';
import { getTaskStatuses } from '../api/taskStatuses';
import { getMembers } from '../api/members';

export const ProjectContext = createContext();

export function ProjectProvider({ children }) {
  const { orgId, projectUuid } = useParams();
  const [roles, setRoles] = useState([]);
  const [loadingRoles, setLoadingRoles] = useState(true);
  const [rolesError, setRolesError] = useState(null);

  // Состояния для типов задач
  const [taskTypes, setTaskTypes] = useState([]);
  const [loadingTaskTypes, setLoadingTaskTypes] = useState(true);
  const [taskTypesError, setTaskTypesError] = useState(null);

  // Состояния для статусов задач
  const [taskStatuses, setTaskStatuses] = useState([]);
  const [loadingTaskStatuses, setLoadingTaskStatuses] = useState(true);
  const [taskStatusesError, setTaskStatusesError] = useState(null);

  const [members, setMembers] = useState([]);

  useEffect(() => {
    const controller = new AbortController();
    async function fetchRoles() {
      try {
        setLoadingRoles(true);
        const rolesData = await getRoles(orgId, projectUuid, controller.signal);
        setRoles(rolesData);
      } catch (error) {
        setRolesError(error);
      } finally {
        setLoadingRoles(false);
      }
    }
    fetchRoles();
    return () => controller.abort();
  }, [orgId, projectUuid]);

  // Загрузка типов задач
  useEffect(() => {
    const controller = new AbortController();
    async function fetchTaskTypes() {
      try {
        setLoadingTaskTypes(true);
        const typesData = await getTaskTypes(orgId, projectUuid, controller.signal);
        setTaskTypes(typesData);
      } catch (error) {
        setTaskTypesError(error);
      } finally {
        setLoadingTaskTypes(false);
      }
    }
    fetchTaskTypes();
    return () => controller.abort();
  }, [orgId, projectUuid]);

  // Загрузка статусов задач
  useEffect(() => {
    const controller = new AbortController();
    async function fetchTaskStatuses() {
      try {
        setLoadingTaskStatuses(true);
        const statusesData = await getTaskStatuses(orgId, projectUuid, controller.signal);
        setTaskStatuses(statusesData);
      } catch (error) {
        setTaskStatusesError(error);
      } finally {
        setLoadingTaskStatuses(false);
      }
    }
    fetchTaskStatuses();
    return () => controller.abort();
  }, [orgId, projectUuid]);

  useEffect(() => {
    if (orgId && projectUuid) {
      const controller = new AbortController();
      getMembers(orgId, projectUuid, controller.signal)
        .then((membersData) => {
          if (membersData) setMembers(membersData);
        })
        .catch((err) => console.error('Error fetching members:', err));
      return () => controller.abort();
    }
  }, [orgId, projectUuid]);

  return (
    <ProjectContext.Provider
      value={{
        roles,
        loadingRoles,
        rolesError,
        taskTypes,
        loadingTaskTypes,
        taskTypesError,
        taskStatuses,
        loadingTaskStatuses,
        taskStatusesError,
        members,
      }}
    >
      {children}
    </ProjectContext.Provider>
  );
} 