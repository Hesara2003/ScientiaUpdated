import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAllTutors } from '../services/tutorService';
import { getAllClasses } from '../services/classService';
import { getAllSubjects } from '../services/subjectService';
import { getAllRecordingBundles } from '../services/recordingService';
import { getAllExams } from '../services/examService';

// Import landing page components
import Navigation from '../components/landing/Navigation';
import HeroSection from '../components/landing/HeroSection';
import FeaturedCourses from '../components/landing/FeaturedCourses';
import ExploreFeatures from '../components/landing/ExploreFeatures';
import SubjectsPreview from '../components/landing/SubjectsPreview';
import TutorsSection from '../components/landing/TutorsSection';
import ExamsSection from '../components/landing/ExamsSection';
import RecordingsSection from '../components/landing/RecordingsSection';
import TimetableSection from '../components/landing/TimetableSection';
import AboutSection from '../components/landing/AboutSection';
import Footer from '../components/landing/Footer';

export default function LandingPage() {
  const [tutors, setTutors] = useState([]);
  const [classes, setClasses] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [recordingBundles, setRecordingBundles] = useState([]);
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeSubject, setActiveSubject] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const navigate = useNavigate();  

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // Fetch data in parallel
        const [tutorsData, classesData, subjectsData, bundlesData, examsData] = await Promise.all([
          getAllTutors().catch(() => []),
          getAllClasses().catch(() => []),
          getAllSubjects().catch(() => []),
          getAllRecordingBundles().catch(() => []),
          getAllExams().catch(() => [])
        ]);
        
        setTutors(tutorsData || []);
        setClasses(classesData || []);
        setSubjects(subjectsData || []);
        setRecordingBundles(bundlesData || []);
        setExams(examsData || []);
        
        // Set the first subject as active by default if subjects exist
        if (subjectsData && subjectsData.length > 0) {
          setActiveSubject(subjectsData[0]);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
        
        // Set empty arrays on error
        setTutors([]);
        setClasses([]);
        setSubjects([]);
        setRecordingBundles([]);
        setExams([]);
      } finally {
        setLoading(false);
      }
    };

    // Clear any existing user role when landing page is loaded
    localStorage.removeItem('userRole');
    
    fetchData();
  }, []);

  // Helper functions
  const getClassesBySubject = (subjectName) => {
    if (!subjectName) return classes;
    return classes.filter(course => 
      course.subject === subjectName || 
      (course.subject && course.subject.name === subjectName)
    );
  };

  const getTutorsBySubject = (subjectName) => {
    if (!subjectName) return tutors;
    return tutors.filter(tutor => 
      tutor.subject === subjectName || 
      (tutor.subject && tutor.subject.name === subjectName)
    );
  };

  const getBundlesBySubject = (subjectId) => {
    if (!subjectId) return recordingBundles;
    return recordingBundles.filter(bundle => bundle.subjectId === subjectId);
  };

  const handleSubjectChange = (subject) => {
    setActiveSubject(subject);
    setActiveTab('overview');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <Navigation />

      {/* Hero Section */}
      <HeroSection />

      {/* Featured Courses Section */}
      <FeaturedCourses 
        classes={classes}
        loading={loading}
        navigate={navigate}
      />

      {/* Explore Features Section */}
      <ExploreFeatures />

      {/* Subjects Preview Section */}
      <SubjectsPreview 
        subjects={subjects}
        loading={loading}
        getClassesBySubject={getClassesBySubject}
      />

      {/* Meet Our Tutors Section */}
      <TutorsSection 
        tutors={tutors}
        loading={loading}
      />

      {/* Exams Section */}
      <ExamsSection 
        exams={exams}
        loading={loading}
        navigate={navigate}
      />

      {/* Premium Recordings Section */}
      <RecordingsSection 
        recordingBundles={recordingBundles}
        loading={loading}
        navigate={navigate}
      />

      {/* Timetable Section */}
      <TimetableSection 
        classes={classes}
        loading={loading}
        navigate={navigate}
      />

      {/* About Us & CTA Section */}
      <AboutSection navigate={navigate} />

      {/* Footer */}
      <Footer />
    </div>
  );
}
