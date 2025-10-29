
export interface User {
  id: string;
  name: string;
  color: string;
}

export enum MessageType {
  CHAT = 'chat',
  FILE_META = 'file-meta',
  FILE_CHUNK = 'file-chunk',
  FILE_END = 'file-end',
  USER_INFO = 'user-info',
}

export interface ChatMessage {
  type: MessageType.CHAT;
  id: string;
  sender: User;
  content: string;
  timestamp: number;
}

export interface FileMeta {
    type: MessageType.FILE_META;
    fileId: string;
    fileName: string;
    fileSize: number;
    fileType: string;
    sender: User;
}

export interface FileChunk {
    type: MessageType.FILE_CHUNK;
    fileId: string;
    chunk: ArrayBuffer;
}

export interface FileEnd {
    type: MessageType.FILE_END;
    fileId: string;
}

export interface UserInfoMessage {
  type: MessageType.USER_INFO;
  user: User;
}


export type DataChannelMessage = ChatMessage | FileMeta | FileChunk | FileEnd | UserInfoMessage;

export interface FileTransfer {
  meta: FileMeta;
  receivedSize: number;
  chunks: ArrayBuffer[];
  blobUrl?: string;
}

export type FileTransfers = Record<string, FileTransfer>;
