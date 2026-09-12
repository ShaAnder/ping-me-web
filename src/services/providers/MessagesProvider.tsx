import React, { useState, ReactNode, useCallback } from "react";
import { MessagesContext } from "../../contexts/MessagesContext";
import { MessageTypeInterface } from "../../@types/message";
import { supabase } from "../../api/supabaseClient";
import { mapMessage, MessageRow } from "../../api/mapMessages";

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
			const { data, error } = await supabase
				.from("messages")
				.select(
					"id, channel_id, sender_id, content, created_at, updated_at, profiles(id, username)",
				)
				.eq("channel_id", channelId)
				.order("created_at", { ascending: true });

			if (error) {
				console.error("fetchMessagesForChannel", error);
				setMessagesByChannel((prev) => ({ ...prev, [channelId]: [] }));
				return;
			}

			setMessagesByChannel((prev) => ({
				...prev,
				[channelId]: ((data ?? []) as unknown as MessageRow[]).map(mapMessage),
			}));
		} finally {
			setLoading(false);
		}
	}, []);

	return (
		<MessagesContext.Provider
			value={{ messagesByChannel, loading, fetchMessagesForChannel }}
		>
			{children}
		</MessagesContext.Provider>
	);
};
