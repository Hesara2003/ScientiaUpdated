import * as React from "react";
import { useState, useEffect } from "react";
import { getAllReminders } from "../../services/feeReminderService";
import { toast } from "react-hot-toast";
import { format, parseISO, isPast } from "date-fns";
import {
  Box,
  Typography,
  Paper,
  Alert,
  AlertTitle,
  CircularProgress,
  Divider,
  Chip,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid
} from "@mui/material";
import {
  WarningAmber as WarningIcon,
  CheckCircle as CheckCircleIcon,
  AttachMoney as MoneyIcon,
  Payment as PaymentIcon,
  CreditCard as CreditCardIcon
} from "@mui/icons-material";

export default function StudentFeeReminders() {
  const [reminders, setReminders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedReminder, setSelectedReminder] = useState(null);
  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false);
  const [processingPayment, setProcessingPayment] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [paymentDetails, setPaymentDetails] = useState({
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    holderName: ''
  });
  
  // Get current student ID for payment processing
  const currentStudentId = parseInt(localStorage.getItem('studentId') || '1');
  
  useEffect(() => {
    fetchReminders();
  }, []);
  
  const fetchReminders = async () => {
    setIsLoading(true);
    setError(null);
    try {
      console.log('Fetching all fee reminders...');
      const data = await getAllReminders();
      console.log('Fetched reminders:', data);
      
      // Display ALL fee reminders, not just for current student
      const allReminders = Array.isArray(data) ? 
        data.map(reminder => ({
          id: reminder.id,
          amount: reminder.amount || 0,
          dueDate: reminder.dueDate || new Date().toISOString(), // Provide default date if null/undefined
          message: reminder.message || 'Payment required',
          resolved: reminder.resolved || false,
          studentId: reminder.studentId,
          createdAt: reminder.createdAt,
          updatedAt: reminder.updatedAt
        })) : [];
      
      // Sort by due date (urgent first), then by student ID
      const sortedReminders = allReminders.sort((a, b) => {
        if (a.resolved !== b.resolved) return a.resolved ? 1 : -1;
        const dateCompare = new Date(a.dueDate) - new Date(b.dueDate);
        if (dateCompare !== 0) return dateCompare;
        return a.studentId - b.studentId;
      });
      
      setReminders(sortedReminders);
      console.log(`Found ${sortedReminders.length} total fee reminders`);
    } catch (err) {
      console.error("Error fetching reminders:", err);
      setError("Failed to load fee reminders. Please try again later.");
      toast.error("Failed to load fee information");
      setReminders([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Helper function to safely parse dates
  const safeDateParse = (dateString) => {
    if (!dateString) return new Date();
    try {
      return parseISO(dateString);
    } catch (error) {
      console.warn('Invalid date string:', dateString);
      return new Date();
    }
  };

  // Helper function to safely check if date is past
  const isSafePast = (dateString) => {
    if (!dateString) return false;
    try {
      return isPast(parseISO(dateString));
    } catch (error) {
      console.warn('Invalid date string for isPast check:', dateString);
      return false;
    }
  };

  // Helper function to safely format dates
  const safeFormatDate = (dateString) => {
    if (!dateString) return 'Date not available';
    try {
      return format(parseISO(dateString), 'PPP');
    } catch (error) {
      console.warn('Invalid date string for formatting:', dateString);
      return 'Invalid date';
    }
  };

  const handlePayNow = (reminder) => {
    // Only allow current student to pay their own fees
    if (reminder.studentId !== currentStudentId) {
      toast.error("You can only pay your own fees.");
      return;
    }
    setSelectedReminder(reminder);
    setPaymentDialogOpen(true);
  };

  const handlePaymentSubmit = async () => {
    if (!selectedReminder) return;

    setProcessingPayment(true);
    try {
      // Simulate payment processing
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Update reminder as resolved
      const updatedReminders = reminders.map(reminder => 
        reminder.id === selectedReminder.id 
          ? { ...reminder, resolved: true }
          : reminder
      );
      
      setReminders(updatedReminders);
      toast.success(`Payment of $${selectedReminder.amount.toFixed(2)} processed successfully!`);
      
      // Close dialog and reset
      setPaymentDialogOpen(false);
      setSelectedReminder(null);
      setPaymentDetails({
        cardNumber: '',
        expiryDate: '',
        cvv: '',
        holderName: ''
      });
    } catch (err) {
      console.error('Payment processing error:', err);
      toast.error('Payment processing failed. Please try again.');
    } finally {
      setProcessingPayment(false);
    }
  };

  const handleClosePaymentDialog = () => {
    setPaymentDialogOpen(false);
    setSelectedReminder(null);
    setPaymentDetails({
      cardNumber: '',
      expiryDate: '',
      cvv: '',
      holderName: ''
    });
  };

  const pendingReminders = reminders.filter(r => !r.resolved);
  const resolvedReminders = reminders.filter(r => r.resolved);
  
  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        All Fee Reminders
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
        View all fee reminders in the system. You can only pay fees assigned to your student ID ({currentStudentId}).
      </Typography>
      
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
          <Button 
            color="inherit" 
            size="small" 
            onClick={fetchReminders}
            sx={{ ml: 2 }}
          >
            Retry
          </Button>
        </Alert>
      )}
      
      {isLoading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 5 }}>
          <CircularProgress />
        </Box>
      ) : reminders.length === 0 ? (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <CheckCircleIcon sx={{ fontSize: 64, color: 'success.main', mb: 2 }} />
          <Typography variant="h6" gutterBottom>No Fee Reminders Found</Typography>
          <Typography variant="body1" color="text.secondary">
            There are no fee reminders in the system at this time.
          </Typography>
        </Paper>
      ) : (
        <>
          {pendingReminders.length > 0 && (
            <Box sx={{ mb: 4 }}>
              <Alert severity="info" sx={{ mb: 3 }}>
                <AlertTitle>Fee Reminders Overview</AlertTitle>
                Total pending payments: {pendingReminders.length} | 
                Total amount: ${pendingReminders.reduce((sum, r) => sum + (r.amount || 0), 0).toFixed(2)} | 
                Your pending payments: {pendingReminders.filter(r => r.studentId === currentStudentId).length}
              </Alert>
              
              <Typography variant="h6" gutterBottom>
                Pending Payments ({pendingReminders.length})
              </Typography>
              
              <Paper sx={{ overflow: 'hidden' }}>
                <List sx={{ width: '100%' }}>
                  {pendingReminders.map((reminder, index) => {
                    const isMyFee = reminder.studentId === currentStudentId;
                    const isOverdue = isSafePast(reminder.dueDate);
                    
                    return (
                      <React.Fragment key={reminder.id}>
                        {index > 0 && <Divider component="li" />}
                        <ListItem 
                          alignItems="flex-start"
                          sx={{ 
                            backgroundColor: isMyFee ? 'action.hover' : 'transparent',
                            border: isMyFee ? '2px solid' : 'none',
                            borderColor: isMyFee ? 'primary.main' : 'transparent',
                            borderRadius: isMyFee ? 1 : 0
                          }}
                        >
                          <ListItemIcon>
                            <MoneyIcon color={isOverdue ? "error" : "warning"} />
                          </ListItemIcon>
                          <ListItemText
                            primary={
                              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                                <Box>
                                  <Typography variant="subtitle1">
                                    ${(reminder.amount || 0).toFixed(2)} Payment Due
                                  </Typography>
                                  <Typography variant="caption" color="text.secondary">
                                    Student ID: {reminder.studentId} {isMyFee && '(Your Fee)'}
                                  </Typography>
                                </Box>
                                <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                                  <Chip 
                                    size="small"
                                    label={isOverdue ? "Overdue" : "Due Soon"} 
                                    color={isOverdue ? "error" : "warning"} 
                                  />
                                  {isMyFee && (
                                    <Button
                                      variant="contained"
                                      size="small"
                                      startIcon={<PaymentIcon />}
                                      onClick={() => handlePayNow(reminder)}
                                      color={isOverdue ? "error" : "primary"}
                                    >
                                      Pay Now
                                    </Button>
                                  )}
                                  {!isMyFee && (
                                    <Button
                                      variant="outlined"
                                      size="small"
                                      disabled
                                      sx={{ opacity: 0.5 }}
                                    >
                                      Not Your Fee
                                    </Button>
                                  )}
                                </Box>
                              </Box>
                            }
                            secondary={
                              <>
                                <Typography component="span" variant="body2" color="text.primary">
                                  Due Date: {safeFormatDate(reminder.dueDate)}
                                </Typography>
                                <Typography variant="body2" display="block">
                                  {reminder.message}
                                </Typography>
                                {isOverdue && (
                                  <Typography variant="body2" color="error" sx={{ mt: 0.5 }}>
                                    ⚠️ This payment is overdue.
                                  </Typography>
                                )}
                              </>
                            }
                          />
                        </ListItem>
                      </React.Fragment>
                    );
                  })}
                </List>
              </Paper>
            </Box>
          )}
          
          {resolvedReminders.length > 0 && (
            <Box>
              <Typography variant="h6" gutterBottom>
                Payment History ({resolvedReminders.length})
              </Typography>
              
              <Paper sx={{ overflow: 'hidden' }}>
                <List sx={{ width: '100%' }}>
                  {resolvedReminders.map((reminder, index) => {
                    const isMyFee = reminder.studentId === currentStudentId;
                    return (
                      <React.Fragment key={reminder.id}>
                        {index > 0 && <Divider component="li" />}
                        <ListItem 
                          alignItems="flex-start"
                          sx={{ 
                            backgroundColor: isMyFee ? 'success.50' : 'transparent',
                            border: isMyFee ? '1px solid' : 'none',
                            borderColor: isMyFee ? 'success.main' : 'transparent',
                            borderRadius: isMyFee ? 1 : 0
                          }}
                        >
                          <ListItemIcon>
                            <CheckCircleIcon color="success" />
                          </ListItemIcon>
                          <ListItemText
                            primary={
                              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <Box>
                                  <Typography variant="subtitle1">
                                    ${(reminder.amount !== undefined ? reminder.amount : 0).toFixed(2)} Payment
                                  </Typography>
                                  <Typography variant="caption" color="text.secondary">
                                    Student ID: {reminder.studentId} {isMyFee && '(Your Payment)'}
                                  </Typography>
                                </Box>
                                <Chip 
                                  size="small"
                                  label="Paid" 
                                  color="success" 
                                />
                              </Box>
                            }
                            secondary={
                              <Typography component="span" variant="body2" color="text.primary">
                                Due Date: {safeFormatDate(reminder.dueDate)}
                              </Typography>
                            }
                          />
                        </ListItem>
                      </React.Fragment>
                    );
                  })}
                </List>
              </Paper>
            </Box>
          )}
        </>
      )}

      {/* Payment Dialog */}
      <Dialog 
        open={paymentDialogOpen} 
        onClose={handleClosePaymentDialog}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <CreditCardIcon />
            Process Payment
          </Box>
        </DialogTitle>
        <DialogContent>
          {selectedReminder && (
            <>
              <Alert severity="info" sx={{ mb: 3 }}>
                <Typography variant="subtitle2">Payment Amount</Typography>
                <Typography variant="h6">${selectedReminder.amount.toFixed(2)}</Typography>
                <Typography variant="body2">
                  Due: {safeFormatDate(selectedReminder.dueDate)}
                </Typography>
                <Typography variant="body2">
                  Student ID: {selectedReminder.studentId}
                </Typography>
              </Alert>

              <FormControl fullWidth sx={{ mb: 3 }}>
                <InputLabel>Payment Method</InputLabel>
                <Select
                  value={paymentMethod}
                  label="Payment Method"
                  onChange={(e) => setPaymentMethod(e.target.value)}
                >
                  <MenuItem value="card">Credit/Debit Card</MenuItem>
                  <MenuItem value="bank">Bank Transfer</MenuItem>
                  <MenuItem value="paypal">PayPal</MenuItem>
                </Select>
              </FormControl>

              {paymentMethod === 'card' && (
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Cardholder Name"
                      value={paymentDetails.holderName}
                      onChange={(e) => setPaymentDetails(prev => ({
                        ...prev,
                        holderName: e.target.value
                      }))}
                      required
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Card Number"
                      value={paymentDetails.cardNumber}
                      onChange={(e) => setPaymentDetails(prev => ({
                        ...prev,
                        cardNumber: e.target.value
                      }))}
                      placeholder="1234 5678 9012 3456"
                      required
                    />
                  </Grid>
                  <Grid item xs={6}>
                    <TextField
                      fullWidth
                      label="Expiry Date"
                      value={paymentDetails.expiryDate}
                      onChange={(e) => setPaymentDetails(prev => ({
                        ...prev,
                        expiryDate: e.target.value
                      }))}
                      placeholder="MM/YY"
                      required
                    />
                  </Grid>
                  <Grid item xs={6}>
                    <TextField
                      fullWidth
                      label="CVV"
                      value={paymentDetails.cvv}
                      onChange={(e) => setPaymentDetails(prev => ({
                        ...prev,
                        cvv: e.target.value
                      }))}
                      placeholder="123"
                      required
                    />
                  </Grid>
                </Grid>
              )}

              {paymentMethod === 'bank' && (
                <Alert severity="info">
                  Bank transfer details will be provided after confirmation.
                  Processing time: 1-3 business days.
                </Alert>
              )}

              {paymentMethod === 'paypal' && (
                <Alert severity="info">
                  You will be redirected to PayPal to complete the payment.
                </Alert>
              )}
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClosePaymentDialog}>
            Cancel
          </Button>
          <Button 
            onClick={handlePaymentSubmit}
            variant="contained"
            disabled={processingPayment || !selectedReminder}
            startIcon={processingPayment ? <CircularProgress size={16} /> : <PaymentIcon />}
          >
            {processingPayment ? 'Processing...' : `Pay $${selectedReminder?.amount.toFixed(2) || '0.00'}`}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}