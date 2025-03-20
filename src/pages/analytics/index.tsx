import { useEffect, useState} from "react";
import AnalyticsCharts from "../../components/charts/response";
import CircularScoreDisplay from "../../components/score/score";
import { Box } from "@mui/material";

type FeedbackData = {
    scores: { technical_skills: number; communication_skills: number; attitude_professionalism: number };
    final_rating: number;
    recommendation_status: string;
  };

  
const Analytics = () => {
    const [data, setData] = useState<any>(null);

    useEffect(() => {
        console.log("who let the dogs out");
        
      const fetchData = async () => {
        try {
          const response = await fetch("http://localhost:8000/send-feedback");
          if (!response.ok) {
            throw new Error("Network response was not ok");
          }
          const result = await response.json();
          console.log();
          
          setData(result.content);
        } catch (error) {
          console.error("Error fetching data:", error);
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
        // <>
        //     {!data ? (
        //         <Box sx={{ textAlign: "center", padding: 2 }}>Loading...</Box>
        //     ) : (
                <>
                    {/* <Box
                        sx={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            padding: 1,
                            backgroundColor: data!.recommendation_status === "Recommended" ? "success.light" : "error.light",
                            color: "white",
                            borderRadius: 1,
                            fontWeight: "bold"
                        }}
                    >
                        {data.recommendation_status}
                    </Box> */}
                    {/* <Box
                        sx={{
                            display: "flex",
                            flexDirection: "row",
                            alignItems: "start",
                            justifyContent: "center",
                            height: "100%",
                            pt: 4
                        }}
                    >
                        <CircularScoreDisplay data={data} />
                    </Box>
                    <Box
                        sx={{
                            display: "flex",
                            flexDirection: "row",
                            alignItems: "start",
                            justifyContent: "center",
                            height: "100%",
                        }}
                    >
                        <AnalyticsCharts data={data} />
                    </Box> */}
                </>
    );
    
}

export default Analytics;