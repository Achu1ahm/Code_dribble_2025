import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Box, Avatar, Typography, Button, Popover, Backdrop } from "@mui/material";
import Swal from 'sweetalert2'
import { motion } from "framer-motion";
import io from "socket.io-client";
import Peer from "simple-peer";
import InterviewGuard from "../../components/interviewGuard";

const socket = io("http://localhost:8000", { autoConnect: false });

const ChatWindow = ({
  micOn,
  setMicOn,
  setUploadOpen,
  showPermissionsPopup,
  setShowPermissionsPopup
}: {
  micOn: boolean;
  setMicOn: (state: boolean) => void;
  setUploadOpen?: (state: boolean) => void;
  showPermissionsPopup: boolean;
  setShowPermissionsPopup: (state: boolean) => void;
}) => {
  const [speaking, setSpeaking] = useState<"user" | "bot" | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [peer, setPeer] = useState<Peer.Instance | null>(null);
  const [showResumePopup, setShowResumePopup] = useState(true); // Resume popup state
  // Permissions popup state
  const localStream = useRef<MediaStream | null>(null);
  const audioRecorder = useRef<MediaRecorder | null>(null);
  const audioChunks = useRef<Blob[]>([]);
  const receivedVideoRef = useRef<any>(null);
  const resumeAnchorEl = useRef<HTMLElement | null>(null);
  const permissionsAnchorEl = useRef<HTMLElement | null>(null);

  const navigate = useNavigate();

  useEffect(() => {
    const handleDisconnect = () => {
      if (localStream.current) {
        localStream.current.getTracks().forEach((track) => track.stop());
        localStream.current = null;
      }
      if (receivedVideoRef.current) {
        receivedVideoRef.current.src = "";
      }
      setIsConnected(false);
      Swal.fire({
        title: "Interview Completed!",
        icon: "success"
      }).then((result) => {
        if (result.isConfirmed) {
          window.location.href = "/analytics";
        }
      });
    };

    socket.on("disconnect", handleDisconnect);

    return () => {
      socket.off("disconnect", handleDisconnect);
    };
  }, [peer, navigate])

  // Set up anchor elements for popups
  useEffect(() => {
    const resumeDummy = document.createElement("div");
    const permissionsDummy = document.createElement("div");
    document.body.appendChild(resumeDummy);
    document.body.appendChild(permissionsDummy);
    resumeAnchorEl.current = resumeDummy as HTMLElement;
    permissionsAnchorEl.current = permissionsDummy as HTMLElement;
    return () => {
      document.body.removeChild(resumeDummy);
      document.body.removeChild(permissionsDummy);
    };
  }, []);

  // Handle resume upload step
  const handleResumeContinue = () => {
    setShowResumePopup(false);
    setUploadOpen && setUploadOpen(true); // Open upload window
  };

  // Handle permissions and start interview
  const handleStartInterview = async () => {
    try {

      const requestFullscreen = async () => {
        try {
          if (document.documentElement.requestFullscreen) {
            await document.documentElement.requestFullscreen();
          } else if ((document.documentElement as any).webkitRequestFullscreen) {
            await (document.documentElement as any).webkitRequestFullscreen();
          } else if ((document.documentElement as any).mozRequestFullScreen) {
            await (document.documentElement as any).mozRequestFullScreen();
          } else if ((document.documentElement as any).msRequestFullscreen) {
            await (document.documentElement as any).msRequestFullscreen();
          }
          return true;
        } catch (err) {
          console.error("Fullscreen request failed:", err);
          return false;
        }
      };

      const fullscreenSuccess = await requestFullscreen();

      if (!fullscreenSuccess) {
        Swal.fire({
          title: "Fullscreen Required",
          text: "Please allow fullscreen mode to proceed with the interview.",
          icon: "warning",
        });
        return;
      }

      setShowPermissionsPopup(false);
      socket.connect();
      setIsConnected(true);
    } catch (error) {
      console.error("Failed to connect to socket or permission denied", error);
    }
  };

  // Audio handling for bot responses
  useEffect(() => {
    if (!isConnected) return;

    const handleBotAudio = (data: string) => { // Adjust type to match raw base64 string
      const audio = new Audio(`data:audio/wav;base64,${data}`); // Change to WAV
      audio.onplay = () => setSpeaking("bot");
      audio.onended = () => setSpeaking(null);
      audio.play().catch((err) => console.error("Bot audio playback failed:", err));
    };

    socket.on("bot-audio", handleBotAudio);
    return () => {
      socket.off("bot-audio", handleBotAudio);
    };
  }, [isConnected]);

  // Audio recording setup for user
  useEffect(() => {
    if (!isConnected || !micOn) {
      if (audioRecorder.current?.state === "recording") audioRecorder.current.stop();
      if (localStream.current) localStream.current.getAudioTracks().forEach((track) => track.stop());
      return;
    }

    const startAudio = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        localStream.current = stream;
        audioRecorder.current = new MediaRecorder(stream);

        audioChunks.current = [];

        audioRecorder.current.ondataavailable = (event) => {
          if (event.data.size > 0) audioChunks.current.push(event.data);
        };

        audioRecorder.current.onstop = async () => {
          const audioBlob = new Blob(audioChunks.current, { type: "audio/webm" });
          audioChunks.current = [];
          const base64Audio = await blobToBase64(audioBlob);
          socket.emit("user-audio", base64Audio); // Send raw base64 string
          setSpeaking(null);
        };

        audioRecorder.current.start(1000);
        setSpeaking("user");
      } catch (err) {
        console.error("Mic setup failed:", err);
        setMicOn(false);
      }
    };

    startAudio();

    return () => {
      if (audioRecorder.current?.state === "recording") audioRecorder.current.stop();
      if (localStream.current) localStream.current.getAudioTracks().forEach((track) => track.stop());
    };
  }, [micOn, isConnected, setMicOn]);

  // Helper function (ensure this is defined)
  const blobToBase64 = (blob: Blob): Promise<string> =>
    new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve((reader.result as string).split(',')[1]); // Extract base64 part
      reader.readAsDataURL(blob);
    });

  // Video streaming setup
  useEffect(() => {
    if (!isConnected) return;

    const setupWebRTC = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });

        const newPeer = new Peer({ initiator: true, trickle: false, stream });
        newPeer.on("signal", (signalData: any) => {
          socket.emit("message", signalData);
        });

        newPeer.on("error", (err: any) => console.error("Peer error:", err));
        newPeer.on("connect", () => console.log("Peer connected"));

        socket.on("processed_frame", (base64Frame) => {

          if (receivedVideoRef.current) {
            const prefixedBase64 = base64Frame.startsWith("data:image/jpeg;base64,")
              ? base64Frame
              : `data:image/jpeg;base64,${base64Frame}`;
            receivedVideoRef.current.src = prefixedBase64;

          }
        });

        startBase64Streaming(stream);
        setPeer(newPeer);
      } catch (err) {
        console.error("WebRTC setup failed:", err);
      }
    };

    const startBase64Streaming = (stream: any) => {
      const video = document.createElement("video");
      video.srcObject = stream;
      video.play();

      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");

      setInterval(() => {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        ctx!.drawImage(video, 0, 0, canvas.width, canvas.height);
        const base64Frame = canvas.toDataURL("image/jpeg");
        socket.emit("message", base64Frame);
      }, 100);
    };

    setupWebRTC();

    return () => {
      socket.off("invigilator-answer");
      if (peer) peer.destroy();
      if (localStream.current) localStream.current.getTracks().forEach((track) => track.stop());
    };
  }, [isConnected]);

  const handleCancel = () => {
    if (isConnected) {
      socket.disconnect();
      setIsConnected(false);
    }
  };

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        minHeight: "calc(100vh - 64px)",
        px: { xs: 2, sm: 3, md: 4 },
        position: "relative",
      }}
    >
       <InterviewGuard isConnected={isConnected} onCancel={handleCancel} />
      {/* Resume Upload Popup*/}
      {showResumePopup && (
        <Backdrop open={true} sx={{ zIndex: 1300 }}>
          <Popover
            open={true}
            anchorEl={resumeAnchorEl.current}
            anchorOrigin={{ vertical: "top", horizontal: "right" }}
            transformOrigin={{ vertical: "top", horizontal: "left" }}
            disableRestoreFocus
          // sx={{ mt: 2, ml: 2 }} 
          >
            <Box
              sx={{
                p: { xs: 2, sm: 3 },
                bgcolor: "white",
                borderRadius: 2,
                textAlign: "center",
                maxWidth: { xs: "90vw", sm: "400px" },
                boxShadow: "0 0 10px rgba(0,0,0,0.1)",
              }}
            >
              <Typography variant="h6" sx={{ fontSize: { xs: "1rem", sm: "1.25rem" } }}>
                Welcome to the AI Interview
              </Typography>
              <Typography sx={{ mt: 1, fontSize: { xs: "0.875rem", sm: "1rem" } }}>
                Please upload your resume to begin.
              </Typography>
              <Button
                variant="contained"
                color="primary"
                onClick={handleResumeContinue}
                sx={{ mt: 2, fontSize: { xs: "0.875rem", sm: "1rem" } }}
              >
                Continue
              </Button>
            </Box>
          </Popover>
        </Backdrop>
      )}
      {/* Permissions Popup - Centered with Backdrop */}
      {showPermissionsPopup && (
        <Backdrop open={true} sx={{ zIndex: 1300 }}>
          <Popover
            open={true}
            anchorEl={permissionsAnchorEl.current}
            anchorOrigin={{ vertical: "center", horizontal: "center" }}
            transformOrigin={{ vertical: "center", horizontal: "center" }}
            disableRestoreFocus
          >
            <Box
              sx={{
                p: { xs: 2, sm: 3 },
                bgcolor: "white",
                borderRadius: 2,
                textAlign: "center",
                maxWidth: { xs: "90vw", sm: "400px" },
              }}
            >
              <Typography variant="h6" sx={{ fontSize: { xs: "1rem", sm: "1.25rem" } }}>
                Permissions Required
              </Typography>
              <Typography color="error" sx={{ mt: 1, fontSize: { xs: "0.875rem", sm: "1rem" } }}>
                Please allow microphone and camera access, and fullscreen access.
              </Typography>
              <Button
                variant="contained"
                color="primary"
                onClick={handleStartInterview}
                sx={{ mt: 2, fontSize: { xs: "0.875rem", sm: "1rem" } }}
              >
                Start Interview
              </Button>
            </Box>
          </Popover>
        </Backdrop>
      )}
      {/* Main Interview UI */}
      {isConnected && (
        // <Box
        //   sx={{
        //     display: "flex",
        //     flexDirection: { xs: "column", md: "row" },
        //     gap: { xs: 2, sm: 3, md: 4 },
        //     width: "90vw",
        //     // maxWidth: "90vw",
        //     height: "80vh",
        //     justifyContent: "center",
        //   }}
        // >
        //   <motion.div
        //     animate={{ scale: speaking === "user" ? 1.05 : 1 }}
        //     style={{
        //       padding: "20px",
        //       borderRadius: "20px",
        //       textAlign: "center",
        //       backgroundColor: "#fff",
        //       boxShadow: speaking === "user" ? "0 0 20px rgba(0, 255, 0, 0.5)" : "0 0 10px rgba(0,0,0,0.1)",
        //       width: "100%",
        //     }}
        //   >
        //     <img
        //       ref={receivedVideoRef}
        //       style={{
        //         width: "100%",
        //         height: "100%",
        //         borderRadius: "10px",
        //         display: "block",
        //       }}
        //     />
        //     <Typography variant="h6" mt={2} sx={{ fontSize: { xs: "1rem", sm: "1.25rem" } }}>
        //       You
        //     </Typography>
        //   </motion.div>
        //   <motion.div
        //     animate={{ scale: speaking === "bot" ? 1.01 : 1 }}
        //     style={{
        //       display: "flex",
        //       flexDirection: "column",
        //       alignItems: "center",
        //       padding: "20px",
        //       borderRadius: "20px",
        //       textAlign: "center",
        //       backgroundColor: "#fff",
        //       boxShadow: speaking === "bot" ? "0 0 20px rgba(0, 0, 255, 0.5)" : "0 0 10px rgba(0,0,0,0.1)",
        //       width: "100%",
        //     }}
        //   >
        //     <Avatar
        //       src="https://i.pravatar.cc/150?img=32"
        //       sx={{ width: { xs: 80, sm: 100, md: "160px" }, height: { xs: 80, sm: 100, md: "160px" }, margin: "auto" }}
        //     />
        //     <Typography variant="h6" mt={2} sx={{ fontSize: { xs: "1rem", sm: "1.25rem" } }}>
        //       AI Interviewer
        //     </Typography>
        //   </motion.div>
        // </Box>
        <Box
          sx={{
            display: "flex",
            flexDirection: { xs: "column", md: "row" },
            gap: { xs: 2, sm: 3, md: 4 },
            width: "60vw",
            height: "74vh",
            justifyContent: "center",
          }}
        >
          {/* User Box with Relative Positioning */}
          <motion.div
            animate={{ scale: speaking === "user" ? 1.05 : 1 }}
            style={{
              position: "relative",
              // padding: "20px",
              borderRadius: "20px",
              textAlign: "center",
              // backgroundColor: "#fff",
              boxShadow: speaking === "user" ? "0 0 20px rgba(0, 255, 0, 0.5)" : "0 0 10px rgba(0,0,0,0.1)",
              width: "100%",
              height: "100%", // Ensure it maintains full height
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "left",
            }}
          >
            <img
              ref={receivedVideoRef}
              style={{
                width: "100%",
                height: "100%",
                borderRadius: "10px",
                display: "block",
              }}
            />
            <Typography variant="h6" mt={2} sx={{ fontSize: { xs: "1rem", sm: "1.25rem" } }}>
              You
            </Typography>

            {/* AI Interviewer Box Inside User Box */}
            <motion.div
              animate={{ scale: speaking === "bot" ? 1.01 : 1 }}
              style={{
                position: "absolute",
                bottom: "10px",
                right: "10px",
                padding: "12px 6px",
                borderRadius: "15px",
                textAlign: "center",
                backgroundColor: "#fff",
                boxShadow: speaking === "bot" ? "0 0 20px rgba(0, 0, 255, 0.5)" : "0 0 10px rgba(0,0,0,0.1)",
                width: "20%",
                minWidth: "100px", // Ensure it remains visible on small screens
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
              }}
            >
              <Avatar
                src="https://imgs.search.brave.com/G5NjwJL4P5DONe3GqqluPQXX5stdK-ZiBY2hllw4MQk/rs:fit:500:0:0:0/g:ce/aHR0cHM6Ly93d3cu/cHJvZmlsZWJha2Vy/eS5jb20vd3AtY29u/dGVudC91cGxvYWRz/LzIwMjMvMDQvd29t/ZW4tQUktUHJvZmls/ZS1QaWN0dXJlLmpw/Zw"
                sx={{ width: { xs: 50, sm: 60, md: 80 }, height: { xs: 50, sm: 60, md: 80 } }}
              />
              <Typography variant="h6" mt={1} sx={{ fontSize: { xs: "0.75rem", sm: "1rem" } }}>
                AI Interviewer
              </Typography>
            </motion.div>
          </motion.div>
        </Box>
      )}
    </Box>
  );
};

export default ChatWindow;