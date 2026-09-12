import { createContext } from "react";
import { UserInterface } from "../@types/user";

export interface UserAuthContextType {
	user: UserInterface | null;
	isAuthenticated: boolean;
	loading: boolean;
	login: (username: string, password: string) => Promise<void>;
	// Returns true if Supabase requires the user to confirm their email
	// before they get a session (Auth settings dependent), false if they're
	// already signed in.
	signup: (
		username: string,
		email: string,
		password: string,
	) => Promise<boolean>;
	logout: () => void;
	refreshUser: () => Promise<void>;
}

export const UserAuthContext = createContext<UserAuthContextType | undefined>(
	undefined,
);
