import { AppBar, Avatar, Toolbar, Typography, Box } from "@mui/material";
import logo from "../../assets/logo.png";

const Navbar = () => {
    return (
        <AppBar position="static" sx={{ background: "transparent", boxShadow: "none", px: 3 }}>
            <Toolbar sx={{ display: "flex", justifyContent: "space-between" }}>
                <Box sx={{display:"flex",gap:1,alignItems:"center"}}>
                    <img
                        src={logo}
                        alt="logo"
                        width="40"
                        height="40"
                    />
                    <Typography sx={{ color: "#000" }} variant="h5" fontWeight="bold">Webby</Typography>
                </Box>
                <Avatar alt="User Avatar" src="https://i.pravatar.cc/150?img=12" />
            </Toolbar>
        </AppBar>
    );
};

export default Navbar;
