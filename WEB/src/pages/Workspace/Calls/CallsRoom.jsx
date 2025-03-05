import { useParams, useSearchParams } from 'react-router-dom';
import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import styled from 'styled-components';
import useWebRTC, { LOCAL_VIDEO } from '../../../hooks/useWebRTC';
import VideoGrid from '../../../components/VideoGrid';
import ControlPanel from '../../../components/ControlPanel';
import ContextMenu from '../../../components/ContextMenu';
import LoadingOverlay from '../../../components/LoadingOverlay';

// Видео — растягивается на весь контейнер; если источник является экраном – используем "contain"
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

// Контейнер страницы (занимает весь экран)
const PageContainer = styled.div`
    width: 100vw;
    height: 100vh;
    overflow: hidden;
    background-color: #000;
`;

// Обертка для видео – используется для создания эффекта увеличения и позиционирования в сетке
const VideoWrapper = styled.div`
    position: relative;
    width: calc(100% - 10px);
    height: calc(100% - 10px);
    margin: 5px;
    border-radius: 6px;
    overflow: hidden;
    background: #222;
    transition: transform 0.2s;
    grid-column: ${({ $isFullscreen }) => $isFullscreen ? '1 / -1' : 'auto'};
    grid-row: ${({ $isFullscreen }) => $isFullscreen ? '1 / -1' : 'auto'};
    z-index: ${({ $isFullscreen }) => $isFullscreen ? 100 : 1};

    &:hover {
        transform: ${({ $isFullscreen }) => $isFullscreen ? 'none' : 'scale(1.02)'};
    }
`;

// Кнопка (не используется для подключения, но оставлена для других действий)
const Button = styled.button`
    padding: 10px 20px;
    background-color: ${({ danger }) => (danger === 'true' ? '#f00' : '#0f0')};
    color: #fff;
    border: none;
    border-radius: 4px;
    cursor: pointer;
`;

// Таймер для отображения времени звонка
const Timer = styled.div`
    color: #fff;
    font-size: 18px;
    white-space: nowrap;
    text-align: center;
    margin-left: auto;
    margin-right: 20px;
    padding: 5px 10px;
    background-color: rgba(0, 0, 0, 0.5);
    border-radius: 4px;
`;

// Элемент контекстного меню
const MenuItem = styled.div`
    padding: 8px 12px;
    color: #fff;
    cursor: pointer;
    &:hover {
        background: #444;
    }
`;

// Слайдер громкости
const VolumeSlider = styled.input.attrs({ type: 'range' })`
    width: 100%;
    margin: 8px 0;
`;

// Форматирование таймера (секунды → MM:SS)
const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60).toString().padStart(2, '0');
    const secs = (seconds % 60).toString().padStart(2, '0');
    return `${mins}:${secs}`;
};

// Обертка локальной камеры (например, отображается в углу)
const LocalCameraWrapper = styled(VideoWrapper)`
    width: 120px;
    height: 70px;
    position: relative;
    margin: 0;
`;

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
    // Удаляем счётчик переподключений – больше не нужен
    // const [reconnectCounter, setReconnectCounter] = useState(0);
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
        <PageContainer>
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
        </PageContainer>
    );
}
