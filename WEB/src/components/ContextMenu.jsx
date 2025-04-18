import React from 'react';
import styled from 'styled-components';

const ContextMenuContainer = styled.div`
  position: absolute;
  background: rgba(51, 51, 51, 0.9);
  border-radius: 6px;
  padding: 10px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
  z-index: 1000;
  min-width: 180px;
`;

const MenuItem = styled.div`
  padding: 8px 12px;
  color: #fff;
  cursor: pointer;
  border-radius: 4px;
  display: flex;
  align-items: center;
  gap: 8px;
  &:hover {
    background: #444;
  }
`;

const VolumeControl = styled.div`
  padding: 8px 12px;
  color: #fff;
`;

const VolumeSlider = styled.input.attrs({ type: 'range' })`
  width: 100%;
  margin: 8px 0;
  height: 6px;
  -webkit-appearance: none;
  background: #555;
  border-radius: 3px;
  outline: none;
  
  &::-webkit-slider-thumb {
    -webkit-appearance: none;
    width: 15px;
    height: 15px;
    border-radius: 50%;
    background: #6f42c1;
    cursor: pointer;
  }
  
  &::-moz-range-thumb {
    width: 15px;
    height: 15px;
    border-radius: 50%;
    background: #6f42c1;
    cursor: pointer;
    border: none;
  }
`;

const VolumeLabel = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 4px;
`;

const ContextMenu = ({
  style,
  fullScreenClient,
  selectedClient,
  activeVideoSource,
  handleToggleFullscreen,
  handleSourceSwitch,
  handleMuteToggle,
  clientVolumes,
  handleVolumeChange,
}) => {
  // Обеспечиваем безопасный доступ к громкости
  const volume = selectedClient ? (clientVolumes[selectedClient] ?? 1) : 1;
  const isMuted = volume === 0;
  
  // Получаем текущий источник видео
  const currentSource = selectedClient ? (activeVideoSource.get(selectedClient) || 'camera') : 'camera';
  
  // Обработчик события изменения громкости
  const onVolumeChange = (e) => {
    if (selectedClient) {
      const newVolume = parseFloat(e.target.value);
      handleVolumeChange(selectedClient, newVolume);
    }
  };
  
  return (
    <ContextMenuContainer style={style}>
      <MenuItem onClick={handleToggleFullscreen}>
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          {fullScreenClient === selectedClient ? (
            <path d="M8 3v3a2 2 0 0 1-2 2H3m18 0h-3a2 2 0 0 1-2-2V3m0 18v-3a2 2 0 0 1 2-2h3M3 16h3a2 2 0 0 1 2 2v3"/>
          ) : (
            <path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7"/>
          )}
        </svg>
        {fullScreenClient === selectedClient ? 'Выйти из полноэкранного режима' : 'Полноэкранный режим'}
      </MenuItem>
      
      {currentSource === 'screen' && (
        <MenuItem onClick={() => handleSourceSwitch(selectedClient, 'camera')}>
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M23 7l-7 5 7 5V7z"></path>
            <rect x="1" y="5" width="15" height="14" rx="2" ry="2"></rect>
          </svg>
          Переключиться на камеру
        </MenuItem>
      )}
      
      {currentSource === 'camera' && (
        <MenuItem onClick={() => handleSourceSwitch(selectedClient, 'screen')}>
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect>
            <line x1="8" y1="21" x2="16" y2="21"></line>
            <line x1="12" y1="17" x2="12" y2="21"></line>
          </svg>
          Переключиться на демонстрацию
        </MenuItem>
      )}
      
      <MenuItem onClick={() => handleMuteToggle(selectedClient)}>
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          {isMuted ? (
            <path d="M11 5L6 9H2v6h4l5 4V5zM23 9l-6 6M17 9l6 6"/>
          ) : (
            <path d="M11 5L6 9H2v6h4l5 4V5zM19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"/>
          )}
        </svg>
        {isMuted ? 'Включить звук' : 'Выключить звук'}
      </MenuItem>
      
      <VolumeControl>
        <VolumeLabel>
          <span>Громкость:</span>
          <span>{Math.round(volume * 100)}%</span>
        </VolumeLabel>
        <VolumeSlider
          min="0"
          max="1"
          step="0.01"
          value={volume}
          onChange={onVolumeChange}
        />
      </VolumeControl>
    </ContextMenuContainer>
  );
};

export default ContextMenu; 