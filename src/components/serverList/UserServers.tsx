import { List, Box, Divider, CircularProgress, Avatar } from "@mui/material";
import { useLocation } from "react-router-dom";
import AddServerButton from "./AddServerButton";
import HomeButton from "./HomeButton";
import { useUserServers } from "../../hooks/useUserServers";
import ServerSideBarActiveHover from "./ServerSideBarActiveHover";

const UserServer: React.FC = () => {
  const { servers, loading } = useUserServers();
  const location = useLocation();

  const selectedServerId = location.pathname.startsWith("/server/")
    ? parseInt(location.pathname.split("/server/")[1])
    : null;

  return (
    <List>
      <HomeButton />
      <AddServerButton />
      <Divider sx={{ my: 1 }} />
      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", p: 2 }}>
          <CircularProgress size={32} />
        </Box>
      ) : servers.length > 0 ? (
        servers.map((item) => (
          <ServerSideBarActiveHover
            key={item.id}
            to={`/server/${item.id}`}
            tooltip={item.name}
            active={selectedServerId === item.id}
          >
            <Avatar
              alt={item.name}
              src={item.server_image_urls?.server_icon_url}
              sx={{
                width: 48,
                height: 48,
                borderRadius: 3,
              }}
            />
          </ServerSideBarActiveHover>
        ))
      ) : (
        <Box sx={{ p: 2, textAlign: "center", color: "text.secondary" }}></Box>
      )}
    </List>
  );
};

export default UserServer;
