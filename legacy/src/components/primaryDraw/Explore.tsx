import React from "react";
import {
  List,
  ListItem,
  ListItemButton,
  Box,
  useTheme,
  ListItemIcon,
  ListItemAvatar,
  Typography,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import { useCategoriesContext } from "../../hooks/useCategoryContext";

type ExploreProps = {
  onOpenMain?: () => void;
};

const Explore: React.FC<ExploreProps> = ({ onOpenMain }) => {
  const theme = useTheme();
  const isDarkMode = theme.palette.mode === "dark";
  const { categories, loading: categoriesLoading } = useCategoriesContext();
  const navigate = useNavigate();

  return (
    <React.Fragment>
      <Box
        sx={{
          height: 50,
          display: "flex",
          alignItems: "center",
          px: 4,
          fontSize: 16,
          letterSpacing: 1,
          fontFamily: "verdana",
          borderBottom: `1px solid ${theme.palette.divider}`,
          position: "sticky",
          top: 0,
          backgroundColor: theme.palette.background.default,
          mb: 1,
        }}
      >
        Explore
      </Box>
      <List sx={{ py: 0 }}>
        {categoriesLoading ? (
          <Typography
            variant="body2"
            sx={{ px: 4, py: 2, color: theme.palette.text.secondary }}
          >
            Loading categories...
          </Typography>
        ) : categories.length === 0 ? (
          <Typography
            variant="body2"
            sx={{ px: 4, py: 2, color: theme.palette.text.secondary }}
          >
            No categories found.
          </Typography>
        ) : (
          categories.map((item) => (
            <ListItem
              disablePadding
              key={item.id}
              sx={{ display: "block" }}
              dense
            >
              <ListItemButton
                sx={{ minHeight: 48, fontFamily: "verdana" }}
                onClick={() => {
                  if (onOpenMain) onOpenMain();
                  setTimeout(() => {
                    navigate(`/explore/${encodeURIComponent(item.name)}`);
                  }, 0);
                }}
              >
                <ListItemIcon sx={{ justifyContent: "center" }}>
                  <ListItemAvatar
                    sx={{
                      minWidth: 0,
                      alignItems: "center",
                      display: "flex",
                    }}
                  >
                    <img
                      alt={`${item.name} category icon`}
                      src={item.category_icon_url}
                      style={{
                        width: 25,
                        height: 25,
                        borderRadius: 8,
                        objectFit: "cover",
                        opacity: 0.8,
                        filter: isDarkMode ? "invert(100%)" : "none",
                      }}
                    />
                  </ListItemAvatar>
                </ListItemIcon>
                {item.name.charAt(0).toUpperCase() + item.name.slice(1)}
              </ListItemButton>
            </ListItem>
          ))
        )}
      </List>
    </React.Fragment>
  );
};

export default Explore;
