import React, { useEffect, useState, ReactNode } from "react";
import { supabase } from "../../api/supabaseClient";
import { ProfilesContext, ProfileLite } from "../../contexts/ProfilesContext";
import { useUserAuth } from "../../hooks/useUserAuth";

export const ProfilesProvider: React.FC<{ children: ReactNode }> = ({
	children,
}) => {
	const { isAuthenticated } = useUserAuth();
	const [profilesById, setProfilesById] = useState<Record<string, ProfileLite>>(
		{},
	);

	useEffect(() => {
		if (!isAuthenticated) {
			setProfilesById({});
			return;
		}

		const load = async () => {
			const { data, error } = await supabase
				.from("profiles")
				.select("id, username, avatar_url");
			if (error) {
				console.error("profiles", error);
				return;
			}
			const next: Record<string, ProfileLite> = {};
			for (const row of data ?? []) next[row.id] = row as ProfileLite;
			setProfilesById(next);
		};

		void load();

		const channel = supabase
			.channel("profiles-live")
			.on(
				"postgres_changes",
				{ event: "*", schema: "public", table: "profiles" },
				(payload) => {
					if (payload.eventType === "DELETE") {
						const id = (payload.old as { id: string }).id;
						setProfilesById((prev) => {
							const copy = { ...prev };
							delete copy[id];
							return copy;
						});
						return;
					}
					const row = payload.new as ProfileLite;
					setProfilesById((prev) => ({ ...prev, [row.id]: row }));
				},
			)
			.subscribe();

		return () => {
			supabase.removeChannel(channel);
		};
	}, [isAuthenticated]);

	return (
		<ProfilesContext.Provider value={{ profilesById }}>
			{children}
		</ProfilesContext.Provider>
	);
};
