import React, { useState, ReactNode, useCallback } from "react";
import axios from "axios";
import { BASE_URL } from "../../api/config";
import { MessagesContext } from "../../contexts/MessagesContext";
import { MessageTypeInterface } from "../../@types/message";

export const MessagesProvider: React.FC<{ children: ReactNode }> = ({
	children,
}) => {
	const [messagesByChannel, setMessagesByChannel] = useState<{
		[channelId: string]: MessageTypeInterface[];
	}>({});
	const [loading, setLoading] = useState(false);

	const fetchMessagesForChannel = useCallback(async (channelId: string) => {
		setLoading(true);
		try {
			const token = localStorage.getItem("access_token");
			if (!token) throw new Error("No access token");
			const res = await axios.get<MessageTypeInterface[]>(
				`${BASE_URL}/api/messages/?channel_id=${channelId}`,
				{ headers: { Authorization: `Bearer ${token}` } }
			);
			setMessagesByChannel((prev) => ({
				...prev,
				[channelId]: res.data,
			}));
		} catch {
			setMessagesByChannel((prev) => ({ ...prev, [channelId]: [] }));
		}
		setLoading(false);
	}, []);

	return (
		<MessagesContext.Provider
			value={{ messagesByChannel, loading, fetchMessagesForChannel }}
		>
			{children}
		</MessagesContext.Provider>
	);
};
