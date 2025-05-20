import * as React from "react";
import { useState, useEffect } from "react";
import { getRemindersByStudentId } from "../../services/feeReminderService";
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
  ListItemIcon
} from "@mui/material";
import {
  WarningAmber as WarningIcon,
  CheckCircle as CheckCircleIcon,
  AttachMoney as MoneyIcon
} from "@mui/icons-material";

export default function StudentFeeReminders() {
  const [reminders, setReminders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Mock student ID - in a real app, this would come from auth context
  const studentId = "101"; // Example student ID
  
  useEffect(() => {
    fetchReminders();
  }, []);
  
  const fetchReminders = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await getRemindersByStudentId(studentId);
      
      // Sort by due date (urgent first)
      const sortedReminders = data.sort((a, b) => {
        if (a.resolved !== b.resolved) return a.resolved ? 1 : -1;
        return new Date(a.dueDate) - new Date(b.dueDate);
      });
      
      setReminders(sortedReminders);
    } catch (err) {
      console.error("Error fetching reminders:", err);
      setError("Failed to load fee reminders. Please try again later.");
      toast.error("Failed to load fee information");
    } finally {
      setIsLoading(false);
    }
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
            You have no fee reminders at this time.
          </Typography>
        </Paper>
      ) : (
        <>
          {pendingReminders.length > 0 && (
            <Box sx={{ mb: 4 }}>
              <Alert severity="warning" sx={{ mb: 3 }}>
                <AlertTitle>Payment Required</AlertTitle>
                You have {pendingReminders.length} pending payment(s) that require attention.
                Please ask your parent or guardian to handle these payments.
              </Alert>
              
              <Typography variant="h6" gutterBottom>
                Pending Payments
              </Typography>
              
              <Paper sx={{ overflow: 'hidden' }}>                <List sx={{ width: '100%' }}>
                  {pendingReminders.map((reminder, index) => (
                    <React.Fragment key={reminder.id}>
                      {index > 0 && <Divider component="li" />}
                      <ListItem alignItems="flex-start">
                        <ListItemIcon>
                          <MoneyIcon color={isPast(parseISO(reminder.dueDate)) ? "error" : "warning"} />
                        </ListItemIcon>
                        <ListItemText
                          primary={
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <Typography variant="subtitle1">
                                ${(reminder.amount !== undefined ? reminder.amount : 0).toFixed(2)} Payment Due
                              </Typography>
                              <Chip 
                                size="small"
                                label={isPast(parseISO(reminder.dueDate)) ? "Overdue" : "Due Soon"} 
                                color={isPast(parseISO(reminder.dueDate)) ? "error" : "warning"} 
                              />
                            </Box>
                          }
                          secondary={
                            <>
                              <Typography component="span" variant="body2" color="text.primary">
                                Due Date: {format(parseISO(reminder.dueDate), 'PPP')}
                              </Typography>
                              <Typography variant="body2" display="block">
                                {reminder.message}
                              </Typography>
                            </>
                          }
                        />
                      </ListItem>
                    </React.Fragment>
                  ))}
                </List>
              </Paper>
            </Box>
          )}
          
          {resolvedReminders.length > 0 && (
            <Box>
              <Typography variant="h6" gutterBottom>
                Payment History
              </Typography>
              
              <Paper sx={{ overflow: 'hidden' }}>                <List sx={{ width: '100%' }}>
                  {resolvedReminders.map((reminder, index) => (
                    <React.Fragment key={reminder.id}>
                      {index > 0 && <Divider component="li" />}
                      <ListItem alignItems="flex-start">
                        <ListItemIcon>
                          <CheckCircleIcon color="success" />
                        </ListItemIcon>
                        <ListItemText
                          primary={
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <Typography variant="subtitle1">
                                ${(reminder.amount !== undefined ? reminder.amount : 0).toFixed(2)} Payment
                              </Typography>
                              <Chip 
                                size="small"
                                label="Paid" 
                                color="success" 
                              />
                            </Box>
                          }
                          secondary={
                            <Typography component="span" variant="body2" color="text.primary">
                              Due Date: {format(parseISO(reminder.dueDate), 'PPP')}
                            </Typography>
                          }
                        />
                      </ListItem>
                    </React.Fragment>
                  ))}
                </List>
              </Paper>
            </Box>
          )}
        </>
      )}
    </Box>
  );
}