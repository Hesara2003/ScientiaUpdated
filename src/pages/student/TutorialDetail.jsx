import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Box, 
  Typography, 
  Paper, 
  Button, 
  Chip, 
  Grid, 
  Divider, 
  CircularProgress, 
  Alert,
  IconButton,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { 
  getTuteById 
} from '../../services/tuteService';
import { 
  purchaseTute,
  hasStudentPurchasedTute
} from '../../services/tutePurchaseService';

const TutorialDetail = () => {
  const { tuteId } = useParams();
  const navigate = useNavigate();
  const [tute, setTute] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isPurchased, setIsPurchased] = useState(false);
  const [purchaseLoading, setPurchaseLoading] = useState(false);
  const [purchaseDialogOpen, setPurchaseDialogOpen] = useState(false);
  const [purchaseSuccess, setPurchaseSuccess] = useState(false);
  const [purchaseError, setPurchaseError] = useState('');
  
  // Get student ID from localStorage or context
  const studentId = localStorage.getItem('userId'); // Adjust based on your auth implementation

  useEffect(() => {
    const fetchTuteDetail = async () => {
      try {
        setLoading(true);
        setError('');
        
        // Get tute details
        const tuteData = await getTuteById(tuteId);
        setTute(tuteData);
        
        // Check if student has already purchased this tute
        if (studentId) {
          const hasPurchased = await hasStudentPurchasedTute(studentId, tuteId);
          setIsPurchased(hasPurchased);
        }
      } catch (err) {
        setError('Failed to load tutorial details');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    
    if (tuteId) {
      fetchTuteDetail();
    }
  }, [tuteId, studentId]);

  const handlePurchaseClick = () => {
    setPurchaseDialogOpen(true);
  };

  const handlePurchaseConfirm = async () => {
    try {
      setPurchaseLoading(true);
      setPurchaseError('');
      
      // Create purchase object
      const purchaseData = {
        studentId,
        tuteId,
        purchaseDate: new Date().toISOString(),
        price: tute.price,
        status: 'COMPLETED' // In a real app, this would be handled by payment processing
      };
      
      // Submit purchase
      await purchaseTute(purchaseData);
      
      // Update state
      setIsPurchased(true);
      setPurchaseSuccess(true);
    } catch (err) {
      setPurchaseError('Failed to complete purchase. Please try again.');
      console.error(err);
    } finally {
      setPurchaseLoading(false);
      setPurchaseDialogOpen(false);
    }
  };

  const handlePurchaseCancel = () => {
    setPurchaseDialogOpen(false);
  };

  const handleBackClick = () => {
    navigate('/student/tutorials');
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">{error}</Alert>
        <Button 
          startIcon={<ArrowBackIcon />}
          onClick={handleBackClick}
          sx={{ mt: 2 }}
        >
          Back to Tutorials
        </Button>
      </Box>
    );
  }

  if (!tute) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="info">Tutorial not found</Alert>
        <Button 
          startIcon={<ArrowBackIcon />}
          onClick={handleBackClick}
          sx={{ mt: 2 }}
        >
          Back to Tutorials
        </Button>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      {purchaseSuccess && (
        <Alert severity="success" sx={{ mb: 3 }}>
          Purchase completed successfully! You now have access to this tutorial.
        </Alert>
      )}
      
      <Box sx={{ mb: 2, display: 'flex', alignItems: 'center' }}>
        <IconButton onClick={handleBackClick} sx={{ mr: 1 }}>
          <ArrowBackIcon />
        </IconButton>
        <Typography variant="h4">{tute.title}</Typography>
      </Box>
      
      <Paper sx={{ p: 3, mb: 3 }}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={8}>
            <Typography variant="h6" gutterBottom>Description</Typography>
            <Typography paragraph>{tute.description}</Typography>
            
            <Divider sx={{ my: 2 }} />
            
            <Typography variant="h6" gutterBottom>What You'll Learn</Typography>
            <Typography paragraph>{tute.learningOutcomes || 'Learning outcomes not specified.'}</Typography>
            
            <Box sx={{ mt: 2 }}>
              <Typography variant="subtitle1" gutterBottom>Subject:</Typography>
              <Chip label={tute.subjectName || 'General'} color="primary" size="small" />
            </Box>
            
            <Box sx={{ mt: 2 }}>
              <Typography variant="subtitle1" gutterBottom>Duration:</Typography>
              <Typography>{tute.duration || '60'} minutes</Typography>
            </Box>
            
            <Box sx={{ mt: 2 }}>
              <Typography variant="subtitle1" gutterBottom>Instructor:</Typography>
              <Typography>{tute.tutorName || 'Unknown'}</Typography>
            </Box>
          </Grid>
          
          <Grid item xs={12} md={4}>
            <Paper sx={{ p: 3, bgcolor: 'background.default' }}>
              <Typography variant="h4" gutterBottom color="primary">
                ${tute.price.toFixed(2)}
              </Typography>
              
              {isPurchased ? (
                <Button 
                  variant="contained" 
                  color="success" 
                  fullWidth 
                  sx={{ mb: 2 }}
                  onClick={() => navigate(`/student/my-tutorials`)}
                >
                  View Your Purchased Tutorial
                </Button>
              ) : (
                <Button 
                  variant="contained" 
                  color="primary" 
                  fullWidth 
                  sx={{ mb: 2 }}
                  onClick={handlePurchaseClick}
                  disabled={purchaseLoading}
                >
                  {purchaseLoading ? 'Processing...' : 'Purchase Tutorial'}
                </Button>
              )}
              
              <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                This tutorial provides full access to:
              </Typography>
              <Box component="ul" sx={{ mt: 1 }}>
                <Typography component="li" variant="body2">Recorded tutorial video</Typography>
                <Typography component="li" variant="body2">Downloadable resources</Typography>
                <Typography component="li" variant="body2">Practice exercises</Typography>
                <Typography component="li" variant="body2">Certificate of completion</Typography>
              </Box>
            </Paper>
          </Grid>
        </Grid>
      </Paper>
      
      <Dialog
        open={purchaseDialogOpen}
        onClose={handlePurchaseCancel}
      >
        <DialogTitle>Confirm Purchase</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to purchase "{tute.title}" for ${tute.price.toFixed(2)}?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handlePurchaseCancel} disabled={purchaseLoading}>Cancel</Button>
          <Button 
            onClick={handlePurchaseConfirm} 
            color="primary" 
            disabled={purchaseLoading}
            autoFocus
          >
            {purchaseLoading ? 'Processing...' : 'Confirm Purchase'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default TutorialDetail;
