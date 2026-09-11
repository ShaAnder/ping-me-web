// src/routes/ProtectedRoute.tsx
import { Navigate } from "react-router-dom";
import { useUserAuth } from "../hooks/useUserAuth";
import { useServerContext } from "../hooks/useServerContext";
import { useCategoriesContext } from "../hooks/useCategoryContext";
import { Box, CircularProgress } from "@mui/material";

interface ProtectedRouteProps {
  children: React.ReactNode;
  waitForServers?: boolean;
  waitForCategories?: boolean;
}

/**
 * ProtectedRoute ensures the user is authenticated and, optionally,
 * waits for servers/categories data to load before rendering children.
 */
const ProtectedRoute = ({
  children,
  waitForServers = false,
  waitForCategories = false,
}: ProtectedRouteProps) => {
  const { isAuthenticated, loading: userLoading } = useUserAuth();
  const { loading: serversLoading } = useServerContext();
  const { loading: categoriesLoading } = useCategoriesContext();

  let isLoading = userLoading;
  if (waitForServers) isLoading = isLoading || serversLoading;
  if (waitForCategories) isLoading = isLoading || categoriesLoading;

  if (isLoading) {
    return (
      <Box
        sx={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
