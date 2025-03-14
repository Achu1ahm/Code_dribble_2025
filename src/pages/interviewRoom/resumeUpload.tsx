// import { useEffect, useState } from "react";
// import { Box, Button, CircularProgress, Slide, Typography } from "@mui/material";

// const ResumeUpload = ({ open, onClose }: { open: boolean; onClose: () => void }) => {
//   const [status, setStatus] = useState<"idle" | "uploading" | "analyzing">("idle");
//   const [selectedFile, setSelectedFile] = useState<File | null>(null);

//   useEffect(() => {
//     if (open && selectedFile) {
//       setStatus("uploading");

//       setTimeout(() => setStatus("analyzing"), 2000);
//       setTimeout(() => {
//         setStatus("idle");
//         setSelectedFile(null);
//         onClose();
//       }, 4000);
//     }
//   }, [open, selectedFile, onClose]);

//   const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
//     const file = event.target.files?.[0];
//     if (file) {
//       setSelectedFile(file);
//     }
//   };

//   return (
//     <Slide direction="left" in={open} mountOnEnter unmountOnExit>
//       <Box
//         sx={{
//           position: "fixed",
//           top: 0,
//           right: 0,
//           width: {xs:"180px",md:"320px"},
//           height: "100vh",
//           backgroundColor: "white",
//           boxShadow: "-3px 0 10px rgba(0,0,0,0.2)",
//           padding: 3,
//           display: "flex",
//           flexDirection: "column",
//           justifyContent: "center",
//           alignItems: "center",
//         }}
//       >
//         {status === "idle" ? (
//           <>
//             <Typography variant="h6" fontWeight="bold" mb={2}>
//               Upload Your Resume
//             </Typography>
//             <input
//               type="file"
//               accept=".pdf,.doc,.docx"
//               onChange={handleFileChange}
//               style={{ display: "none" }}
//               id="resume-upload"
//             />
//             <label htmlFor="resume-upload">
//               <Button variant="contained" component="span" sx={{backgroundColor:"#000"}}>
//                 Choose File
//               </Button>
//             </label>
//             {selectedFile && (
//               <Typography variant="body2" color="textSecondary" mt={1}>
//                 {selectedFile.name}
//               </Typography>
//             )}
//           </>
//         ) : (
//           <>
//             <Typography variant="h6" fontWeight="bold" mb={2}>
//               {status === "uploading" ? "Uploading..." : "Analyzing..."}
//             </Typography>
//             <CircularProgress color="success" />
//           </>
//         )}
//       </Box>
//     </Slide>
//   );
// };

// export default ResumeUpload;

import { useEffect, useState } from "react";
import { Box, Button, CircularProgress, Slide, Typography } from "@mui/material";
import axios from "axios";

const ResumeUpload = ({ open, onClose, setShowPermissionsPopup }: { open: boolean; onClose: () => void; setShowPermissionsPopup: (state:boolean) => void }) => {
  const [status, setStatus] = useState<"idle" | "uploading" | "analyzing">("idle");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  useEffect(() => {
    if (open && selectedFile) {
      handleUpload();
    }
  }, [open, selectedFile]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    setStatus("uploading");

    try {
      const base64 = await convertFileToBase64(selectedFile);
      await uploadResume(base64, selectedFile.type);

      setStatus("analyzing");

        setStatus("idle");
        setSelectedFile(null);
        onClose();
        setShowPermissionsPopup(true)

    } catch (error) {
      console.error("Upload failed", error);
      setStatus("idle");
    }
  };

  const convertFileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (error) => reject(error);
    });
  };

  const uploadResume = async (base64: string, fileType: string) => {
    await axios.post("http://localhost:8000/upload/", {
      file: base64,
      type: fileType,
    });
  };

  return (
    <Slide direction="left" in={open} mountOnEnter unmountOnExit>
      <Box
        sx={{
          position: "fixed",
          top: 0,
          right: 0,
          width: { xs: "180px", md: "320px" },
          height: "100vh",
          backgroundColor: "white",
          boxShadow: "-3px 0 10px rgba(0,0,0,0.2)",
          padding: 3,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        {status === "idle" ? (
          <>
            <Typography variant="h6" fontWeight="bold" mb={2}>
              Upload Your Resume
            </Typography>
            <input
              type="file"
              accept=".pdf,.doc,.docx"
              onChange={handleFileChange}
              style={{ display: "none" }}
              id="resume-upload"
            />
            <label htmlFor="resume-upload">
              <Button variant="contained" component="span" sx={{ backgroundColor: "#000" }}>
                Choose File
              </Button>
            </label>
            {selectedFile && (
              <Typography variant="body2" color="textSecondary" mt={1}>
                {selectedFile.name}
              </Typography>
            )}
          </>
        ) : (
          <>
            <Typography variant="h6" fontWeight="bold" mb={2}>
              {status === "uploading" ? "Uploading..." : "Analyzing..."}
            </Typography>
            <CircularProgress color="success" />
          </>
        )}
      </Box>
    </Slide>
  );
};

export default ResumeUpload;
