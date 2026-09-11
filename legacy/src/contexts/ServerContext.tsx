/* eslint-disable @typescript-eslint/no-explicit-any */
import { createContext } from "react";
import { ServerInterface } from "../@types/server";

export interface NewServerData {
  name: string;
  server: string;
  description: string;
  category: string;
  category_name: string;
  server_image_urls: {
    server_icon_url: string;
    banner_image_url: string;
  };
}

export interface ServerContextType {
  servers: ServerInterface[] | null;
  loading: boolean;
  refreshServers: (categoryName?: string) => Promise<void>;
  addServer: (data: any) => Promise<void>;
}

export const ServerContext = createContext<ServerContextType | undefined>(
  undefined
);
