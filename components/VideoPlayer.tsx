
import React, { useEffect, useRef } from 'react';
import { Icons } from './Icons';

interface VideoPlayerProps {
  stream: MediaStream | null;
  muted: boolean;
  name: string;
  isCameraOff?: boolean;
}

export const VideoPlayer: React.FC<VideoPlayerProps> = ({ stream, muted, name, isCameraOff }) => {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream;
    }
  }, [stream]);

  return (
    <div className="bg-gray-950 rounded-lg overflow-hidden relative aspect-video flex items-center justify-center">
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted={muted}
        className={`w-full h-full object-cover transform scale-x-[-1] ${isCameraOff || !stream ? 'hidden' : 'block'}`}
      />
      {(isCameraOff || !stream) && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-800">
            <div className="w-24 h-24 rounded-full bg-gray-700 flex items-center justify-center mb-4">
                <Icons.User className="w-12 h-12 text-gray-500" />
            </div>
        </div>
      )}
      <div className="absolute bottom-2 left-2 bg-black bg-opacity-50 px-2 py-1 rounded-md text-sm">
        {name}
      </div>
    </div>
  );
};
