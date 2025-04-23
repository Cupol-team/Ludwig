import styled from 'styled-components';
import { Link } from 'react-router-dom';

export const ListCard = styled.div`
  background-color: #1c1c1c;
  border-radius: 12px;
  padding: 24px;
  width: 100%;
  max-width: 600px;
  color: white;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.25);
  border: 1px solid #333;
  margin-bottom: 24px;
`;

export const Title = styled.h2`
  color: #6f42c1;
  font-size: 24px;
  margin-bottom: 24px;
  text-align: center;
  font-weight: 600;
  position: relative;
  
  &::after {
    content: '';
    display: block;
    width: 40px;
    height: 3px;
    background-color: #6f42c1;
    margin: 8px auto 0;
    border-radius: 2px;
  }
`;

export const List = styled.ul`
  list-style: none;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

export const ProjectItem = styled.li`
  background-color: #252525;
  border-radius: 8px;
  padding: 16px;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  border: 1px solid #333;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 12px rgba(0, 0, 0, 0.2);
  }
`;

export const ProjectHeader = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 16px;
`;

export const IconContainer = styled.div`
  margin-right: 12px;
  flex-shrink: 0;
`;

export const ProjectIcon = styled.div`
  width: 40px;
  height: 40px;
  border-radius: 8px;
  background: linear-gradient(135deg, #9333ea, #4f46e5);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  font-weight: bold;
  color: white;
`;

export const ProjectNameWrapper = styled.div`
  flex-grow: 1;
  min-width: 0;
`;

export const ProjectName = styled.h3`
  font-size: 16px;
  font-weight: 600;
  color: white;
  margin: 0 0 4px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

export const ProjectOrg = styled.div`
  font-size: 13px;
  color: #aaa;
  display: flex;
  align-items: center;
`;

export const ProjectRole = styled.span`
  display: inline-block;
  background: linear-gradient(135deg, #9333ea, #4f46e5);
  color: #fff;
  font-size: 12px;
  padding: 4px 10px;
  border-radius: 12px;
  font-weight: 500;
  flex-shrink: 0;
  margin-left: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
`;

export const ActionButton = styled(Link)`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 10px 16px;
  background-color: #6f42c1;
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 500;
  cursor: pointer;
  text-decoration: none;
  transition: background-color 0.2s ease;
  
  &:hover {
    background-color: #8250df;
  }
`; 