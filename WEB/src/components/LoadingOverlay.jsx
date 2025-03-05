import React from 'react';
import styled from 'styled-components';

const Overlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0,0,0,0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  font-size: 24px;
  z-index: 1000;
`;

const LoadingOverlay = ({ children }) => {
  return <Overlay>{children}</Overlay>;
};

export default LoadingOverlay; 