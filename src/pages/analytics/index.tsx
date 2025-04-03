import { useEffect, useState } from "react";
import AnalyticsCharts from "../../components/charts/response";
import CircularScoreDisplay from "../../components/score/score";
import { Box, Button, Dialog, DialogContent, DialogTitle, Typography } from "@mui/material";
import VideoAnalysisDashboard from "../../components/charts/vedioAnalytics";

type FeedbackData = {
    times_repeated: number,
    scores: { technical_skills: number; communication_skills: number; attitude_professionalism: number };
    final_rating: number;
    recommendation_status: string;
};

type IntervalStat = {
    Interval: number;
    "Looking Away": number;
    "Looking at Interviewer": number;
};

type VideoAnalyticsData = {
    "Interval Stats": IntervalStat[];
    "Max Consecutive Off-Focus Frames": number;
    "Total Frames": number;
    "Total Looking Away": number;
    "Total Looking at Interviewer": number;
    "remaining_frames": number;
    "total_away_percentage": number;
    "total_gaze_percentage": number;
};


const Analytics = () => {
    const [audiodata, setAudioData] = useState<any>(null);
    const [videoAnalyticsData, setVideoAnalyticsData] = useState<VideoAnalyticsData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const [showJustification, setShowJustification] = useState(false);

    useEffect(() => {

        const fetchData = async () => {
            try {
                const [feedbackResponse, videoAnalyticsResponse] = await Promise.all([
                    fetch("http://localhost:8000/send-feedback"),
                    fetch("http://localhost:8000/video-analysis")
                ]);

                if (!feedbackResponse.ok || !videoAnalyticsResponse.ok) {
                    throw new Error("One or more requests failed");
                }

                const feedbackResult = await feedbackResponse.json();
                const videoAnalyticsResult = await videoAnalyticsResponse.json();

                setVideoAnalyticsData(videoAnalyticsResult);
                setAudioData(feedbackResult);
            } catch (error) {
                console.error("Error fetching data:", error);
                setError("Error fetching data");
            }
            finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);


    // const data = {
    //     "questions": [
    //         {
    //             "question": "Hello, Anita. How are you doing today?",
    //             "response": "Hi, I am doing great. How are you?",
    //             "response_time": 5,
    //             "repeats": 0
    //         },
    //         {
    //             "question": "Could you please introduce yourself and talk about your education and experience?",
    //             "response": "My name is Rahul, I am from Madurai. I studied in PSME College of Engineering Technology in Electronics and Communication. After that I joined a data science company. I have 6 years of experience in that. I have worked in NLP, Machine Learning, Chatbot, Computer Vision and I am currently working in Gen.A. So this is about me.",
    //             "response_time": 10,
    //             "repeats": 0
    //         },
    //         {
    //             "question": "Can you tell me more about the NLP-based document classification system you designed at Wipro Technologies? Specifically, what techniques and tools did you use, and what challenges did you face during the project?",
    //             "response": "I don't understand. Can you repeat the question?",
    //             "response_time": 5,
    //             "repeats": 1
    //         },
    //         {
    //             "question": "Can you tell me more about the NLP-based document classification system you designed at Wipro Technologies? Specifically, what techniques and tools did you use, and what challenges did you face during the project?",
    //             "response": "I didn't work that hard.",
    //             "response_time": 5,
    //             "repeats": 0
    //         },
    //         {
    //             "question": "It seems like you are not able to provide details about the NLP-based document classification system you mentioned in your resume. This raises concerns about the authenticity of your experience. Can you explain why you included this project in your resume if you cannot discuss it in detail?",
    //             "response": "I mean, I have worked but I don't remember now.",
    //             "response_time": 5,
    //             "repeats": 0
    //         },
    //         {
    //             "question": "Can you explain how you integrated Spark with machine learning workflows to handle large-scale datasets efficiently at Cognizant? What specific challenges did you encounter, and how did you overcome them?",
    //             "response": "and other sites.",
    //             "response_time": 5,
    //             "repeats": 0
    //         }
    //     ],
    //     "scores": {
    //         "technical_skills": 2,
    //         "communication_skills": 3,
    //         "attitude_professionalism": 4
    //     },
    //     "final_rating": 3,
    //     "recommendation_status": "Not Recommended"
    // };



    return (
        <>
            {loading ? (
                <Box sx={{ textAlign: "center", padding: 2 }}>Loading...</Box>
            ) : (
                <>
                    <Box
                        sx={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            padding: 1,
                            backgroundColor: audiodata!.report.recommendation_status === "Recommended" ? "success.light" : "error.light",
                            color: "white",
                            borderRadius: 1,
                            fontWeight: "bold"
                        }}
                    >
                        {audiodata!.report.recommendation_status}
                        <Button
                            variant="outlined"
                            size="small"
                            color="inherit"
                            sx={{ ml: 2 }}
                            onClick={() => setShowJustification(true)} // Open dialog
                        >
                            Show Details
                        </Button>
                    </Box>
                    {/* Justification Dialog */}
                    <Dialog open={showJustification} onClose={() => setShowJustification(false)} fullWidth maxWidth="sm">
                        <DialogTitle>Justification</DialogTitle>
                        <DialogContent>
                            {audiodata?.report.justification?.split('. ').map((sentence:any, index:number) => (
                                <Typography key={index} variant="body1" sx={{ mb: 1 }}>
                                    • {sentence}.
                                </Typography>
                            ))}
                        </DialogContent>
                    </Dialog>
                    <Box
                        sx={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            flexDirection: "row",
                            padding: 1,
                            pt: 4,
                            gap: 4
                        }} >
                        <Box
                            sx={{
                                display: "flex",
                                flexDirection: "column",
                                alignItems: "start",
                                justifyContent: "center",
                                height: "100%",
                                gap: 2
                            }}
                        >

                            <CircularScoreDisplay data={audiodata} />
                            <AnalyticsCharts data={audiodata} />

                        </Box>
                        <Box
                            sx={{
                                display: "flex",
                                flexDirection: "row",
                                alignItems: "start",
                                justifyContent: "start",
                                height: "100%",
                            }}
                        >
                            <VideoAnalysisDashboard data={videoAnalyticsData!} />
                        </Box>
                    </Box>
                </>
            )}
        </>
    );

}

export default Analytics;