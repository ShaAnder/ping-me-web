import { useContext } from "react";
import { MessagesContext } from "../contexts/MessagesContext";

export const useMessagesContext = () => {
  const ctx = useContext(MessagesContext);
  if (!ctx)
    throw new Error(
      "useMessagesContext must be used within a MessagesProvider"
    );
  return ctx;
};
