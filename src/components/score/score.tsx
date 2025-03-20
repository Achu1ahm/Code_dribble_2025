import {
    Box,
    Card,
    CardContent,
    CardHeader,
    Typography,
    Grid
} from '@mui/material';
import { formatName, getScoreColor, calculateStrokeDasharray } from '../../utils/score';

const CircularScoreDisplay = ({ data }: any) => {
    // Transform the object format to array format for rendering
    const scoresArray = Object.entries(data?.scores).map(([key, value]) => ({
        name: formatName(key),
        score: value
    }));


    return (
        <Card sx={{ width: '100%', maxWidth: '700px', background:"white", borderRadius:4 }}>
            <CardHeader
                title={
                    <Typography variant="h5" component="h2" align="center" fontWeight="bold">
                        Performance Scores
                    </Typography>
                }
                subheader={
                    <Typography variant="subtitle2" align="center" color="text.secondary">
                        All scores out of 10
                    </Typography>
                }
                sx={{ pb: 2 }}
            />
            <CardContent>
                <Grid container direction="column" spacing={4}>
                    <Grid item md={12}>
                    <Box sx={{
                            display:"flex",
                            flexDirection:"row",
                            alignItems:"center",
                            justifyContent:"center",
                            gap:2,
                            py:1
                            
                        }}>
                             <Typography variant="h6" component="span" sx={{ mt: 2, fontWeight: 600, textAlign: 'center' }}>
                                Overall Rating
                            </Typography>
                            <Box sx={{ position: 'relative', width: 150, height: 150 }}>
                                {/* SVG for circular progress */}
                                <svg width="100%" height="100%" viewBox="0 0 100 100">
                                    <circle
                                        cx="50"
                                        cy="50"
                                        r="45"
                                        fill="none"
                                        stroke="#e0e0e0"
                                        strokeWidth="10"
                                    />
                                    {/* Foreground circle - the actual progress */}
                                    <circle
                                        cx="50"
                                        cy="50"
                                        r="45"
                                        fill="none"
                                        stroke={getScoreColor(data.final_rating)}
                                        strokeWidth="10"
                                        strokeLinecap="round"
                                        strokeDasharray={calculateStrokeDasharray(data.final_rating)}
                                        strokeDashoffset="0"
                                        transform="rotate(-90 50 50)"
                                    />
                                </svg>
                                {/* Score text in the middle */}
                                <Box
                                    sx={{
                                        position: 'absolute',
                                        top: 0,
                                        left: 0,
                                        bottom: 0,
                                        right: 0,
                                        display: 'flex',
                                        flexDirection: 'column',
                                        justifyContent: 'center',
                                        alignItems: 'center'
                                    }}
                                >
                                    <Typography variant="h3" component="span" fontWeight="bold">
                                        {data.final_rating}
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary">
                                        /10
                                    </Typography>
                                </Box>
                            </Box>
                        </Box>
                    </Grid>
                    <Grid item md={12}>
                        <Box sx={{ display: "flex", flexDirection: "row",gap:4,justifyContent:"center",py:1 }}>
                            {scoresArray.map((item: any, index) => (
                                <Box
                                    key={index}
                                    sx={{
                                        display: 'flex',
                                        flexDirection: "column",
                                        alignItems: 'center',
                                        py: 3,
                                    }}
                                >
                                    <Box sx={{ position: 'relative', width: 100, height: 100, flexShrink: 0 }}>
                                        {/* SVG for circular progress */}
                                        <svg width="100%" height="100%" viewBox="0 0 100 100">
                                            {/* Background circle */}
                                            <circle
                                                cx="50"
                                                cy="50"
                                                r="40"
                                                fill="none"
                                                stroke="#e0e0e0"
                                                strokeWidth="8"
                                            />
                                            {/* Foreground circle - the actual progress */}
                                            <circle
                                                cx="50"
                                                cy="50"
                                                r="40"
                                                fill="none"
                                                stroke={getScoreColor(item.score)}
                                                strokeWidth="8"
                                                strokeLinecap="round"
                                                strokeDasharray={calculateStrokeDasharray(item.score)}
                                                strokeDashoffset="0"
                                                transform="rotate(-90 50 50)"
                                            />
                                        </svg>
                                        {/* Score text in the middle */}
                                        <Box
                                            sx={{
                                                position: 'absolute',
                                                top: 0,
                                                left: 0,
                                                bottom: 0,
                                                right: 0,
                                                display: 'flex',
                                                flexDirection: 'column',
                                                justifyContent: 'center',
                                                alignItems: 'center'
                                            }}
                                        >
                                            <Typography variant="h5" component="span" fontWeight="bold">
                                                {item.score}
                                            </Typography>
                                            <Typography variant="caption" color="text.secondary">
                                                /10
                                            </Typography>
                                        </Box>
                                    </Box>
                                    <Typography variant="body1" component="span" sx={{ fontWeight: 500 }}>
                                        {item.name}
                                    </Typography>
                                </Box>
                            ))}
                        </Box>
                    </Grid>
                </Grid>
            </CardContent>
        </Card>
    );
};

export default CircularScoreDisplay;


