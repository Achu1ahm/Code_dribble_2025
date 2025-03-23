// import {
//     Box,
//     Card,
//     CardContent,
//     CardHeader,
//     Typography,
//     Grid,
//     Button,
//     Dialog,
//     DialogTitle,
//     DialogContent,
//     DialogActions,
//     Divider,
//     Paper,
//     IconButton
// } from '@mui/material';
// import { formatName, getScoreColor, calculateStrokeDasharray } from '../../utils/score';
// import { useState } from 'react';
// import CloseIcon from '@mui/icons-material/Close';

// const CircularScoreDisplay = ({ data }: any) => {
//     // State to handle the dialog
//     const [dialogOpen, setDialogOpen] = useState(false);
//     const [selectedCategory, setSelectedCategory] = useState<string>('');

//     // Transform the object format to array format for rendering
//     const scoresArray = Object.entries(data?.scores).map(([key, value]) => ({
//         name: formatName(key),
//         key: key, // Keep the original key for reference
//         score: value
//     }));

//     // Sample detailed data for Technical Skills
//     // In a real implementation, this would come from your data prop
//     const detailedData:any = {
//         'technical_skills': [
//             {
//                 'Question': 'What is RAG?',
//                 'Answer': 'RAG is Retrieval Augmented Generation',
//                 'Coherence': {'Score': 5, 'Justification': 'The response is highly logical, well-structured, and easy to follow.'},
//                 'Relevance': {'Score': 5, 'Justification': 'The answer directly addresses the question with precise and relevant details.'},
//                 'Fluency': {'Score': 5, 'Justification': 'The response is grammatically perfect and highly readable.'},
//                 'Technical Skills': {'Score': 4, 'Justification': 'The answer demonstrates strong technical knowledge but lacks depth.'},
//                 'Communication Skills': {'Score': 5, 'Justification': 'The response is exceptionally clear and concise.'}
//             },
//             // Additional questions could be added here
//         ]
//     };

//     const handleOpenDetails = (categoryKey: string) => {
//         setSelectedCategory(categoryKey);
//         setDialogOpen(true);
//     };

//     const handleCloseDialog = () => {
//         setDialogOpen(false);
//     };

//     const getCategoryData = (categoryKey: string) => {
//         // Convert the category name to snake_case for matching with data keys
//         const formattedKey = categoryKey.toLowerCase().replace(/\s+/g, '_');
//         return detailedData[formattedKey] || [];
//     };

//     return (
//         <Card sx={{ width: '100%', maxWidth: '700px', background:"white", borderRadius:4 }}>
//             <CardHeader
//                 title={
//                     <Typography variant="h5" component="h2" align="center" fontWeight="bold">
//                         Performance Scores
//                     </Typography>
//                 }
//                 subheader={
//                     <Typography variant="subtitle2" align="center" color="text.secondary">
//                         All scores out of 10
//                     </Typography>
//                 }
//                 sx={{ pb: 2 }}
//             />
//             <CardContent>
//                 <Grid container direction="column" spacing={4}>
//                     <Grid item md={12}>
//                     <Box sx={{
//                             display:"flex",
//                             flexDirection:"row",
//                             alignItems:"center",
//                             justifyContent:"center",
//                             gap:2,
//                             py:1
                            
//                         }}>
//                              <Typography variant="h6" component="span" sx={{ mt: 2, fontWeight: 600, textAlign: 'center' }}>
//                                 Overall Rating
//                             </Typography>
//                             <Box sx={{ position: 'relative', width: 150, height: 150 }}>
//                                 {/* SVG for circular progress */}
//                                 <svg width="100%" height="100%" viewBox="0 0 100 100">
//                                     <circle
//                                         cx="50"
//                                         cy="50"
//                                         r="45"
//                                         fill="none"
//                                         stroke="#e0e0e0"
//                                         strokeWidth="10"
//                                     />
//                                     {/* Foreground circle - the actual progress */}
//                                     <circle
//                                         cx="50"
//                                         cy="50"
//                                         r="45"
//                                         fill="none"
//                                         stroke={getScoreColor(data.final_rating)}
//                                         strokeWidth="10"
//                                         strokeLinecap="round"
//                                         strokeDasharray={calculateStrokeDasharray(data.final_rating)}
//                                         strokeDashoffset="0"
//                                         transform="rotate(-90 50 50)"
//                                     />
//                                 </svg>
//                                 {/* Score text in the middle */}
//                                 <Box
//                                     sx={{
//                                         position: 'absolute',
//                                         top: 0,
//                                         left: 0,
//                                         bottom: 0,
//                                         right: 0,
//                                         display: 'flex',
//                                         flexDirection: 'column',
//                                         justifyContent: 'center',
//                                         alignItems: 'center'
//                                     }}
//                                 >
//                                     <Typography variant="h3" component="span" fontWeight="bold">
//                                         {data.final_rating}
//                                     </Typography>
//                                     <Typography variant="body2" color="text.secondary">
//                                         /10
//                                     </Typography>
//                                 </Box>
//                             </Box>
//                         </Box>
//                     </Grid>
//                     <Grid item md={12}>
//                         <Box sx={{ display: "flex", flexDirection: "row", gap:4, justifyContent:"center", py:1, flexWrap: "wrap" }}>
//                             {scoresArray.map((item: any, index) => (
//                                 <Box
//                                     key={index}
//                                     sx={{
//                                         display: 'flex',
//                                         flexDirection: "column",
//                                         alignItems: 'center',
//                                         py: 3,
//                                     }}
//                                 >
//                                     <Box sx={{ position: 'relative', width: 100, height: 100, flexShrink: 0 }}>
//                                         {/* SVG for circular progress */}
//                                         <svg width="100%" height="100%" viewBox="0 0 100 100">
//                                             {/* Background circle */}
//                                             <circle
//                                                 cx="50"
//                                                 cy="50"
//                                                 r="40"
//                                                 fill="none"
//                                                 stroke="#e0e0e0"
//                                                 strokeWidth="8"
//                                             />
//                                             {/* Foreground circle - the actual progress */}
//                                             <circle
//                                                 cx="50"
//                                                 cy="50"
//                                                 r="40"
//                                                 fill="none"
//                                                 stroke={getScoreColor(item.score)}
//                                                 strokeWidth="8"
//                                                 strokeLinecap="round"
//                                                 strokeDasharray={calculateStrokeDasharray(item.score)}
//                                                 strokeDashoffset="0"
//                                                 transform="rotate(-90 50 50)"
//                                             />
//                                         </svg>
//                                         {/* Score text in the middle */}
//                                         <Box
//                                             sx={{
//                                                 position: 'absolute',
//                                                 top: 0,
//                                                 left: 0,
//                                                 bottom: 0,
//                                                 right: 0,
//                                                 display: 'flex',
//                                                 flexDirection: 'column',
//                                                 justifyContent: 'center',
//                                                 alignItems: 'center'
//                                             }}
//                                         >
//                                             <Typography variant="h5" component="span" fontWeight="bold">
//                                                 {item.score}
//                                             </Typography>
//                                             <Typography variant="caption" color="text.secondary">
//                                                 /10
//                                             </Typography>
//                                         </Box>
//                                     </Box>
//                                     <Typography variant="body1" component="span" sx={{ fontWeight: 500, mb: 1 }}>
//                                         {item.name}
//                                     </Typography>
//                                     <Button 
//                                         variant="outlined" 
//                                         size="small"
//                                         onClick={() => handleOpenDetails(item.key)}
//                                         sx={{ 
//                                             fontSize: '0.75rem', 
//                                             mt: 1,
//                                             border:"none",
//                                             // borderColor: getScoreColor(item.score),
//                                             color:"primary",
//                                             // '&:hover': {
//                                             //     borderColor: getScoreColor(item.score),
//                                             //     backgroundColor: `${getScoreColor(item.score)}10`
//                                             // }
//                                         }}
//                                     >
//                                         Details
//                                     </Button>
//                                 </Box>
//                             ))}
//                         </Box>
//                     </Grid>
//                 </Grid>
//             </CardContent>

//             {/* Details Dialog */}
//             <Dialog 
//                 open={dialogOpen} 
//                 onClose={handleCloseDialog}
//                 maxWidth="lg"
//                 fullWidth
//                 PaperProps={{
//                     sx: { minHeight: '70vh' }
//                 }}
//             >
//                 <DialogTitle sx={{ 
//                     bgcolor: getScoreColor(data?.scores?.[selectedCategory] || 0), 
//                     color: 'white',
//                     display: 'flex',
//                     justifyContent: 'space-between',
//                     alignItems: 'center',
//                     px: 3
//                 }}>
//                     <Typography variant="h6" component="div">
//                         {formatName(selectedCategory)} Details
//                     </Typography>
//                     <IconButton
//                         aria-label="close"
//                         onClick={handleCloseDialog}
//                         sx={{ color: 'white' }}
//                     >
//                         <CloseIcon />
//                     </IconButton>
//                 </DialogTitle>
//                 <DialogContent sx={{ mt: 2, px: 3 }}>
//                     <Typography variant="subtitle1" gutterBottom fontWeight="bold" sx={{ mb: 3 }}>
//                         Question & Answer Analysis
//                     </Typography>
                    
//                     {getCategoryData(selectedCategory).length > 0 ? (
//                         getCategoryData(selectedCategory).map((item:any, index:number) => (
//                             <Paper 
//                                 key={index} 
//                                 elevation={1} 
//                                 sx={{ 
//                                     p: 3, 
//                                     mb: 3, 
//                                     borderLeft: `4px solid ${getScoreColor(item['Technical Skills']?.Score * 2 || 0)}` 
//                                 }}
//                             >
//                                 <Typography variant="h6" gutterBottom>
//                                     {item.Question}
//                                 </Typography>
//                                 <Typography variant="body1" paragraph sx={{ backgroundColor: '#f5f5f5', p: 2, borderRadius: 1 }}>
//                                     {item.Answer}
//                                 </Typography>
                                
//                                 <Typography variant="subtitle2" gutterBottom sx={{ mt: 2, fontWeight: 'bold' }}>
//                                     Evaluation Breakdown
//                                 </Typography>
//                                 <Grid container spacing={2} sx={{ mt: 1 }}>
//                                     {Object.entries(item)
//                                         .filter(([key]) => key !== 'Question' && key !== 'Answer' && typeof item[key] === 'object')
//                                         .map(([key, value]:any) => (
//                                             <Grid item xs={12} sm={6} md={4} key={key}>
//                                                 <Box sx={{ mb: 2 }}>
//                                                     <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
//                                                         <Typography variant="body2" fontWeight="bold">
//                                                             {key}
//                                                         </Typography>
//                                                         <Typography 
//                                                             variant="body2" 
//                                                             sx={{ 
//                                                                 fontWeight: 'bold', 
//                                                                 color: getScoreColor(value.Score * 2) 
//                                                             }}
//                                                         >
//                                                             {value.Score}/5
//                                                         </Typography>
//                                                     </Box>
//                                                     <Typography variant="body2" color="text.secondary">
//                                                         {value.Justification}
//                                                     </Typography>
//                                                 </Box>
//                                             </Grid>
//                                         ))}
//                                 </Grid>
//                             </Paper>
//                         ))
//                     ) : (
//                         <Typography variant="body1" color="text.secondary" align="center" sx={{ py: 4 }}>
//                             No detailed data available for this category.
//                         </Typography>
//                     )}
//                 </DialogContent>
//             </Dialog>
//         </Card>
//     );
// };

// export default CircularScoreDisplay;

import {
    Box,
    Card,
    CardContent,
    CardHeader,
    Typography,
    Grid,
    Button,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Divider,
    Paper,
    IconButton
} from '@mui/material';
import { formatName, getScoreColor, calculateStrokeDasharray } from '../../utils/score';
import { useState } from 'react';
import CloseIcon from '@mui/icons-material/Close';

const CircularScoreDisplay = ({ data }: any) => {
    // State to handle the dialog
    const [dialogOpen, setDialogOpen] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState<string>('');

    // Transform the object format to array format for rendering
    const scoresArray = Object.entries(data?.report?.scores || {}).map(([key, value]) => ({
        name: formatName(key),
        key: key, // Keep the original key for reference
        score: value
    }));

    const handleOpenDetails = (categoryKey: string) => {
        setSelectedCategory(categoryKey);
        setDialogOpen(true);
    };

    const handleCloseDialog = () => {
        setDialogOpen(false);
    };

    // Filter the QA history to get only entries relevant to the selected category
    const getCategoryData = (categoryKey: string) => {
        if (!data?.qam_history || !data.qam_history.length) {
            return [];
        }

        // Flatten the QA history array (since it appears to be nested)
        const flattenedHistory = data.qam_history.reduce((acc:any, curr:any) => {
            if (Array.isArray(curr) && curr.length > 0) {
                return [...acc, ...curr];
            }
            return acc;
        }, []);

        // Return all Q&A pairs as they all have evaluations for each category
        return flattenedHistory;
    };

    // Function to format category key to match the format in the data
    const formatCategoryKey = (key: string) => {
        // Check if key is 'technical_skills', 'communication_skills', etc.
        // and convert to 'Technical Skills', 'Communication Skills' for matching
        return key.split('_')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ');
    };

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
                                        stroke={getScoreColor(data?.report?.final_rating || 0)}
                                        strokeWidth="10"
                                        strokeLinecap="round"
                                        strokeDasharray={calculateStrokeDasharray(data?.report?.final_rating || 0)}
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
                                        {data?.report?.final_rating || 0}
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary">
                                        /10
                                    </Typography>
                                </Box>
                            </Box>
                        </Box>
                    </Grid>
                    <Grid item md={12}>
                        <Box sx={{ display: "flex", flexDirection: "row", gap:4, justifyContent:"center", py:1, flexWrap: "wrap" }}>
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
                                    <Typography variant="body1" component="span" sx={{ fontWeight: 500, mb: 1 }}>
                                        {item.name}
                                    </Typography>
                                    <Button 
                                        variant="outlined" 
                                        size="small"
                                        onClick={() => handleOpenDetails(item.key)}
                                        sx={{ 
                                            fontSize: '0.75rem', 
                                            mt: 1,
                                            border:"none",
                                            color:"primary",
                                        }}
                                    >
                                        Details
                                    </Button>
                                </Box>
                            ))}
                        </Box>
                    </Grid>
                </Grid>
            </CardContent>

            {/* Details Dialog */}
            <Dialog 
                open={dialogOpen} 
                onClose={handleCloseDialog}
                maxWidth="lg"
                fullWidth
                PaperProps={{
                    sx: { minHeight: '70vh' }
                }}
            >
                <DialogTitle sx={{ 
                    bgcolor: getScoreColor(data?.report?.scores?.[selectedCategory] || 0), 
                    color: 'white',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    px: 3
                }}>
                    <Typography variant="h6" component="div">
                        {formatName(selectedCategory)} Details
                    </Typography>
                    <IconButton
                        aria-label="close"
                        onClick={handleCloseDialog}
                        sx={{ color: 'white' }}
                    >
                        <CloseIcon />
                    </IconButton>
                </DialogTitle>
                <DialogContent sx={{ mt: 2, px: 3 }}>
                    <Typography variant="subtitle1" gutterBottom fontWeight="bold" sx={{ mb: 3 }}>
                        Question & Answer Analysis for {formatName(selectedCategory)}
                    </Typography>
                    
                    {getCategoryData(selectedCategory).length > 0 ? (
                        getCategoryData(selectedCategory).map((item:any, index:number) => {
                            // Get the formatted category key to match data structure
                            const formattedKey = formatCategoryKey(selectedCategory);
                            
                            return (
                                <Paper 
                                    key={index} 
                                    elevation={1} 
                                    sx={{ 
                                        p: 3, 
                                        mb: 3, 
                                        borderLeft: `4px solid ${getScoreColor(item[formattedKey]?.Score * 2 || 0)}` 
                                    }}
                                >
                                    <Typography variant="h6" gutterBottom>
                                        {item.Question}
                                    </Typography>
                                    <Typography variant="body1" paragraph sx={{ backgroundColor: '#f5f5f5', p: 2, borderRadius: 1 }}>
                                        {item.Answer}
                                    </Typography>
                                    
                                    <Box sx={{ mt: 2 }}>
                                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                                            <Typography variant="body1" fontWeight="bold">
                                                {formattedKey}
                                            </Typography>
                                            <Typography 
                                                variant="body1" 
                                                sx={{ 
                                                    fontWeight: 'bold', 
                                                    color: getScoreColor(item[formattedKey]?.Score * 2) 
                                                }}
                                            >
                                                {item[formattedKey]?.Score}/5
                                            </Typography>
                                        </Box>
                                        <Typography variant="body2" color="text.secondary">
                                            {item[formattedKey]?.Justification}
                                        </Typography>
                                    </Box>
                                </Paper>
                            );
                        })
                    ) : (
                        <Typography variant="body1" color="text.secondary" align="center" sx={{ py: 4 }}>
                            No detailed data available for this category.
                        </Typography>
                    )}
                </DialogContent>
            </Dialog>
        </Card>
    );
};

export default CircularScoreDisplay;