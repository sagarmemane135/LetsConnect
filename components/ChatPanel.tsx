
import React, { useState, useRef, useEffect, ChangeEvent } from 'react';
import { ChatMessage, FileTransfers, User } from '../types';
import { Icons } from './Icons';
import { MAX_FILE_SIZE } from '../constants';

interface ChatPanelProps {
  messages: ChatMessage[];
  fileTransfers: FileTransfers;
  onSendMessage: (message: string) => void;
  onSendFile: (file: File) => void;
  localUser: User;
  peerUser: User | null;
}

const formatBytes = (bytes: number, decimals = 2) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
};

export const ChatPanel: React.FC<ChatPanelProps> = ({ messages, fileTransfers, onSendMessage, onSendFile, localUser, peerUser }) => {
  const [text, setText] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, fileTransfers]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (text.trim()) {
      onSendMessage(text.trim());
      setText('');
    }
  };

  const handleFileSelect = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > MAX_FILE_SIZE) {
        alert(`File is too large. Maximum size is ${formatBytes(MAX_FILE_SIZE)}.`);
        return;
      }
      onSendFile(file);
    }
    if (fileInputRef.current) {
        fileInputRef.current.value = "";
    }
  };

  const renderMessageContent = (msg: ChatMessage) => {
      const isLocal = msg.sender.id === localUser.id;
      const user = isLocal ? localUser : peerUser;
      return (
        <div key={msg.id} className={`flex items-start gap-2.5 my-2 ${isLocal ? 'justify-end' : ''}`}>
            {!isLocal && (
                 <div className="w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center text-white font-bold" style={{backgroundColor: user?.color || '#718096'}}>
                    {user?.name.charAt(0).toUpperCase()}
                 </div>
            )}
            <div className={`flex flex-col gap-1 w-full max-w-[320px] ${isLocal ? 'items-end' : ''}`}>
                <div className="flex items-center space-x-2 rtl:space-x-reverse">
                    <span className="text-sm font-semibold text-white">{isLocal ? 'You' : user?.name}</span>
                    <span className="text-xs font-normal text-gray-400">{new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                </div>
                <div className={`leading-1.5 p-4 border-gray-200 rounded-e-xl rounded-es-xl ${isLocal ? 'bg-indigo-600' : 'bg-gray-700'}`}>
                    <p className="text-sm font-normal text-white break-words">{msg.content}</p>
                </div>
            </div>
             {isLocal && (
                 <div className="w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center text-white font-bold" style={{backgroundColor: user?.color || '#718096'}}>
                    {user?.name.charAt(0).toUpperCase()}
                 </div>
            )}
        </div>
      )
  };

 const renderFileTransfer = (fileId: string) => {
    const transfer = fileTransfers[fileId];
    if (!transfer) return null;

    const isLocal = transfer.meta.sender.id === localUser.id;
    const user = isLocal ? localUser : peerUser;
    const progress = transfer.meta.fileSize > 0 ? (transfer.receivedSize / transfer.meta.fileSize) * 100 : 0;
    const isComplete = progress >= 100;

    return (
        <div key={fileId} className={`flex items-start gap-2.5 my-2 ${isLocal ? 'justify-end' : ''}`}>
             {!isLocal && (
                 <div className="w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center text-white font-bold" style={{backgroundColor: user?.color || '#718096'}}>
                    {user?.name.charAt(0).toUpperCase()}
                 </div>
            )}
            <div className={`flex flex-col gap-1 w-full max-w-[320px]`}>
                 <div className={`flex items-center space-x-2 rtl:space-x-reverse ${isLocal ? 'self-end' : ''}`}>
                    <span className="text-sm font-semibold text-white">{isLocal ? 'You' : user?.name}</span>
                 </div>
                <div className={`p-4 rounded-e-xl rounded-es-xl ${isLocal ? 'bg-indigo-600' : 'bg-gray-700'}`}>
                    <div className="flex items-center space-x-2">
                        <div className="flex-shrink-0">
                            {transfer.meta.fileType.startsWith('image/') && transfer.blobUrl ? (
                                <img src={transfer.blobUrl} alt={transfer.meta.fileName} className="w-16 h-16 rounded-lg object-cover" />
                            ) : (
                                <div className="w-12 h-12 bg-gray-600 rounded-lg flex items-center justify-center">
                                    <Icons.Paperclip className="w-6 h-6 text-gray-300" />
                                </div>
                            )}
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-white truncate">{transfer.meta.fileName}</p>
                            <p className="text-xs text-gray-300">{formatBytes(transfer.meta.fileSize)}</p>
                        </div>
                         {isComplete && transfer.blobUrl && (
                             <a href={transfer.blobUrl} download={transfer.meta.fileName} className="p-2 text-gray-300 hover:text-white hover:bg-gray-500 rounded-full">
                                <Icons.Download className="w-5 h-5" />
                             </a>
                         )}
                    </div>
                    {!isComplete && (
                        <div className="mt-2">
                            <div className="w-full bg-gray-600 rounded-full h-1.5">
                                <div className="bg-blue-500 h-1.5 rounded-full" style={{ width: `${progress}%` }}></div>
                            </div>
                            <p className="text-xs text-right text-gray-300 mt-1">{Math.round(progress)}%</p>
                        </div>
                    )}
                </div>
            </div>
             {isLocal && (
                 <div className="w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center text-white font-bold" style={{backgroundColor: user?.color || '#718096'}}>
                    {user?.name.charAt(0).toUpperCase()}
                 </div>
            )}
        </div>
    )
 };

  return (
    <div className="flex flex-col h-full w-full bg-gray-950">
      <header className="p-4 border-b border-gray-800">
        <h2 className="text-lg font-semibold">Chat & Files</h2>
      </header>
      <div className="flex-1 p-4 overflow-y-auto">
        {messages.map(renderMessageContent)}
        {Object.keys(fileTransfers).map(renderFileTransfer)}
        <div ref={messagesEndRef} />
      </div>
      <footer className="p-4 border-t border-gray-800">
        <form onSubmit={handleSendMessage} className="flex items-center space-x-2">
          <input type="file" ref={fileInputRef} onChange={handleFileSelect} className="hidden" />
          <button type="button" onClick={() => fileInputRef.current?.click()} title="Send File" className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-full">
            <Icons.Paperclip className="w-6 h-6" />
          </button>
          <input
            type="text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Type a message..."
            className="flex-1 px-4 py-2 bg-gray-800 border border-gray-700 rounded-full focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <button type="submit" title="Send Message" className="p-2 bg-indigo-600 hover:bg-indigo-700 rounded-full text-white">
            <Icons.Send className="w-6 h-6" />
          </button>
        </form>
      </footer>
    </div>
  );
};
