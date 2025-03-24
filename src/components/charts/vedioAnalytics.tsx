import React, { useState } from 'react';
import { 
  Box, 
  Card, 
  CardContent, 
  Typography, 
  Grid, 
  useTheme
} from '@mui/material';
import {  
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';

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

interface VideoAnalysisDashboardProps {
    data: VideoAnalyticsData;
  }

const VideoAnalysisDashboard: React.FC<VideoAnalysisDashboardProps> = ({data}) => {
  const theme = useTheme();
  const [tabValue, setTabValue] = useState(0);

  // Calculate remaining frames correctly
  const calculatedRemainingFrames = data["Total Frames"] - data["Total Looking Away"] - data["Total Looking at Interviewer"];

  // Prepare data for the pie chart
  const pieData = [
    { name: 'Looking Away', value: data["Total Looking Away"] },
    { name: 'Looking at Interviewer', value: data["Total Looking at Interviewer"] },
    { name: 'Other', value:Math.max(0, calculatedRemainingFrames) }
  ];

  const COLORS = [theme.palette.error.main, theme.palette.success.main, theme.palette.grey[400]];


  return (
    <Box sx={{ maxWidth: 1200,borderRadius:4, boxShadow: 3, padding:2, background:"white",minHeight:"100vh" }}>
      <Typography variant="h5" component="h2" align="center" fontWeight="bold" gutterBottom sx={{ mb:8,mt:5 }}>
        Interview Gaze Analysis Dashboard
      </Typography>
      
      {/* Summary Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ height: '100%', bgcolor: theme.palette.primary.light, borderRadius:3 }}>
            <CardContent>
              <Typography variant="h6" color="textSecondary">
                Total Frames
              </Typography>
              <Typography variant="h4">
                {data["Total Frames"]}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ height: '100%', bgcolor: theme.palette.error.light, borderRadius:3 }}>
            <CardContent>
              <Typography variant="h6" color="textSecondary">
                Looking Away
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Typography variant="h4" sx={{ mr: 1 }}>
                {((data["Total Looking Away"] / data["Total Frames"]) * 100).toFixed(1)}%
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ height: '100%', bgcolor: theme.palette.success.light, borderRadius:3 }}>
            <CardContent>
              <Typography variant="h6" color="textSecondary">
                Looking at Interviewer
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Typography variant="h4" sx={{ mr: 1 }}>
                {((data["Total Looking at Interviewer"] / data["Total Frames"]) * 100).toFixed(1)}%
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ height: '100%', bgcolor: theme.palette.warning.light, borderRadius:3 }}>
            <CardContent>
              <Typography variant="h6" color="textSecondary">
                Max Consecutive Off-Focus
              </Typography>
              <Typography variant="h4">
                {data["Max Consecutive Off-Focus Frames"]}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Box sx={{ p: 2, height: 450 }}>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                labelLine={false}
                outerRadius={140}
                fill="#8884d8"
                dataKey="value"
                label={({ name, value }) => `${name}: ${((value / data["Total Frames"]) * 100).toFixed(1)}%`}
              >
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
      </Box>
    </Box>
  );
};

export default VideoAnalysisDashboard;