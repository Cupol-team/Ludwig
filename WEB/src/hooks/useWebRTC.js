import { useEffect, useRef, useCallback, useState } from 'react';
import freeice from 'freeice';
import useStateWithCallback from './useStateWithCallback';
import socket from '../pages/Workspace/Calls/CallsSocket/index';
import ACTIONS from '../pages/Workspace/Calls/CallsSocket/actions';

export const LOCAL_VIDEO = 'LOCAL_VIDEO';

export default function useWebRTC(roomID, { roomName, projectUuid } = {}) {
    const [clients, updateClients] = useStateWithCallback([]);
    const [connectionAttempts, setConnectionAttempts] = useState(0);
    const MAX_RETRIES = 3;
    const RETRY_DELAY = 5000;
    const [isScreenSharing, setIsScreenSharing] = useState(false);
    const screenTrackRef = useRef(null);
    const [activeVideoSource, setActiveVideoSource] = useState(new Map());

    const addNewClient = useCallback((newClient, cb) => {
        updateClients((list) => {
            if (!list.includes(newClient)) {
                return [...list, newClient];
            }
            return list;
        }, cb);
    }, [updateClients]);

    const peerConnections = useRef({});
    const localMediaStream = useRef(null);
    const peerMediaElements = useRef({
        [LOCAL_VIDEO]: null,
    });

    function toggleVideo(enable) {
        if (localMediaStream.current) {
            localMediaStream.current.getVideoTracks().forEach(track => {
                track.enabled = enable;
            });
        }
    }

    function toggleAudio(enable) {
        if (localMediaStream.current) {
            localMediaStream.current.getAudioTracks().forEach(track => {
                track.enabled = enable;
            });
        }
    }

    useEffect(() => {
        async function handleNewPeer({ peerID, createOffer }) {
            try {
                if (peerID in peerConnections.current) {
                    return console.warn(`Already connected to peer ${peerID}`);
                }

                const peerConnection = new RTCPeerConnection({
                    iceServers: freeice(),
                });

                peerConnections.current[peerID] = peerConnection;

                peerConnection.onicecandidate = (event) => {
                    if (event.candidate) {
                        socket.emit(ACTIONS.RELAY_ICE, {
                            peerID,
                            iceCandidate: event.candidate,
                        });
                    }
                };

                peerConnection.ontrack = ({ streams: [remoteStream] }) => {
                    addNewClient(peerID, () => {
                        const applyStream = () => {
                            if (peerMediaElements.current[peerID]) {
                                const element = peerMediaElements.current[peerID];
                                if (element.srcObject !== remoteStream) {
                                    element.srcObject = remoteStream;
                                    element.muted = false;
                                    element.play().catch(e => console.error('Play error:', e));
                                }
                            }
                        };

                        applyStream();
                        const retryInterval = setInterval(applyStream, 1000);
                        
                        remoteStream.onremovetrack = () => {
                            clearInterval(retryInterval);
                            handleNewPeer({ peerID, createOffer: true });
                        };
                    });
                };

                peerConnection.onconnectionstatechange = () => {
                    console.log(`Connection state with ${peerID}:`, peerConnection.connectionState);
                };

                peerConnection.oniceconnectionstatechange = () => {
                    console.log(`ICE connection state with ${peerID}:`, peerConnection.iceConnectionState);
                };

                if (localMediaStream.current) {
                    localMediaStream.current.getTracks().forEach((track) => {
                        peerConnection.addTrack(track, localMediaStream.current);
                    });
                }

                if (createOffer) {
                    const offer = await peerConnection.createOffer();
                    await peerConnection.setLocalDescription(offer);
                    socket.emit(ACTIONS.RELAY_SDP, {
                        peerID,
                        sessionDescription: offer,
                    });
                }
            } catch (e) {
                console.error('Error handling new peer:', e);
            }
        }

        socket.on(ACTIONS.ADD_PEER, handleNewPeer);
        return () => socket.off(ACTIONS.ADD_PEER, handleNewPeer);
    }, [addNewClient]);

    useEffect(() => {
        async function setRemoteMedia({ peerID, sessionDescription: remoteDescription }) {
            const peerConnection = peerConnections.current[peerID];
            if (peerConnection) {
                await peerConnection.setRemoteDescription(new RTCSessionDescription(remoteDescription));

                if (remoteDescription.type === 'offer') {
                    const answer = await peerConnection.createAnswer();
                    await peerConnection.setLocalDescription(answer);
                    socket.emit(ACTIONS.RELAY_SDP, {
                        peerID,
                        sessionDescription: answer,
                    });
                }
            }
        }

        socket.on(ACTIONS.SESSION_DESCRIPTION, setRemoteMedia);
        return () => socket.off(ACTIONS.SESSION_DESCRIPTION);
    }, []);

    useEffect(() => {
        socket.on(ACTIONS.ICE_CANDIDATE, ({ peerID, iceCandidate }) => {
            const peerConnection = peerConnections.current[peerID];
            if (peerConnection) {
                peerConnection.addIceCandidate(new RTCIceCandidate(iceCandidate));
            }
        });

        return () => socket.off(ACTIONS.ICE_CANDIDATE);
    }, []);

    useEffect(() => {
        const handleRemovePeer = ({ peerID }) => {
            const peerConnection = peerConnections.current[peerID];
            if (peerConnection) {
                peerConnection.close();
            }

            delete peerConnections.current[peerID];
            delete peerMediaElements.current[peerID];

            updateClients((list) => list.filter((c) => c !== peerID));
        };

        socket.on(ACTIONS.REMOVE_PEER, handleRemovePeer);

        return () => socket.off(ACTIONS.REMOVE_PEER);
    }, [updateClients]);

    useEffect(() => {
        async function startCapture() {
            try {
                const devices = await navigator.mediaDevices.enumerateDevices();
                const hasVideo = devices.some((device) => device.kind === 'videoinput');

                localMediaStream.current = await navigator.mediaDevices.getUserMedia({
                    audio: true,
                    video: {
                        width: 1280,
                        height: 720,
                        frameRate: 30
                    },
                });

                addNewClient(LOCAL_VIDEO, () => {
                    const localVideoElement = peerMediaElements.current[LOCAL_VIDEO];
                    if (localVideoElement) {
                        localVideoElement.volume = 0;
                        localVideoElement.srcObject = localMediaStream.current;
                    }
                });
            } catch (e) {
                console.error('Error getting userMedia:', e);
            }
        }

        startCapture()
            .then(() => socket.emit(ACTIONS.JOIN, { room: roomID, name: roomName, project_uuid: projectUuid }))
            .catch((e) => console.error('Error during user media capture:', e));

        return () => {
            if (localMediaStream.current) {
                localMediaStream.current.getTracks().forEach((track) => track.stop());
            }

            socket.emit(ACTIONS.LEAVE);
        };
    }, [roomID, roomName, projectUuid, addNewClient]);

    // Вывод всех треков каждые 5 секунд
    useEffect(() => {
        const interval = setInterval(() => {
            console.log('Local Media Stream Tracks:');
            if (localMediaStream.current) {
                console.log(localMediaStream.current.getTracks());
            }

            console.log('Peer Media Tracks:');
            Object.entries(peerConnections.current).forEach(([peerID, connection]) => {
                connection.getReceivers().forEach(receiver => {
                    console.log(`Peer ${peerID} track:`, receiver.track);
                });
            });
        }, 5000);

        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        if (connectionAttempts >= MAX_RETRIES) {
            console.error('Max connection attempts reached, forcing reload');
            window.location.reload();
        }
    }, [connectionAttempts]);

    const provideMediaRef = useCallback((id, node) => {
        peerMediaElements.current[id] = node;
    }, []);

    // Функция для демонстрации экрана
    const startScreenSharing = useCallback(async () => {
        try {
            const screenStream = await navigator.mediaDevices.getDisplayMedia({
                video: true,
                audio: true
            });
            
            const screenTrack = screenStream.getVideoTracks()[0];
            screenTrackRef.current = screenTrack;

            // Заменяем трек для всех пиров
            Object.values(peerConnections.current).forEach(peerConnection => {
                const sender = peerConnection.getSenders().find(s => s.track?.kind === 'video');
                if (sender) sender.replaceTrack(screenTrack);
            });

            // Обновляем локальный поток
            localMediaStream.current.getVideoTracks().forEach(track => track.stop());
            localMediaStream.current.addTrack(screenTrack);
            
            setIsScreenSharing(true);
            screenTrack.onended = () => {
                stopScreenSharing();
            };

        } catch (error) {
            console.error('Error sharing screen:', error);
        }
    }, []);

    // Функция остановки демонстрации
    const stopScreenSharing = useCallback(() => {
        if (!screenTrackRef.current) return;
        
        // Сохраняем оригинальные настройки камеры
        const originalConstraints = {
            video: { 
                width: 1280, 
                height: 720, 
                frameRate: 30
            },
            audio: true
        };

        screenTrackRef.current.stop();
        screenTrackRef.current = null;
        setIsScreenSharing(false);

        // Восстанавливаем камеру с оригинальными настройками
        navigator.mediaDevices.getUserMedia(originalConstraints)
            .then(cameraStream => {
                const cameraTrack = cameraStream.getVideoTracks()[0];
                
                // Аккуратная замена треков
                localMediaStream.current.getVideoTracks().forEach(track => {
                    track.stop();
                    localMediaStream.current.removeTrack(track);
                });
                
                localMediaStream.current.addTrack(cameraTrack);

                // Обновляем все peer-соединения
                Object.values(peerConnections.current).forEach(peerConnection => {
                    const sender = peerConnection.getSenders()
                        .find(s => s.track?.kind === 'video');
                    if (sender) sender.replaceTrack(cameraTrack);
                });
            });
    }, []);

    return {
        clients,
        provideMediaRef,
        leave_func: () => socket.emit(ACTIONS.LEAVE),
        localMediaStream,
        toggleVideo,
        toggleAudio,
        connectionAttempts,
        startScreenSharing,
        stopScreenSharing,
        isScreenSharing,
        activeVideoSource,
        setActiveVideoSource
    };
}
