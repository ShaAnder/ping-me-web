import { useLocation } from "react-router-dom";
import { Box, Avatar } from "@mui/material";
import home from "../../assets/img/home.png";
import ServerSideBarActiveHover from "./ServerSideBarActiveHover";

const HomeButton = () => {
  const location = useLocation();
  const isActive = location.pathname === "/";

  return (
    <ServerSideBarActiveHover to="/" tooltip="Home" active={isActive}>
      <Box
        sx={{
          width: 48,
          height: 48,
          backgroundColor: "#36393f",
          borderRadius: 3,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          transition: "background-color 0.3s ease",
        }}
      >
        <Avatar
          alt="Home"
          src={home}
          sx={{
            width: 40,
            height: 40,
            filter: "invert(1) sepia(1) saturate(5) hue-rotate(180deg)",
          }}
        />
      </Box>
    </ServerSideBarActiveHover>
  );
};

export default HomeButton;
