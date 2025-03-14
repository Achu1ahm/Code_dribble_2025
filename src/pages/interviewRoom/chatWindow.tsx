// import { useState, useEffect, useRef } from "react";
// import { Box, Avatar, Typography, Button, Popover, Backdrop } from "@mui/material";
// import { motion } from "framer-motion";
// import io from "socket.io-client";
// import Peer from "simple-peer";

// const socket = io("http://localhost:5000", { autoConnect: false });

// const ChatWindow = ({
//   micOn,
//   setMicOn,
//   setUploadOpen,
// }: {
//   micOn: boolean;
//   setMicOn: (state: boolean) => void;
//   setUploadOpen?: (state: boolean) => void;
// }) => {
//   const [speaking, setSpeaking] = useState<"user" | "bot" | null>(null);
//   const [isConnected, setIsConnected] = useState(false);
//   const [peer, setPeer] = useState<Peer.Instance | null>(null);
//   const localStream = useRef<MediaStream | null>(null);
//   const audioRecorder = useRef<MediaRecorder | null>(null);
//   const audioChunks = useRef<Blob[]>([]);
//   const videoRef = useRef<HTMLVideoElement>(null);
//   const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);

//   useEffect(() => {
//     const dummyElement = document.createElement("div");
//     document.body.appendChild(dummyElement);
//     setAnchorEl(dummyElement as HTMLElement);
//     return () => {
//       document.body.removeChild(dummyElement);
//     };
//   }, []);

//   const handleStartChat = async () => {
//     try {
//       socket.connect();
//       setIsConnected(true);
//       setAnchorEl(null);
//       setTimeout(() => setUploadOpen && setUploadOpen(true), 2600);
//     } catch (error) {
//       console.error("Failed to connect to socket:", error);
//     }
//   };

//   useEffect(() => {
//     if (!isConnected) return;

//     const handleBotAudio = (data: { audioBase64: string }) => {
//       const audio = new Audio(`data:audio/mp3;base64,${data.audioBase64}`);
//       audio.onplay = () => setSpeaking("bot");
//       audio.onended = () => setSpeaking(null);
//       audio.play().catch((err) => console.error("Bot audio playback failed:", err));
//     };

//     socket.on("bot-audio", handleBotAudio);
//     return () => {
//       socket.off("bot-audio", handleBotAudio);
//     };
//   }, [isConnected]);


//   useEffect(() => {
//     if (!isConnected || !micOn) {
//       if (audioRecorder.current?.state === "recording") audioRecorder.current.stop();
//       if (localStream.current) localStream.current.getAudioTracks().forEach((track) => track.stop());
//       return;
//     }

//     const startAudio = async () => {
//       try {
//         const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
//         localStream.current = stream;
//         audioRecorder.current = new MediaRecorder(stream);

//         audioChunks.current = []; // Reset chunks before starting

//         // Push chunks whenever data is available
//         audioRecorder.current.ondataavailable = (event) => {
//           if (event.data.size > 0) {
//             audioChunks.current.push(event.data);
//           }
//         };

//         audioRecorder.current.onstop = async () => {
//           const audioBlob = new Blob(audioChunks.current, { type: "audio/webm" });
//           audioChunks.current = []; // Reset chunks after processing

//           const base64Audio = await blobToBase64(audioBlob);
//           console.log(base64Audio);
//           socket.emit("user-audio", { base64Audio });

//           setSpeaking(null);
//         };

//         // Start recording with a timeslice (e.g., every second)
//         audioRecorder.current.start(1000); // Collects data every second

//         setSpeaking("user");
//       } catch (err) {
//         console.error("Mic setup failed:", err);
//         setMicOn(false);
//       }
//     };

//     startAudio();    

//     return () => {
//       if (audioRecorder.current?.state === "recording") audioRecorder.current.stop();
//       if (localStream.current) localStream.current.getAudioTracks().forEach((track) => track.stop());
//     };
//   }, [micOn, isConnected, setMicOn]);

//   const blobToBase64 = (blob: Blob): Promise<string> => {
//     return new Promise((resolve) => {
//       const reader = new FileReader();
//       reader.onloadend = () => resolve(reader.result as string);
//       reader.readAsDataURL(blob);
//     });
//   };

//   //vedio stream man
//   useEffect(() => {
//     if (!isConnected) return;

//     const setupWebRTC = async () => {
//       try {
//         const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
//         localStream.current = stream;
//         if (videoRef.current) videoRef.current.srcObject = stream;

//         const newPeer = new Peer({ initiator: true, trickle: false, stream });

//         newPeer.on("signal", (signalData) => {
//           // console.log("Sending user-offer:", signalData);
//           socket.emit("message", signalData);
//         });

//         newPeer.on("error", (err) => console.error("Peer error:", err));
//         newPeer.on("connect", () => console.log("Peer connected"));

//         socket.on("invigilator-answer", (answer) => {
//           // console.log("Received invigilator-answer:", answer);
//           newPeer.signal(answer);
//         });

//         // Start capturing frames and sending as Base64
//         startBase64Streaming(stream);

//         setPeer(newPeer);
//       } catch (err) {
//         console.error("WebRTC setup failed:", err);
//       }
//     };

//     const startBase64Streaming = (stream: any) => {
//       const video = document.createElement("video");
//       video.srcObject = stream;
//       video.play();

//       const canvas = document.createElement("canvas");
//       const ctx = canvas.getContext("2d");

//       setInterval(() => {
//         canvas.width = video.videoWidth;
//         canvas.height = video.videoHeight;
//         ctx!.drawImage(video, 0, 0, canvas.width, canvas.height);
//         const base64Frame = canvas.toDataURL("image/jpeg"); // Convert frame to Base64
//         // console.log(base64Frame);

//         socket.emit("message", base64Frame); // Send Base64 frame
//       }, 100); // Send every 100ms (adjust based on network conditions)
//     };

//     setupWebRTC();

//     return () => {
//       socket.off("invigilator-answer");
//       if (peer) peer.destroy();
//       if (localStream.current) localStream.current.getTracks().forEach((track) => track.stop());
//     };
//   }, [isConnected]);

//   return (
//     <Box
//       sx={{
//         display: "flex",
//         flexDirection: "column",
//         justifyContent: "center",
//         alignItems: "center",
//         minHeight: "calc(100vh - 64px)",
//         px: { xs: 2, sm: 3, md: 4 },
//       }}
//     >
//       {!isConnected && (
//         <Backdrop open={Boolean(anchorEl)} sx={{ backdropFilter: "blur(5px)", zIndex: 1300 }}>
//           <Popover
//             open={Boolean(anchorEl)}
//             anchorEl={anchorEl}
//             anchorOrigin={{ vertical: "center", horizontal: "center" }}
//             transformOrigin={{ vertical: "center", horizontal: "center" }}
//           >
//             <Box
//               sx={{
//                 p: { xs: 2, sm: 3, md: 4 },
//                 bgcolor: "white",
//                 borderRadius: 2,
//                 textAlign: "center",
//                 maxWidth: { xs: "90vw", sm: "400px" },
//               }}
//             >
//               <Typography variant="h6" sx={{ fontSize: { xs: "1rem", sm: "1.25rem" } }}>
//                 Welcome to the AI Interview
//               </Typography>
//               <Typography color="error" sx={{ fontSize: { xs: "0.875rem", sm: "1rem" } }}>
//                 Please allow microphone and camera access.
//               </Typography>
//               <Button
//                 variant="contained"
//                 color="primary"
//                 onClick={handleStartChat}
//                 sx={{ mt: 2, fontSize: { xs: "0.875rem", sm: "1rem" } }}
//               >
//                 Start Chat
//               </Button>
//             </Box>
//           </Popover>
//         </Backdrop>
//       )}
//       <Box
//         sx={{
//           display: "flex",
//           flexDirection: { xs: "column", md: "row" },
//           gap: { xs: 2, sm: 3, md: 4 },
//           width: "100%",
//           maxWidth: "1200px",
//           justifyContent: "center",
//         }}
//       >
//         <motion.div
//           animate={{ scale: speaking === "user" ? 1.05 : 1 }}
//           style={{
//             padding: "20px",
//             borderRadius: "20px",
//             textAlign: "center",
//             backgroundColor: "#fff",
//             boxShadow: speaking === "user" ? "0 0 20px rgba(0, 255, 0, 0.5)" : "0 0 10px rgba(0,0,0,0.1)",
//             width: "100%",
//           }}
//         >
//           <video
//             autoPlay
//             playsInline
//             muted
//             ref={videoRef}
//             style={{
//               width: "100%",
//               borderRadius: "10px",
//               display: "block",
//             }}
//           />
//           <Typography variant="h6" mt={2} sx={{ fontSize: { xs: "1rem", sm: "1.25rem" } }}>
//             You
//           </Typography>
//         </motion.div>
//         <motion.div
//           animate={{ scale: speaking === "bot" ? 1.01 : 1 }}
//           style={{
//             display: "flex",
//             flexDirection: "column",
//             alignItems: "center",
//             padding: "20px",
//             borderRadius: "20px",
//             textAlign: "center",
//             backgroundColor: "#fff",
//             boxShadow: speaking === "bot" ? "0 0 20px rgba(0, 0, 255, 0.5)" : "0 0 10px rgba(0,0,0,0.1)",
//             width: "100%",
//           }}
//         >
//           <Avatar
//             src="https://i.pravatar.cc/150?img=32"
//             sx={{ width: { xs: 80, sm: 100 }, height: { xs: 80, sm: 100 }, margin: "auto" }}
//           />
//           <Typography variant="h6" mt={2} sx={{ fontSize: { xs: "1rem", sm: "1.25rem" } }}>
//             AI Interviewer
//           </Typography>
//         </motion.div>
//       </Box>
//     </Box>
//   );
// };

// export default ChatWindow;

import { useState, useEffect, useRef } from "react";
import { Box, Avatar, Typography, Button, Popover, Backdrop } from "@mui/material";
import { motion } from "framer-motion";
import io from "socket.io-client";
import Peer from "simple-peer";

const socket = io("http://localhost:5000", { autoConnect: false });

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
  const videoRef = useRef<HTMLVideoElement>(null);
  const resumeAnchorEl = useRef<HTMLElement | null>(null); // Anchor for resume popup
  const permissionsAnchorEl = useRef<HTMLElement | null>(null); // Anchor for permissions popup

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
      setShowPermissionsPopup(false);
      socket.connect();
      setIsConnected(true);
    } catch (error) {
      console.error("Failed to connect to socket:", error);
    }
  };

  // Audio handling for bot responses
  useEffect(() => {
    if (!isConnected) return;

    const handleBotAudio = (data: { audioBase64: string }) => {
      const audio = new Audio(`data:audio/mp3;base64,${data.audioBase64}`);
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
          socket.emit("user-audio", { base64Audio });
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

  const blobToBase64 = (blob: Blob): Promise<string> => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.readAsDataURL(blob);
    });
  };

  // Video streaming setup
  useEffect(() => {
    if (!isConnected) return;

    const setupWebRTC = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
        localStream.current = stream;
        if (videoRef.current) videoRef.current.srcObject = stream;

        const newPeer = new Peer({ initiator: true, trickle: false, stream });

        newPeer.on("signal", (signalData) => {
          socket.emit("message", signalData);
        });

        newPeer.on("error", (err) => console.error("Peer error:", err));
        newPeer.on("connect", () => console.log("Peer connected"));

        socket.on("invigilator-answer", (answer) => {
          newPeer.signal(answer);
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
                Please allow microphone and camera access.
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
        <Box
          sx={{
            display: "flex",
            flexDirection: { xs: "column", md: "row" },
            gap: { xs: 2, sm: 3, md: 4 },
            width: "100%",
            maxWidth: "1200px",
            justifyContent: "center",
          }}
        >
          <motion.div
            animate={{ scale: speaking === "user" ? 1.05 : 1 }}
            style={{
              padding: "20px",
              borderRadius: "20px",
              textAlign: "center",
              backgroundColor: "#fff",
              boxShadow: speaking === "user" ? "0 0 20px rgba(0, 255, 0, 0.5)" : "0 0 10px rgba(0,0,0,0.1)",
              width: "100%",
            }}
          >
            <video
              autoPlay
              playsInline
              muted
              ref={videoRef}
              style={{
                width: "100%",
                borderRadius: "10px",
                display: "block",
              }}
            />
            <Typography variant="h6" mt={2} sx={{ fontSize: { xs: "1rem", sm: "1.25rem" } }}>
              You
            </Typography>
          </motion.div>
          <motion.div
            animate={{ scale: speaking === "bot" ? 1.01 : 1 }}
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              padding: "20px",
              borderRadius: "20px",
              textAlign: "center",
              backgroundColor: "#fff",
              boxShadow: speaking === "bot" ? "0 0 20px rgba(0, 0, 255, 0.5)" : "0 0 10px rgba(0,0,0,0.1)",
              width: "100%",
            }}
          >
            <Avatar
              src="https://i.pravatar.cc/150?img=32"
              sx={{ width: { xs: 80, sm: 100 }, height: { xs: 80, sm: 100 }, margin: "auto" }}
            />
            <Typography variant="h6" mt={2} sx={{ fontSize: { xs: "1rem", sm: "1.25rem" } }}>
              AI Interviewer
            </Typography>
          </motion.div>
        </Box>
      )}
    </Box>
  );
};

export default ChatWindow;