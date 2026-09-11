import { useContext } from "react";
import { UserServerContext } from "../contexts/UserServerContext";

export const useUserServers = () => {
  const ctx = useContext(UserServerContext);
  if (!ctx)
    throw new Error("useUserServers must be used within a UserServerProvider");
  return ctx;
};
