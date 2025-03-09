import styled from 'styled-components';

// Стили для карточки профиля
export const Card = styled.div`
  background-color: #1c1c1c;
  border-radius: 8px;
  padding: 20px;
  width: 100%;
  max-width: 400px;
  color: white;
  border: 2px solid #6f42c1;
`;

export const AvatarContainer = styled.div`
  position: relative;
  width: 120px;
  height: 120px;
  margin: 0 auto 20px;
  border-radius: 50%;
  overflow: hidden;
  border: 2px solid #6f42c1;
`;

export const Avatar = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
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
  font-size: 14px;
`;

export const ProfileField = styled.div`
  margin-bottom: 15px;
`;

export const Label = styled.label`
  display: block;
  color: #6f42c1;
  font-size: 14px;
  margin-bottom: 5px;
`;

export const Input = styled.input`
  width: 100%;
  padding: 8px;
  background-color: ${props => props.readOnly ? 'transparent' : '#2b2b2b'};
  border: 1px solid #6f42c1;
  border-radius: 4px;
  color: white;
  outline: none;
  
  &:focus {
    border-color: #8a63d2;
  }
  
  &:read-only {
    border-color: #444;
  }
`;

export const Button = styled.button`
  display: block;
  width: 100%;
  padding: 10px;
  background-color: #6f42c1;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 16px;
  margin-top: 20px;
  transition: background-color 0.3s;
  
  &:hover {
    background-color: #5932a6;
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
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 36px;
  font-weight: bold;
  color: #6f42c1;
`; 