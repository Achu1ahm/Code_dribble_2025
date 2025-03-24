import React from 'react';
import { Box, IconButton } from '@mui/material';
import { Mic, MicOff } from '@mui/icons-material';
import { keyframes } from '@mui/system';

const pulseAnimation = keyframes`
  0% {
    transform: scale(1);
    box-shadow: 0 4px 8px rgba(0, 128, 0, 0.5);
  }
  
  70% {
    transform: scale(1.05);
    box-shadow: 0 0 0 10px rgba(220, 0, 0, 0);
  }
  
  100% {
    transform: scale(1);
    box-shadow: 0 0 0 0 rgba(220, 0, 0, 0);
  }
`;

const AnimatedMicButton = ({ uploadOpen, micOn, setMicOn }:{
    uploadOpen : boolean,
    micOn: boolean,
    setMicOn: (state:boolean)=>void
}) => {

  
  return (
    <Box 
      sx={{ 
        position: "absolute", 
        bottom: 20, 
        left: "50%", 
        transform: "translateX(-50%)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center"
      }}
    >
      <IconButton
        aria-label={micOn ? "Mute microphone" : "Turn on microphone"}
        disabled={uploadOpen}
        onClick={() => setMicOn(!micOn)}
        sx={{
          width: 64,
          height: 64,
          backgroundColor: !micOn ? 'error.main' : 'success.main',
          color: 'white',
          transition: 'all 0.3s ease-in-out',
          '&:hover': {
            backgroundColor: !micOn ? 'error.dark' : 'success.dark',
            transform: 'scale(1.05)',
          },
          animation: micOn ? `${pulseAnimation} 2s infinite` : 'none',
          boxShadow: !micOn 
            ? '0 0 10px rgba(220, 0, 0, 0.7)' 
            : '0 4px 8px rgba(0, 128, 0, 0.5)',
        }}
      >
        {!micOn ? <MicOff fontSize="large" /> : <Mic fontSize="large" />}
      </IconButton>
      
    </Box>
  );
};

export default AnimatedMicButton;