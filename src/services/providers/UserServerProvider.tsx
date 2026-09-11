import React, { useState, useEffect, useCallback, ReactNode } from "react";
import { ServerInterface } from "../../@types/server";
import { UserServerContext } from "../../contexts/UserServerContext";
import { fetchMyServers } from "../../api/mapServer";
import { useUserAuth } from "../../hooks/useUserAuth";

export const UserServerProvider: React.FC<{ children: ReactNode }> = ({
	children,
}) => {
	const { isAuthenticated, loading: authLoading } = useUserAuth();
	const [servers, setServers] = useState<ServerInterface[]>([]);
	const [loading, setLoading] = useState(true);

	const fetchServers = useCallback(async () => {
		setLoading(true);
		try {
			if (!isAuthenticated) {
				setServers([]);
				return;
			}
			setServers(await fetchMyServers());
		} finally {
			setLoading(false);
		}
	}, [isAuthenticated]);

	useEffect(() => {
		if (authLoading) return;
		fetchServers();
	}, [authLoading, fetchServers]);

	return (
		<UserServerContext.Provider
			value={{ servers, loading, refresh: fetchServers }}
		>
			{children}
		</UserServerContext.Provider>
	);
};
