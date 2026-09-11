import React, { useState, useEffect, ReactNode } from "react";
import axios from "axios";
import { UserInterface } from "../../@types/user";
import { BASE_URL } from "../../api/config";
import { UserAuthContext } from "../../contexts/UserAuthContext";

export const UserAuthProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<UserInterface | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  // Set up axios instance with token
  const authAxios = axios.create({ baseURL: BASE_URL });
  authAxios.interceptors.request.use((config) => {
    const token = localStorage.getItem("access_token");
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  });

  // Fetch user profile
  const refreshUser = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("access_token");
      if (token) {
        const res = await authAxios.get<UserInterface>("/api/account/me/");
        setUser(res.data);
        setIsAuthenticated(true);
      } else {
        setUser(null);
        setIsAuthenticated(false);
      }
    } catch {
      setUser(null);
      setIsAuthenticated(false);
    }
    setLoading(false);
  };

  useEffect(() => {
    refreshUser();
    // eslint-disable-next-line
  }, []);

  // Login
  const login = async (username: string, password: string) => {
    const res = await axios.post(`${BASE_URL || ""}/api/token/`, {
      username,
      password,
    });
    localStorage.setItem("access_token", res.data.access);
    localStorage.setItem("refresh_token", res.data.refresh);
    await refreshUser();
  };

  // Logout
  const logout = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    setUser(null);
    setIsAuthenticated(false);
  };

  return (
    <UserAuthContext.Provider
      value={{ user, isAuthenticated, loading, login, logout, refreshUser }}
    >
      {children}
    </UserAuthContext.Provider>
  );
};
