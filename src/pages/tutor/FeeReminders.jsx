import * as React from "react";
import { useState, useEffect } from "react";
import { 
  addReminder, 
  getAllReminders, 
  deleteReminder, 
  updateReminder,
  getRemindersByStudentId
} from "../../services/feeReminderService";
import { getAllStudents, getStudentById } from "../../services/studentService";
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
  FormHelperText,
  Card,
  CardContent,
  CardActions,
  Fade,
  Zoom,
  Container,
  Stack,
  Badge,
  Avatar
} from "@mui/material";
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  Warning as WarningIcon,
  Refresh as RefreshIcon,
  FilterList as FilterIcon,
  Search as SearchIcon,
  CalendarToday as CalendarIcon,
  Person as PersonIcon,
  Message as MessageIcon,
  CheckCircle as CheckCircleIcon,
  Schedule as ScheduleIcon
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
  const [selectedStudentFilter, setSelectedStudentFilter] = useState("");

  // Form state - matching backend model
  const [formData, setFormData] = useState({
    studentId: "",
    reminderDate: "",
    message: ""
  });

  useEffect(() => {
    fetchRemindersAndStudents();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [reminders, selectedStudentFilter]);

  const applyFilters = () => {
    let result = [...reminders];

    // Filter by student
    if (selectedStudentFilter) {
      result = result.filter(r => 
        r.student && r.student.id && 
        r.student.id.toString() === selectedStudentFilter
      );
    }

    // Sort by reminder date (most recent first)
    result.sort((a, b) => {
      const dateA = new Date(a.reminderDate || new Date());
      const dateB = new Date(b.reminderDate || new Date());
      return dateB - dateA;
    });

    setFilteredReminders(result);
  };

  const fetchRemindersAndStudents = async () => {
    setIsLoading(true);
    setError(null);
    try {
      console.log("Starting to fetch students and reminders...");
      
      // Fetch students first and log the result
      const studentsData = await getAllStudents();
      console.log('Students API response:', studentsData);
      
      // Fetch reminders
      const remindersData = await getAllReminders();
      console.log('Reminders API response:', remindersData);
      
      // Handle students data - the API should return an array directly
      let processedStudents = [];
      if (Array.isArray(studentsData)) {
        processedStudents = studentsData;
      } else if (studentsData && studentsData.data && Array.isArray(studentsData.data)) {
        processedStudents = studentsData.data;
      } else if (studentsData && studentsData.content && Array.isArray(studentsData.content)) {
        processedStudents = studentsData.content;
      } else {
        console.warn("Students data is not in expected format:", studentsData);
        processedStudents = [];
      }
      
      // Normalize student data - ensure consistent ID field
      const normalizedStudents = processedStudents.map(student => ({
        ...student,
        id: student.id || student.studentId, // Ensure we have an ID
        // Ensure we have basic required fields
        firstName: student.firstName || '',
        lastName: student.lastName || '',
        email: student.email || ''
      })).filter(student => student.id); // Remove any students without valid IDs
    
    // Handle reminders data
    let processedReminders = [];
    if (Array.isArray(remindersData)) {
      processedReminders = remindersData;
    } else if (remindersData && remindersData.data && Array.isArray(remindersData.data)) {
      processedReminders = remindersData.data;
    } else if (remindersData && remindersData.content && Array.isArray(remindersData.content)) {
      processedReminders = remindersData.content;
    } else {
      console.warn("Reminders data is not in expected format:", remindersData);
      processedReminders = [];
    }
    
    // Enrich reminders with complete student data
    const enrichedReminders = await Promise.all(
      processedReminders.map(async (reminder) => {
        if (reminder.student && reminder.student.id) {
          // First try to find student in our normalized students array
          let fullStudent = normalizedStudents.find(s => 
            s.id?.toString() === reminder.student.id?.toString()
          );
          
          // If not found in the array, try to fetch individually
          if (!fullStudent) {
            try {
              console.log(`Fetching individual student data for ID: ${reminder.student.id}`);
              fullStudent = await getStudentById(reminder.student.id);
            } catch (error) {
              console.warn(`Could not fetch student ${reminder.student.id}:`, error);
              // Use the minimal student data we have
              fullStudent = {
                id: reminder.student.id,
                firstName: reminder.student.firstName || 'Unknown',
                lastName: reminder.student.lastName || 'Student',
                email: reminder.student.email || ''
              };
            }
          }
          
          if (fullStudent) {
            return {
              ...reminder,
              student: {
                id: fullStudent.id,
                firstName: fullStudent.firstName || '',
                lastName: fullStudent.lastName || '',
                email: fullStudent.email || '',
                // Include any other student fields that might be useful
                ...fullStudent
              }
            };
          }
        }
        
        // Return reminder as-is if we can't enrich it
        return reminder;
      })
    );
    
    console.log('Processed students:', normalizedStudents);
    console.log('Enriched reminders:', enrichedReminders);
    
    // Verify data integrity
    if (normalizedStudents.length === 0) {
      console.warn("No students were loaded!");
      toast.warning("No students found. Please add students first.");
    }
    
    // Check if all reminders have valid student data
    const remindersWithoutStudents = enrichedReminders.filter(r => !r.student || !r.student.id);
    if (remindersWithoutStudents.length > 0) {
      console.warn("Some reminders don't have valid student data:", remindersWithoutStudents);
    }
    
    setStudents(normalizedStudents);
    setReminders(enrichedReminders);
    
  } catch (err) {
    console.error("Error fetching data:", err);
    console.error("Error details:", {
      message: err.message,
      response: err.response?.data,
      status: err.response?.status
    });
    setError("Failed to load reminders. Please try again later.");
    toast.error("Failed to load reminders: " + (err.message || "Unknown error"));
  } finally {
    setIsLoading(false);
  }
};

  const handleStudentFilterChange = (event) => {
    setSelectedStudentFilter(event.target.value);
  };

  const handleOpenDialog = (reminder = null) => {
    console.log("Opening dialog with reminder:", reminder);
    console.log("Available students:", students);
    console.log("Students count:", students.length);
    
    if (reminder) {
      setSelectedReminder(reminder);
      setFormData({
        studentId: reminder.student?.id?.toString() || "",
        reminderDate: reminder.reminderDate?.split('T')[0] || "",
        message: reminder.message || ""
      });
    } else {
      setSelectedReminder(null);
      setFormData({
        studentId: "",
        reminderDate: new Date().toISOString().split('T')[0],
        message: ""
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedReminder(null);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    console.log("Form data at submission:", formData);
    
    // Validation
    if (!formData.studentId || formData.studentId === "") {
      toast.error("Please select a student");
      return;
    }
    
    if (!formData.reminderDate) {
      toast.error("Please select a reminder date");
      return;
    }
    
    try {
      const parsedStudentId = parseInt(formData.studentId, 10);
      if (isNaN(parsedStudentId) || parsedStudentId <= 0) {
        toast.error("Invalid student ID. Please select a valid student.");
        return;
      }
      
      // Find the full student object from our students array
      const selectedStudent = students.find(student => 
        (student.id || student.studentId)?.toString() === formData.studentId
      );
      
      if (!selectedStudent) {
        toast.error("Selected student not found. Please refresh and try again.");
        return;
      }
      
      // Build payload with complete student object (to prevent backend from creating new student)
      const reminderData = {
        student: {
          id: selectedStudent.id,
          firstName: selectedStudent.firstName,
          lastName: selectedStudent.lastName,
          email: selectedStudent.email,
          // Include other essential fields to ensure backend recognizes existing student
          studentId: selectedStudent.studentId,
          phoneNumber: selectedStudent.phoneNumber,
          address: selectedStudent.address,
          dateOfBirth: selectedStudent.dateOfBirth,
          enrollmentDate: selectedStudent.enrollmentDate
        },
        reminderDate: new Date(formData.reminderDate).toISOString(),
        message: formData.message || ""
      };
      
      console.log("Validated data being sent to backend:", reminderData);
      console.log("Selected student object:", selectedStudent);
      
      if (selectedReminder) {
        // Update existing reminder
        await updateReminder(selectedReminder.id, reminderData);
        toast.success("Fee reminder updated successfully");
      } else {
        // Add new reminder
        const newReminder = await addReminder(reminderData);
        console.log("New reminder created:", newReminder);
        toast.success("Fee reminder created successfully");
      }
      
      // Refresh data to get updated information
      await fetchRemindersAndStudents();
      handleCloseDialog();
    } catch (err) {
      console.error("Error saving fee reminder:", err);
      console.error("Full error object:", err);
      
      // More detailed error handling
      if (err.response?.data?.message) {
        toast.error(`Failed to save reminder: ${err.response.data.message}`);
      } else if (err.message) {
        toast.error(`Failed to save reminder: ${err.message}`);
      } else {
        toast.error("Failed to save fee reminder. Please try again.");
      }
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
      setSelectedReminder(null);
    }
  };

  const getStudentName = (reminder) => {
    console.log("Getting student name for reminder:", reminder);
    
    if (!reminder.student) {
      console.warn("Reminder has no student object:", reminder);
      return "Unknown Student";
    }
    
    const student = reminder.student;
    console.log("Reminder student object:", student);
    
    // Get name from the student object
    const firstName = student.firstName || '';
    const lastName = student.lastName || '';
    const fullName = `${firstName} ${lastName}`.trim();
    
    if (fullName) {
      console.log("Got student name:", fullName);
      return fullName;
    }
    
    // Fallback to student ID if no name available
    const studentId = student.id || student.studentId;
    if (studentId) {
      return `Student #${studentId}`;
    }
    
    console.warn("Student has no valid name or ID:", student);
    return "Unknown Student";
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

  // Add this helper function near the top of your component
  const validateStudentData = (student) => {
    if (!student) return false;
    if (!student.id && !student.studentId) return false;
    return true;
  };

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {/* Header Section with Gradient */}
      <Box 
        sx={{ 
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          borderRadius: 3,
          color: 'white',
          p: 4,
          mb: 4,
          position: 'relative',
          overflow: 'hidden',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'linear-gradient(45deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0) 100%)',
            zIndex: 1
          }
        }}
      >
        <Box sx={{ position: 'relative', zIndex: 2 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Box>
              <Typography variant="h3" component="h1" sx={{ fontWeight: 'bold', mb: 1 }}>
                Fee Reminders
              </Typography>
              <Typography variant="h6" sx={{ opacity: 0.9 }}>
                Manage and track student fee reminders efficiently
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Tooltip title="Refresh data">
                <IconButton 
                  onClick={fetchRemindersAndStudents} 
                  sx={{ 
                    color: 'white',
                    backgroundColor: 'rgba(255,255,255,0.2)',
                    '&:hover': { backgroundColor: 'rgba(255,255,255,0.3)' }
                  }}
                >
                  <RefreshIcon />
                </IconButton>
              </Tooltip>
              <Button 
                variant="contained" 
                startIcon={<AddIcon />} 
                onClick={() => handleOpenDialog()}
                sx={{
                  backgroundColor: 'rgba(255,255,255,0.2)',
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(255,255,255,0.3)',
                  color: 'white',
                  fontWeight: 'bold',
                  px: 3,
                  '&:hover': {
                    backgroundColor: 'rgba(255,255,255,0.3)',
                    transform: 'translateY(-2px)',
                    boxShadow: '0 8px 25px rgba(0,0,0,0.2)'
                  },
                  transition: 'all 0.3s ease'
                }}
              >
                New Reminder
              </Button>
            </Box>
          </Box>
        </Box>
      </Box>

      {error && (
        <Fade in={true}>
          <Alert 
            severity="error" 
            sx={{ 
              mb: 3,
              borderRadius: 2,
              boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
            }}
          >
            {error}
          </Alert>
        </Fade>
      )}

      {/* Stats and Filter Section */}
      <Card sx={{ mb: 4, borderRadius: 3, boxShadow: '0 8px 32px rgba(0,0,0,0.1)' }}>
        <CardContent sx={{ p: 3 }}>
          <Box sx={{ display: 'flex', flexDirection: {xs: 'column', md: 'row'}, gap: 3, alignItems: 'center' }}>
            {/* Stats */}
            <Box sx={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="h4" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
                  {reminders.length}
                </Typography>
                <Typography variant="body2" color="text.secondary">Total Reminders</Typography>
              </Box>
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="h4" sx={{ fontWeight: 'bold', color: 'warning.main' }}>
                  {reminders.filter(r => isOverdue(r.reminderDate)).length}
                </Typography>
                <Typography variant="body2" color="text.secondary">Overdue</Typography>
              </Box>
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="h4" sx={{ fontWeight: 'bold', color: 'success.main' }}>
                  {reminders.filter(r => !isOverdue(r.reminderDate)).length}
                </Typography>
                <Typography variant="body2" color="text.secondary">Upcoming</Typography>
              </Box>
            </Box>
            
            <Box sx={{ flexGrow: 1 }} />
            
            {/* Filter */}
            <FormControl sx={{ minWidth: 250 }} size="small">
              <InputLabel 
                id="student-filter-label"
                sx={{ 
                  '&.Mui-focused': { color: 'primary.main' }
                }}
              >
                <FilterIcon sx={{ mr: 1, fontSize: 16 }} />
                Filter by Student
              </InputLabel>
              <Select
                labelId="student-filter-label"
                value={selectedStudentFilter}
                onChange={handleStudentFilterChange}
                label="Filter by Student"
                sx={{ borderRadius: 2 }}
              >
                <MenuItem value="">All Students</MenuItem>
                {students.map((student) => {
                  const studentId = student.id || student.studentId;
                  return (
                    <MenuItem 
                      key={studentId} 
                      value={studentId?.toString()}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Avatar sx={{ width: 24, height: 24, fontSize: 12 }}>
                          {student.firstName?.charAt(0) || 'S'}
                        </Avatar>
                        {student.firstName} {student.lastName}
                      </Box>
                    </MenuItem>
                  );
                })}
              </Select>
            </FormControl>
          </Box>
        </CardContent>
      </Card>

      {isLoading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 8 }}>
          <Box sx={{ textAlign: 'center' }}>
            <CircularProgress size={60} thickness={4} sx={{ mb: 2 }} />
            <Typography variant="h6" color="text.secondary">Loading reminders...</Typography>
          </Box>
        </Box>
      ) : filteredReminders.length === 0 ? (
        <Zoom in={true}>
          <Card sx={{ 
            p: 6, 
            textAlign: 'center',
            borderRadius: 3,
            background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
            boxShadow: '0 8px 32px rgba(0,0,0,0.1)'
          }}>
            <WarningIcon sx={{ fontSize: 80, color: 'text.secondary', mb: 3 }} />
            <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold' }}>
              No Fee Reminders
            </Typography>
            <Typography variant="h6" color="text.secondary" gutterBottom sx={{ mb: 4 }}>
              {selectedStudentFilter 
                ? "No reminders match your current filters." 
                : "You haven't created any fee reminders yet."}
            </Typography>
            {selectedStudentFilter ? (
              <Button 
                variant="contained" 
                size="large"
                sx={{ mt: 2, borderRadius: 2, px: 4 }} 
                startIcon={<FilterIcon />}
                onClick={() => setSelectedStudentFilter("")}
              >
                Clear Filters
              </Button>
            ) : (
              <Button 
                variant="contained" 
                size="large"
                sx={{ 
                  mt: 2, 
                  borderRadius: 2, 
                  px: 4,
                  background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
                  '&:hover': {
                    background: 'linear-gradient(45deg, #1976D2 30%, #1BA8D7 90%)',
                    transform: 'translateY(-2px)',
                    boxShadow: '0 8px 25px rgba(33, 150, 243, 0.3)'
                  }
                }} 
                startIcon={<AddIcon />}
                onClick={() => handleOpenDialog()}
              >
                Create Your First Reminder
              </Button>
            )}
          </Card>
        </Zoom>
      ) : (
        <Box sx={{ 
          display: 'grid', 
          gridTemplateColumns: {
            xs: '1fr', 
            md: 'repeat(2, 1fr)', 
            lg: 'repeat(3, 1fr)'
          }, 
          gap: 3 
        }}>
          {filteredReminders.map((reminder, index) => (
            <Fade in={true} timeout={300 + index * 100} key={reminder.id}>
              <Card
                sx={{ 
                  borderRadius: 3,
                  position: 'relative',
                  overflow: 'hidden',
                  transition: 'all 0.4s ease',
                  border: `2px solid ${isOverdue(reminder.reminderDate) ? '#ff9800' : '#e0e0e0'}`,
                  background: isOverdue(reminder.reminderDate) 
                    ? 'linear-gradient(135deg, #fff3e0 0%, #ffe0b2 100%)'
                    : 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)',
                  '&:hover': {
                    transform: 'translateY(-8px)',
                    boxShadow: '0 20px 40px rgba(0,0,0,0.15)',
                    '& .action-buttons': {
                      opacity: 1,
                      transform: 'translateY(0)'
                    }
                  },
                  '&::before': {
                    content: '""',
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    height: 4,
                    background: isOverdue(reminder.reminderDate)
                      ? 'linear-gradient(90deg, #ff9800, #f57c00)'
                      : 'linear-gradient(90deg, #2196f3, #1976d2)'
                  }
                }}
              >
                {/* Status Badge */}
                <Box sx={{ position: 'absolute', top: 16, right: 16, zIndex: 2 }}>
                  {isOverdue(reminder.reminderDate) ? (
                    <Badge
                      badgeContent={
                        <Chip 
                          label="Overdue" 
                          color="warning" 
                          size="small"
                          icon={<WarningIcon sx={{ fontSize: 16 }} />}
                          sx={{ fontWeight: 'bold' }}
                        />
                      }
                    />
                  ) : (
                    <Chip 
                      label="Active" 
                      color="success" 
                      size="small"
                      icon={<CheckCircleIcon sx={{ fontSize: 16 }} />}
                      sx={{ fontWeight: 'bold' }}
                    />
                  )}
                </Box>
                
                <CardContent sx={{ p: 3, pb: 1 }}>
                  <Box sx={{ mb: 3 }}>
                    <Typography 
                      variant="h6" 
                      gutterBottom 
                      sx={{ 
                        fontWeight: 'bold',
                        color: 'primary.main',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1
                      }}
                    >
                      <ScheduleIcon />
                      Fee Reminder
                    </Typography>
                  </Box>
                  
                  <Stack spacing={2}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Avatar sx={{ 
                        bgcolor: 'primary.main', 
                        width: 32, 
                        height: 32,
                        fontSize: 14
                      }}>
                        <PersonIcon sx={{ fontSize: 18 }} />
                      </Avatar>
                      <Box sx={{ flexGrow: 1 }}>
                        <Typography variant="body2" color="text.secondary">Student</Typography>
                        <Typography variant="body1" sx={{ fontWeight: 'medium' }}>
                          {getStudentName(reminder)}
                        </Typography>
                      </Box>
                    </Box>
                    
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Avatar sx={{ 
                        bgcolor: isOverdue(reminder.reminderDate) ? 'warning.main' : 'success.main',
                        width: 32, 
                        height: 32
                      }}>
                        <CalendarIcon sx={{ fontSize: 18 }} />
                      </Avatar>
                      <Box sx={{ flexGrow: 1 }}>
                        <Typography variant="body2" color="text.secondary">Due Date</Typography>
                        <Typography 
                          variant="body1" 
                          sx={{ 
                            fontWeight: 'medium',
                            color: isOverdue(reminder.reminderDate) ? 'warning.main' : 'text.primary'
                          }}
                        >
                          {formatReminderDate(reminder.reminderDate)}
                        </Typography>
                      </Box>
                    </Box>
                  </Stack>
                  
                  <Divider sx={{ my: 2 }} />
                  
                  <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
                    <MessageIcon sx={{ color: 'text.secondary', mt: 0.5, fontSize: 20 }} />
                    <Box sx={{ flexGrow: 1 }}>
                      <Typography variant="body2" color="text.secondary" gutterBottom>
                        Message
                      </Typography>
                      <Typography 
                        variant="body2" 
                        sx={{ 
                          minHeight: '3em',
                          lineHeight: 1.4,
                          color: 'text.primary'
                        }}
                      >
                        {reminder.message || "No message provided"}
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
                
                <CardActions 
                  className="action-buttons"
                  sx={{ 
                    p: 2, 
                    pt: 0,
                    opacity: { xs: 1, md: 0 },
                    transform: { xs: 'none', md: 'translateY(10px)' },
                    transition: 'all 0.3s ease',
                    justifyContent: 'flex-end'
                  }}
                >
                  <Tooltip title="Edit Reminder">
                    <IconButton 
                      color="primary"
                      onClick={() => handleOpenDialog(reminder)}
                      sx={{
                        backgroundColor: 'primary.main',
                        color: 'white',
                        '&:hover': {
                          backgroundColor: 'primary.dark',
                          transform: 'scale(1.1)'
                        }
                      }}
                    >
                      <EditIcon />
                    </IconButton>
                  </Tooltip>
                  
                  <Tooltip title="Delete Reminder">
                    <IconButton 
                      color="error"
                      onClick={() => handleDeleteClick(reminder)}
                      sx={{
                        backgroundColor: 'error.main',
                        color: 'white',
                        ml: 1,
                        '&:hover': {
                          backgroundColor: 'error.dark',
                          transform: 'scale(1.1)'
                        }
                      }}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </Tooltip>
                </CardActions>
              </Card>
            </Fade>
          ))}
        </Box>
      )}

      {/* Enhanced Add/Edit Dialog */}
      <Dialog 
        open={openDialog} 
        onClose={handleCloseDialog} 
        maxWidth="sm" 
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3,
            background: 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)'
          }
        }}
      >
        <DialogTitle sx={{ 
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
          textAlign: 'center',
          fontWeight: 'bold'
        }}>
          {selectedReminder ? "✏️ Edit Fee Reminder" : "➕ Create New Fee Reminder"}
        </DialogTitle>
        <DialogContent sx={{ p: 3 }}>
          <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
            <FormControl 
              fullWidth 
              margin="normal" 
              error={!formData.studentId}
              sx={{ mb: 3 }}
            >
              <InputLabel id="student-label" sx={{ fontWeight: 'medium' }}>
                👤 Student *
              </InputLabel>
              <Select
                labelId="student-label"
                id="studentId"
                name="studentId"
                value={formData.studentId}
                onChange={handleInputChange}
                label="👤 Student *"
                required
                sx={{ borderRadius: 2 }}
              >
                {students.length === 0 ? (
                  <MenuItem value="" disabled>
                    {isLoading ? "Loading students..." : "No students available - Please add students first"}
                  </MenuItem>
                ) : (
                  students.map((student) => {
                    const id = student.id || student.studentId;
                    if (!id) return null;
                    
                    const firstName = student.firstName || '';
                    const lastName = student.lastName || '';
                    const name = `${firstName} ${lastName}`.trim();
                    const displayName = name || `Student #${id}`;
                    
                    return (
                      <MenuItem key={id} value={id.toString()}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                          <Avatar sx={{ width: 28, height: 28, fontSize: 12 }}>
                            {firstName.charAt(0) || 'S'}
                          </Avatar>
                          {displayName}
                        </Box>
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
              name="reminderDate"
              label="📅 Reminder Date"
              type="date"
              InputLabelProps={{ shrink: true }}
              value={formData.reminderDate}
              onChange={handleInputChange}
              sx={{ 
                mb: 3,
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2
                }
              }}
            />
            
            <TextField
              margin="normal"
              fullWidth
              name="message"
              label="💬 Message"
              multiline
              rows={4}
              value={formData.message}
              onChange={handleInputChange}
              placeholder="Enter reminder message for the student..."
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2
                }
              }}
            />
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 3, gap: 2 }}>
          <Button 
            onClick={handleCloseDialog}
            sx={{ borderRadius: 2, px: 3 }}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleSubmit} 
            variant="contained" 
            disabled={students.length === 0}
            sx={{
              borderRadius: 2,
              px: 4,
              background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
              '&:hover': {
                background: 'linear-gradient(45deg, #1976D2 30%, #1BA8D7 90%)',
                transform: 'translateY(-2px)',
                boxShadow: '0 8px 25px rgba(33, 150, 243, 0.3)'
              }
            }}
          >
            {selectedReminder ? "Update" : "Create"} Reminder
          </Button>
        </DialogActions>
      </Dialog>

      {/* Enhanced Delete Dialog */}
      <Dialog 
        open={deleteDialogOpen} 
        onClose={() => setDeleteDialogOpen(false)}
        PaperProps={{
          sx: { borderRadius: 3 }
        }}
      >
        <DialogTitle sx={{ 
          color: 'error.main',
          fontWeight: 'bold',
          textAlign: 'center'
        }}>
          🗑️ Delete Fee Reminder
        </DialogTitle>
        <DialogContent sx={{ textAlign: 'center', py: 3 }}>
          <DialogContentText sx={{ fontSize: 16 }}>
            Are you sure you want to delete this fee reminder? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ p: 3, gap: 2, justifyContent: 'center' }}>
          <Button 
            onClick={() => setDeleteDialogOpen(false)}
            sx={{ borderRadius: 2, px: 3 }}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleDeleteConfirm} 
            color="error"
            variant="contained"
            sx={{ borderRadius: 2, px: 4 }}
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}