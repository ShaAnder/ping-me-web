import { createContext } from "react";
import { UserInterface } from "../@types/user";

export interface UserAuthContextType {
  user: UserInterface | null;
  isAuthenticated: boolean;
  loading: boolean;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

export const UserAuthContext = createContext<UserAuthContextType | undefined>(
  undefined
);
