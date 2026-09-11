import { Box, useMediaQuery } from "@mui/material";
import { useState } from "react";
import { useParams } from "react-router-dom";
import { useCategoriesContext } from "../hooks/useCategoryContext";

import Nav from "./templates/Nav";
import ServerList from "./templates/ServerList";
import PrimaryDraw from "./templates/PrimaryDraw";
import Main from "./templates/Main";
import ErrorPage from "./ErrorPage";

import UserServer from "../components/serverList/UserServers";
import Explore from "../components/primaryDraw/Explore";
import ExplorePopularServers from "../components/main/PopularServers";
import UserPanel from "../components/shared/UserPanel";

const Popular = () => {
  const { categoryName } = useParams();
  const { categories, loading: categoriesLoading } = useCategoriesContext();
  const isMobile = useMediaQuery("(max-width:767px)", { noSsr: true });
  const [mainOpen, setMainOpen] = useState(false);

  const handleOpenMain = () => setMainOpen(true);
  const handleCloseMain = () => setMainOpen(false);

  // Check if the category exists (fallback protection)
  const categoryExists = categories.some(
    (category) => category.name.toLowerCase() === categoryName?.toLowerCase()
  );

  // Show error page if category doesn't exist and we're done loading
  if (!categoriesLoading && categoryName && !categoryExists) {
    return (
      <ErrorPage 
        error={{ 
          status: 404, 
          message: `Category "${categoryName}" doesn't exist` 
        }} 
      />
    );
  }

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
        <UserPanel />
      </Box>
    </>
  );
};

export default Popular;
