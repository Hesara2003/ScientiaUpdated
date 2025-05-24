import React, { useState, useEffect } from 'react';
import { getAllSubjects, getSubjectTutors } from '../../services/subjectService';

export default function SubjectSelection() {
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userSubjects, setUserSubjects] = useState([]);
  const [tutorName, setTutorName] = useState('John Doe'); // In a real app, this would come from auth context
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const allSubjects = await getAllSubjects();
        const mySubjects = await getTutorSubjects(tutorName);
        
        setSubjects(allSubjects || []);
        setUserSubjects(mySubjects || []);
      } catch (error) {
        console.error("Error fetching subjects:", error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [tutorName]);
  
  // Function to get subjects taught by a tutor
  // Since backend returns tutor names as strings, we check by name
  const getTutorSubjects = async (tutorName) => {
    try {
      const allSubjects = await getAllSubjects();
      const subjectIds = [];
      
      // Check each subject to see if this tutor teaches it
      for (const subject of allSubjects) {
        try {
          const tutors = await getSubjectTutors(subject.id);
          // Backend returns array of strings (tutor names)
          if (tutors.includes(tutorName)) {
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
        // In a real app: await api.delete(`/tutors/${tutorName}/subjects/${subjectId}`);
      } else {
        // Add subject
        setUserSubjects(prev => [...prev, subjectId]);
        // In a real app: await api.post(`/tutors/${tutorName}/subjects/${subjectId}`);
      }
    } catch (error) {
      console.error("Error updating subjects:", error);
    }
  };

  // Get grade badge color
  const getGradeBadgeColor = (grade) => {
    const colors = {
      'Elementary': 'bg-green-100 text-green-800',
      'Middle': 'bg-blue-100 text-blue-800',
      'High': 'bg-purple-100 text-purple-800',
      'College': 'bg-red-100 text-red-800'
    };
    return colors[grade] || 'bg-gray-100 text-gray-800';
  };

  // Get subject icon based on name
  const getSubjectIcon = (subjectName) => {
    const name = subjectName.toLowerCase();
    if (name.includes('math') || name.includes('algebra') || name.includes('calculus')) {
      return '📊';
    } else if (name.includes('science') || name.includes('physics') || name.includes('chemistry') || name.includes('biology')) {
      return '🔬';
    } else if (name.includes('english') || name.includes('literature') || name.includes('writing')) {
      return '📚';
    } else if (name.includes('history') || name.includes('social')) {
      return '🏛️';
    } else if (name.includes('art') || name.includes('music')) {
      return '🎨';
    } else if (name.includes('computer') || name.includes('programming')) {
      return '💻';
    }
    return '📖';
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
        <p className="text-sm text-gray-500 mt-1">Logged in as: {tutorName}</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {subjects.map((subject) => {
          const isTeaching = userSubjects.includes(subject.id);
          
          return (
            <div 
              key={subject.id} 
              className={`relative rounded-lg overflow-hidden border ${isTeaching ? 'border-green-500 bg-green-50' : 'border-gray-200 bg-white'} hover:shadow-md transition-all`}
            >
              <div className={`absolute top-0 right-0 m-2 ${isTeaching ? 'bg-green-500' : 'bg-gray-200'} rounded-full p-1`}>
                <svg className={`h-5 w-5 ${isTeaching ? 'text-white' : 'text-gray-400'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  {isTeaching ? (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  )}
                </svg>
              </div>
              
              <div className="p-6 flex flex-col h-full">
                <div className="flex items-center mb-4">
                  <span className="text-2xl mr-3">{getSubjectIcon(subject.name)}</span>
                  <div>
                    <h2 className="text-lg font-semibold text-gray-800">{subject.name}</h2>
                    <span className={`inline-block px-2 py-1 text-xs rounded-full ${getGradeBadgeColor(subject.grade)}`}>
                      {subject.grade} Level
                    </span>
                  </div>
                </div>
                
                <p className="text-gray-600 mb-4 flex-grow">
                  {subject.description || 'No description available for this subject.'}
                </p>
                
                <div className="mt-auto">
                  <button
                    onClick={() => toggleSubject(subject.id)}
                    className={`w-full py-2 rounded-md transition-colors font-medium ${
                      isTeaching 
                        ? 'bg-green-600 text-white hover:bg-green-700' 
                        : 'bg-indigo-600 text-white hover:bg-indigo-700'
                    }`}
                  >
                    {isTeaching ? 'Currently Teaching ✓' : 'Add to My Subjects'}
                  </button>
                  
                  {isTeaching && (
                    <button
                      onClick={() => toggleSubject(subject.id)}
                      className="w-full mt-2 py-1 text-sm text-gray-600 hover:text-red-600 transition-colors"
                    >
                      Remove from my subjects
                    </button>
                  )}
                </div>
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
      
      {/* Summary section */}
      {subjects.length > 0 && (
        <div className="mt-8 bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Summary</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-indigo-600">{subjects.length}</div>
              <div className="text-sm text-gray-600">Total Subjects</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-green-600">{userSubjects.length}</div>
              <div className="text-sm text-gray-600">Teaching</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-orange-600">
                {subjects.length - userSubjects.length}
              </div>
              <div className="text-sm text-gray-600">Available</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-purple-600">
                {userSubjects.length > 0 ? Math.round((userSubjects.length / subjects.length) * 100) : 0}%
              </div>
              <div className="text-sm text-gray-600">Coverage</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
