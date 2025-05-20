import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  getPurchasesByStudentId 
} from '../../services/tutePurchaseService';
import { getTutesByIds } from '../../services/tuteService';
import { 
  Box, 
  Typography, 
  Grid, 
  Card, 
  CardContent, 
  CardActions,
  Button,
  CircularProgress,
  Alert
} from '@mui/material';

const StudentMyTutorials = () => {
  const [purchases, setPurchases] = useState([]);
  const [tutorials, setTutorials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Get student ID from localStorage or context
  const studentId = localStorage.getItem('userId'); // Adjust based on your auth implementation

  useEffect(() => {
    const fetchPurchasedTutorials = async () => {
      try {
        setLoading(true);
        // Get all purchases for this student
        const purchaseData = await getPurchasesByStudentId(studentId);
        setPurchases(purchaseData);
          // Extract tutorial IDs from purchases
        const tuteIds = purchaseData.map(purchase => purchase.tuteId);
        
        // Fetch tutorial details for all purchased tutorials
        if (tuteIds.length > 0) {
          const tuteData = await getTutesByIds(tuteIds);
          setTutorials(tuteData);
        }
      } catch (err) {
        setError('Failed to load your tutorials');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchPurchasedTutorials();
  }, [studentId]);

  if (loading) {
    return <CircularProgress />;
  }

  if (error) {
    return <Alert severity="error">{error}</Alert>;
  }

  if (tutorials.length === 0) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography variant="h4" sx={{ mb: 3 }}>My Tutorials</Typography>
        <Alert severity="info">
          You haven't purchased any tutorials yet. 
          <Link to="/student/tutorials" style={{ marginLeft: 8 }}>
            Browse available tutorials
          </Link>
        </Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" sx={{ mb: 3 }}>My Tutorials</Typography>
      <Grid container spacing={3}>
        {tutorials.map((tutorial) => (
          <Grid item xs={12} sm={6} md={4} key={tutorial.id}>
            <Card>
              <CardContent>
                <Typography variant="h6">{tutorial.title}</Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                  {tutorial.description.substring(0, 100)}...
                </Typography>
              </CardContent>
              <CardActions>
                <Button 
                  size="small" 
                  component={Link} 
                  to={`/student/my-tutorials/${tutorial.id}`}
                >
                  View Details
                </Button>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default StudentMyTutorials;
