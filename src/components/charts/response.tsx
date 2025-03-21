import React from "react";
import { Card, CardContent, Typography, Box } from "@mui/material";
import { Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from "recharts";


// Colors for the Pie Chart
const COLORS = ["#0088FE", "#FFBB28"];

const AnalyticsCharts = ({data}:any) => {
  // Data for Pie Chart (Repeat vs. No Repeat)
  const repeatData = [
    { name: "Repeated Questions", value: data.times_repeated},
    { name: "Non-Repeated Questions", value: 10 },
  ];

  return (
    <Box sx={{ width:"100%" }}>
      
      {/* Response Time Line Chart */}
      {/* <Card sx={{ p: 2, borderRadius: 3, boxShadow: 3 }}>
        <CardContent>
          <Typography variant="h5" component="h2" align="center" fontWeight="bold" sx={{ mb: 4 }}>
            Response Time Trend
          </Typography>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={data}>
              <XAxis dataKey="id" tick={{ fontSize: 14 }} />
              <YAxis tick={{ fontSize: 14 }} />
              <Tooltip />
              <Line type="monotone" dataKey="response_time" stroke="#3498db" strokeWidth={3} dot={{ r: 6 }} />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card> */}

      {/* Repeat Question Pie Chart */}
      <Card sx={{ p: 2, borderRadius: 3, boxShadow: 3 }}>
        <CardContent>
          <Typography variant="h5" component="h2" align="center" fontWeight="bold" sx={{ mb: 4 }}>
            Repeated vs. Non-Repeated Questions
          </Typography>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={repeatData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={110}
                // label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                stroke="#fff"
                strokeWidth={2}
              >
                {repeatData.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

    </Box>
  );
};

export default AnalyticsCharts;
