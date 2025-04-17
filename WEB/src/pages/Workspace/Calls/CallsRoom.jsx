import { useParams, useSearchParams } from 'react-router-dom';
import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import useWebRTC, { LOCAL_VIDEO } from '../../../hooks/useWebRTC';
import VideoGrid from '../../../components/VideoGrid';
import ControlPanel from '../../../components/ControlPanel';
import ContextMenu from '../../../components/ContextMenu';
import LoadingOverlay from '../../../components/LoadingOverlay';
import '../../../styles/CallsRoom.css';

// Форматирование таймера (секунды → MM:SS)
const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60).toString().padStart(2, '0');
    const secs = (seconds % 60).toString().padStart(2, '0');
    return `${mins}:${secs}`;
};

export default function CallsRoom() {
    const { id: roomID } = useParams();
    const [searchParams] = useSearchParams();
    const roomName = searchParams.get('roomName') || 'Room';
    const projectUuid = searchParams.get('projectUuid');

    const {
        clients,
        provideMediaRef,
        leave_func,
        toggleVideo,
        toggleAudio,
        connectionAttempts, // приходят из хука useWebRTC
        isScreenSharing,
        startScreenSharing,
        stopScreenSharing,
        activeVideoSource,
        setActiveVideoSource
    } = useWebRTC(roomID, { roomName, projectUuid });

    // Исключаем локальное видео из списка участников
    const clientsToRender = useMemo(
        () => clients.filter((clientID) => clientID !== LOCAL_VIDEO),
        [clients]
    );

    const [seconds, setSeconds] = useState(0);
    const [audioStatus, setAudioStatus] = useState(true);
    const [videoStatus, setVideoStatus] = useState(true);
    const [showContextMenu, setShowContextMenu] = useState(false);
    const [menuPosition, setMenuPosition] = useState({ x: 0, y: 0 });
    const [selectedClient, setSelectedClient] = useState(null);
    const [isMuted, setIsMuted] = useState(false);
    const [clientVolumes, setClientVolumes] = useState({});
    const [prevVolumes, setPrevVolumes] = useState({});
    const videoElements = useRef({});
    const [fullScreenClient, setFullScreenClient] = useState(null);

    const muteAudio = useCallback(() => {
        setAudioStatus(prevStatus => {
            const newStatus = !prevStatus;
            toggleAudio(newStatus);
            return newStatus;
        });
    }, [toggleAudio]);

    const muteVideo = useCallback(() => {
        setVideoStatus(prevStatus => {
            const newStatus = !prevStatus;
            toggleVideo(newStatus);
            return newStatus;
        });
    }, [toggleVideo]);

    // При переподключении теперь просто перезагружаем страницу, без счёта попыток
    const forceReconnect = useCallback(() => {
        window.location.reload(); // Перезагрузка страницы
    }, []);

    // Обработчик контекстного меню для участников вызова
    const handleContextMenu = useCallback((clientID) => (e) => {
        e.preventDefault();
        setSelectedClient(clientID);
        setMenuPosition({ x: e.clientX, y: e.clientY });
        setShowContextMenu(true);
    }, []);

    // Закрытие контекстного меню при клике вне его области
    useEffect(() => {
        const closeMenu = () => setShowContextMenu(false);
        document.addEventListener('click', closeMenu);
        return () => document.removeEventListener('click', closeMenu);
    }, []);

    // Таймер звонка
    useEffect(() => {
        const interval = setInterval(() => {
            setSeconds((prev) => prev + 1);
        }, 1000);
        return () => clearInterval(interval);
    }, []);

    // Инициализация громкости для каждого клиента
    useEffect(() => {
        const newVolumes = { ...clientVolumes };
        clientsToRender.forEach(clientID => {
            if (!(clientID in newVolumes)) {
                newVolumes[clientID] = 1;
            }
        });
        setClientVolumes(newVolumes);
    }, [clientsToRender]);

    // Привязка ссылки на видеоэлемент и установка начальной громкости
    const handleProvideMediaRef = useCallback((clientID, instance) => {
        provideMediaRef(clientID, instance);
        if (instance) {
            videoElements.current[clientID] = instance;
            instance.volume = clientVolumes[clientID] ?? 1;
        }
    }, [clientVolumes, provideMediaRef]);

    // Обработчик изменения громкости
    const handleVolumeChange = useCallback((clientID, newVolume) => {
        setClientVolumes(prev => ({
            ...prev,
            [clientID]: newVolume
        }));
        if (videoElements.current[clientID]) {
            videoElements.current[clientID].volume = newVolume;
        }
    }, []);

    // Обработчик переключения состояния "Mute"
    const handleMuteToggle = useCallback((clientID) => {
        const currentVolume = clientVolumes[clientID] ?? 1;
        if (currentVolume === 0) {
            const prevVolume = prevVolumes[clientID] ?? 1;
            setClientVolumes(prev => ({ ...prev, [clientID]: prevVolume }));
            setPrevVolumes(prev => ({ ...prev, [clientID]: 0 }));
            if (videoElements.current[clientID]) {
                videoElements.current[clientID].volume = prevVolume;
            }
        } else {
            setPrevVolumes(prev => ({ ...prev, [clientID]: currentVolume }));
            setClientVolumes(prev => ({ ...prev, [clientID]: 0 }));
            if (videoElements.current[clientID]) {
                videoElements.current[clientID].volume = 0;
            }
        }
    }, [clientVolumes, prevVolumes]);

    // Переключение источника видео
    const handleSourceSwitch = useCallback((clientID, sourceType) => {
        setActiveVideoSource(prev => new Map(prev).set(clientID, sourceType));
        setShowContextMenu(false);
    }, []);

    // Переключение полноэкранного режима для выбранного клиента
    const handleToggleFullscreen = useCallback(() => {
        setFullScreenClient(prev => prev === selectedClient ? null : selectedClient);
        setShowContextMenu(false);
    }, [selectedClient]);

    return (
        <div className="calls-page-container">
            <div className="calls-header">
                <h2 className="calls-title">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M15.05 5A5 5 0 0 1 19 8.95M15.05 1A9 9 0 0 1 23 8.94m-1 7.98v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
                    </svg>
                    {roomName}
                </h2>
                <div className="calls-status">
                    <div className="calls-status-indicator"></div>
                    <span className="calls-status-text">Активен</span>
                    <span className="calls-status-text">•</span>
                    <span className="calls-status-text">{formatTime(seconds)}</span>
                </div>
            </div>
            
            <VideoGrid
                clients={clientsToRender}
                fullScreenClient={fullScreenClient}
                handleProvideMediaRef={handleProvideMediaRef}
                handleContextMenu={handleContextMenu}
                activeVideoSource={activeVideoSource}
            />

            {showContextMenu && (
                <ContextMenu
                    style={{ left: menuPosition.x, top: menuPosition.y }}
                    fullScreenClient={fullScreenClient}
                    selectedClient={selectedClient}
                    activeVideoSource={activeVideoSource}
                    handleToggleFullscreen={handleToggleFullscreen}
                    handleSourceSwitch={handleSourceSwitch}
                    handleMuteToggle={handleMuteToggle}
                    clientVolumes={clientVolumes}
                    handleVolumeChange={handleVolumeChange}
                />
            )}

            {connectionAttempts > 2 && (
                <LoadingOverlay>
                    <div>
                        Connection issues...
                        <button onClick={forceReconnect}>Reconnect</button>
                    </div>
                </LoadingOverlay>
            )}

            <ControlPanel
                provideMediaRef={provideMediaRef}
                muteVideo={muteVideo}
                muteAudio={muteAudio}
                isScreenSharing={isScreenSharing}
                stopScreenSharing={stopScreenSharing}
                startScreenSharing={startScreenSharing}
                forceReconnect={forceReconnect}
                leave_func={leave_func}
                videoStatus={videoStatus}
                audioStatus={audioStatus}
                seconds={seconds}
            />
        </div>
    );
}
