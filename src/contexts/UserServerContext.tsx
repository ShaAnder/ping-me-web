import { createContext } from "react";
import { ServerInterface } from "../@types/server";

export interface UserServerContextType {
	servers: ServerInterface[];
	loading: boolean;
	refresh: () => Promise<void>;
}

export const UserServerContext = createContext<
	UserServerContextType | undefined
>(undefined);
