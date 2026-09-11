import React, { useEffect, useState } from "react";
import { Box, Typography, Grid, Container } from "@mui/material";
import { useParams } from "react-router-dom";
import { useServerContext } from "../../hooks/useServerContext";
import { useUserServers } from "../../hooks/useUserServers";
import { useCategoriesContext } from "../../hooks/useCategoryContext";
import Modal from "../../components/shared/Modal";
import axios from "axios";
import { BASE_URL } from "../../api/config";
import { ServerInterface } from "../../@types/server";
import PopularServerCard from "./PopularServerCard";
import MainScroll from "../../components/main/MainScroll";
import ErrorPage from "../../pages/ErrorPage";

const ExplorePopularServers: React.FC = () => {
  const { categoryName } = useParams();
  const {
    servers,
    loading: serversLoading,
    refreshServers,
  } = useServerContext();
  const {
    servers: userServers,
    loading: userServersLoading,
    refresh: refreshUserServers,
  } = useUserServers();
  const {
    categories,
    loading: categoriesLoading,
  } = useCategoriesContext();

  const [detailsModalOpen, setDetailsModalOpen] = useState(false);
  const [selectedServer, setSelectedServer] = useState<ServerInterface | null>(
    null
  );
  const [joinedServerIds, setJoinedServerIds] = useState<Set<number>>(
    new Set()
  );
  const [actionInProgress, setActionInProgress] = useState<number | null>(null);

  // Check if the category exists
  const categoryExists = categories.some(
    (category) => category.name.toLowerCase() === categoryName?.toLowerCase()
  );

  useEffect(() => {
    setJoinedServerIds(new Set(userServers.map((s) => s.id)));
  }, [userServers]);

  useEffect(() => {
    refreshServers(categoryName);
    // eslint-disable-next-line
  }, [categoryName]);

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

  const handleShowServerDetails = (server: ServerInterface) => {
    setSelectedServer(server);
    setDetailsModalOpen(true);
  };

  const handleJoinServer = async (server: ServerInterface) => {
    setActionInProgress(server.id);
    const token = localStorage.getItem("access_token");
    try {
      await axios.post(
        `${BASE_URL}/api/servers/${server.id}/add_member/`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setJoinedServerIds((prev) => new Set(prev).add(server.id));
      await refreshUserServers();
    } catch (err) {
      console.log(err);
    }
    setActionInProgress(null);
  };

  const handleLeaveServer = async (server: ServerInterface) => {
    setActionInProgress(server.id);
    const token = localStorage.getItem("access_token");
    try {
      await axios.post(
        `${BASE_URL}/api/servers/${server.id}/remove_member/`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setJoinedServerIds((prev) => {
        const newSet = new Set(prev);
        newSet.delete(server.id);
        return newSet;
      });
      await refreshUserServers();
    } catch (err) {
      console.log(err);
    }
    setActionInProgress(null);
  };

  const handleCloseModal = () => {
    setDetailsModalOpen(false);
    setSelectedServer(null);
  };

  return (
    <Container maxWidth="lg" disableGutters>
      <MainScroll>
        <Box sx={{ pt: 4, pl: { xs: 2, sm: 4, md: 8 } }}>
          <Typography
            variant="h3"
            noWrap
            component="h1"
            sx={{
              fontWeight: 700,
              fontSize: { xs: 24, sm: 32, md: 48 },
              letterSpacing: "-2px",
              textAlign: { xs: "center", sm: "left" },
            }}
          >
            {categoryName
              ? `Explore ${
                  categoryName.charAt(0).toUpperCase() + categoryName.slice(1)
                } Servers`
              : "All Popular Servers"}
          </Typography>
        </Box>
        <Box sx={{ pl: { xs: 2, sm: 4, md: 8 } }}>
          <Typography
            variant="h6"
            noWrap
            component="h2"
            sx={{
              fontWeight: 300,
              fontSize: { xs: 18, sm: 20, md: 40 },
              textAlign: { xs: "center", sm: "left" },
              opacity: 0.6,
            }}
          >
            {categoryName
              ? `Talking about all things ${
                  categoryName.charAt(0).toUpperCase() + categoryName.slice(1)
                }`
              : "Here's all of the most popular servers!"}
          </Typography>
        </Box>
        <Grid container spacing={3} sx={{ mt: 2, pl: { xs: 2, sm: 4, md: 8 } }}>
          {serversLoading || userServersLoading ? (
            <Grid item xs={12}>
              <Typography
                sx={{
                  px: 2,
                  py: 4,
                  textAlign: { xs: "center", sm: "left" },
                }}
              >
                Loading servers...
              </Typography>
            </Grid>
          ) : !servers || servers.length === 0 ? (
            <Grid item xs={12}>
              <Typography
                sx={{
                  px: 2,
                  py: 4,
                  textAlign: { xs: "center", sm: "left" },
                }}
              >
                No servers found.
              </Typography>
            </Grid>
          ) : (
            servers.map((item) => {
              const joined = joinedServerIds.has(item.id);
              return (
                <Grid
                  item
                  key={item.id}
                  xs={10}
                  sm={6}
                  md={4}
                  lg={4}
                  xl={3}
                  sx={{
                    display: "flex",
                    justifyContent: "center",
                    mx: { xs: "auto", sm: 0 },
                  }}
                >
                  <PopularServerCard
                    server={item}
                    joined={joined}
                    actionInProgress={actionInProgress === item.id}
                    onJoin={handleJoinServer}
                    onLeave={handleLeaveServer}
                    onShowDetails={handleShowServerDetails}
                  />
                </Grid>
              );
            })
          )}
        </Grid>
      </MainScroll>
      <Modal
        open={detailsModalOpen && !!selectedServer}
        onClose={handleCloseModal}
        title=""
      >
        {selectedServer && (
          <Box sx={{ textAlign: "center", p: 2 }}>
            <img
              src={selectedServer.server_image_urls.banner_image_url}
              alt={selectedServer.name}
              style={{ width: "100%", borderRadius: 8, marginBottom: 16 }}
            />
            <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
              <img
                src={selectedServer.server_image_urls.server_icon_url}
                alt={`${selectedServer.name} icon`}
                style={{
                  width: 60,
                  height: 60,
                  borderRadius: 12,
                  marginRight: 16,
                  border: "2px solid white",
                }}
              />
              <Typography variant="h5" align="left">
                {selectedServer.name}
              </Typography>
            </Box>
            <Typography variant="body1" align="left" sx={{ mb: 2 }}>
              Category:{" "}
              {selectedServer.category_name.charAt(0).toUpperCase() +
                selectedServer.category_name.slice(1)}
            </Typography>
            {selectedServer.description && (
              <Typography variant="body1" align="left" sx={{ mb: 2 }}>
                {selectedServer.description}
              </Typography>
            )}
          </Box>
        )}
      </Modal>
    </Container>
  );
};

export default ExplorePopularServers;
