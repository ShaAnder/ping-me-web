export interface UserInterface {
  id: string;
  username: string;
  email: string;
  image: string;
  image_url?: string;
  location: string;
  content: string;
  servers: ServerInterface[];
}
