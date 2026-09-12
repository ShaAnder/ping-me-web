import { useContext } from "react";
import { ProfilesContext } from "../contexts/ProfilesContext";

export const useProfiles = () => {
	const ctx = useContext(ProfilesContext);
	if (!ctx) throw new Error("useProfiles must be used within ProfilesProvider");
	return ctx;
};
