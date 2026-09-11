export interface AuthServiceProps {
  login: (username: string, password: string) => Promise<unknown | null>;
  isAuthenticated: boolean;
  logout: () => void;
}
