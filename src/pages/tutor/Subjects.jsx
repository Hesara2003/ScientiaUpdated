import React, { useState, useEffect } from 'react';
import { getAllSubjects, getSubjectTutors } from '../../services/subjectService';

export default function SubjectSelection() {
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userSubjects, setUserSubjects] = useState([]);
  const [tutorId, setTutorId] = useState(1); // In a real app, this would come from auth context
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [allSubjects, mySubjects] = await Promise.all([
          getAllSubjects(),
          // In a real app, this would be a specific endpoint to get the tutor's subjects
          // For now, we'll simulate by checking all subjects for this tutor
          getTutorSubjects(tutorId)
        ]);
        
        setSubjects(allSubjects || []);
        setUserSubjects(mySubjects || []);
      } catch (error) {
        console.error("Error fetching subjects:", error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [tutorId]);
  
  // Function to get subjects taught by a tutor
  // In a real app, this would be a specific API endpoint
  const getTutorSubjects = async (tutorId) => {
    try {
      // This is a simulation - in a real app, you'd have a direct API endpoint
      // to get subjects for a specific tutor
      const allSubjects = await getAllSubjects();
      const subjectIds = [];
      
      // Check each subject to see if this tutor teaches it
      for (const subject of allSubjects) {
        try {
          const tutors = await getSubjectTutors(subject.id);
          if (tutors.some(tutor => tutor.id === tutorId)) {
            subjectIds.push(subject.id);
          }
        } catch (error) {
          console.error(`Error checking tutors for subject ${subject.id}:`, error);
        }
      }
      
      return subjectIds;
    } catch (error) {
      console.error("Error getting tutor subjects:", error);
      return [];
    }
  };
  
  // Toggle whether a tutor teaches a subject
  const toggleSubject = async (subjectId) => {
    try {
      // In a real app, this would call an API to update the tutor's subjects
      // For now, we'll just update the local state
      const isTeaching = userSubjects.includes(subjectId);
      
      if (isTeaching) {
        // Remove subject
        setUserSubjects(prev => prev.filter(id => id !== subjectId));
        // In a real app: await api.delete(`/tutors/${tutorId}/subjects/${subjectId}`);
      } else {
        // Add subject
        setUserSubjects(prev => [...prev, subjectId]);
        // In a real app: await api.post(`/tutors/${tutorId}/subjects/${subjectId}`);
      }
    } catch (error) {
      console.error("Error updating subjects:", error);
    }
  };
  
  if (loading) {
    return (
      <div className="flex justify-center items-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }
  
  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">My Subjects</h1>
        <p className="text-gray-600 mt-1">Select the subjects you are qualified to teach</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {subjects.map((subject) => {
          const isTeaching = userSubjects.includes(subject.id);
          
          return (
            <div 
              key={subject.id} 
              className={`relative rounded-lg overflow-hidden border ${isTeaching ? 'border-green-500' : 'border-gray-200'} hover:shadow-md transition-all`}
            >
              <div className={`absolute top-0 right-0 m-2 ${isTeaching ? 'bg-green-500' : 'bg-gray-200'} rounded-full p-1`}>
                <svg className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  {isTeaching ? (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  )}
                </svg>
              </div>
              
              <div className="p-6 flex flex-col h-full">
                <div className="flex items-center mb-4">
                  {subject.icon && (
                    <img src={subject.icon} alt={subject.name} className="h-10 w-10 mr-3" />
                  )}
                  <h2 className="text-lg font-semibold text-gray-800">{subject.name}</h2>
                </div>
                
                <p className="text-gray-600 mb-4 flex-grow">{subject.description}</p>
                
                <div className="flex flex-wrap gap-2 mb-4">
                  {subject.popularTopics?.slice(0, 3).map((topic, index) => (
                    <span 
                      key={index} 
                      className="bg-indigo-100 text-indigo-800 text-xs px-2 py-1 rounded-full"
                    >
                      {topic}
                    </span>
                  ))}
                </div>
                
                <button
                  onClick={() => toggleSubject(subject.id)}
                  className={`mt-auto w-full py-2 rounded-md transition-colors ${
                    isTeaching 
                      ? 'bg-green-50 text-green-700 border border-green-300 hover:bg-green-100' 
                      : 'bg-indigo-600 text-white hover:bg-indigo-700'
                  }`}
                >
                  {isTeaching ? 'Currently Teaching' : 'Add to My Subjects'}
                </button>
              </div>
            </div>
          );
        })}
      </div>
      
      {subjects.length === 0 && (
        <div className="text-center py-12 bg-white rounded-lg shadow">
          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900">No subjects available</h3>
          <p className="mt-1 text-sm text-gray-500">There are no subjects in the system yet.</p>
        </div>
      )}
    </div>
  );
}
