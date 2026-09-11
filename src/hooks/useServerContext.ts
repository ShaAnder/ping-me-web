import { useContext } from "react";
import { ServerContext } from "../contexts/ServerContext";

export const useServerContext = () => {
  const ctx = useContext(ServerContext);
  if (!ctx)
    throw new Error("useServerContext must be used within a ServerProvider");
  return ctx;
};
