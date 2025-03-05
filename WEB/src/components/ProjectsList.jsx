import React from 'react';
import { Link } from 'react-router-dom';
import {
  ListCard,
  Title,
  List,
  ListItem,
  ProjectLink
} from '../styles/ProjectsListStyles';

const ProjectsList = ({ projects }) => {
  return (
    <ListCard>
      <Title>Мои проекты</Title>
      {projects.length > 0 ? (
        <List>
          {projects.map(project => (
            <ListItem key={project.uuid}>
              <ProjectLink to={`/organizations/${project.organizationId}/project/${project.uuid}/workspace`}>
                {project.name}
              </ProjectLink>
            </ListItem>
          ))}
        </List>
      ) : (
        <p>У вас пока нет проектов</p>
      )}
    </ListCard>
  );
};

export default ProjectsList; 