import { supabase } from "./supabaseClient";

export async function joinServer(
	serverId: string,
): Promise<{ alreadyMember: boolean }> {
	const { data: sessionData } = await supabase.auth.getSession();
	const userId = sessionData.session?.user.id;
	if (!userId) throw new Error("No session");

	const { data: server, error: serverErr } = await supabase
		.from("servers")
		.select("id")
		.eq("id", serverId)
		.maybeSingle();
	if (serverErr) throw serverErr;
	if (!server) {
		throw new Error("That invite link doesn't point to a server that exists.");
	}

	const { error } = await supabase.from("server_members").insert({
		server_id: serverId,
		user_id: userId,
	});

	if (error) {
		// Unique violation on (server_id, user_id) just means they're
		// already a member - not a real failure, don't surface it as one.
		if (error.code === "23505") {
			return { alreadyMember: true };
		}
		throw error;
	}

	return { alreadyMember: false };
}
