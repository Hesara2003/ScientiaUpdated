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
  Chip,
  CircularProgress,
  Alert
} from '@mui/material';
import { 
  getAllTutePurchases 
} from '../../services/tutePurchaseService';
import { 
  getTutesByTutorId, 
  getTuteById 
} from '../../services/tuteService';
import { getStudentById } from '../../services/studentService';

const TutorialSales = () => {
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [tutorId, setTutorId] = useState(''); // Would come from auth context in a real app
  
  useEffect(() => {
    // For demo purposes, we're using a hardcoded tutor ID
    // In a real app, this would come from authentication
    const mockTutorId = '1';
    setTutorId(mockTutorId);
    fetchSales(mockTutorId);
  }, []);

  const fetchSales = async (tutorId) => {
    try {
      setLoading(true);
      setError('');
      
      // Get all tutes created by this tutor
      const tutorTutes = await getTutesByTutorId(tutorId);
      
      if (!tutorTutes || tutorTutes.length === 0) {
        setSales([]);
        setLoading(false);
        return;
      }
      
      // Get all tute purchases
      const allPurchases = await getAllTutePurchases();
      
      // Filter purchases to only include those for this tutor's tutes
      const tutorTuteIds = tutorTutes.map(tute => tute.id.toString());
      const tutorSales = allPurchases.filter(purchase => 
        tutorTuteIds.includes(purchase.tuteId.toString())
      );
      
      // Enrich the sales data with student and tute details
      const enrichedSales = await Promise.all(
        tutorSales.map(async (sale) => {
          try {
            const student = await getStudentById(sale.studentId);
            const tute = await getTuteById(sale.tuteId);
            
            return {
              ...sale,
              studentName: student ? `${student.firstName} ${student.lastName}` : 'Unknown Student',
              tuteTitle: tute ? tute.title : 'Unknown Tute',
              tutePrice: tute ? tute.price : 0
            };
          } catch (err) {
            console.error('Error fetching details for sale:', err);
            return {
              ...sale,
              studentName: 'Error loading',
              tuteTitle: 'Error loading',
              tutePrice: 0
            };
          }
        })
      );
      
      setSales(enrichedSales);
    } catch (err) {
      setError('Failed to load tutorial sales');
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

  // Helper to get status color for chip
  const getStatusColor = (status) => {
    switch (status) {
      case 'COMPLETED':
        return 'success';
      case 'PENDING':
        return 'warning';
      case 'FAILED':
        return 'error';
      default:
        return 'default';
    }
  };

  // Calculate total earnings
  const totalEarnings = sales.reduce((total, sale) => {
    if (sale.status === 'COMPLETED') {
      return total + (sale.tutePrice || 0);
    }
    return total;
  }, 0);

  return (
    <Box sx={{ width: '100%', p: 2 }}>
      <Typography variant="h4" gutterBottom>
        Tutorial Sales
      </Typography>
      
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
          <CircularProgress />
        </Box>
      ) : error ? (
        <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>
      ) : (
        <>
          <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between' }}>
            <Paper sx={{ p: 2, minWidth: 200 }}>
              <Typography variant="body2" color="text.secondary">
                Total Sales
              </Typography>
              <Typography variant="h5">{sales.filter(s => s.status === 'COMPLETED').length}</Typography>
            </Paper>
            
            <Paper sx={{ p: 2, minWidth: 200 }}>
              <Typography variant="body2" color="text.secondary">
                Total Earnings
              </Typography>
              <Typography variant="h5">${totalEarnings.toFixed(2)}</Typography>
            </Paper>
          </Box>
          
          <TableContainer component={Paper}>
            <Table sx={{ minWidth: 650 }} aria-label="tutorial sales table">
              <TableHead>
                <TableRow>
                  <TableCell>Purchase ID</TableCell>
                  <TableCell>Tutorial</TableCell>
                  <TableCell>Student</TableCell>
                  <TableCell>Price</TableCell>
                  <TableCell>Purchase Date</TableCell>
                  <TableCell>Status</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {sales.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} align="center">
                      <Typography sx={{ py: 2 }}>No sales found</Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  sales
                    .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                    .map((sale) => (
                      <TableRow key={sale.id}>
                        <TableCell>{sale.id}</TableCell>
                        <TableCell>{sale.tuteTitle}</TableCell>
                        <TableCell>{sale.studentName}</TableCell>
                        <TableCell>${sale.tutePrice?.toFixed(2) || '0.00'}</TableCell>
                        <TableCell>
                          {new Date(sale.purchaseDate).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          <Chip 
                            label={sale.status} 
                            color={getStatusColor(sale.status)}
                            size="small"
                          />
                        </TableCell>
                      </TableRow>
                    ))
                )}
              </TableBody>
            </Table>
            <TablePagination
              rowsPerPageOptions={[5, 10, 25]}
              component="div"
              count={sales.length}
              rowsPerPage={rowsPerPage}
              page={page}
              onPageChange={handleChangePage}
              onRowsPerPageChange={handleChangeRowsPerPage}
            />
          </TableContainer>
        </>
      )}
    </Box>
  );
};

export default TutorialSales;
