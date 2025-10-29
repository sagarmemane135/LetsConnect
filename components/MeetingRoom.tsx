import React, { useState, useMemo } from 'react';
import { useWebRTC } from '../hooks/useWebRTC';
import { VideoPlayer } from './VideoPlayer';
import { ChatPanel } from './ChatPanel';
import { Icons } from './Icons';
import { User } from '../types';

interface MeetingRoomProps {
  roomName: string;
  displayName: string;
  isHost: boolean;
  onLeave: () => void;
}

const colors = [
  '#f87171', '#fb923c', '#facc15', '#a3e635', '#4ade80',
  '#34d399', '#2dd4bf', '#22d3ee', '#38bdf8', '#60a5fa',
  '#818cf8', '#a78bfa', '#c084fc', '#e879f9', '#f472b6'
];

const formatRoomName = (name: string) => {
    return name.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
}

export const MeetingRoom: React.FC<MeetingRoomProps> = ({ roomName, displayName, isHost, onLeave }) => {
  const localUser = useMemo<User>(() => ({
    id: Math.random().toString(36).substring(2, 9),
    name: displayName,
    color: colors[Math.floor(Math.random() * colors.length)],
  }), [displayName]);

  const {
    localStream,
    remoteStream,
    peerUser,
    messages,
    fileTransfers,
    connectionStatus,
    isMuted,
    isCameraOff,
    sendMessage,
    sendFile,
    toggleMute,
    toggleCamera,
    disconnect,
  } = useWebRTC(localUser, roomName, isHost);

  const [isChatVisible, setChatVisible] = useState(true);

  const handleLeaveCall = () => {
    disconnect();
    onLeave();
  };

  const ControlButton: React.FC<{onClick: () => void, children: React.ReactNode, className?: string, title: string}> = 
    ({onClick, children, className, title}) => (
    <button
      onClick={onClick}
      title={title}
      className={`p-3 rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-indigo-500 ${className}`}
    >
      {children}
    </button>
  );
  
  const isConnected = connectionStatus === 'connected';

  const ConnectionStatusOverlay = () => {
    if (isConnected) return null;

    let title = '';
    let content = null;

    switch (connectionStatus) {
      case 'connecting':
        title = 'Connecting...';
        content = (
           <div className="flex justify-center items-center text-gray-300">
            <svg className="animate-spin -ml-1 mr-3 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <span>Establishing a secure connection...</span>
          </div>
        );
        break;
      case 'waiting':
        title = 'Waiting for Peer';
        content = (
            <>
                <p className="text-gray-300 mb-4">Share the page URL with a friend to have them join.</p>
                <div className="mt-2">
                    <input type="text" value={window.location.href} readOnly className="w-full bg-gray-800 text-gray-300 border border-gray-700 rounded px-2 py-1" />
                    <button onClick={() => navigator.clipboard.writeText(window.location.href)} className="mt-2 w-full text-sm px-4 py-2 font-semibold text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors duration-200">
                        Copy Invite Link
                    </button>
                </div>
            </>
        );
        break;
      case 'disconnected':
        title = 'Meeting Ended';
        content = (
          <>
            <p className="text-gray-300 mb-4">The other participant has left the meeting.</p>
            <button onClick={handleLeaveCall} className="w-full px-4 py-2 font-semibold text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors duration-200">
              Return to Lobby
            </button>
          </>
        );
        break;
      case 'error':
        title = 'Connection Error';
        content = (
          <>
            <p className="text-gray-300 mb-4">Could not connect to the room. Please check the Room ID and try again.</p>
            <button onClick={handleLeaveCall} className="w-full px-4 py-2 font-semibold text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors duration-200">
              Return to Lobby
            </button>
          </>
        );
        break;
      default:
        return null;
    }
    
    return (
      <div className="absolute inset-0 bg-black bg-opacity-70 flex items-center justify-center z-10 p-4">
        <div className="text-center max-w-sm bg-gray-900 p-8 rounded-lg shadow-xl">
          <h2 className="text-2xl font-bold mb-4">{title}</h2>
          {content}
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col h-screen bg-gray-900 text-white">
      <header className="px-4 py-2 flex items-center justify-between bg-gray-950 border-b border-gray-800 z-30">
        <h1 className="text-xl font-bold">{formatRoomName(roomName)}</h1>
        <div className="flex items-center space-x-4">
            <span className="hidden sm:inline text-sm text-gray-400 capitalize">
              {isConnected ? `Connected with ${peerUser?.name || 'Peer'}` : connectionStatus}
            </span>
             <button onClick={() => setChatVisible(!isChatVisible)} className="p-2 rounded-full hover:bg-gray-800" title={isChatVisible ? "Hide Chat" : "Show Chat"}>
                {isChatVisible ? <Icons.MessageSquareOff className="w-6 h-6" /> : <Icons.MessageSquare className="w-6 h-6" />}
             </button>
        </div>
      </header>

      <main className="flex-1 flex overflow-hidden">
        <div className="flex-1 flex flex-col p-4 relative">
          
          <ConnectionStatusOverlay />

          <div className={`flex-1 grid grid-cols-1 md:grid-cols-2 gap-4 ${!isConnected ? 'opacity-20 pointer-events-none' : 'opacity-100'}`}>
            <VideoPlayer stream={localStream} muted={true} isCameraOff={isCameraOff} name={`${displayName} (You)`} />
            <VideoPlayer stream={remoteStream} muted={false} name={peerUser?.name || 'Remote User'} isCameraOff={!remoteStream || !isConnected} />
          </div>

          <footer className="py-4 flex items-center justify-center space-x-4">
            <ControlButton onClick={toggleMute} title={isMuted ? "Unmute" : "Mute"}
              className={isMuted ? 'bg-red-600 hover:bg-red-700' : 'bg-gray-700 hover:bg-gray-600'}>
              {isMuted ? <Icons.MicOff className="w-6 h-6" /> : <Icons.Mic className="w-6 h-6" />}
            </ControlButton>
            <ControlButton onClick={toggleCamera} title={isCameraOff ? "Turn Camera On" : "Turn Camera Off"}
              className={isCameraOff ? 'bg-red-600 hover:bg-red-700' : 'bg-gray-700 hover:bg-gray-600'}>
              {isCameraOff ? <Icons.VideoOff className="w-6 h-6" /> : <Icons.Video className="w-6 h-6" />}
            </ControlButton>
             <ControlButton onClick={handleLeaveCall} title="Leave Call"
              className="bg-red-600 hover:bg-red-700">
               <Icons.PhoneOff className="w-6 h-6" />
            </ControlButton>
          </footer>
        </div>
        
        {/* Chat Backdrop for mobile */}
        {isChatVisible && <div onClick={() => setChatVisible(false)} className="fixed inset-0 bg-black bg-opacity-50 z-30 md:hidden"></div>}

        {/* Chat Panel */}
        <aside className={`fixed top-0 right-0 h-full bg-gray-950 border-l border-gray-800 z-40 transition-transform duration-300 ease-in-out md:relative md:translate-x-0 md:h-auto md:w-96
            ${isChatVisible ? 'translate-x-0' : 'translate-x-full'}`}>
            <ChatPanel messages={messages} fileTransfers={fileTransfers} onSendMessage={sendMessage} onSendFile={sendFile} localUser={localUser} peerUser={peerUser} />
        </aside>
      </main>
    </div>
  );
};