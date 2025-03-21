import { useEffect, useState } from "react";
import { Box, Container } from "@mui/material";
import ChatWindow from "./chatWindow";
import ResumeUpload from "./resumeUpload";
import { useAuth } from "../../hooks/useAuth";
import ListenerWindow from "./chatInvigilator";
import AnimatedMicButton from "../../components/mic/mic";

const InterviewRoom = () => {
  const [micOn, setMicOn] = useState(false);
  const [uploadOpen, setUploadOpen] = useState(false); // Start with upload prompt open
  const [showPermissionsPopup, setShowPermissionsPopup] = useState(false);

  const { user } = useAuth();

  useEffect(() => {console.log(isAdmin) }, [user]);
  const isAdmin = user === "admin" || window.location.pathname.includes("monitoring"); 
  
  return (
    <Box sx={{ height: "100vh", display: "flex", flexDirection: "column", backgroundColor: isAdmin ? "grey" : "" }}>
      {/* Chat Window */}
      <Container sx={{ flex: 1 }}>
        {isAdmin ? (
          <ListenerWindow  />
        ) :
          (
            <ChatWindow micOn={micOn} setMicOn={setMicOn} setUploadOpen={setUploadOpen} showPermissionsPopup={showPermissionsPopup} setShowPermissionsPopup={setShowPermissionsPopup}/>
          )}
      </Container>
      {/* Mic Control */}
      {!isAdmin &&
        <>
          {/* <Box sx={{ position: "absolute", bottom: 20, left: "50%", transform: "translateX(-50%)" }}>
            <Button
              variant="contained"
              color={micOn ? "error" : "primary"}
              startIcon={micOn ? <MicOff /> : <Mic />}
              sx={{ mt: 2 }}
              onClick={() => setMicOn(!micOn)} // Simply toggle the state
              disabled={uploadOpen} // Disable the button when upload prompt is open
            >
              {micOn ? "Mute" : "Speak"}
            </Button>
          </Box> */}
          <AnimatedMicButton uploadOpen={uploadOpen} micOn={micOn} setMicOn={setMicOn}/>
          {/* Resume Upload Popup */}
          <ResumeUpload open={uploadOpen} onClose={() => setUploadOpen(false)} setShowPermissionsPopup={setShowPermissionsPopup}/>
        </>
      }
    </Box>
  );
};

export default InterviewRoom;