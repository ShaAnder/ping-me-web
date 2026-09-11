import { useContext } from "react";
import { UserAuthContext } from "../contexts/UserAuthContext";

export const useUserAuth = () => {
  const ctx = useContext(UserAuthContext);
  if (!ctx)
    throw new Error("useUserAuth must be used within a UserAuthProvider");
  return ctx;
};
