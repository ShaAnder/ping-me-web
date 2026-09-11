import { Typography, Box } from "@mui/material";
import React from "react";
import pingMeLogo from "../../assets/img/pingMe.png";

const AuthHeader: React.FC<{ title: string }> = ({ title }) => (
  <>
    <Box
      sx={{
        display: "flex",
        alignItems: "right",
        justifyContent: "center",
        mb: 6,
      }}
    >
      <img
        style={{ width: "50px", marginRight: 12 }}
        src={pingMeLogo}
        alt="PingMe Logo"
      />
      <Typography
        variant="h4"
        sx={{
          fontWeight: 900,
          letterSpacing: 1,
          textAlign: "center",
        }}
      >
        PingMe
      </Typography>
    </Box>
    <Typography
      variant="h5"
      sx={{
        mb: 2,
        fontWeight: 700,
        textAlign: "left",
      }}
    >
      {title}
    </Typography>
  </>
);

export default AuthHeader;
