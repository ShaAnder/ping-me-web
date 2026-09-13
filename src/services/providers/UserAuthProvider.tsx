import React, { useState, useEffect, ReactNode } from "react";
import { UserInterface } from "../../@types/user";
import { UserAuthContext } from "../../contexts/UserAuthContext";
import { supabase } from "../../api/supabaseClient";
import type { Session } from "@supabase/supabase-js";

export const UserAuthProvider: React.FC<{ children: ReactNode }> = ({
	children,
}) => {
	const [user, setUser] = useState<UserInterface | null>(null);
	const [isAuthenticated, setIsAuthenticated] = useState(false);
	const [loading, setLoading] = useState(true);

	const applySession = async (session: Session | null, showLoader: boolean) => {
		if (showLoader) setLoading(true);

		if (!session) {
			setUser(null);
			setIsAuthenticated(false);
			setLoading(false);
			return;
		}

		const { data: profile, error } = await supabase
			.from("profiles")
			.select("id, username, avatar_url, bio, location")
			.eq("id", session.user.id)
			.maybeSingle();

		if (error || !profile) {
			setUser(null);
			setIsAuthenticated(false);
			setLoading(false);
			return;
		}

		setUser({
			id: profile.id,
			username: profile.username,
			email: session.user.email ?? "",
			image: profile.avatar_url ?? "",
			image_url: profile.avatar_url ?? "",
			location: profile.location ?? "",
			content: profile.bio ?? "",
			servers: [],
		});
		setIsAuthenticated(true);
		setLoading(false);
	};

	useEffect(() => {
		const { data: sub } = supabase.auth.onAuthStateChange((event, session) => {
			if (event === "TOKEN_REFRESHED") return;
			if (event === "INITIAL_SESSION") {
				void applySession(session, true);
				return;
			}
			if (event === "SIGNED_OUT") {
				void applySession(null, false);
				return;
			}
			void applySession(session, false);
		});

		return () => sub.subscription.unsubscribe();
	}, []);

	const refreshUser = async () => {
		const { data } = await supabase.auth.getSession();
		await applySession(data.session, false);
	};

	const login = async (email: string, password: string) => {
		const { data, error } = await supabase.auth.signInWithPassword({
			email,
			password,
		});
		if (error) throw error;

		// Resolve the profile fetch here rather than trusting the
		// onAuthStateChange listener to have finished by the time this
		// resolves — that listener fires async and independently, so
		// navigating right after login() used to race it: isAuthenticated
		// was still false for a moment, ProtectedRoute bounced back to
		// /login, and the login only "took" on a second attempt once the
		// first login's background profile fetch had quietly finished.
		await applySession(data.session, false);
	};

	// Returns true when Supabase is still waiting on email confirmation
	// (no session yet), false when the user is already signed in.
	const signup = async (
		username: string,
		email: string,
		password: string,
	): Promise<boolean> => {
		const { data, error } = await supabase.auth.signUp({
			email,
			password,
			options: { data: { username } },
		});
		if (error) throw error;
		return data.session === null;
	};

	const logout = async () => {
		await supabase.auth.signOut();
	};

	return (
		<UserAuthContext.Provider
			value={{
				user,
				isAuthenticated,
				loading,
				login,
				signup,
				logout,
				refreshUser,
			}}
		>
			{children}
		</UserAuthContext.Provider>
	);
};
