import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Paper, 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow,
  TablePagination,
  IconButton,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  CircularProgress,
  Alert,
  Chip
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import VisibilityIcon from '@mui/icons-material/Visibility';
import { 
  getAllTutePurchases, 
  deleteTutePurchase 
} from '../../services/tutePurchaseService';
import { getStudentById } from '../../services/studentService';
import { getTuteById } from '../../services/tuteService';

const TutorialPurchases = () => {
  const [purchases, setPurchases] = useState([]);
  const [purchaseDetails, setPurchaseDetails] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedPurchaseId, setSelectedPurchaseId] = useState(null);

  useEffect(() => {
    fetchPurchases();
  }, []);

  const fetchPurchases = async () => {
    try {
      setLoading(true);
      const purchaseData = await getAllTutePurchases();
      setPurchases(purchaseData);
      
      // Fetch additional details for each purchase
      const detailedPurchases = await Promise.all(
        purchaseData.map(async (purchase) => {          try {
            const student = await getStudentById(purchase.studentId);
            const tute = await getTuteById(purchase.tuteId);
            
            return {
              ...purchase,
              studentName: student ? `${student.firstName} ${student.lastName}` : 'Unknown Student',
              tutorialTitle: tute ? tute.title : 'Unknown Tutorial',
              tutorialPrice: tute ? tute.price : 0
            };
          } catch (err) {
            console.error('Error fetching details for purchase:', err);
            return {
              ...purchase,
              studentName: 'Error loading',
              tutorialTitle: 'Error loading',
              tutorialPrice: 0
            };
          }
        })
      );
      
      setPurchaseDetails(detailedPurchases);
    } catch (err) {
      setError('Failed to load tutorial purchases');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleDeleteClick = (purchaseId) => {
    setSelectedPurchaseId(purchaseId);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    try {
      await deleteTutePurchase(selectedPurchaseId);
      // Refresh the list
      setPurchases(purchases.filter(p => p.id !== selectedPurchaseId));
      setPurchaseDetails(purchaseDetails.filter(p => p.id !== selectedPurchaseId));
      setDeleteDialogOpen(false);
    } catch (err) {
      setError('Failed to delete purchase');
      console.error(err);
    }
  };

  const getStatusChip = (status) => {
    let color = 'default';
    
    switch(status) {
      case 'COMPLETED':
        color = 'success';
        break;
      case 'PENDING':
        color = 'warning';
        break;
      case 'FAILED':
        color = 'error';
        break;
      default:
        color = 'default';
    }
    
    return <Chip label={status} color={color} size="small" />;
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" sx={{ mb: 3 }}>Tutorial Purchases</Typography>
      
      {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}
      
      <Button 
        variant="contained" 
        color="primary" 
        sx={{ mb: 3 }}
        onClick={fetchPurchases}
      >
        Refresh Data
      </Button>
      
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>Student</TableCell>
              <TableCell>Tutorial</TableCell>
              <TableCell>Purchase Date</TableCell>
              <TableCell>Amount</TableCell>
              <TableCell>Status</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {purchaseDetails
              .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
              .map((purchase) => (
                <TableRow key={purchase.id}>
                  <TableCell>{purchase.id}</TableCell>
                  <TableCell>{purchase.studentName}</TableCell>
                  <TableCell>{purchase.tutorialTitle}</TableCell>
                  <TableCell>{new Date(purchase.purchaseDate).toLocaleDateString()}</TableCell>
                  <TableCell>${purchase.amount}</TableCell>
                  <TableCell>{getStatusChip(purchase.status)}</TableCell>
                  <TableCell align="right">
                    <IconButton 
                      color="primary"
                      onClick={() => {/* View details implementation */}}
                    >
                      <VisibilityIcon />
                    </IconButton>
                    <IconButton 
                      color="error"
                      onClick={() => handleDeleteClick(purchase.id)}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
            ))}
            
            {purchaseDetails.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} align="center">
                  No purchases found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
        
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={purchaseDetails.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </TableContainer>
      
      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
      >
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete this purchase record? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleDeleteConfirm} color="error">Delete</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default TutorialPurchases;
