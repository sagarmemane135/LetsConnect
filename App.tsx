import React, { useState, useEffect } from 'react';
import { Lobby } from './components/Lobby';
import { MeetingRoom } from './components/MeetingRoom';

const App: React.FC = () => {
  const [roomName, setRoomName] = useState<string | null>(null);
  const [displayName, setDisplayName] = useState<string>('');
  const [isHost, setIsHost] = useState(false);

  useEffect(() => {
    const getRoomFromHash = () => {
      const hash = window.location.hash.substring(1);
      if (hash) {
        setRoomName(hash);
      } else {
        setRoomName(null);
      }
    };

    getRoomFromHash();
    window.addEventListener('hashchange', getRoomFromHash);
    return () => {
      window.removeEventListener('hashchange', getRoomFromHash);
    };
  }, []);

  const handleJoin = (name: string, isCreating: boolean) => {
    setDisplayName(name);
    setIsHost(isCreating);
  };
  
  const handleLeave = () => {
    window.location.hash = '';
    setRoomName(null);
    setDisplayName('');
  };

  return (
    <div className="min-h-screen bg-gray-950 text-gray-200">
      {roomName && displayName ? (
        <MeetingRoom 
          roomName={roomName} 
          displayName={displayName} 
          isHost={isHost}
          onLeave={handleLeave} 
        />
      ) : (
        <Lobby onJoin={handleJoin} initialRoomId={roomName} />
      )}
    </div>
  );
};

export default App;