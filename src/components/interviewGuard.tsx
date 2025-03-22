import { useEffect } from "react";
import Swal from "sweetalert2";

const InterviewGuard = ({ isConnected, onCancel }: { isConnected: boolean; onCancel: () => void }) => {
  useEffect(() => {
    const handleInterviewCancel = (reason: string) => {
      if (isConnected) {
        onCancel();
        Swal.fire({
          title: "Interview Cancelled!",
          text: `Your interview was cancelled due to ${reason}.`,
          icon: "warning",
        }).then(() => (window.location.href = "/"));
      }
    };

    const handleFullscreenChange = () => {
      if (!document.fullscreenElement && isConnected) {
        handleInterviewCancel("exiting fullscreen mode");
      }
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);
    document.addEventListener("webkitfullscreenchange", handleFullscreenChange);
    document.addEventListener("mozfullscreenchange", handleFullscreenChange);
    document.addEventListener("MSFullscreenChange", handleFullscreenChange);

    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
      document.removeEventListener("webkitfullscreenchange", handleFullscreenChange);
      document.removeEventListener("mozfullscreenchange", handleFullscreenChange);
      document.removeEventListener("MSFullscreenChange", handleFullscreenChange);
    };
  }, [isConnected, onCancel]);

  return null;
};

export default InterviewGuard;