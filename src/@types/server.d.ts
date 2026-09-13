export interface ServerInterface {
  id: string;
  name: string;
  server: string;
  description: string;
  category: string;
  category_name: string;
  created_at: string;
  num_members?: number;
  owner: string;
  owner_id: string;

  server_image_urls: {
    server_icon_url: string;
    banner_image_url: string;
  };
  channel_server: {
    id: string;
    name: string;
    server: string;
    topic: string;
    owner: string;
    type: string;
  }[];
}
