import * as React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './contexts/AuthContext';
import { useAuth } from './contexts/AuthContext';
import ProtectedRoute from './components/auth/ProtectedRoute';
import RootLayout from './components/RootLayout';
import AuthDebugger from './components/common/AuthDebugger';

// Layouts
import AdminLayout from "./components/admin/AdminLayout";
import ParentLayout from "./components/parent/ParentLayout";
import StudentLayout from "./components/student/StudentLayout";
import TutorLayout from "./components/tutor/TutorLayout";
import AuthLayout from "./components/auth/AuthLayout";
import ExploreLayout from "./pages/explore/ExploreLayout";

// Landing Page
import LandingPage from "./pages/LandingPage";

// Explore Pages
import SubjectsPage from "./pages/explore/SubjectsPage";
import TutorsPage from "./pages/explore/TutorsPage";
import TimetablePage from "./pages/explore/TimetablePage";
import RecordingsPage from "./pages/explore/RecordingsPage";
import AboutPage from "./pages/explore/AboutPage";
import FaqPage from "./pages/explore/FaqPage";

// Class Components
import ClassDetailView from "./components/classes/ClassDetailView";

// Admin Pages
import AdminHome from "./pages/admin/Home";
import Students from "./pages/admin/Students";
import EditStudent from "./pages/admin/EditStudent";
import StudentManagement from "./pages/admin/StudentManagement";
import StudentAssignment from "./pages/admin/StudentAssignment";
import Fees from "./pages/admin/Fees";
import Courses from "./pages/admin/Courses";
import Subjects from "./pages/admin/Subjects";
import Tutor from "./pages/admin/Tutors";
import Analytics from "./pages/admin/Analytics";
import Classes from "./pages/admin/Classes";
import Recordings from "./pages/admin/Recordings";
import Attendance from "./pages/admin/Attendance";
import Exams from "./pages/admin/Exams";
import ManageFaqs from "./pages/admin/ManageFaqs";
import Parents from "./pages/admin/Parents";
import AdminFeeReminders from "./pages/admin/FeeReminders";

// Parent Pages
import ParentHome from "./pages/parent/Home";
import ParentChildren from "./pages/parent/Children";
import ParentPayments from "./pages/parent/Payments";
import ParentAttendance from "./pages/parent/Attendance";
import ParentProgress from "./pages/parent/Progress";
import ParentFeeReminders from "./pages/parent/FeeReminders";

// Student Pages
import StudentHome from "./pages/student/Home";
import StudentCourses from "./pages/student/Courses";
import StudentAttendance from "./pages/student/Attendance";
import StudentExams from "./pages/student/Exams";
import StudentProgress from "./pages/student/Progress";
import StudentFeeReminders from "./pages/student/FeeReminders";

// Tutor Pages
import TutorHome from "./pages/tutor/Home";
import TutorClasses from "./pages/tutor/Classes";
import TutorStudents from "./pages/tutor/Students";
import TutorSchedule from "./pages/tutor/Schedule";
import TutorSubjects from "./pages/tutor/Subjects";
import TutorAssignments from "./pages/tutor/Assignments";
import TutorMaterials from "./pages/tutor/Materials";
import TutorMessages from "./pages/tutor/Messages";
import TutorRecordings from "./pages/tutor/Recordings";
import TutorFeeReminders from "./pages/tutor/FeeReminders";
import TutorAttendance from "./pages/tutor/Attendance";
import TutorialsList from "./pages/tutor/tutorials/TutorialsList";
import CreateTutorial from "./pages/tutor/tutorials/CreateTutorial";
import EditTutorial from "./pages/tutor/tutorials/EditTutorial";

// Auth Pages
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import ForgotPassword from "./pages/auth/ForgotPassword";

// Import Not Found and Unauthorized pages
import NotFound from "./pages/NotFound";
import Unauthorized from "./pages/Unauthorized";

// Shared Imports
import ShoppingCart from "../src/components/cart/ShoppingCart";
import Checkout from "../src/components/cart/Checkout";

// Student Imports
import TuteList from "..//src/components/student/TuteList";
import MyTutorials from "./pages/student/tutorials/MyTutorials";
import TutorialDetail from "./pages/student/tutorials/TutorialDetail";

// Parent Imports
import TuteListParent from "./pages/parent/tutorials/TuteListParent";
import ChildTutorials from "./pages/parent/tutorials/ChildTutorials";

import RecordingsStudent from '../src/pages/student/Recordings';


// App Routes component using the auth context
const AppRoutes = () => {
  const { user, isAuthenticated } = useAuth();
  const [userRole, setUserRole] = useState(null);  // Effect for backward compatibility with existing role-based routing
  // Update the userRole effect to prioritize recent registrations
  useEffect(() => {
    if (user) {
      // Check for recent student registration first
      const lastRegisteredRole = localStorage.getItem('lastRegisteredRole');
      const storedRole = localStorage.getItem('userRole');
      
      // Priority order: lastRegisteredRole > storedRole > user.role > default
      if (lastRegisteredRole === 'student') {
        console.log('App: Using recent registration role: student');
        setUserRole('student');
        // Also update localStorage to be consistent
        localStorage.setItem('userRole', 'student');
        return;
      }
      
      // Use stored role if available
      if (storedRole && storedRole !== 'parent') {
        console.log('App: Using stored role from localStorage:', storedRole);
        setUserRole(storedRole);
        return;
      }
      
      // Otherwise use the role from user object
      const roleFromUser = user.role || 'guest';
      console.log('App: Setting userRole from user object:', roleFromUser);
      setUserRole(roleFromUser);
    } else {
      // No user, clear role
      setUserRole(null);
    }
  }, [user]);
  // For backward compatibility
  const isLoggedIn = () => {
    // Check both context authentication state and localStorage items
    const hasToken = localStorage.getItem('token') !== null;
    const hasUserRole = localStorage.getItem('userRole') !== null;
    const hasUserData = localStorage.getItem('userData') !== null;
    
    // Only consider logged in if both a token AND some user identifying information exists
    return (isAuthenticated && (hasUserRole || hasUserData)) || (hasToken && hasUserRole);
  };

  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/auth" element={<AuthLayout />}>
        <Route path="login" element={<Login />} />
        <Route path="register" element={<Register />} />
        <Route path="forgot-password" element={<ForgotPassword />} />
        <Route index element={<Navigate to="/auth/login" />} />
      </Route>
      
      {/* Explore Routes */}
      <Route path="/explore" element={<ExploreLayout />}>
        <Route path="subjects" element={<SubjectsPage />} />
        <Route path="tutors" element={<TutorsPage />} />          
        <Route path="timetable" element={<TimetablePage />} />
        <Route path="classes/:id" element={<ClassDetailView />} />
        <Route path="recordings" element={<RecordingsPage />} />
        <Route path="faqs" element={<FaqPage />} />
        <Route path="about" element={<AboutPage />} />
        <Route index element={<Navigate to="/explore/subjects" />} />
      </Route>

      {/* Admin Routes */}      <Route 
        path="/admin" 
        element={
          <ProtectedRoute allowedRoles={["admin"]}>
            <AdminLayout />
          </ProtectedRoute>
        }
      >
        <Route path="" element={<AdminHome />} />
        <Route path="students" element={<Students />} />
        <Route path="students/:id/edit" element={<EditStudent />} />
        <Route path="students/:id/assign" element={<StudentAssignment />} />
        <Route path="student-management" element={<StudentManagement />} />
        <Route path="fees" element={<Fees />} />
        <Route path="courses" element={<Courses />} />
        <Route path="classes" element={<Classes />} />
        <Route path="tutors" element={<Tutor />} />
        <Route path="subjects" element={<Subjects />} />
        <Route path="analytics" element={<Analytics />} />          
        <Route path="recordings" element={<Recordings />} />
        <Route path="attendance" element={<Attendance />} />
        <Route path="exams" element={<Exams />} />
        <Route path="faqs" element={<ManageFaqs />} />
        <Route path="parents" element={<Parents />} />
        <Route path="fee-reminders" element={<AdminFeeReminders />} />
      </Route>

      {/* Parent Routes */}
      <Route 
        path="/parent" 
        element={
          <ProtectedRoute allowedRoles={["parent"]}>
            <ParentLayout />
          </ProtectedRoute>
        }
      >
        <Route path="" element={<ParentHome />} />
        <Route path="children" element={<ParentChildren />} />
        <Route path="payments" element={<ParentPayments />} />
        <Route path="attendance" element={<ParentAttendance />} />
        <Route path="progress" element={<ParentProgress />} />
        <Route path="fee-reminders" element={<ParentFeeReminders />} />
      </Route>
      
      {/* Student Routes */}
      <Route 
        path="/student" 
        element={
          <ProtectedRoute allowedRoles={["student"]}>
            <StudentLayout />
          </ProtectedRoute>
        }
      >
        <Route path="" element={<StudentHome />} />
        <Route path="courses" element={<StudentCourses />} />
        <Route path="attendance" element={<StudentAttendance />} />
        <Route path="recordings" element={<RecordingsStudent />} />
        <Route path="exams" element={<StudentExams />} />
        <Route path="progress" element={<StudentProgress />} />
        <Route path="fee-reminders" element={<StudentFeeReminders />} />
        
        {/* Tutorials Subroutes */}
        <Route path="tutorials" element={<ProtectedRoute role="STUDENT"><TuteList /></ProtectedRoute>} />
        <Route path="my-tutorials" element={<ProtectedRoute role="STUDENT"><MyTutorials /></ProtectedRoute>} />
        <Route path="tutorial/:id" element={<ProtectedRoute role="STUDENT"><TutorialDetail /></ProtectedRoute>} />
      </Route>
      
      {/* Tutor Routes */}
      <Route 
        path="/tutor" 
        element={
          <ProtectedRoute allowedRoles={["tutor"]}>
            <TutorLayout />
          </ProtectedRoute>
        }
      >
        <Route path="" element={<TutorHome />} />          
        <Route path="classes" element={<TutorClasses />} />
        <Route path="students" element={<TutorStudents />} />
        <Route path="schedule" element={<TutorSchedule />} />
        <Route path="subjects" element={<TutorSubjects />} />        <Route path="assignments" element={<TutorAssignments />} />
        <Route path="materials" element={<TutorMaterials />} />
        <Route path="messages" element={<TutorMessages />} />
        <Route path="recordings" element={<TutorRecordings />} />
        <Route path="fee-reminders" element={<TutorFeeReminders />} />
        <Route path="attendance" element={<TutorAttendance />} />
        <Route path="tutorials" element={<ProtectedRoute allowedRoles={["tutor"]}><TutorialsList /></ProtectedRoute>} />
        <Route path="tutorials/create" element={<ProtectedRoute allowedRoles={["tutor"]}><CreateTutorial /></ProtectedRoute>} />
        <Route path="tutorials/edit/:id" element={<ProtectedRoute allowedRoles={["tutor"]}><EditTutorial /></ProtectedRoute>} />
      </Route>{/* Redirect based on role */}
      <Route path="/" element={
        (() => {
          // Check for the landing page flag first
          const showLandingPage = localStorage.getItem('showLandingPage');
          
          if (showLandingPage === 'true') {
            // Clear the flag and show landing page
            localStorage.removeItem('showLandingPage');
            // Also ensure we're not in a logged-in state that would cause a redirect loop
            return <LandingPage />;
          }
          
          // If user is explicitly logged in, redirect to their dashboard
          if (isLoggedIn()) {
            // Prioritize roles in order
            const lastRegisteredRole = localStorage.getItem('lastRegisteredRole');
            const storedRole = localStorage.getItem('userRole');
            
            const effectiveRole = 
              (lastRegisteredRole === 'student') ? 'student' :
              storedRole ? storedRole :
              userRole || 'guest';
              
            console.log('Root path redirect using role:', effectiveRole);
            
            return (
              effectiveRole === "admin" ? <Navigate to="/admin" /> :
              effectiveRole === "student" ? <Navigate to="/student" /> :
              effectiveRole === "tutor" ? <Navigate to="/tutor" /> :
              effectiveRole === "parent" ? <Navigate to="/parent" /> :
              <LandingPage /> // Changed from Navigate to /auth/login to prevent loops
            );
          } else {
            // Not logged in, show landing page
            return <LandingPage />;
          }
        })()
      } />
      
      {/* Error pages */}
      <Route path="/unauthorized" element={<Unauthorized />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

export default function App() {
  return (
    <Router>
      <AuthProvider>
        <RootLayout>
          <AppRoutes />
          <Toaster position="top-right" />
          {import.meta.env.DEV && <AuthDebugger />}
        </RootLayout>
      </AuthProvider>
    </Router>
  );
}
