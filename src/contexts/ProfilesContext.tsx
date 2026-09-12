import { createContext } from "react";

export type ProfileLite = {
	id: string;
	username: string;
	avatar_url: string | null;
};

export type ProfilesContextType = {
	profilesById: Record<string, ProfileLite>;
};

export const ProfilesContext = createContext<ProfilesContextType | undefined>(
	undefined,
);
