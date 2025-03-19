import { Outlet, useLocation } from "react-router-dom";
import { Box } from "@mui/material";
import Navbar from "./navbar";

const Layout = () => {
  const location = useLocation();

  // Hide Navbar for login page
  const showNavbar = location.pathname !== "/";

  return (
    <Box sx={{ height: "100vh", display: "flex", flexDirection: "column" }}>
      {showNavbar && <Navbar />}
      <Outlet /> {/* Renders the child page */}
    </Box>
  );
};

export default Layout;
