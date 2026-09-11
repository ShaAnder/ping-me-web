import { UserInterface } from "./user";

export interface MessageTypeInterface {
  id: number;
  user: UserInterface;
  content: string;
  timestamp_created: string;
  timestamp_updated: string;
}
