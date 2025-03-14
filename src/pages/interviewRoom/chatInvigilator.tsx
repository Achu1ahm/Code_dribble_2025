import { useState, useEffect, useRef } from "react";
import { Box, Typography, Avatar, CircularProgress } from "@mui/material";
import { motion } from "framer-motion";
import io from "socket.io-client";
import Peer from "simple-peer";

// Create the socket outside the component to avoid recreating it on re-renders
const socket = io("http://localhost:5000", { autoConnect: false });

const ListenerWindow = () => {
  const [speaking, setSpeaking] = useState<"user" | "bot" | null>(null);
  const [connected, setConnected] = useState(false);
  const [loading, setLoading] = useState(true);
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
  const [peer, setPeer] = useState<Peer.Instance | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const audioQueue = useRef<Array<{ data: any, speaker: "user" | "bot" }>>([]);
  const isPlayingAudio = useRef<boolean>(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Process audio queue sequentially
  const processAudioQueue = () => {
    if (audioQueue.current.length === 0 || isPlayingAudio.current) return;
    
    isPlayingAudio.current = true;
    const nextItem = audioQueue.current.shift();
    if (!nextItem) {
      isPlayingAudio.current = false;
      return;
    }
    
    const { data, speaker } = nextItem;
    console.log(`Playing queued ${speaker} audio`);
    
    // Create appropriate audio source
    let audioSrc;
    if (speaker === "user") {
      // User audio comes as base64 webm
      if (data.base64Audio) {
        audioSrc = data.base64Audio;
        if (!audioSrc.startsWith("data:audio/")) {
          audioSrc = `data:audio/webm;base64,${audioSrc.split(",").pop()}`;
        }
      } else if (data.audioBase64) {
        audioSrc = data.audioBase64;
        if (!audioSrc.startsWith("data:audio/")) {
          audioSrc = `data:audio/webm;base64,${audioSrc}`;
        }
      }
    } else {
      // Bot audio comes as base64 mp3
      audioSrc = `data:audio/mp3;base64,${data.audioBase64}`;
    }
    
    if (!audioSrc) {
      console.error("Invalid audio source for", speaker);
      isPlayingAudio.current = false;
      setTimeout(processAudioQueue, 100);
      return;
    }
    
    // Create and play audio
    const audio = new Audio(audioSrc);
    audioRef.current = audio;
      
    audio.onplay = () => {
      console.log(`${speaker} audio is now playing`);
      setSpeaking(speaker);
    };
    
    audio.onended = () => {
      console.log(`${speaker} audio ended`);
      setSpeaking(null);
      isPlayingAudio.current = false;
      audioRef.current = null;
      // Process next item in queue after a short delay
      setTimeout(processAudioQueue, 300);
    };
    
    audio.onerror = (err) => {
      console.error(`${speaker} audio error:`, err);
      setSpeaking(null);
      isPlayingAudio.current = false;
      audioRef.current = null;
      setTimeout(processAudioQueue, 300);
    };
    
    // Play with volume boosted
    audio.volume = 1.0;
    audio.play().catch((err) => {
      console.error(`${speaker} audio playback failed:`, err);
      isPlayingAudio.current = false;
      audioRef.current = null;
      setTimeout(processAudioQueue, 300);
    });
  };

  // Add to queue and process
  const queueAudio = (data: any, speaker: "user" | "bot") => {
    console.log(`Queueing ${speaker} audio:`, data);
    audioQueue.current.push({ data, speaker });
    processAudioQueue();
  };

  useEffect(() => {
    let reconnectInterval: NodeJS.Timeout;
    
    const connectSocket = () => {
      if (socket.connected) return;
      
      console.log("Connecting to server...");
      socket.connect();
    };
    
    connectSocket();
    
    socket.on("connect", () => {
      console.log("Listener connected to server with ID:", socket.id);
      setConnected(true);
      setLoading(false);
      socket.emit("request-offer"); // Request the latest user-offer
      
      // Request all prior conversation history
      socket.emit("request-history");
    });
    
    socket.on("connect_error", (error) => {
      console.error("Socket connection error:", error);
      setConnected(false);
      setLoading(false);
    });
    
    socket.on("disconnect", () => {
      console.log("Socket disconnected");
      setConnected(false);
      // Attempt to reconnect
      clearInterval(reconnectInterval);
      reconnectInterval = setInterval(() => {
        if (!socket.connected) {
          console.log("Attempting to reconnect...");
          socket.connect();
        } else {
          clearInterval(reconnectInterval);
        }
      }, 5000);
    });
    
    // Debug every socket event
    const originalOn = socket.on;
    socket.on = function(event, ...args) {
      console.log(`Registering handler for: ${event}`);
      return originalOn.call(socket, event, ...args);
    };
    
    // Event listeners for audio
    socket.on("bot-audio-listener", (data) => {
      console.log("Received bot-audio-listener:", data);
      queueAudio(data, "bot");
    });
    
    socket.on("user-audio", (data) => {
      console.log("Received user-audio:", data);
      queueAudio(data, "user");
    });
    
    // Event listener for conversation history
    socket.on("conversation-history", (history) => {
      console.log("Received conversation history:", history);
      if (Array.isArray(history)) {
        // Clear existing queue first
        audioQueue.current = [];
        isPlayingAudio.current = false;
        if (audioRef.current) {
          audioRef.current.pause();
          audioRef.current = null;
        }
        
        // Queue all historical items
        history.forEach(item => {
          queueAudio(item, item.type);
        });
      }
    });
    
    return () => {
      socket.off("connect");
      socket.off("connect_error");
      socket.off("disconnect");
      socket.off("bot-audio-listener");
      socket.off("user-audio");
      socket.off("conversation-history");
      socket.disconnect();
      clearInterval(reconnectInterval);
      if (peer) peer.destroy();
      if (remoteStream) remoteStream.getTracks().forEach((track) => track.stop());
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    const handlePeerSetup = (offer: any) => {
      console.log("Received user-offer:", offer);
      
      try {
        if (peer) {
          peer.destroy(); // Destroy existing peer if any
          setPeer(null);
        }
        
        const newPeer = new Peer({ 
          initiator: false, 
          trickle: false,
          config: {
            iceServers: [
              { urls: 'stun:stun.l.google.com:19302' },
              { urls: 'stun:global.stun.twilio.com:3478' }
            ]
          }
        });
        
        newPeer.on("signal", (signalData) => {
          console.log("Sending invigilator-answer");
          socket.emit("invigilator-answer", signalData);
        });
        
        newPeer.on("stream", (stream) => {
          console.log("Received remote stream");
          setRemoteStream(stream);
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
            videoRef.current.play().catch((err) => console.error("Video playback error:", err));
          }
        });
        
        newPeer.on("error", (err) => console.error("Peer error:", err));
        newPeer.on("connect", () => console.log("Peer connection established"));
        newPeer.on("close", () => console.log("Peer connection closed"));
        
        // Signal with the offer
        newPeer.signal(offer);
        setPeer(newPeer);
      } catch (err) {
        console.error("Error setting up peer:", err);
      }
    };

    socket.on("user-offer", handlePeerSetup);

    // Implement periodic offer request for reliability
    const requestOfferInterval = setInterval(() => {
      if (socket.connected && !peer) {
        console.log("Requesting user offer (periodic)");
        socket.emit("request-offer");
      }
    }, 10000);

    return () => {
      socket.off("user-offer");
      clearInterval(requestOfferInterval);
      if (peer) peer.destroy();
    };
  }, [peer]);

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        minHeight: "80vh",
        bgcolor: "#333",
        padding: { xs: 2, sm: 3, md: 4 },
        width: "100%",
      }}
    >
      <Typography
        variant="h5"
        fontWeight="bold"
        sx={{
          marginTop: { xs: 2, sm: 3, md: 4 },
          color: "white",
          fontSize: { xs: "1.25rem", sm: "1.5rem", md: "1.75rem" },
          textAlign: "center",
        }}
      >
        Monitoring Dashboard
      </Typography>
      
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <CircularProgress color="primary" />
        </Box>
      ) : !connected ? (
        <Typography sx={{ color: 'white', mt: 4 }}>
          Disconnected from server. Attempting to reconnect...
        </Typography>
      ) : (
        <Box
          sx={{
            display: "flex",
            flexDirection: { xs: "column", md: "row" },
            gap: { xs: 2, sm: 3, md: 4 },
            mt: { xs: 2, sm: 3, md: 4 },
            width: "100%",
            maxWidth: "1200px",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <motion.div
            animate={{ scale: speaking === "user" ? 1.1 : 1 }}
            transition={{ duration: 0.3 }}
            style={{
              padding: "10px",
              borderRadius: "20px",
              textAlign: "center",
              backgroundColor: "#fff",
              boxShadow: speaking === "user" ? "0 0 20px rgba(0, 255, 0, 0.5)" : "0 0 10px rgba(0,0,0,0.1)",
              width: "100%",
              maxWidth: "300px",
              position: "relative",
            }}
          >
            {speaking === "user" && (
              <Box 
                sx={{ 
                  position: 'absolute',
                  top: -5,
                  right: -5,
                  bgcolor: 'green',
                  color: 'white',
                  borderRadius: '50%',
                  width: 24,
                  height: 24,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '0.75rem',
                  fontWeight: 'bold',
                }}
              >
                🔊
              </Box>
            )}
            <video
              autoPlay
              playsInline
              muted
              ref={videoRef}
              style={{
                width: "100%",
                maxWidth: "300px",
                borderRadius: "10px",
                height: "auto",
                backgroundColor: "#eee"
              }}
            />
            <Typography
              variant="h6"
              sx={{ mt: 2, fontSize: { xs: "1rem", sm: "1.25rem" } }}
            >
              User
            </Typography>
          </motion.div>
          <motion.div
            animate={{ scale: speaking === "bot" ? 1.1 : 1 }}
            transition={{ duration: 0.3 }}
            style={{
              padding: "clamp(20px, 4vw, 35px)",
              borderRadius: "20px",
              textAlign: "center",
              backgroundColor: "#fff",
              boxShadow: speaking === "bot" ? "0 0 20px rgba(0, 0, 255, 0.5)" : "0 0 10px rgba(0,0,0,0.1)",
              width: "100%",
              maxWidth: "300px",
              position: "relative",
            }}
          >
            {speaking === "bot" && (
              <Box 
                sx={{ 
                  position: 'absolute',
                  top: -5,
                  right: -5,
                  bgcolor: 'blue',
                  color: 'white',
                  borderRadius: '50%',
                  width: 24,
                  height: 24,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '0.75rem',
                  fontWeight: 'bold',
                }}
              >
                🔊
              </Box>
            )}
            <Avatar
              src="https://i.pravatar.cc/150?img=32"
              sx={{ width: { xs: 80, sm: 100 }, height: { xs: 80, sm: 100 }, margin: "auto" }}
            />
            <Typography
              variant="h6"
              sx={{ mt: 2, fontSize: { xs: "1rem", sm: "1.25rem" } }}
            >
              AI Interviewer
            </Typography>
          </motion.div>
        </Box>
      )}
      
      {connected && (
        <Typography sx={{ color: '#4CAF50', mt: 2, fontSize: '0.875rem' }}>
          Connected to interview session
        </Typography>
      )}
    </Box>
  );
};

export default ListenerWindow;