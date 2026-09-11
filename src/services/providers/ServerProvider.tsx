/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect, ReactNode, useCallback } from "react";
import { ServerContext } from "../../contexts/ServerContext";
import { ServerInterface } from "../../@types/server";
import { fetchMyServers } from "../../api/mapServer";
import { useUserAuth } from "../../hooks/useUserAuth";

export const ServerProvider: React.FC<{ children: ReactNode }> = ({
	children,
}) => {
	const { isAuthenticated, loading: authLoading } = useUserAuth();
	const [servers, setServers] = useState<ServerInterface[] | null>(null);
	const [loading, setLoading] = useState(true);

	const refreshServers = useCallback(
		async (_categoryName?: string) => {
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
		},
		[isAuthenticated],
	);

	const addServer = async (_data: any) => {
		throw new Error("addServer is not in this slice");
	};

	useEffect(() => {
		if (authLoading) return;
		refreshServers();
	}, [authLoading, refreshServers]);

	return (
		<ServerContext.Provider
			value={{ servers, loading, refreshServers, addServer }}
		>
			{children}
		</ServerContext.Provider>
	);
};
