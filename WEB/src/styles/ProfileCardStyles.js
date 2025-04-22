import styled from 'styled-components';

// Стили для карточки профиля
export const Card = styled.div`
  background-color: #1c1c1c;
  border-radius: 12px;
  padding: 30px;
  width: 100%;
  max-width: 450px;
  color: white;
  border: 2px solid #6f42c1;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
  transition: transform 0.3s, box-shadow 0.3s;
  
  &:hover {
    box-shadow: 0 15px 30px rgba(0, 0, 0, 0.25);
    transform: translateY(-5px);
  }
`;

export const AvatarContainer = styled.div`
  position: relative;
  width: 140px;
  height: 140px;
  margin: 0 auto 32px;
  border-radius: 50%;
  overflow: hidden;
  border: 3px solid #6f42c1;
  box-shadow: 0 5px 15px rgba(111, 66, 193, 0.3);
`;

export const Avatar = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.5s ease;
  
  &:hover {
    transform: scale(1.05);
  }
`;

export const AvatarOverlay = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  justify-content: center;
  align-items: center;
  opacity: 0;
  transition: opacity 0.3s;
  cursor: pointer;
  
  &:hover {
    opacity: 1;
  }
`;

export const OverlayText = styled.span`
  color: white;
  font-size: 16px;
  font-weight: 500;
  background-color: #6f42c1;
  padding: 6px 12px;
  border-radius: 20px;
`;

export const ProfileField = styled.div`
  margin-bottom: 24px;
  position: relative;
`;

export const Label = styled.label`
  display: block;
  color: #8a5cf5;
  font-size: 14px;
  font-weight: 500;
  margin-bottom: 8px;
  letter-spacing: 0.5px;
`;

export const Input = styled.input`
  width: 100%;
  padding: 12px 16px;
  background-color: ${props => props.readOnly ? 'transparent' : '#2b2b2b'};
  border: 1px solid ${props => props.readOnly ? '#444' : '#6f42c1'};
  border-radius: 8px;
  color: white;
  outline: none;
  font-size: 16px;
  transition: all 0.3s ease;
  
  &:focus {
    border-color: #8a63d2;
    box-shadow: 0 0 0 3px rgba(111, 66, 193, 0.2);
  }
  
  &:read-only {
    opacity: 0.8;
  }
  
  &::placeholder {
    color: rgba(255, 255, 255, 0.4);
  }
`;

export const Button = styled.button`
  display: block;
  width: 100%;
  padding: 14px;
  background-color: #6f42c1;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 16px;
  margin-top: 30px;
  transition: all 0.3s ease;
  font-weight: 600;
  letter-spacing: 0.5px;
  text-transform: uppercase;
  
  &:hover {
    background-color: #8a5cf5;
    box-shadow: 0 5px 15px rgba(111, 66, 193, 0.4);
    transform: translateY(-2px);
  }
  
  &:active {
    transform: translateY(0);
    box-shadow: 0 2px 5px rgba(111, 66, 193, 0.4);
  }
`;

export const HiddenInput = styled.input`
  display: none;
`;

export const AvatarInitials = styled.div`
  width: 100%;
  height: 100%;
  border-radius: 50%;
  background-color: #2c2c2c;
  background: linear-gradient(135deg, #3a1f5d, #6f42c1);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 48px;
  font-weight: bold;
  color: white;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
`; 