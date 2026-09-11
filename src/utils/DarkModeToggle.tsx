import { useContext } from "react";
import { ColorModeContext } from "../contexts/DarkModeContext";
import { useTheme } from "@mui/material/styles";
import { IconButton, Typography, Box } from "@mui/material";
import ToggleOffIcon from "@mui/icons-material/ToggleOff";
import ToggleOnIcon from "@mui/icons-material/ToggleOn";
import Brightness4Icon from "@mui/icons-material/Brightness4";

const DarkModeSwitch = () => {
  const theme = useTheme();
  const colorMode = useContext(ColorModeContext);
  return (
    <>
      <Box>
        <Typography variant="body2" sx={{ textTransform: "capitalize" }}>
          {theme.palette.mode} Mode
        </Typography>
      </Box>
      <Box sx={{ alignItems: "center", display: "flex" }}>
        <Brightness4Icon
          sx={{
            fontSize: "20px",
          }}
        />
        <IconButton
          sx={{
            m: 0,
            p: 0,
            pl: 2,
            alignItems: "center",
          }}
          onClick={colorMode.toggleColorMode}
          color="inherit"
        >
          {theme.palette.mode === "dark" ? (
            <ToggleOffIcon sx={{ fontSize: "2.5rem", p: 0 }} />
          ) : (
            <ToggleOnIcon sx={{ fontSize: "2.5rem" }} />
          )}
        </IconButton>
      </Box>

      <Box></Box>
    </>
  );
};

export default DarkModeSwitch;
