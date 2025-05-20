import * as React from "react";
import { useState, useEffect } from "react";
import { getRemindersByStudentId, markReminderResolved } from "../../services/feeReminderService";
import { getParentStudents } from "../../services/parentStudentService";
import { getStudentById } from "../../services/studentService";
import { toast } from "react-hot-toast";
import { format, parseISO, isPast, addDays } from "date-fns";
import {
  Box,
  Typography,
  Paper,
  Alert,
  AlertTitle,
  CircularProgress,
  Button,
  Grid,
  Divider,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField
} from "@mui/material";
import {
  PaymentOutlined as PaymentIcon,
  AccessTimeOutlined as TimeIcon,
  CalendarToday as CalendarIcon
} from "@mui/icons-material";

export default function ParentFeeReminders() {
  const [reminders, setReminders] = useState([]);
  const [children, setChildren] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false);
  const [selectedReminder, setSelectedReminder] = useState(null);
  
  // Mock parent ID - in a real app, this would come from auth context
  const parentId = "1001"; // Example parent ID
  
  useEffect(() => {
    fetchParentData();
  }, []);
  
  const fetchParentData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      // Get parent-student relationships for this parent
      const relations = await getParentStudents(parentId);
      
      if (!relations || relations.length === 0) {
        setChildren([]);
        setReminders([]);
        setIsLoading(false);
        return;
      }
      
      // Get all children details
      const childrenPromises = relations.map(relation => 
        getStudentById(relation.studentId)
      );
      
      const childrenData = await Promise.all(childrenPromises);
      setChildren(childrenData);
      
      // Get reminders for all children
      const reminderPromises = relations.map(relation => 
        getRemindersByStudentId(relation.studentId)
      );
      
      const reminderResults = await Promise.all(reminderPromises);
      
      // Flatten the array of arrays
      const allReminders = reminderResults.flat();
      
      // Sort by due date (urgent first)
      const sortedReminders = allReminders.sort((a, b) => {
        if (a.resolved !== b.resolved) return a.resolved ? 1 : -1;
        return new Date(a.dueDate) - new Date(b.dueDate);
      });
      
      setReminders(sortedReminders);
    } catch (err) {
      console.error("Error fetching parent data:", err);
      setError("Failed to load fee reminders. Please try again later.");
      toast.error("Failed to load fee information");
    } finally {
      setIsLoading(false);
    }
  };
  
  const getChildName = (studentId) => {
    const child = children.find(c => c.id?.toString() === studentId?.toString() || 
                                    c.studentId?.toString() === studentId?.toString());
    return child ? `${child.firstName} ${child.lastName}` : "Your child";
  };
  
  const handlePayNow = (reminder) => {
    setSelectedReminder(reminder);
    setPaymentDialogOpen(true);
  };
  
  const handlePaymentSubmit = async () => {
    try {
      // In a real app, this would process the payment
      // For now, we'll just mark the reminder as resolved
      await markReminderResolved(selectedReminder.id, true);
      toast.success("Payment successful!");
      fetchParentData();
    } catch (err) {
      console.error("Error processing payment:", err);
      toast.error("Payment processing failed");
    } finally {
      setPaymentDialogOpen(false);
    }
  };
  
  // Determine urgency level for styling
  const getReminderUrgency = (dueDate) => {
    const dueDateObj = parseISO(dueDate);
    if (isPast(dueDateObj)) {
      return "error"; // Overdue
    } else if (isPast(addDays(new Date(), 3))) {
      return "warning"; // Due soon
    }
    return "info"; // Not urgent
  };
  
  const pendingReminders = reminders.filter(r => !r.resolved);
  const resolvedReminders = reminders.filter(r => r.resolved);
  
  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Fee Reminders
      </Typography>
      
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>
      )}
      
      {isLoading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 5 }}>
          <CircularProgress />
        </Box>
      ) : reminders.length === 0 ? (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="h6" gutterBottom>No Fee Reminders</Typography>
          <Typography variant="body1" color="text.secondary">
            You have no pending fee reminders at this time.
          </Typography>
        </Paper>
      ) : (
        <>
          {pendingReminders.length > 0 && (
            <Box sx={{ mb: 4 }}>
              <Typography variant="h5" gutterBottom>
                Pending Payments
              </Typography>
              <Grid container spacing={3}>
                {pendingReminders.map((reminder) => {
                  const urgency = getReminderUrgency(reminder.dueDate);
                  return (
                    <Grid item xs={12} md={6} key={reminder.id}>
                      <Paper 
                        sx={{ 
                          p: 3, 
                          borderLeft: 5,
                          borderColor: `${urgency}.main`,
                          boxShadow: 3
                        }}
                      >
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                          <Typography variant="h6">
                            ${(reminder.amount !== undefined ? reminder.amount : 0).toFixed(2)} Payment
                          </Typography>
                          <Chip 
                            icon={<TimeIcon />}
                            label={isPast(parseISO(reminder.dueDate)) ? "Overdue" : "Upcoming"} 
                            color={urgency}
                            size="small"
                          />
                        </Box>
                        
                        <Typography variant="body2" color="text.secondary" gutterBottom>
                          <strong>Student:</strong> {getChildName(reminder.studentId)}
                        </Typography>
                        
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                          <CalendarIcon sx={{ mr: 1, color: 'text.secondary', fontSize: 'small' }} />
                          <Typography variant="body2" color="text.secondary">
                            Due: {format(parseISO(reminder.dueDate), 'PPP')}
                          </Typography>
                        </Box>
                        
                        <Divider sx={{ my: 2 }} />
                        
                        <Typography variant="body1" paragraph>
                          {reminder.message}
                        </Typography>
                        
                        <Button 
                          variant="contained" 
                          color="primary"
                          startIcon={<PaymentIcon />}
                          fullWidth
                          onClick={() => handlePayNow(reminder)}
                        >
                          Pay Now
                        </Button>
                      </Paper>
                    </Grid>
                  );
                })}
              </Grid>
            </Box>
          )}
          
          {resolvedReminders.length > 0 && (
            <Box>
              <Typography variant="h5" gutterBottom>
                Payment History
              </Typography>
              <Grid container spacing={3}>
                {resolvedReminders.map((reminder) => (
                  <Grid item xs={12} md={6} lg={4} key={reminder.id}>
                    <Paper sx={{ p: 3, opacity: 0.8 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                        <Typography variant="h6">
                          ${(reminder.amount !== undefined ? reminder.amount : 0).toFixed(2)} Payment
                        </Typography>
                        <Chip 
                          label="Paid" 
                          color="success"
                          size="small"
                        />
                      </Box>
                      
                      <Typography variant="body2" color="text.secondary" gutterBottom>
                        <strong>Student:</strong> {getChildName(reminder.studentId)}
                      </Typography>
                      
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                        <CalendarIcon sx={{ mr: 1, color: 'text.secondary', fontSize: 'small' }} />
                        <Typography variant="body2" color="text.secondary">
                          Due: {format(parseISO(reminder.dueDate), 'PPP')}
                        </Typography>
                      </Box>
                    </Paper>
                  </Grid>
                ))}
              </Grid>
            </Box>
          )}
        </>
      )}
      
      {/* Payment Dialog */}
      <Dialog open={paymentDialogOpen} onClose={() => setPaymentDialogOpen(false)}>
        <DialogTitle>Complete Payment</DialogTitle>
        <DialogContent>
          <Alert severity="info" sx={{ mb: 3 }}>
            <AlertTitle>Demo Mode</AlertTitle>
            This is a demo payment page. In a real application, this would connect to a payment gateway.
          </Alert>
          
          {selectedReminder && (
            <Box sx={{ minWidth: 300 }}>
              <Typography variant="h6" gutterBottom align="center">
                ${(selectedReminder.amount !== undefined ? selectedReminder.amount : 0).toFixed(2)}
              </Typography>
              
              <Typography variant="body2" gutterBottom>
                For: {getChildName(selectedReminder.studentId)}
              </Typography>
              
              <Divider sx={{ my: 2 }} />
              
              <TextField
                fullWidth
                label="Card Number"
                placeholder="1234 5678 9012 3456"
                variant="outlined"
                margin="normal"
              />
              
              <Box sx={{ display: 'flex', gap: 2 }}>
                <TextField
                  label="Expiry Date"
                  placeholder="MM/YY"
                  variant="outlined"
                  margin="normal"
                  sx={{ flex: 1 }}
                />
                <TextField
                  label="CVC"
                  placeholder="123"
                  variant="outlined"
                  margin="normal"
                  sx={{ flex: 1 }}
                />
              </Box>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPaymentDialogOpen(false)}>Cancel</Button>
          <Button 
            onClick={handlePaymentSubmit} 
            variant="contained" 
            color="primary"
          >
            Complete Payment
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}