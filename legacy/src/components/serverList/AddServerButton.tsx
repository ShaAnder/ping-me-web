import plus from "../../assets/img/plus.png";
import { Box, Avatar } from "@mui/material";
import { useLocation } from "react-router-dom";
import ServerSideBarActiveHover from "./ServerSideBarActiveHover";

const AddServerButton = () => {
  const location = useLocation();
  const isActive = location.pathname === "/create-or-join";

  return (
    <ServerSideBarActiveHover
      to="/add_server"
      tooltip="Add Server"
      active={isActive}
    >
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
          alt="Add Server"
          src={plus}
          sx={{
            width: 32,
            height: 32,
            filter: "invert(1) sepia(1) saturate(5) hue-rotate(180deg)",
          }}
        />
      </Box>
    </ServerSideBarActiveHover>
  );
};

export default AddServerButton;
