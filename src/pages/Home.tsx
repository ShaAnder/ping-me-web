import { Box, useMediaQuery } from "@mui/material";
import { useState } from "react";

import Nav from "./templates/Nav";
import ServerList from "./templates/ServerList";
import PrimaryDraw from "./templates/PrimaryDraw";
import Main from "./templates/Main";

import UserServer from "../components/serverList/UserServers";
import Explore from "../components/primaryDraw/Explore";
import ExplorePopularServers from "../components/main/PopularServers";
import UserPanel from "../components/shared/UserPanel";

const Home = () => {
  const isMobile = useMediaQuery("(max-width:767px)", { noSsr: true });
  const [mainOpen, setMainOpen] = useState(false);

  // Pass this to Explore or PrimaryDraw to open Main on click
  const handleOpenMain = () => setMainOpen(true);
  const handleCloseMain = () => setMainOpen(false);

  return (
    <>
      <Nav serverName="PingMe Home" />
      <Box sx={{ display: "flex", width: "100%" }}>
        {/* Sidebar - Server List */}
        <ServerList>
          <UserServer />
        </ServerList>
        {/* Explore Section - Primary Drawer */}
        <PrimaryDraw>
          <Explore onOpenMain={handleOpenMain} />
        </PrimaryDraw>

        {/* Drawer - Popular Servers */}
        <Main
          open={!isMobile || mainOpen}
          onClose={isMobile ? handleCloseMain : undefined}
        >
          <ExplorePopularServers />
        </Main>
      </Box>
      <UserPanel />
    </>
  );
};

export default Home;
