import styled from 'styled-components';

// Основной контейнер для страницы профиля
export const ProfileContainer = styled.div`
  display: flex;
  justify-content: center;
  gap: 20px;
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
  
  @media (max-width: 768px) {
    flex-direction: column;
    align-items: center;
  }
`; 