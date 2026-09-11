import React, { useState, useEffect, ReactNode } from "react";
import { UserInterface } from "../../@types/user";
import { UserAuthContext } from "../../contexts/UserAuthContext";
import { supabase } from "../../api/supabaseClient";

export const UserAuthProvider: React.FC<{ children: ReactNode }> = ({
	children,
}) => {
	const [user, setUser] = useState<UserInterface | null>(null);
	const [isAuthenticated, setIsAuthenticated] = useState(false);
	const [loading, setLoading] = useState(true);

	const refreshUser = async () => {
		setLoading(true);
		const { data: sessionData } = await supabase.auth.getSession();
		const session = sessionData.session;
		if (!session) {
			setUser(null);
			setIsAuthenticated(false);
			setLoading(false);
			return;
		}

		const { data: profile, error } = await supabase
			.from("profiles")
			.select("id, username")
			.eq("id", session.user.id)
			.maybeSingle();

		if (error || !profile) {
			setUser(null);
			setIsAuthenticated(false);
			setLoading(false);
			return;
		}

		setUser({
			id: profile.id as unknown as number,
			username: profile.username,
			email: session.user.email ?? "",
			image: "",
			location: "",
			content: "",
			servers: [],
		});
		setIsAuthenticated(true);
		setLoading(false);
	};

	useEffect(() => {
		refreshUser();
		const { data: sub } = supabase.auth.onAuthStateChange(() => {
			refreshUser();
		});
		return () => sub.subscription.unsubscribe();
	}, []);

	const login = async (email: string, password: string) => {
		const { error } = await supabase.auth.signInWithPassword({
			email,
			password,
		});
		if (error) throw error;
		await refreshUser();
	};

	const signup = async (username: string, email: string, password: string) => {
		const { error } = await supabase.auth.signUp({
			email,
			password,
			options: { data: { username } },
		});
		if (error) throw error;
	};

	const logout = async () => {
		await supabase.auth.signOut();
		setUser(null);
		setIsAuthenticated(false);
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
