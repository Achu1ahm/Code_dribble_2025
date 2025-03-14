import { useState } from "react";
import { useAuth } from "../../hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { Box, Button, Grid, TextField, Typography } from "@mui/material";
import logo from "../../assets/logo.png";

const Login = () => {
  const [roomId, setRoomId] = useState("");
  const { login, user } = useAuth();
  const navigate = useNavigate();

  const handleLogin = () => {
    if (roomId.trim()) {
      login(roomId);
      if (user == "admin") {
        navigate(`/monitoring`);
      }
      else {
        navigate(`/interview/${roomId}`);
      }
    }
  };

  return (
    <Grid container sx={{ height: "100vh", p: 3 }}>
      {/* Left Side - Login Form */}
      <Grid
        item
        xs={12}
        md={6}
        sx={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          padding: 4,
        }}
      >
        <Box sx={{ width: "80%", maxWidth: 400 }}>
          <img
            src={logo}
            alt="logo"
            width="55"
            height="55"
            style={{ marginBottom: 20 }}
          />
          <Typography variant="h4" fontWeight="bold" mb={3}>
            Welcome Back
          </Typography>
          <Typography variant="body1" color="textSecondary" mb={6}>
            Enter your room ID to start your interview.
          </Typography>

          <TextField
            fullWidth
            label="Your Room ID"
            variant="outlined"
            value={roomId}
            onChange={(e) => setRoomId(e.target.value)}
            sx={{ mb: 4 }}
          />

          <Button
            type="submit"
            fullWidth
            variant="contained"
            color="primary"
            onClick={handleLogin}
            sx={{ py: 1.5, fontSize: "1rem", backgroundColor: "#000" }}
          >
            Enter Room
          </Button>
        </Box>
      </Grid>

      {/* Right Side - Image with Blur & Overlay Text */}
      <Grid
        item
        xs={12}
        md={6}
        sx={{
          position: "relative",
          borderRadius: "15px",
          overflow: "hidden",
          display: { xs: "none", md: "block" },
          "&::after": {
            content: '""',
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            backgroundImage:
              "url('https://plus.unsplash.com/premium_photo-1673688152102-b24caa6e8725?q=80&w=1932&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D')",
            backgroundSize: "cover",
            backgroundPosition: "center",
            filter: "blur(2px) brightness(0.7)",
            zIndex: -1,
          },
        }}
      >
        <Typography
          variant="h3"
          fontWeight="bold"
          color="white"
          sx={{
            position: "absolute",
            bottom: 50,
            left: "36%",
            transform: "translateX(-50%)",
            padding: "10px 20px",
            borderRadius: "8px",
          }}
        >
          Step Into Your Next Opportunity
        </Typography>
      </Grid>
    </Grid>
  );
};

export default Login;
