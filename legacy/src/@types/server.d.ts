export interface ServerInterface {
  id: number;
  name: string;
  server: string;
  description: string;
  category: string;
  category_name: string;
  created_at: string;
  num_members?: number;
  owner: string;
  owner_id: number;

  server_image_urls: {
    server_icon_url: string;
    banner_image_url: string;
  };
  channel_server: {
    id: number;
    name: string;
    server: number;
    topic: string;
    owner: number;
    type: string;
  }[];
}
