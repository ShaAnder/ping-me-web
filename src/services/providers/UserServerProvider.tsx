import React, { useState, useCallback, ReactNode } from "react";
import { ServerInterface } from "../../@types/server";
import { UserServerContext } from "../../contexts/UserServerContext";
import { fetchMyServers } from "../../api/mapServer";

export const UserServerProvider: React.FC<{ children: ReactNode }> = ({
	children,
}) => {
	const [servers, setServers] = useState<ServerInterface[]>([]);
	const [loading, setLoading] = useState(true);

	const fetchServers = useCallback(async () => {
		setLoading(true);
		setServers(await fetchMyServers());
		setLoading(false);
	}, []);

	return (
		<UserServerContext.Provider
			value={{ servers, loading, refresh: fetchServers }}
		>
			{children}
		</UserServerContext.Provider>
	);
};
