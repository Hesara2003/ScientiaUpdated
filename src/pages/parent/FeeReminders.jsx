import * as React from "react";
import { useState, useEffect } from "react";
import { getRemindersByStudentId } from "../../services/feeReminderService";
import { getAllStudents } from "../../services/studentService";
import { toast } from "react-hot-toast";
import { format, parseISO, isValid } from "date-fns";
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
  CalendarToday as CalendarIcon,
  Warning as WarningIcon
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
      // For demo purposes, we'll get all students and filter by a mock parent relationship
      // In a real app, you'd have a proper parent-student relationship service
      const allStudents = await getAllStudents();
      
      // Mock: assume first 3 students belong to this parent
      const parentChildren = allStudents.slice(0, 3);
      setChildren(parentChildren);
      
      if (parentChildren.length === 0) {
        setReminders([]);
        setIsLoading(false);
        return;
      }
      
      // Get reminders for all children
      const reminderPromises = parentChildren.map(child => 
        getRemindersByStudentId(child.id)
      );
      
      const reminderResults = await Promise.all(reminderPromises);
      
      // Flatten the array of arrays and add student info
      const allReminders = reminderResults.flat().map(reminder => ({
        ...reminder,
        studentId: reminder.student?.id
      }));
      
      // Sort by reminder date (most recent first)
      const sortedReminders = allReminders.sort((a, b) => {
        const dateA = new Date(a.reminderDate || new Date());
        const dateB = new Date(b.reminderDate || new Date());
        return dateB - dateA;
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
    const child = children.find(c => 
      c.id?.toString() === studentId?.toString()
    );
    if (child) {
      const firstName = child.firstName || '';
      const lastName = child.lastName || '';
      return `${firstName} ${lastName}`.trim() || `Student #${studentId}`;
    }
    return "Your child";
  };
  
  const handlePayNow = (reminder) => {
    setSelectedReminder(reminder);
    setPaymentDialogOpen(true);
  };
  
  const handlePaymentSubmit = async () => {
    try {
      // In a real app, this would process the payment
      // Since we can't mark as resolved, we'll just show success message
      toast.success("Payment information submitted successfully!");
      setPaymentDialogOpen(false);
      // Optionally refresh data
      fetchParentData();
    } catch (err) {
      console.error("Error processing payment:", err);
      toast.error("Payment processing failed");
    }
  };
  
  const formatReminderDate = (dateStr) => {
    if (!dateStr) return "No date specified";
    
    try {
      const date = parseISO(dateStr);
      return isValid(date) ? format(date, 'PPP') : "Invalid date";
    } catch (e) {
      return "Invalid date";
    }
  };
  
  const isOverdue = (reminderDate) => {
    if (!reminderDate) return false;
    return new Date(reminderDate) < new Date();
  };
  
  // Determine urgency level for styling
  const getReminderUrgency = (reminderDate) => {
    if (isOverdue(reminderDate)) {
      return "error"; // Overdue
    }
    const daysDiff = Math.ceil((new Date(reminderDate) - new Date()) / (1000 * 60 * 60 * 24));
    if (daysDiff <= 3) {
      return "warning"; // Due soon
    }
    return "info"; // Not urgent
  };
  
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
          <WarningIcon sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h6" gutterBottom>No Fee Reminders</Typography>
          <Typography variant="body1" color="text.secondary">
            You have no pending fee reminders at this time.
          </Typography>
        </Paper>
      ) : (
        <Grid container spacing={3}>
          {reminders.map((reminder) => {
            const urgency = getReminderUrgency(reminder.reminderDate);
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
                      Fee Reminder
                    </Typography>
                    <Chip 
                      icon={<TimeIcon />}
                      label={isOverdue(reminder.reminderDate) ? "Overdue" : "Active"} 
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
                      Reminder Date: {formatReminderDate(reminder.reminderDate)}
                    </Typography>
                  </Box>
                  
                  <Divider sx={{ my: 2 }} />
                  
                  <Typography variant="body1" paragraph>
                    {reminder.message || "Please contact the tutor for fee payment details."}
                  </Typography>
                  
                  <Button 
                    variant="contained" 
                    color="primary"
                    startIcon={<PaymentIcon />}
                    fullWidth
                    onClick={() => handlePayNow(reminder)}
                  >
                    Contact for Payment
                  </Button>
                </Paper>
              </Grid>
            );
          })}
        </Grid>
      )}
      
      {/* Payment Dialog */}
      <Dialog open={paymentDialogOpen} onClose={() => setPaymentDialogOpen(false)}>
        <DialogTitle>Payment Information</DialogTitle>
        <DialogContent>
          <Alert severity="info" sx={{ mb: 3 }}>
            <AlertTitle>Contact Tutor</AlertTitle>
            Please contact your tutor directly for payment instructions and details.
          </Alert>
          
          {selectedReminder && (
            <Box sx={{ minWidth: 300 }}>
              <Typography variant="body1" gutterBottom>
                <strong>Student:</strong> {getChildName(selectedReminder.studentId)}
              </Typography>
              
              <Typography variant="body1" gutterBottom>
                <strong>Reminder Date:</strong> {formatReminderDate(selectedReminder.reminderDate)}
              </Typography>
              
              <Divider sx={{ my: 2 }} />
              
              <Typography variant="body1" gutterBottom>
                <strong>Message:</strong>
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {selectedReminder.message || "Please contact the tutor for fee payment details."}
              </Typography>
              
              <TextField
                fullWidth
                label="Notes (Optional)"
                placeholder="Add any notes or questions about this payment..."
                variant="outlined"
                margin="normal"
                multiline
                rows={3}
              />
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPaymentDialogOpen(false)}>Close</Button>
          <Button 
            onClick={handlePaymentSubmit} 
            variant="contained" 
            color="primary"
          >
            Submit Inquiry
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}