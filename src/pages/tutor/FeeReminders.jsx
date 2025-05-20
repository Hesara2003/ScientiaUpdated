import * as React from "react";
import { useState, useEffect } from "react";
import { 
  addReminder, 
  getAllReminders, 
  deleteReminder, 
  markReminderResolved,
  getRemindersByStudentId,
  getActiveReminders
} from "../../services/feeReminderService";
import { getAllStudents } from "../../services/studentService";
import { toast } from "react-hot-toast";
import { format, parseISO, isValid } from "date-fns";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
  TextField,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  Box,
  Alert,
  CircularProgress,
  Chip,
  IconButton,
  Paper,
  Typography,
  Grid,
  Tabs,
  Tab,
  Tooltip,
  Divider,
  FormHelperText // Add this import
} from "@mui/material";
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
  Refresh as RefreshIcon,
  FilterList as FilterIcon,
  Search as SearchIcon
} from "@mui/icons-material";

export default function FeeReminders() {
  const [reminders, setReminders] = useState([]);
  const [filteredReminders, setFilteredReminders] = useState([]);
  const [students, setStudents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedReminder, setSelectedReminder] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [tabValue, setTabValue] = useState(0); // 0 = all, 1 = active, 2 = resolved
  const [selectedStudentFilter, setSelectedStudentFilter] = useState("");

  // Form state
  const [formData, setFormData] = useState({
    studentId: "",
    amount: "",
    dueDate: "",
    message: "",
    resolved: false
  });

  useEffect(() => {
    fetchRemindersAndStudents();
  }, []);

  // Apply filters whenever reminders, tab, or selected student changes
  useEffect(() => {
    applyFilters();
  }, [reminders, tabValue, selectedStudentFilter]);

  const applyFilters = () => {
    let result = [...reminders];

    // Filter by status (tab)
    if (tabValue === 1) { // Active/Pending
      result = result.filter(r => !r.resolved);
    } else if (tabValue === 2) { // Resolved
      result = result.filter(r => r.resolved);
    }

    // Filter by student
    if (selectedStudentFilter) {
      result = result.filter(r => 
        r.studentId && r.studentId.toString() === selectedStudentFilter
      );
    }

    // Sort: unresolved first, then by due date
    result.sort((a, b) => {
      if (a.resolved !== b.resolved) return a.resolved ? 1 : -1;
      return new Date(a.dueDate || new Date()) - new Date(b.dueDate || new Date());
    });

    setFilteredReminders(result);
  };
  // Replace the fetchRemindersAndStudents function with this improved version
  const fetchRemindersAndStudents = async () => {
    setIsLoading(true);
    setError(null);
    try {
      // Fetch students first to ensure we have them available for mapping
      const studentsData = await getAllStudents();
      
      // Then fetch reminders
      let remindersData;
      try {
        remindersData = await getAllReminders();
      } catch (apiError) {
        console.warn("Primary API failed, trying backup method:", apiError);
        remindersData = await getActiveReminders();
      }
      
      // Log raw data for debugging
      console.log('Raw students data:', studentsData);
      console.log('Raw reminders data:', remindersData);
      
      // Process reminders data - with enhanced validation
      const validReminders = Array.isArray(remindersData) 
        ? remindersData.filter(reminder => {
            // Enhanced filter with validation logging
            if (!reminder) {
              console.warn('Skipping null/undefined reminder');
              return false;
            }
            
            if (!reminder.id && !reminder.reminderId) {
              console.warn('Skipping reminder without ID:', reminder);
              return false;
            }
            
            return true;
          })
        : [];
      
      // Map students to a lookup object for faster access
      const studentLookup = {};
      if (Array.isArray(studentsData)) {
        studentsData.forEach(student => {
          if (!student) {
            console.warn('Skipping null/undefined student');
            return;
          }
          
          if (student.id) studentLookup[student.id] = student;
          if (student.studentId) studentLookup[student.studentId] = student;
        });
      }
      
      console.log('Students lookup built with keys:', Object.keys(studentLookup));
      
      // Normalize reminder data to ensure consistent structure
      const normalizedReminders = validReminders.map(reminder => {
        // Extract studentId with validation
        let studentId = null;
        if (reminder.studentId) {
          // Try to parse as integer if it's a string
          studentId = typeof reminder.studentId === 'string' ? 
            parseInt(reminder.studentId, 10) : 
            reminder.studentId;
            
          // Check if it's a valid number
          if (isNaN(studentId)) {
            console.warn(`Invalid studentId format: ${reminder.studentId}`);
            studentId = null;
          }
        } else if (reminder.student?.id) {
          studentId = typeof reminder.student.id === 'string' ? 
            parseInt(reminder.student.id, 10) : 
            reminder.student.id;
            
          if (isNaN(studentId)) {
            console.warn(`Invalid student.id format: ${reminder.student.id}`);
            studentId = null;
          }
        }
        
        // Log student mapping for debugging
        if (studentId) {
          const found = studentLookup[studentId];
          if (!found) {
            console.warn(`No student match for ID: ${studentId}`);
          } else {
            console.log(`Found student match for ID ${studentId}:`, found);
          }
        } else {
          console.warn('Reminder has no valid studentId:', reminder);
        }
        
        // Parse amount with validation
        let amount = 0;
        if (reminder.amount !== undefined && reminder.amount !== null) {
          amount = parseFloat(reminder.amount);
          if (isNaN(amount)) {
            console.warn(`Invalid amount format: ${reminder.amount}`);
            amount = 0;
          }
        }
        
        // Determine student name with multiple fallbacks
        let studentName = "Unknown Student";
        // Handle reminders with missing student info
        if (!studentId || studentId <= 0) {
          // First try to get name from embedded student object
          if (reminder.student) {
            const firstName = reminder.student.firstName || '';
            const lastName = reminder.student.lastName || '';
            
            if (firstName || lastName) {
              studentName = `${firstName} ${lastName}`.trim();
            }
          }
          
          // If we have an ID but it's not in our lookup, use a generic name
          if (reminder.id) {
            studentName = `Reminder #${reminder.id}`;
          }
        } else if (studentLookup[studentId]) {
          const student = studentLookup[studentId];
          const firstName = student.firstName || '';
          const lastName = student.lastName || '';
          
          if (firstName || lastName) {
            studentName = `${firstName} ${lastName}`.trim();
          } else {
            studentName = `Student #${studentId}`;
          }
        } else {
          studentName = `Student #${studentId}`;
        }
        
        // Ensure amount is always a valid number
        const safeAmount = reminder.amount !== undefined && reminder.amount !== null ? 
          parseFloat(reminder.amount) : 0;
        
        return {
          id: reminder.id || reminder.reminderId,
          studentId: studentId || null, // Allow null studentId for orphaned reminders
          amount: safeAmount,
          dueDate: formatDateString(reminder.dueDate),
          message: reminder.message || reminder.description || "",
          resolved: Boolean(reminder.resolved),
          createdAt: formatDateString(reminder.createdAt) || new Date().toISOString(),
          studentName: studentName
        };
      });
      
      console.log('Normalized reminders with validation:', normalizedReminders);
      
      setReminders(normalizedReminders);
      setStudents(studentsData || []);
    } catch (err) {
      console.error("Error fetching data:", err);
      setError("Failed to load reminders. Please try again later.");
      toast.error("Failed to load reminders");
    } finally {
      setIsLoading(false);
    }
  };

  // Helper to ensure consistent date format
  const formatDateString = (dateStr) => {
    if (!dateStr) return new Date().toISOString();
    
    try {
      const date = typeof dateStr === 'string' ? new Date(dateStr) : dateStr;
      return isValid(date) ? date.toISOString() : new Date().toISOString();
    } catch (e) {
      console.warn("Invalid date format:", dateStr);
      return new Date().toISOString();
    }
  };

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handleStudentFilterChange = (event) => {
    setSelectedStudentFilter(event.target.value);
  };

  const handleOpenDialog = (reminder = null) => {
    if (reminder) {
      setSelectedReminder(reminder);
      setFormData({
        studentId: reminder.studentId?.toString() || "",
        amount: reminder.amount?.toString() || "",
        dueDate: reminder.dueDate?.split('T')[0] || "", // Format date for date input
        message: reminder.message || "",
        resolved: Boolean(reminder.resolved)
      });
    } else {
      setSelectedReminder(null);
      setFormData({
        studentId: "",
        amount: "",
        dueDate: new Date().toISOString().split('T')[0], // Default to today
        message: "",
        resolved: false
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  // Update handleSubmit function with enhanced validation and type conversion
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Debug log form data
    console.log("Form data at submission:", formData);
    
    // Enhanced validation with detailed feedback
    if (!formData.studentId || formData.studentId === "") {
      toast.error("Please select a student");
      return;
    }
    
    if (!formData.amount || formData.amount === "" || parseFloat(formData.amount) <= 0) {
      toast.error("Please enter a valid amount (greater than 0)");
      return;
    }
    
    if (!formData.dueDate) {
      toast.error("Please select a due date");
      return;
    }
    
    try {
      // Parse and validate studentId before submission
      const parsedStudentId = parseInt(formData.studentId, 10);
      if (isNaN(parsedStudentId) || parsedStudentId <= 0) {
        toast.error("Invalid student ID. Please select a valid student.");
        return;
      }
      
      // Parse and validate amount before submission
      const parsedAmount = parseFloat(formData.amount);
      if (isNaN(parsedAmount) || parsedAmount <= 0) {
        toast.error("Amount must be a valid number greater than zero");
        return;
      }
      
      // CRITICAL FIX: Convert values to proper types for backend with strict validation
      const reminderData = {
        // Convert studentId to numeric with validation
        studentId: parsedStudentId,
        // Parse amount to numeric with validation
        amount: parsedAmount,
        // Format date properly
        dueDate: new Date(formData.dueDate).toISOString(),
        message: formData.message || "",
        resolved: Boolean(formData.resolved)
      };
      
      // Extra validation log to ensure data is properly formatted
      console.log("Validated data being sent to backend:", reminderData);
      
      let result;
      if (selectedReminder) {
        // Update logic unchanged
        if (selectedReminder.id) {
          await markReminderResolved(selectedReminder.id, reminderData.resolved);
          toast.success("Fee reminder status updated");
        } else {
          toast.error("Cannot update reminder: Missing ID");
        }
      } else {
        // Add new reminder with properly formatted and validated data
        result = await addReminder(reminderData);
        console.log("Created reminder:", result);
        toast.success("Fee reminder sent successfully");
      }
      
      // Refresh reminders
      fetchRemindersAndStudents();
      handleCloseDialog();
    } catch (err) {
      console.error("Error saving fee reminder:", err);
      toast.error(err.message || "Failed to save fee reminder");
    }
  };

  const handleDeleteClick = (reminder) => {
    setSelectedReminder(reminder);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!selectedReminder || !selectedReminder.id) {
      toast.error("Invalid reminder selected");
      setDeleteDialogOpen(false);
      return;
    }
    
    try {
      await deleteReminder(selectedReminder.id);
      toast.success("Fee reminder deleted successfully");
      fetchRemindersAndStudents();
    } catch (err) {
      console.error("Error deleting reminder:", err);
      toast.error(err.message || "Failed to delete fee reminder");
    } finally {
      setDeleteDialogOpen(false);
    }
  };

  const handleToggleResolved = async (reminder) => {
    if (!reminder || !reminder.id) {
      toast.error("Invalid reminder selected");
      return;
    }
    
    try {
      await markReminderResolved(reminder.id, !reminder.resolved);
      toast.success(`Reminder marked as ${!reminder.resolved ? "resolved" : "unresolved"}`);
      fetchRemindersAndStudents();
    } catch (err) {
      console.error("Error updating reminder status:", err);
      toast.error(err.message || "Failed to update reminder status");
    }
  };

  // Replace the getStudentName function with this improved version
  const getStudentName = (studentId) => {
    // Handle null/undefined values
    if (!studentId) {
      console.warn('Student ID is undefined or null');
      return "Unknown Student";
    }
    
    try {
      // Convert to string for consistent comparison
      const searchId = studentId.toString();
      
      // Find student with matching ID (checking both id and studentId fields)
      const student = students.find(s => {
        // Handle potential undefined values
        const sId = s.id?.toString() || "";
        const sStudentId = s.studentId?.toString() || "";
        
        // Debug logging when student IDs don't match
        if (process.env.NODE_ENV === 'development' && 
            (sId === searchId || sStudentId === searchId)) {
          console.log('Found student match:', s);
        }
        
        return sId === searchId || sStudentId === searchId;
      });
      
      if (student) {
        // Make sure we have at least one name part
        const firstName = student.firstName || '';
        const lastName = student.lastName || '';
        
        if (!firstName && !lastName) {
          return `Student #${studentId}`;
        }
        
        return `${firstName} ${lastName}`.trim();
      } else {
        // Log when student isn't found
        console.warn(`Student with ID ${studentId} not found in student list`);
        return `Student #${studentId}`;
      }
    } catch (err) {
      console.error('Error in getStudentName:', err);
      return `Student #${studentId}`;
    }
  };

  const getStatusChip = (reminder) => {
    if (reminder.resolved) {
      return <Chip label="Resolved" color="success" size="small" />;
    } else {
      // Check if overdue
      const dueDate = new Date(reminder.dueDate);
      const today = new Date();
      
      if (dueDate < today) {
        return <Chip label="Overdue" color="error" size="small" />;
      } else {
        return <Chip label="Pending" color="warning" size="small" />;
      }
    }
  };
  // Add this helper function to the component
  const formatAmount = (amount) => {
    // Enhanced validation for amount display
    if (amount === undefined || amount === null || amount === "" || isNaN(parseFloat(amount))) {
      console.warn('Invalid amount value for display:', amount);
      return '0.00';
    }
    
    try {
      // Convert to number and format with 2 decimal places
      const numAmount = parseFloat(amount);
      if (numAmount <= 0) {
        console.warn('Non-positive amount value:', numAmount);
      }
      return numAmount.toFixed(2);
    } catch (err) {
      console.error('Error formatting amount:', err, amount);
      return '0.00';
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3, alignItems: 'center' }}>
        <Typography variant="h4" component="h1">Fee Reminders</Typography>
        <Box>
          <Tooltip title="Refresh data">
            <IconButton onClick={fetchRemindersAndStudents} sx={{ mr: 1 }}>
              <RefreshIcon />
            </IconButton>
          </Tooltip>
          <Button 
            variant="contained" 
            startIcon={<AddIcon />} 
            onClick={() => handleOpenDialog()}
          >
            New Fee Reminder
          </Button>
        </Box>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>
      )}

      {/* Filter options */}
      <Box sx={{ mb: 3, display: 'flex', flexDirection: {xs: 'column', md: 'row'}, gap: 2 }}>
        <Tabs 
          value={tabValue} 
          onChange={handleTabChange} 
          indicatorColor="primary"
          textColor="primary"
        >
          <Tab label={`All (${reminders.length})`} />
          <Tab label={`Pending (${reminders.filter(r => !r.resolved).length})`} />
          <Tab label={`Resolved (${reminders.filter(r => r.resolved).length})`} />
        </Tabs>
        
        <Box sx={{ flexGrow: 1 }} />
        
        <FormControl sx={{ minWidth: 200 }} size="small">
          <InputLabel id="student-filter-label">Filter by Student</InputLabel>
          <Select
            labelId="student-filter-label"
            value={selectedStudentFilter}
            onChange={handleStudentFilterChange}
            label="Filter by Student"
          >
            <MenuItem value="">All Students</MenuItem>
            {students.map((student) => (
              <MenuItem 
                key={student.id || student.studentId} 
                value={student.id?.toString() || student.studentId?.toString()}
              >
                {student.firstName} {student.lastName}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>

      {isLoading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 5 }}>
          <CircularProgress />
        </Box>
      ) : filteredReminders.length === 0 ? (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <WarningIcon sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h6" gutterBottom>No Fee Reminders</Typography>
          <Typography variant="body1" color="text.secondary" gutterBottom>
            {selectedStudentFilter || tabValue > 0 
              ? "No reminders match your current filters." 
              : "You haven't created any fee reminders yet."}
          </Typography>
          {selectedStudentFilter || tabValue > 0 ? (
            <Button 
              variant="outlined" 
              sx={{ mt: 2 }} 
              startIcon={<FilterIcon />}
              onClick={() => {
                setSelectedStudentFilter("");
                setTabValue(0);
              }}
            >
              Clear Filters
            </Button>
          ) : (
            <Button 
              variant="outlined" 
              sx={{ mt: 2 }} 
              startIcon={<AddIcon />}
              onClick={() => handleOpenDialog()}
            >
              Create Your First Reminder
            </Button>
          )}
        </Paper>
      ) : (
        <Box sx={{ display: 'grid', gridTemplateColumns: {
          xs: '1fr', 
          md: 'repeat(2, 1fr)', 
          lg: 'repeat(3, 1fr)'
        }, gap: 3 }}>
          {filteredReminders.map((reminder) => (
            <Paper 
              key={reminder.id}
              sx={{ 
                p: 3, 
                border: '1px solid',
                borderColor: reminder.resolved ? 'success.light' : 
                  new Date(reminder.dueDate) < new Date() ? 'error.light' : 'warning.light',
                opacity: reminder.resolved ? 0.8 : 1,
                position: 'relative',
                transition: 'all 0.3s ease',
                '&:hover': {
                  boxShadow: 3
                }
              }}
            >
              <Box sx={{ position: 'absolute', top: 12, right: 12 }}>
                {getStatusChip(reminder)}
              </Box>
                <Typography variant="h6" gutterBottom>
                ${formatAmount(reminder.amount)} Payment Due
                {reminder.amount <= 0 && 
                  <Tooltip title="Invalid amount value">
                    <WarningIcon color="error" fontSize="small" sx={{ml: 1, verticalAlign: 'middle'}} />
                  </Tooltip>
                }
              </Typography>
              
              <Typography variant="body2" color="text.secondary" gutterBottom>
                <strong>Student:</strong> {reminder.studentName}
                {reminder.studentName === "Unknown Student" && 
                  <Tooltip title="Student not found in system">
                    <WarningIcon color="error" fontSize="small" sx={{ml: 1, verticalAlign: 'middle'}} />
                  </Tooltip>
                }
              </Typography>
              
              <Typography variant="body2" color="text.secondary" gutterBottom>
                <strong>Due Date:</strong> {reminder.dueDate ? 
                  format(parseISO(reminder.dueDate), 'PPP') : 
                  "No date specified"}
              </Typography>
              
              <Divider sx={{ my: 1.5 }} />
              
              <Typography variant="body2" sx={{ mt: 2, mb: 2, minHeight: '3em', maxHeight: '4.5em', overflow: 'hidden' }}>
                {reminder.message || "No additional message"}
              </Typography>
              
              <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
                <Tooltip title={reminder.resolved ? "Mark as Pending" : "Mark as Resolved"}>
                  <IconButton 
                    color={reminder.resolved ? "default" : "success"}
                    onClick={() => handleToggleResolved(reminder)}
                  >
                    <CheckCircleIcon />
                  </IconButton>
                </Tooltip>
                
                <Tooltip title="Delete Reminder">
                  <IconButton 
                    color="error" 
                    onClick={() => handleDeleteClick(reminder)}
                  >
                    <DeleteIcon />
                  </IconButton>
                </Tooltip>
              </Box>
            </Paper>
          ))}
        </Box>
      )}

      {/* Add/Edit Reminder Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          {selectedReminder ? "Edit Fee Reminder" : "Send New Fee Reminder"}
        </DialogTitle>
        <DialogContent>
          <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1 }}>
            <FormControl fullWidth margin="normal" error={!formData.studentId}>
              <InputLabel id="student-label">Student *</InputLabel>              <Select
                labelId="student-label"
                id="studentId"
                name="studentId"
                value={formData.studentId}
                onChange={(e) => {
                  const selectedId = e.target.value;
                  // Enhanced validation for student ID
                  if (selectedId) {
                    // Find the selected student to verify it's valid
                    const selectedStudent = students.find(s => 
                      (s.id?.toString() === selectedId || s.studentId?.toString() === selectedId)
                    );
                    
                    if (selectedStudent) {
                      console.log("Selected valid student:", selectedStudent);
                      setFormData(prev => ({...prev, studentId: selectedId}));
                    } else {
                      console.warn("Invalid student ID selected:", selectedId);
                      toast.error("Invalid student selected");
                    }
                  } else {
                    console.warn("Empty student selection");
                    setFormData(prev => ({...prev, studentId: ""}));
                  }
                }}
                label="Student *"
                required
                disabled={selectedReminder !== null}
              >
                {students.length === 0 ? (
                  <MenuItem value="" disabled>No students available</MenuItem>
                ) : (
                  students.map((student) => {
                    // Use explicit id for value
                    const id = student.id?.toString() || student.studentId?.toString();
                    // Skip invalid entries
                    if (!id) return null;
                    
                    const name = `${student.firstName || ''} ${student.lastName || ''}`.trim();
                    
                    return (
                      <MenuItem 
                        key={id} 
                        value={id}
                      >
                        {name || `Student #${id}`}
                      </MenuItem>
                    );
                  })
                )}
              </Select>
              {!formData.studentId && <FormHelperText>Student is required</FormHelperText>}
            </FormControl>
              <TextField
              margin="normal"
              required
              fullWidth
              name="amount"
              label="Amount Due ($) *"
              type="number"
              inputProps={{ 
                min: 0.01, 
                step: 0.01
              }}
              value={formData.amount}
              onChange={(e) => {
                // Enhanced validation to prevent invalid amounts
                const value = e.target.value;
                // Allow empty string (for typing) or valid positive numbers
                if (value === "" || (parseFloat(value) > 0 && !isNaN(parseFloat(value)))) {
                  setFormData(prev => ({...prev, amount: value}));
                  console.log("Amount updated to:", value);
                } else {
                  console.warn("Rejected invalid amount:", value);
                }
              }}
              disabled={selectedReminder !== null}
              error={!formData.amount || parseFloat(formData.amount) <= 0}
              helperText={!formData.amount ? 
                "Amount is required" : 
                parseFloat(formData.amount) <= 0 ? 
                "Amount must be greater than zero" : ""}
            />
            
            <TextField
              margin="normal"
              required
              fullWidth
              name="dueDate"
              label="Due Date"
              type="date"
              InputLabelProps={{ shrink: true }}
              value={formData.dueDate}
              onChange={handleInputChange}
              disabled={selectedReminder !== null}
            />
            
            <TextField
              margin="normal"
              fullWidth
              name="message"
              label="Message"
              multiline
              rows={4}
              value={formData.message}
              onChange={handleInputChange}
              disabled={selectedReminder !== null}
            />
            
            {selectedReminder && (
              <FormControl fullWidth margin="normal">
                <InputLabel id="status-label">Status</InputLabel>
                <Select
                  labelId="status-label"
                  name="resolved"
                  value={formData.resolved}
                  onChange={handleInputChange}
                  label="Status"
                >
                  <MenuItem value={false}>Pending</MenuItem>
                  <MenuItem value={true}>Resolved</MenuItem>
                </Select>
              </FormControl>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained" color="primary">
            {selectedReminder ? "Update" : "Send Reminder"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
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