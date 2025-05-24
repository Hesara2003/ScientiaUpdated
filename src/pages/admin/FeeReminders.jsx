import * as React from "react";
import { useState, useEffect } from "react";
import { 
  getAllReminders, 
  deleteReminder
  // Remove markReminderResolved as it doesn't exist in your backend
} from "../../services/feeReminderService";
import { getAllStudents } from "../../services/studentService";
import { getAllTutors } from "../../services/tutorService";
import { toast } from "react-hot-toast";
import { format, parseISO, isValid } from "date-fns";
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
  TextField,
  Grid,
  Card,
  CardContent,
  Tooltip,
  Fade,
  InputAdornment,
  Divider,
  Skeleton,
  useTheme
} from "@mui/material";
import {
  Delete as DeleteIcon,
  Warning as WarningIcon,
  Search as SearchIcon,
  Refresh as RefreshIcon,
  ErrorOutline as ErrorIcon,
  CheckCircleOutline as CheckIcon,
  EventNote as EventIcon
} from "@mui/icons-material";

export default function AdminFeeReminders() {
  const theme = useTheme();
  const [reminders, setReminders] = useState([]);
  const [students, setStudents] = useState([]);
  const [tutors, setTutors] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedReminder, setSelectedReminder] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [refreshing, setRefreshing] = useState(false);

  // Define isOverdue function before using it
  const isOverdue = (reminderDate) => {
    if (!reminderDate) return false;
    return new Date(reminderDate) < new Date();
  };

  // Add stats for dashboard
  const activeReminders = reminders.filter(r => !isOverdue(r.reminderDate)).length;
  const overdueReminders = reminders.filter(r => isOverdue(r.reminderDate)).length;
  const totalReminders = reminders.length;

  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    setIsLoading(true);
    setError(null);
    setRefreshing(true);
    try {
      const [remindersData, studentsData, tutorsData] = await Promise.all([
        getAllReminders(),
        getAllStudents(),
        getAllTutors()
      ]);
      
      // Sort reminders by reminder date (most recent first)
      const sortedReminders = remindersData.sort((a, b) => {
        const dateA = new Date(a.reminderDate || new Date());
        const dateB = new Date(b.reminderDate || new Date());
        return dateB - dateA;
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
      setTimeout(() => setRefreshing(false), 600); // Add small delay for better UX
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

  const getStudentName = (reminder) => {
    if (!reminder.student || !reminder.student.id) {
      return "Unknown Student";
    }
    
    const student = students.find(s => 
      s.id?.toString() === reminder.student.id?.toString()
    );
    
    if (student) {
      const firstName = student.firstName || '';
      const lastName = student.lastName || '';
      return `${firstName} ${lastName}`.trim() || `Student #${reminder.student.id}`;
    }
    
    return `Student #${reminder.student.id}`;
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

  const filteredReminders = reminders.filter(reminder => {
    if (!searchTerm) return true;
    
    const studentName = getStudentName(reminder).toLowerCase();
    const searchLower = searchTerm.toLowerCase();
    const message = (reminder.message || '').toLowerCase();
    
    return studentName.includes(searchLower) || 
           message.includes(searchLower);
  });

  return (
    <Box sx={{ p: { xs: 2, md: 3 } }}>
      <Typography 
        variant="h4" 
        component="h1" 
        gutterBottom
        sx={{ 
          mb: 3, 
          fontWeight: 'bold',
          color: theme.palette.primary.main,
          borderBottom: `1px solid ${theme.palette.divider}`,
          pb: 2
        }}
      >
        <EventIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
        Fee Reminders Dashboard
      </Typography>

      {/* Dashboard Stats */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={4}>
          <Card 
            elevation={2}
            sx={{ 
              height: '100%',
              background: `linear-gradient(45deg, ${theme.palette.primary.main} 30%, ${theme.palette.primary.light} 90%)`,
              color: 'white',
              transition: 'transform 0.3s',
              '&:hover': {
                transform: 'translateY(-5px)',
              }
            }}
          >
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" sx={{ mb: 1, fontWeight: 'medium' }}>
                Total Reminders
              </Typography>
              {isLoading ? (
                <Skeleton variant="text" width="60%" height={60} sx={{ bgcolor: 'rgba(255,255,255,0.1)' }} />
              ) : (
                <Typography variant="h3" sx={{ fontWeight: 'bold' }}>
                  {totalReminders}
                </Typography>
              )}
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card 
            elevation={2}
            sx={{ 
              height: '100%',
              background: `linear-gradient(45deg, ${theme.palette.success.main} 30%, ${theme.palette.success.light} 90%)`,
              color: 'white',
              transition: 'transform 0.3s',
              '&:hover': {
                transform: 'translateY(-5px)',
              }
            }}
          >
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" sx={{ mb: 1, fontWeight: 'medium' }}>
                Active Reminders
              </Typography>
              {isLoading ? (
                <Skeleton variant="text" width="60%" height={60} sx={{ bgcolor: 'rgba(255,255,255,0.1)' }} />
              ) : (
                <Typography variant="h3" sx={{ fontWeight: 'bold' }}>
                  {activeReminders}
                </Typography>
              )}
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card 
            elevation={2}
            sx={{ 
              height: '100%',
              background: `linear-gradient(45deg, ${theme.palette.warning.main} 30%, ${theme.palette.warning.light} 90%)`,
              color: 'white',
              transition: 'transform 0.3s',
              '&:hover': {
                transform: 'translateY(-5px)',
              }
            }}
          >
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" sx={{ mb: 1, fontWeight: 'medium' }}>
                Overdue Reminders
              </Typography>
              {isLoading ? (
                <Skeleton variant="text" width="60%" height={60} sx={{ bgcolor: 'rgba(255,255,255,0.1)' }} />
              ) : (
                <Typography variant="h3" sx={{ fontWeight: 'bold' }}>
                  {overdueReminders}
                </Typography>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {error && (
        <Alert 
          severity="error" 
          sx={{ 
            mb: 3,
            animation: 'fadeIn 0.5s', 
            '@keyframes fadeIn': {
              '0%': { opacity: 0 },
              '100%': { opacity: 1 }
            }
          }}
          icon={<ErrorIcon fontSize="inherit" />}
        >
          {error}
        </Alert>
      )}

      <Paper 
        elevation={3} 
        sx={{ 
          p: 3, 
          mb: 4,
          borderRadius: 2,
          background: theme.palette.background.default
        }}
      >
        <Box sx={{ 
          mb: 3, 
          display: 'flex', 
          flexDirection: { xs: 'column', sm: 'row' }, 
          alignItems: 'center',
          gap: 2
        }}>
          <Box sx={{ position: 'relative', flexGrow: 1, width: { xs: '100%', sm: 'auto' } }}>
            <TextField
              fullWidth
              placeholder="Search by student name or message..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              variant="outlined"
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                  '&:hover .MuiOutlinedInput-notchedOutline': {
                    borderColor: theme.palette.primary.main,
                  },
                },
                transition: 'all 0.3s',
              }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon sx={{ color: theme.palette.primary.main }} />
                  </InputAdornment>
                )
              }}
            />
          </Box>
          <Button 
            variant="contained" 
            startIcon={<RefreshIcon />}
            onClick={fetchAllData}
            disabled={refreshing}
            sx={{ 
              borderRadius: 2,
              px: 3,
              py: 1.2,
              transition: 'all 0.3s',
              boxShadow: 2,
              '&:hover': {
                boxShadow: 4,
                transform: 'translateY(-2px)'
              }
            }}
          >
            {refreshing ? 'Refreshing...' : 'Refresh'}
          </Button>
        </Box>

        <Divider sx={{ mb: 3 }} />

        {isLoading ? (
          <Box sx={{ my: 3 }}>
            {[1, 2, 3, 4].map((i) => (
              <Skeleton 
                key={i} 
                variant="rectangular" 
                width="100%" 
                height={60} 
                sx={{ mb: 1, borderRadius: 1 }}
              />
            ))}
          </Box>
        ) : filteredReminders.length === 0 ? (
          <Paper 
            sx={{ 
              p: 4, 
              textAlign: 'center',
              borderRadius: 2,
              backgroundColor: theme.palette.background.paper,
              boxShadow: 'none'
            }}
          >
            <WarningIcon sx={{ fontSize: 80, color: theme.palette.text.secondary, mb: 2, opacity: 0.7 }} />
            <Typography variant="h5" gutterBottom sx={{ fontWeight: 'medium' }}>
              No Fee Reminders Found
            </Typography>
            <Typography variant="body1" color="text.secondary">
              {searchTerm ? "Try adjusting your search term" : "There are no fee reminders in the system yet"}
            </Typography>
          </Paper>
        ) : (
          <TableContainer component={Paper} elevation={0} sx={{ borderRadius: 2, overflow: 'hidden' }}>
            <Table sx={{ minWidth: 650 }}>
              <TableHead>
                <TableRow sx={{ backgroundColor: theme.palette.background.default }}>
                  <TableCell sx={{ fontWeight: 'bold', py: 2 }}>Student</TableCell>
                  <TableCell sx={{ fontWeight: 'bold', py: 2 }}>Reminder Date</TableCell>
                  <TableCell sx={{ fontWeight: 'bold', py: 2 }}>Status</TableCell>
                  <TableCell sx={{ fontWeight: 'bold', py: 2 }}>Message</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 'bold', py: 2 }}>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredReminders.map((reminder, index) => (
                  <TableRow 
                    key={reminder.id}
                    sx={{ 
                      '&:last-child td, &:last-child th': { border: 0 },
                      '&:nth-of-type(odd)': { backgroundColor: theme.palette.action.hover },
                      '&:hover': { 
                        backgroundColor: theme.palette.action.selected,
                        transition: 'background-color 0.2s'
                      },
                    }}
                  >
                    <TableCell 
                      sx={{ 
                        py: 1.8, 
                        fontWeight: 'medium',
                        color: theme.palette.text.primary
                      }}
                    >
                      {getStudentName(reminder)}
                    </TableCell>
                    <TableCell sx={{ py: 1.8 }}>
                      {formatReminderDate(reminder.reminderDate)}
                    </TableCell>
                    <TableCell sx={{ py: 1.8 }}>
                      {isOverdue(reminder.reminderDate) ? (
                        <Chip 
                          icon={<WarningIcon />}
                          label="Overdue" 
                          color="warning"
                          size="small"
                          sx={{ 
                            fontWeight: 'medium',
                            pl: 0.5
                          }}
                        />
                      ) : (
                        <Chip 
                          icon={<CheckIcon />}
                          label="Active" 
                          color="success"
                          size="small"
                          sx={{ 
                            fontWeight: 'medium',
                            pl: 0.5
                          }}
                        />
                      )}
                    </TableCell>
                    <TableCell sx={{ maxWidth: 300, py: 1.8 }}>
                      {reminder.message || "No message provided"}
                    </TableCell>
                    <TableCell align="right" sx={{ py: 1.8 }}>
                      <Tooltip title="Delete Reminder" arrow>
                        <IconButton
                          color="error"
                          onClick={() => handleDeleteClick(reminder)}
                          size="small"
                          sx={{ 
                            transition: 'all 0.2s',
                            '&:hover': {
                              backgroundColor: theme.palette.error.light,
                              transform: 'scale(1.1)'
                            }
                          }}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Paper>

      {/* Delete Confirmation Dialog */}
      <Dialog 
        open={deleteDialogOpen} 
        onClose={() => setDeleteDialogOpen(false)}
        TransitionComponent={Fade}
        TransitionProps={{ timeout: 500 }}
        PaperProps={{
          elevation: 5,
          sx: { borderRadius: 2 }
        }}
      >
        <DialogTitle sx={{ fontWeight: 'bold' }}>
          <DeleteIcon sx={{ mr: 1, color: theme.palette.error.main, verticalAlign: 'middle' }} />
          Delete Fee Reminder
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete this fee reminder? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ p: 2.5, pt: 0 }}>
          <Button 
            onClick={() => setDeleteDialogOpen(false)}
            variant="outlined"
            sx={{ borderRadius: 2 }}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleDeleteConfirm} 
            color="error"
            variant="contained"
            sx={{ 
              borderRadius: 2,
              boxShadow: 1,
              '&:hover': {
                boxShadow: 3
              }
            }}
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}