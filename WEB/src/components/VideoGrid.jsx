import React from 'react';
import styled from 'styled-components';
import { LOCAL_VIDEO } from '../hooks/useWebRTC';

const VideoGridContainer = styled.div`
  display: grid;
  grid-template-columns: ${({ $fullScreen }) =>
    $fullScreen ? '1fr' : 'repeat(auto-fit, minmax(300px, 1fr))'};
  grid-auto-rows: ${({ $fullScreen }) => ($fullScreen ? '1fr' : 'minmax(200px, 1fr)')};
  grid-gap: 15px;
  width: 100%;
  height: calc(100vh - 100px);
  padding: 10px;
  background-color: #111;
  box-sizing: border-box;
  overflow: hidden;
  transition: all 0.3s ease;
`;

const VideoWrapperStyled = styled.div`
  position: relative;
  width: calc(100% - 10px);
  height: calc(100% - 10px);
  margin: 5px;
  border-radius: 6px;
  overflow: hidden;
  background: #222;
  transition: transform 0.2s;
  grid-column: ${({ $isFullscreen }) => ($isFullscreen ? '1 / -1' : 'auto')};
  grid-row: ${({ $isFullscreen }) => ($isFullscreen ? '1 / -1' : 'auto')};
  z-index: ${({ $isFullscreen }) => ($isFullscreen ? 100 : 1)};

  &:hover {
    transform: ${({ $isFullscreen }) => ($isFullscreen ? 'none' : 'scale(1.02)')};
  }
`;

const VideoStyled = styled.video`
  width: 100%;
  height: 100%;
  object-fit: ${({ $sourceType }) => ($sourceType === 'screen' ? 'contain' : 'cover')};
  cursor: pointer;
  border: ${({ $sourceType }) =>
    $sourceType === 'screen' ? '3px solid #4CAF50' : 'none'};
  background: ${({ $sourceType }) =>
    $sourceType === 'screen' ? '#000' : 'transparent'};
  border-radius: 4px;
`;

const VideoGrid = ({
  clients,
  fullScreenClient,
  handleProvideMediaRef,
  handleContextMenu,
  activeVideoSource,
}) => {
  return (
    <VideoGridContainer $fullScreen={!!fullScreenClient}>
      {clients
        .filter((clientID) => !fullScreenClient || clientID === fullScreenClient)
        .map((clientID) => (
          <VideoWrapperStyled key={clientID} $isFullscreen={clientID === fullScreenClient}>
            <VideoStyled
              ref={(instance) => handleProvideMediaRef(clientID, instance)}
              autoPlay
              playsInline
              muted={clientID === LOCAL_VIDEO}
              onContextMenu={handleContextMenu(clientID)}
              $sourceType={activeVideoSource.get(clientID) || 'camera'}
            />
          </VideoWrapperStyled>
        ))}
    </VideoGridContainer>
  );
};

export default VideoGrid; 