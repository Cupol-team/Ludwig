import React from 'react';
import { LOCAL_VIDEO } from '../hooks/useWebRTC';
import '../styles/ControlPanel.css';

const formatTime = (seconds) => {
  const mins = Math.floor(seconds / 60).toString().padStart(2, '0');
  const secs = (seconds % 60).toString().padStart(2, '0');
  return `${mins}:${secs}`;
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
    <div className="control-panel-container">
      <div className="control-local-camera-container">
        <div className="control-local-camera-wrapper">
          <video
            className="control-video"
            ref={(instance) => provideMediaRef(LOCAL_VIDEO, instance)}
            autoPlay
            playsInline
            muted
          />
        </div>
      </div>
      
      <div className="control-button-row">
        <button 
          className={`control-button ${!videoStatus ? 'control-button-active' : 'control-button-inactive'}`} 
          onClick={muteVideo}
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            {videoStatus ? 
              <path d="M23 7l-7 5 7 5V7z M1 5h15v14H1z" /> : 
              <path d="M1 1l22 22 M21 6.4v11.2 M3.2 3H16v10.6 M1 8v8a2 2 0 0 0 2 2h7.2" />
            }
          </svg>
          <span>{videoStatus ? 'Камера' : 'Выкл. камеру'}</span>
        </button>
        
        <button 
          className={`control-button ${!audioStatus ? 'control-button-active' : 'control-button-inactive'}`} 
          onClick={muteAudio}
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            {audioStatus ? 
              <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z M19 10v2a7 7 0 0 1-14 0v-2 M12 19v4 M8 23h8" /> : 
              <path d="M1 1l22 22 M9 9v3a3 3 0 0 0 5.12 2.12M15 9.34V4a3 3 0 0 0-5.94-.6 M17 16.95A7 7 0 0 1 5 12v-2m14 0v2c0 .25-.01.5-.04.75 M12 19v4 M8 23h8" />
            }
          </svg>
          <span>{audioStatus ? 'Микрофон' : 'Выкл. микрофон'}</span>
        </button>
        
        <button 
          className={`control-button ${isScreenSharing ? 'control-button-active' : 'control-button-inactive'}`}
          onClick={isScreenSharing ? stopScreenSharing : startScreenSharing}
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect>
            <line x1="8" y1="21" x2="16" y2="21"></line>
            <line x1="12" y1="17" x2="12" y2="21"></line>
          </svg>
          <span>{isScreenSharing ? 'Стоп демо' : 'Демонстрация'}</span>
        </button>
        
        <button className="control-button control-button-inactive" onClick={forceReconnect}>
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21.5 2v6h-6M2.5 22v-6h6M2 11.5a10 10 0 0 1 18.8-4.3M22 12.5a10 10 0 0 1-18.8 4.2"/>
          </svg>
          <span>Переподключиться</span>
        </button>
        
        <button
          className="control-button control-button-leave"
          onClick={() => {
            leave_func();
            window.location.href = '/';
          }}
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
            <polyline points="16 17 21 12 16 7"></polyline>
            <line x1="21" y1="12" x2="9" y2="12"></line>
          </svg>
          <span>Покинуть</span>
        </button>
      </div>
      
      <div className="control-timer">{formatTime(seconds)}</div>
    </div>
  );
};

export default ControlPanel;