import React from 'react';
import { LOCAL_VIDEO } from '../hooks/useWebRTC';
import '../styles/VideoGrid.css';

const VideoGrid = ({
  clients,
  fullScreenClient,
  handleProvideMediaRef,
  handleContextMenu,
  activeVideoSource,
}) => {
  return (
    <div className={`video-grid-container ${fullScreenClient ? 'video-grid-container-fullscreen' : 'video-grid-container-normal'}`}>
      {clients
        .filter((clientID) => !fullScreenClient || clientID === fullScreenClient)
        .map((clientID) => {
          const sourceType = activeVideoSource.get(clientID) || 'camera';
          return (
            <div 
              key={clientID} 
              className={`video-wrapper ${clientID === fullScreenClient ? 'video-wrapper-fullscreen' : ''}`}
            >
              <video
                className={`video ${sourceType === 'screen' ? 'video-screen' : 'video-camera'}`}
                ref={(instance) => handleProvideMediaRef(clientID, instance)}
                autoPlay
                playsInline
                muted={clientID === LOCAL_VIDEO}
                onContextMenu={handleContextMenu(clientID)}
              />
              
              <div className={`participant-tag participant-tag-${sourceType}`}>
                {sourceType === 'screen' ? (
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect>
                    <line x1="8" y1="21" x2="16" y2="21"></line>
                    <line x1="12" y1="17" x2="12" y2="21"></line>
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M23 7l-7 5 7 5V7z"></path>
                    <rect x="1" y="5" width="15" height="14" rx="2" ry="2"></rect>
                  </svg>
                )}
                {clientID === LOCAL_VIDEO ? 'Вы' : `Участник ${clientID.slice(0, 5)}`}
              </div>
              
              <div className="fullscreen-icon" onClick={handleContextMenu(clientID)}>
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="15 3 21 3 21 9"></polyline>
                  <polyline points="9 21 3 21 3 15"></polyline>
                  <line x1="21" y1="3" x2="14" y2="10"></line>
                  <line x1="3" y1="21" x2="10" y2="14"></line>
                </svg>
              </div>
            </div>
          );
        })}
    </div>
  );
};

export default VideoGrid; 