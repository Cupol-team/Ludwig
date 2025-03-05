import styled from 'styled-components';
import { Link } from 'react-router-dom';

export const ListCard = styled.div`
  background-color: #1c1c1c;
  border-radius: 8px;
  padding: 20px;
  width: 100%;
  max-width: 400px;
  color: white;
  border: 2px solid #6f42c1;
`;

export const Title = styled.h2`
  color: #6f42c1;
  font-size: 24px;
  margin-bottom: 20px;
  text-align: center;
`;

export const List = styled.ul`
  list-style: none;
  padding: 0;
`;

export const ListItem = styled.li`
  margin-bottom: 10px;
  padding-bottom: 10px;
  border-bottom: 1px solid #333;
  
  &:last-child {
    border-bottom: none;
  }
`;

export const OrganizationLink = styled(Link)`
  color: white;
  text-decoration: none;
  display: block;
  padding: 8px 0;
  transition: color 0.3s;
  
  &:hover {
    color: #6f42c1;
  }
  
  &::after {
    content: '';
    display: block;
    width: 100%;
    height: 1px;
    background-color: #6f42c1;
    transform: scaleX(0);
    transition: transform 0.3s;
  }
  
  &:hover::after {
    transform: scaleX(1);
  }
`; 