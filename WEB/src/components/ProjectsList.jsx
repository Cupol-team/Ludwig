import React from 'react';
import { Link } from 'react-router-dom';
import {
  ListCard,
  Title,
  List,
  ProjectItem,
  ProjectHeader,
  ProjectNameWrapper,
  ProjectName,
  ProjectRole,
  ProjectOrg,
  ProjectIcon,
  IconContainer,
  ActionButton
} from '../styles/ProjectsListStyles';

const ProjectsList = ({ projects }) => {
  // Создаем инициалы из названия проекта
  const getProjectInitial = (name) => {
    return name ? name.charAt(0).toUpperCase() : '?';
  };

  return (
    <ListCard>
      <Title>Мои проекты</Title>
      {projects.length > 0 ? (
        <List>
          {projects.map(project => (
            <ProjectItem key={project.project_uuid}>
              <ProjectHeader>
                <IconContainer>
                  <ProjectIcon>{getProjectInitial(project.project_name)}</ProjectIcon>
                </IconContainer>
                <ProjectNameWrapper>
                  <ProjectName>{project.project_name}</ProjectName>
                  <ProjectOrg>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" style={{ marginRight: '4px' }}>
                      <path d="M12 7V3H2v18h20V7H12zM6 19H4v-2h2v2zm0-4H4v-2h2v2zm0-4H4V9h2v2zm0-4H4V5h2v2zm4 12H8v-2h2v2zm0-4H8v-2h2v2zm0-4H8V9h2v2zm0-4H8V5h2v2zm10 12h-8v-2h2v-2h-2v-2h2v-2h-2V9h8v10zm-2-8h-2v2h2v-2zm0 4h-2v2h2v-2z"/>
                    </svg>
                    {project.organizationName}
                  </ProjectOrg>
                </ProjectNameWrapper>
                <ProjectRole>{project.role || 'Участник'}</ProjectRole>
              </ProjectHeader>
              
              <ActionButton 
                as={Link} 
                to={`/organizations/${project.organizationId}/project/${project.project_uuid}/workspace`}
              >
                Перейти к проекту
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" style={{ marginLeft: '4px' }}>
                  <path d="M12 4l-1.41 1.41L16.17 11H4v2h12.17l-5.58 5.59L12 20l8-8-8-8z"/>
                </svg>
              </ActionButton>
            </ProjectItem>
          ))}
        </List>
      ) : (
        <p style={{ textAlign: 'center', color: '#888' }}>У вас пока нет проектов</p>
      )}
    </ListCard>
  );
};

export default ProjectsList; 