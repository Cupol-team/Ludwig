import React from 'react';
import styled from 'styled-components';

const ContextMenuContainer = styled.div`
  position: absolute;
  background: rgba(51, 51, 51, 0.9);
  border-radius: 6px;
  padding: 10px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
  z-index: 1000;
  min-width: 150px;
`;

const MenuItem = styled.div`
  padding: 8px 12px;
  color: #fff;
  cursor: pointer;
  &:hover {
    background: #444;
  }
`;

const VolumeSlider = styled.input.attrs({ type: 'range' })`
  width: 100%;
  margin: 8px 0;
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
  return (
    <ContextMenuContainer style={style}>
      <MenuItem onClick={handleToggleFullscreen}>
        {fullScreenClient === selectedClient ? 'Exit Fullscreen' : 'Fullscreen'}
      </MenuItem>
      {activeVideoSource.get(selectedClient) === 'screen' && (
        <MenuItem onClick={() => handleSourceSwitch(selectedClient, 'camera')}>
          Switch to Camera
        </MenuItem>
      )}
      {activeVideoSource.get(selectedClient) === 'camera' && (
        <MenuItem onClick={() => handleSourceSwitch(selectedClient, 'screen')}>
          Switch to Screen
        </MenuItem>
      )}
      <MenuItem onClick={() => handleMuteToggle(selectedClient)}>
        {clientVolumes[selectedClient] === 0 ? 'Unmute 🔊' : 'Mute 🔇'}
      </MenuItem>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <span>🔊</span>
        <VolumeSlider
          min="0"
          max="1"
          step="0.1"
          value={clientVolumes[selectedClient] || 1}
          onChange={(e) =>
            handleVolumeChange(selectedClient, parseFloat(e.target.value))
          }
        />
      </div>
    </ContextMenuContainer>
  );
};

export default ContextMenu; 