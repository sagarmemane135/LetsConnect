import React, { useState, useEffect } from 'react';
import { Icons } from './Icons';
import { generateRoomName } from '../utils/roomNameGenerator';

interface LobbyProps {
  onJoin: (displayName: string, isCreating: boolean) => void;
  initialRoomId: string | null;
}

export const Lobby: React.FC<LobbyProps> = ({ onJoin, initialRoomId }) => {
  const [name, setName] = useState('');
  const [joinId, setJoinId] = useState('');

  useEffect(() => {
    if (initialRoomId) {
        setJoinId(initialRoomId);
    }
  }, [initialRoomId]);


  const handleCreateRoom = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      const newRoomId = generateRoomName();
      window.location.hash = newRoomId;
      onJoin(name.trim(), true);
    }
  };
  
  const handleJoinRoom = (e: React.FormEvent) => {
    e.preventDefault();
     if (name.trim() && joinId.trim()) {
      window.location.hash = joinId.trim();
      onJoin(name.trim(), false);
    }
  }

  return (
    <div className="flex items-center justify-center min-h-screen p-4">
      <div className="w-full max-w-md bg-gray-900 rounded-lg shadow-xl p-8 space-y-8">
        <div className="text-center">
            <h1 className="text-4xl font-bold tracking-tight text-white sm:text-5xl">P2P Meet</h1>
            <p className="mt-4 text-lg text-gray-400">Serverless. Private. Peer-to-Peer.</p>
        </div>

        <div className="space-y-4">
            <input
              type="text"
              placeholder="Enter your display name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-white"
              required
            />
        </div>

        <div className="space-y-6">
            <form onSubmit={handleCreateRoom} className="space-y-4">
                <button
                type="submit"
                disabled={!name.trim()}
                className="w-full flex items-center justify-center px-4 py-3 font-semibold text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 disabled:bg-gray-600 disabled:cursor-not-allowed transition-colors duration-200"
                >
                    <Icons.PlusCircle className="w-5 h-5 mr-2" />
                    Create New Room
                </button>
            </form>

            <div className="relative">
                <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-700"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                    <span className="px-2 bg-gray-900 text-gray-500">OR</span>
                </div>
            </div>

            <form onSubmit={handleJoinRoom} className="space-y-4">
                 <input
                    type="text"
                    placeholder="Enter Room ID to join"
                    value={joinId}
                    onChange={(e) => setJoinId(e.target.value)}
                    className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-white"
                 />
                 <button
                    type="submit"
                    disabled={!name.trim() || !joinId.trim()}
                    className="w-full flex items-center justify-center px-4 py-3 font-semibold text-white bg-green-600 rounded-lg hover:bg-green-700 disabled:bg-gray-600 disabled:cursor-not-allowed transition-colors duration-200"
                >
                    <Icons.LogIn className="w-5 h-5 mr-2" />
                    Join Room
                </button>
            </form>
        </div>
      </div>
    </div>
  );
};