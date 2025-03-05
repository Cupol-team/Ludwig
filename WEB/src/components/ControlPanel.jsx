import React from 'react';
import styled from 'styled-components';
import { LOCAL_VIDEO } from '../hooks/useWebRTC';
import HoverButton from './HoverButton';

const ControlPanelContainer = styled.div`
  position: fixed;
  bottom: 0;
  left: 0;
  width: 100vw;
  height: 80px;
  background-color: #222;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 20px;
  z-index: 10;
  box-shadow: 0 -2px 5px rgba(0, 0, 0, 0.5);
`;

const ButtonRow = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  flex: 1;
  justify-content: center;
`;

const Timer = styled.div`
  color: #fff;
  font-size: 18px;
  white-space: nowrap;
  text-align: center;
  padding: 5px 10px;
  background-color: rgba(0, 0, 0, 0.5);
  border-radius: 4px;
`;

const VideoWrapper = styled.div`
  position: relative;
  width: calc(100% - 10px);
  height: calc(100% - 10px);
  margin: 5px;
  border-radius: 6px;
  overflow: hidden;
  background: #222;
  transition: transform 0.2s;
`;

const LocalCameraWrapper = styled(VideoWrapper)`
  width: 120px;
  height: 70px;
  margin: 0;
`;

const Video = styled.video`
  width: 100%;
  height: 100%;
  object-fit: ${({ $sourceType }) =>
    $sourceType === 'screen' ? 'contain' : 'cover'};
  cursor: pointer;
  border: ${({ $sourceType }) =>
    $sourceType === 'screen' ? '3px solid #4CAF50' : 'none'};
  background: ${({ $sourceType }) =>
    $sourceType === 'screen' ? '#000' : 'transparent'};
  border-radius: 4px;
`;

const formatTime = (seconds) => {
  const mins = Math.floor(seconds / 60).toString().padStart(2, '0');
  const secs = (seconds % 60).toString().padStart(2, '0');
  return `${mins}:${secs}`;
};

const downloadButtonStyle = {
  background: '#8B5CF6',
  color: '#fff',
  padding: '8px 16px',
  border: 'none',
  borderRadius: '4px',
  cursor: 'pointer',
  minWidth: '120px',
};

const deleteButtonStyle = {
  background: '#ff4d4f',
  color: '#fff',
  padding: '8px 16px',
  border: 'none',
  borderRadius: '4px',
  cursor: 'pointer',
  minWidth: '120px',
};

const ControlPanel = ({
  provideMediaRef,
  muteVideo,
  muteAudio,
  isScreenSharing,
  stopScreenSharing,
  startScreenSharing,
  forceReconnect,
  leave_func,
  videoStatus,
  audioStatus,
  seconds,
}) => {
  return (
    <ControlPanelContainer>
      <LocalCameraWrapper>
        <Video
          ref={(instance) => provideMediaRef(LOCAL_VIDEO, instance)}
          autoPlay
          playsInline
          muted
        />
      </LocalCameraWrapper>
      <ButtonRow>
        <HoverButton baseStyle={downloadButtonStyle} onClick={muteVideo}>
          {videoStatus ? 'Camera On' : 'Camera Off'}
        </HoverButton>
        <HoverButton baseStyle={downloadButtonStyle} onClick={muteAudio}>
          {audioStatus ? 'Mic On' : 'Mic Off'}
        </HoverButton>
        <HoverButton
          baseStyle={downloadButtonStyle}
          onClick={isScreenSharing ? stopScreenSharing : startScreenSharing}
        >
          {isScreenSharing ? 'Stop Screen Share' : 'Share Screen'}
        </HoverButton>
        <HoverButton baseStyle={downloadButtonStyle} onClick={forceReconnect}>
          Reconnect
        </HoverButton>
        <HoverButton
          baseStyle={deleteButtonStyle}
          onClick={() => {
            leave_func();
            window.location.href = '/';
          }}
        >
          Удалить
        </HoverButton>
      </ButtonRow>
      <Timer>{formatTime(seconds)}</Timer>
    </ControlPanelContainer>
  );
};

export default ControlPanel;