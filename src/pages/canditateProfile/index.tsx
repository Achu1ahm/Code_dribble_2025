import React, { useState, useRef } from "react";
import { 
  Button, 
  Card, 
  CardContent, 
  Typography, 
  Snackbar, 
  Alert,
  Box,
  Stack,
  Paper,
  Divider,
  LinearProgress,
  IconButton,
  Container
} from "@mui/material";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import InsertDriveFileIcon from "@mui/icons-material/InsertDriveFile";
import PersonIcon from "@mui/icons-material/Person";
import DeleteIcon from "@mui/icons-material/Delete";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import axios from "axios";

const UploadPage: React.FC = () => {
  const [profilePic, setProfilePic] = useState<File | null>(null);
  const [jdPdf, setJdPdf] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [severity, setSeverity] = useState<"success" | "error">("success");
  const [uploading, setUploading] = useState<boolean>(false);
  
  const profileInputRef = useRef<HTMLInputElement>(null);
  const jdInputRef = useRef<HTMLInputElement>(null);

  // Handle file selection
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>, type: "profile_pic" | "jd_pdf") => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile) {
      if (type === "profile_pic") {
        setProfilePic(selectedFile);
        setPreview(URL.createObjectURL(selectedFile)); // Show image preview
      } else if (type === "jd_pdf") {
        setJdPdf(selectedFile);
      }
    }
  };

  // Clear file selection
  const clearFile = (type: "profile_pic" | "jd_pdf") => {
    if (type === "profile_pic") {
      setProfilePic(null);
      setPreview(null);
      if (profileInputRef.current) profileInputRef.current.value = "";
    } else {
      setJdPdf(null);
      if (jdInputRef.current) jdInputRef.current.value = "";
    }
  };

  // Upload both files together
  const uploadFiles = async () => {
    if (!profilePic || !jdPdf) {
      setMessage("Both files are required!");
      setSeverity("error");
      return;
    }

    setUploading(true);
    const formData = new FormData();
    formData.append("profile_pic", profilePic);
    formData.append("jd_pdf", jdPdf);

    try {
      const response = await axios.post("http://localhost:8000/upload-profile", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setMessage(response.data.message);
      setSeverity("success");

      // Reset after success
      setProfilePic(null);
      setJdPdf(null);
      setPreview(null);
      if (profileInputRef.current) profileInputRef.current.value = "";
      if (jdInputRef.current) jdInputRef.current.value = "";
    } catch (error: any) {
      setMessage(error.response?.data?.error || "Upload failed!");
      setSeverity("error");
    } finally {
      setUploading(false);
    }
  };

  return (
    <Container maxWidth="md">
      <Card sx={{ 
        mt: 5, 
        mb: 5, 
        borderRadius: 2, 
        boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
        overflow: "visible" 
      }}>
        <Box 
          sx={{ 
            p: 3, 
            backgroundColor: "primary.main", 
            color: "white",
            borderTopLeftRadius: 8,
            borderTopRightRadius: 8
          }}
        >
          <Typography variant="h5" fontWeight="bold">
            Candidate Profile
          </Typography>
          <Typography variant="subtitle2" sx={{ opacity: 0.8 }}>
            Upload candidate profile picture and job description
          </Typography>
        </Box>
        
        <CardContent sx={{ p: 4 }}>
          <Stack spacing={4}>
            {/* Profile Picture Upload */}
            <Paper 
              elevation={0} 
              sx={{ 
                p: 3, 
                border: "1px solid #e0e0e0", 
                borderRadius: 2,
                backgroundColor: "#fafafa"
              }}
            >
              <Stack direction="row" alignItems="center" spacing={2} mb={2}>
                <PersonIcon color="primary" />
                <Typography variant="h6">Candidate Profile Picture</Typography>
              </Stack>
              
              <Box>
                {!profilePic ? (
                  <Box 
                    sx={{ 
                      border: "2px dashed #ccc", 
                      borderRadius: 2, 
                      p: 3, 
                      textAlign: "center",
                      backgroundColor: "white",
                      cursor: "pointer",
                      "&:hover": { borderColor: "primary.main" }
                    }}
                    onClick={() => profileInputRef.current?.click()}
                  >
                    <input 
                      type="file" 
                      accept="image/png, image/jpeg" 
                      onChange={(e) => handleFileChange(e, "profile_pic")} 
                      style={{ display: "none" }}
                      ref={profileInputRef}
                    />
                    <CloudUploadIcon sx={{ fontSize: 40, color: "primary.main", mb: 1 }} />
                    <Typography>Drag and drop or click to upload</Typography>
                    <Typography variant="caption" sx={{ color: "text.secondary" }}>
                      Supported formats: JPG, PNG, JPEG
                    </Typography>
                  </Box>
                ) : (
                  <Stack direction="row" alignItems="center" spacing={2}>
                    <Box 
                      sx={{ 
                        width: 100, 
                        height: 100, 
                        borderRadius: "50%", 
                        overflow: "hidden",
                        border: "3px solid",
                        borderColor: "primary.light"
                      }}
                    >
                      {preview && <img src={preview} alt="Profile Preview" style={{ width: "100%", height: "100%", objectFit: "cover" }} />}
                    </Box>
                    <Box>
                      <Typography fontWeight="medium" noWrap>
                        {profilePic.name}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {(profilePic.size / 1024).toFixed(2)} KB
                      </Typography>
                      <Box mt={1}>
                        <Button 
                          size="small" 
                          variant="outlined" 
                          color="error"
                          startIcon={<DeleteIcon />}
                          onClick={() => clearFile("profile_pic")}
                        >
                          Remove
                        </Button>
                      </Box>
                    </Box>
                  </Stack>
                )}
              </Box>
            </Paper>

            {/* JD PDF Upload */}
            <Paper 
              elevation={0} 
              sx={{ 
                p: 3, 
                border: "1px solid #e0e0e0", 
                borderRadius: 2,
                backgroundColor: "#fafafa"
              }}
            >
              <Stack direction="row" alignItems="center" spacing={2} mb={2}>
                <InsertDriveFileIcon color="primary" />
                <Typography variant="h6">Job Description PDF</Typography>
              </Stack>
              
              <Box>
                {!jdPdf ? (
                  <Box 
                    sx={{ 
                      border: "2px dashed #ccc", 
                      borderRadius: 2, 
                      p: 3, 
                      textAlign: "center",
                      backgroundColor: "white",
                      cursor: "pointer",
                      "&:hover": { borderColor: "primary.main" }
                    }}
                    onClick={() => jdInputRef.current?.click()}
                  >
                    <input 
                      type="file" 
                      accept="application/pdf" 
                      onChange={(e) => handleFileChange(e, "jd_pdf")} 
                      style={{ display: "none" }}
                      ref={jdInputRef}
                    />
                    <CloudUploadIcon sx={{ fontSize: 40, color: "primary.main", mb: 1 }} />
                    <Typography>Drag and drop or click to upload</Typography>
                    <Typography variant="caption" sx={{ color: "text.secondary" }}>
                      Supported format: PDF
                    </Typography>
                  </Box>
                ) : (
                  <Stack direction="row" alignItems="center" spacing={2}>
                    <Box sx={{ p: 2, bgcolor: "#f5f5f5", borderRadius: 1 }}>
                      <InsertDriveFileIcon color="primary" sx={{ fontSize: 40 }} />
                    </Box>
                    <Box sx={{ flexGrow: 1 }}>
                      <Typography fontWeight="medium" noWrap>
                        {jdPdf.name}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {(jdPdf.size / 1024).toFixed(2)} KB
                      </Typography>
                      <Box mt={1}>
                        <Button 
                          size="small" 
                          variant="outlined" 
                          color="error"
                          startIcon={<DeleteIcon />}
                          onClick={() => clearFile("jd_pdf")}
                        >
                          Remove
                        </Button>
                      </Box>
                    </Box>
                  </Stack>
                )}
              </Box>
            </Paper>
            
            <Divider />
            
            {/* Submit Section */}
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <Typography variant="body2" color="text.secondary">
                "Upload both files to continue"
              </Typography>
              <Button 
                variant="contained" 
                color="primary" 
                size="large"
                onClick={uploadFiles} 
                disabled={!profilePic || !jdPdf || uploading}
                startIcon={uploading ? null : <CheckCircleIcon />}
                sx={{ 
                  px: 4,
                  py: 1,
                  borderRadius: 2,
                  boxShadow: 2
                }}
              >
                {uploading ? "Uploading..." : "Upload Candidate"}
              </Button>
            </Box>
            
            {uploading && (
              <LinearProgress sx={{ mt: 2 }} />
            )}
          </Stack>
        </CardContent>
      </Card>
      
      {/* Snackbar for Feedback */}
      <Snackbar 
        open={!!message} 
        autoHideDuration={5000} 
        onClose={() => setMessage(null)}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert 
          severity={severity} 
          onClose={() => setMessage(null)}
          variant="filled"
          sx={{ width: "100%" }}
        >
          {message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default UploadPage;