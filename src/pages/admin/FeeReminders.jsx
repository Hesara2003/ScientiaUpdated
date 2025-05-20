import * as React from "react";
import { useState, useEffect } from "react";
import { 
  getAllReminders, 
  deleteReminder, 
  markReminderResolved 
} from "../../services/feeReminderService";
import { getAllStudents } from "../../services/studentService";
import { getAllTutors } from "../../services/tutorService";
import { toast } from "react-hot-toast";
import { format, parseISO } from "date-fns";
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
  Button,
  IconButton,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Alert,
  CircularProgress,
  TextField
} from "@mui/material";
import {
  Delete as DeleteIcon,
  CheckCircle as CheckCircleIcon,
  Search as SearchIcon
} from "@mui/icons-material";

export default function AdminFeeReminders() {
  const [reminders, setReminders] = useState([]);
  const [students, setStudents] = useState([]);
  const [tutors, setTutors] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedReminder, setSelectedReminder] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [remindersData, studentsData, tutorsData] = await Promise.all([
        getAllReminders(),
        getAllStudents(),
        getAllTutors()
      ]);
      
      // Sort reminders by due date, unresolved first
      const sortedReminders = remindersData.sort((a, b) => {
        if (a.resolved !== b.resolved) return a.resolved ? 1 : -1;
        return new Date(a.dueDate) - new Date(b.dueDate);
      });
      
      setReminders(sortedReminders);
      setStudents(studentsData);
      setTutors(tutorsData);
    } catch (err) {
      console.error("Error fetching data:", err);
      setError("Failed to load reminders. Please try again later.");
      toast.error("Failed to load fee reminders");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteClick = (reminder) => {
    setSelectedReminder(reminder);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    try {
      await deleteReminder(selectedReminder.id);
      toast.success("Fee reminder deleted successfully");
      fetchAllData();
    } catch (err) {
      console.error("Error deleting reminder:", err);
      toast.error("Failed to delete fee reminder");
    } finally {
      setDeleteDialogOpen(false);
    }
  };

  const handleToggleResolved = async (reminder) => {
    try {
      await markReminderResolved(reminder.id, !reminder.resolved);
      toast.success(`Reminder marked as ${!reminder.resolved ? "resolved" : "unresolved"}`);
      fetchAllData();
    } catch (err) {
      console.error("Error updating reminder status:", err);
      toast.error("Failed to update reminder status");
    }
  };

  const getStudentName = (studentId) => {
    const student = students.find(s => s.id?.toString() === studentId?.toString() || 
                                      s.studentId?.toString() === studentId?.toString());
    return student ? `${student.firstName} ${student.lastName}` : "Unknown Student";
  };

  const getTutorName = (tutorId) => {
    const tutor = tutors.find(t => t.id?.toString() === tutorId?.toString());
    return tutor ? `${tutor.firstName} ${tutor.lastName}` : "Unknown Tutor";
  };

  const filteredReminders = reminders.filter(reminder => {
    if (!searchTerm) return true;
    
    const studentName = getStudentName(reminder.studentId).toLowerCase();
    const tutorName = getTutorName(reminder.tutorId).toLowerCase();
    const searchLower = searchTerm.toLowerCase();
    
    return studentName.includes(searchLower) || 
           tutorName.includes(searchLower) ||
           reminder.amount.toString().includes(searchLower);
  });

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Fee Reminders
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>
      )}

      <Box sx={{ mb: 3, display: 'flex', alignItems: 'center' }}>
        <Box sx={{ position: 'relative', flexGrow: 1, maxWidth: 500 }}>
          <TextField
            fullWidth
            placeholder="Search by student or tutor name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            variant="outlined"
            InputProps={{
              startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />
            }}
          />
        </Box>
        <Button 
          variant="contained" 
          sx={{ ml: 2 }}
          onClick={fetchAllData}
        >
          Refresh
        </Button>
      </Box>

      {isLoading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 5 }}>
          <CircularProgress />
        </Box>
      ) : filteredReminders.length === 0 ? (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="h6" gutterBottom>No Fee Reminders Found</Typography>
          <Typography variant="body1" color="text.secondary">
            {searchTerm ? "Try adjusting your search term" : "There are no fee reminders in the system yet"}
          </Typography>
        </Paper>
      ) : (
        <TableContainer component={Paper}>
          <Table sx={{ minWidth: 650 }}>
            <TableHead>
              <TableRow>
                <TableCell>Student</TableCell>
                <TableCell>Tutor</TableCell>
                <TableCell>Amount</TableCell>
                <TableCell>Due Date</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Message</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredReminders.map((reminder) => (
                <TableRow 
                  key={reminder.id}
                  sx={{ 
                    '&:last-child td, &:last-child th': { border: 0 },
                    opacity: reminder.resolved ? 0.7 : 1
                  }}
                >
                  <TableCell>{getStudentName(reminder.studentId)}</TableCell>
                  <TableCell>{getTutorName(reminder.tutorId)}</TableCell>
                  <TableCell>${(reminder.amount !== undefined ? reminder.amount : 0).toFixed(2)}</TableCell>
                  <TableCell>
                    {reminder.dueDate 
                      ? format(parseISO(reminder.dueDate), 'PP')
                      : 'No due date'
                    }
                  </TableCell>
                  <TableCell>
                    <Chip 
                      label={reminder.resolved ? "Resolved" : "Pending"} 
                      color={reminder.resolved ? "success" : "warning"} 
                      size="small" 
                    />
                  </TableCell>
                  <TableCell>{reminder.message}</TableCell>
                  <TableCell align="right">
                    <IconButton
                      color={reminder.resolved ? "default" : "success"}
                      onClick={() => handleToggleResolved(reminder)}
                      size="small"
                    >
                      <CheckCircleIcon />
                    </IconButton>
                    <IconButton
                      color="error"
                      onClick={() => handleDeleteClick(reminder)}
                      size="small"
                    >
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Delete Confirmation Dialog */}
      <Dialog 
        open={deleteDialogOpen} 
        onClose={() => setDeleteDialogOpen(false)}
      >
        <DialogTitle>Delete Fee Reminder</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete this fee reminder? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleDeleteConfirm} color="error">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}