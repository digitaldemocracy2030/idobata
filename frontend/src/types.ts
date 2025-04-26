import { Dispatch, SetStateAction } from 'react';

export interface OutletContext {
  userId: string | null;
  setUserId: Dispatch<SetStateAction<string | null>>;
}

export interface Message {
  role: string;
  content: string;
  timestamp: Date;
}

export interface Problem {
  _id: string;
  statement: string;
  version?: number;
}

export interface Solution {
  _id: string;
  statement: string;
  version?: number;
}

export interface NotificationType {
  message: string;
  type: string;
  id: string;
}

export interface PreviousExtractions {
  problems: Problem[];
  solutions: Solution[];
}
