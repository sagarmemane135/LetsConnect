import { useState, useEffect, useRef, useCallback } from 'react';
import { FILE_CHUNK_SIZE } from '../constants';
import { User, MessageType, DataChannelMessage, ChatMessage, FileTransfers, FileMeta, FileChunk, FileEnd } from '../types';

// This line is for TypeScript type checking, PeerJS is loaded from a script tag in index.html
declare const Peer: any; 

export type ConnectionStatus = 'connecting' | 'waiting' | 'connected' | 'disconnected' | 'error';

export const useWebRTC = (localUser: User, roomName: string, isHost: boolean) => {
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
  const [peerUser, setPeerUser] = useState<User | null>(null);
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>('connecting');
  
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [fileTransfers, setFileTransfers] = useState<FileTransfers>({});

  const [isMuted, setIsMuted] = useState(false);
  const [isCameraOff, setIsCameraOff] = useState(false);

  const peerRef = useRef<any>(null); // Using `any` for PeerJS object
  const connRef = useRef<any>(null); // For DataConnection
  const callRef = useRef<any>(null); // For MediaConnection

  const customJsonStringify = (data: any) => {
    return JSON.stringify(data, (key, value) => {
        if (value instanceof ArrayBuffer) {
            return Array.from(new Uint8Array(value));
        }
        return value;
    });
  };

  const customJsonParse = (data: string) => {
    return JSON.parse(data, (key, value) => {
        if (key === 'chunk' && Array.isArray(value)) {
            return new Uint8Array(value).buffer;
        }
        return value;
    });
  };
  
  const handleDataMessage = (message: DataChannelMessage) => {
    switch (message.type) {
        case MessageType.CHAT:
            setMessages(prev => [...prev, message]);
            break;
        case MessageType.USER_INFO:
            setPeerUser(message.user);
            break;
        case MessageType.FILE_META:
            setFileTransfers(prev => ({
                ...prev,
                [message.fileId]: { meta: message, receivedSize: 0, chunks: [] }
            }));
            break;
        case MessageType.FILE_CHUNK:
            setFileTransfers(prev => {
                const transfer = prev[message.fileId];
                if (!transfer) return prev;

                const newChunks = [...transfer.chunks, message.chunk];
                const receivedSize = transfer.receivedSize + message.chunk.byteLength;

                return {...prev, [message.fileId]: {...transfer, chunks: newChunks, receivedSize}};
            });
            break;
        case MessageType.FILE_END:
             setFileTransfers(prev => {
                const transfer = prev[message.fileId];
                if (!transfer || transfer.blobUrl) return prev;

                const fileBlob = new Blob(transfer.chunks, { type: transfer.meta.fileType });
                const blobUrl = URL.createObjectURL(fileBlob);
                return {...prev, [message.fileId]: {...transfer, blobUrl}};
             });
            break;
    }
  };
  
  const setupConnectionEvents = useCallback((conn: any) => {
    conn.on('data', (data: string) => {
        const message = customJsonParse(data) as DataChannelMessage;
        handleDataMessage(message);
    });

    conn.on('open', () => {
        setConnectionStatus('connected');
        const userInfo: DataChannelMessage = { type: MessageType.USER_INFO, user: localUser };
        conn.send(JSON.stringify(userInfo));
    });

    conn.on('close', () => {
        setConnectionStatus('disconnected');
        setRemoteStream(null);
        setPeerUser(null);
    });

    connRef.current = conn;
  }, [localUser]);

  useEffect(() => {
    let peer: any;
    
    const initialize = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
            setLocalStream(stream);
            
            // If Peer object doesn't exist, we can't continue.
            if (typeof Peer === 'undefined') {
                console.error('PeerJS is not loaded');
                setConnectionStatus('error');
                return;
            }

            peer = isHost ? new Peer(roomName) : new Peer();
            peerRef.current = peer;

            peer.on('open', (id: string) => {
                console.log('My peer ID is: ' + id);
                if (isHost) {
                    setConnectionStatus('waiting');
                } else {
                    // Joiner connects to the host
                    const conn = peer.connect(roomName);
                    setupConnectionEvents(conn);

                    const call = peer.call(roomName, stream);
                    call.on('stream', (remoteStream: MediaStream) => {
                        setRemoteStream(remoteStream);
                    });
                    callRef.current = call;
                }
            });

            // Host listens for connections
            if (isHost) {
                peer.on('connection', (conn: any) => {
                    setupConnectionEvents(conn);
                });
                peer.on('call', (call: any) => {
                    call.answer(stream);
                    call.on('stream', (remoteStream: MediaStream) => {
                        setRemoteStream(remoteStream);
                    });
                    callRef.current = call;
                });
            }
            
            peer.on('error', (err: any) => {
                console.error('PeerJS error:', err);
                setConnectionStatus('error');
                if (err.type === 'peer-unavailable') {
                    alert('Could not connect to the host. Please check the Room ID and ensure the host is waiting.');
                }
            });

            peer.on('disconnected', () => {
                setConnectionStatus('disconnected');
            });
            
        } catch (error) {
            console.error("Error initializing media or peer connection.", error);
            alert("Could not access camera and microphone. Please allow permissions and refresh.");
            setConnectionStatus('error');
        }
    };

    initialize();

    return () => {
      peerRef.current?.destroy();
      connRef.current?.close();
      callRef.current?.close();
      localStream?.getTracks().forEach(track => track.stop());
    };
  }, [roomName, isHost, localUser, setupConnectionEvents]);


  const sendMessage = (messageContent: string) => {
    if (connRef.current?.open) {
      const message: ChatMessage = {
        type: MessageType.CHAT,
        id: Math.random().toString(36).substring(2, 9),
        sender: localUser,
        content: messageContent,
        timestamp: Date.now(),
      };
      connRef.current.send(JSON.stringify(message));
      setMessages(prev => [...prev, message]);
    }
  };
  
  const sendFile = (file: File) => {
    const dc = connRef.current;
    if (!dc || !dc.open) return;

    const fileId = Math.random().toString(36).substring(2, 9);
    const fileMeta: FileMeta = {
      type: MessageType.FILE_META, fileId, fileName: file.name, fileSize: file.size, fileType: file.type, sender: localUser,
    };
    
    setFileTransfers(prev => ({
        ...prev,
        [fileId]: { meta: fileMeta, receivedSize: 0, chunks: [], blobUrl: URL.createObjectURL(file) }
    }));
    
    dc.send(JSON.stringify(fileMeta));

    const reader = new FileReader();
    reader.onload = () => {
        const buffer = reader.result as ArrayBuffer;
        let offset = 0;

        function sendNextChunk() {
            if (offset >= buffer.byteLength) {
                const fileEnd: FileEnd = { type: MessageType.FILE_END, fileId };
                dc.send(JSON.stringify(fileEnd));
                setFileTransfers(prev => ({...prev, [fileId]: {...prev[fileId], receivedSize: file.size}}));
                return;
            }

            const chunk = buffer.slice(offset, offset + FILE_CHUNK_SIZE);
            const fileChunk: FileChunk = { type: MessageType.FILE_CHUNK, fileId, chunk };
            dc.send(customJsonStringify(fileChunk));
            offset += chunk.byteLength;
            setFileTransfers(prev => ({...prev, [fileId]: {...prev[fileId], receivedSize: offset}}));
            
            // Small delay to allow buffer to clear if needed, simple backpressure
            setTimeout(sendNextChunk, 0);
        }
        sendNextChunk();
    };
    reader.readAsArrayBuffer(file);
  };
  
  const toggleMute = () => {
    if (localStream) {
      const audioTrack = localStream.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setIsMuted(!audioTrack.enabled);
      }
    }
  };
  
  const toggleCamera = () => {
    if (localStream) {
      const videoTrack = localStream.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        setIsCameraOff(!videoTrack.enabled);
      }
    }
  };
  
  const disconnect = () => {
    peerRef.current?.destroy();
  };

  return {
    localStream, remoteStream, peerUser, messages, fileTransfers, connectionStatus, isMuted, isCameraOff,
    sendMessage, sendFile, toggleMute, toggleCamera, disconnect,
  };
};