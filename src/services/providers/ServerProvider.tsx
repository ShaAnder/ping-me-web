/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect, ReactNode, useCallback } from "react";
import { ServerContext } from "../../contexts/ServerContext";
import { ServerInterface } from "../../@types/server";
import { fetchMyServers } from "../../api/mapServer";

export const ServerProvider: React.FC<{ children: ReactNode }> = ({
	children,
}) => {
	const [servers, setServers] = useState<ServerInterface[] | null>(null);
	const [loading, setLoading] = useState(true);
	// Track the latest request

	const refreshServers = useCallback(async (_categoryName?: string) => {
		setServers([]);
		setLoading(true);
		setServers(await fetchMyServers());
		setLoading(false);
	}, []);

	const addServer = async (_data: any) => {
		throw new Error("addServer is not in this slice");
	};

	useEffect(() => {
		refreshServers();
	}, [refreshServers]);

	return (
		<ServerContext.Provider
			value={{ servers, loading, refreshServers, addServer }}
		>
			{children}
		</ServerContext.Provider>
	);
};
