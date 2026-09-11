import { createContext } from "react";
import { MessageTypeInterface } from "../@types/message";

export interface MessagesContextType {
  messagesByChannel: { [channelId: string]: MessageTypeInterface[] };
  loading: boolean;
  fetchMessagesForChannel: (channelId: string) => Promise<void>;
}

export const MessagesContext = createContext<MessagesContextType | undefined>(
  undefined
);
