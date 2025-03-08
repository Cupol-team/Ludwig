import React from 'react';
import {
  ListCard,
  Title,
  List,
  ListItem,
  OrganizationLink
} from '../styles/OrganizationsListStyles';

const OrganizationsList = ({ organizations }) => {
  return (
    <ListCard>
      <Title>Организации</Title>
      {organizations.length > 0 ? (
        <List>
          {organizations.map(org => (
            <ListItem key={org.uuid}>
              <OrganizationLink>
                {org.name}
              </OrganizationLink>
            </ListItem>
          ))}
        </List>
      ) : (
        <p>Пользователь не состоит в организациях</p>
      )}
    </ListCard>
  );
};

export default OrganizationsList; 