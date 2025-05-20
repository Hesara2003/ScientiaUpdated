import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  getAllSubjects, 
  searchSubjects, 
  filterSubjectsByGrade 
} from '../../services/subjectService';

export default function SubjectBrowser() {
  const [subjects, setSubjects] = useState([]);
  const [filteredSubjects, setFilteredSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('all');
  
  useEffect(() => {
    const fetchSubjects = async () => {
      try {
        setLoading(true);
        const data = await getAllSubjects();
        setSubjects(data || []);
        setFilteredSubjects(data || []);
      } catch (error) {
        console.error("Error fetching subjects:", error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchSubjects();
  }, []);
  
  // Filter and search subjects when search term or filter changes
  useEffect(() => {
    // Apply grade filter first
    const gradeFiltered = filterSubjectsByGrade(subjects, filter === 'all' ? null : filter);
    
    // Then apply search
    const searchFiltered = searchSubjects(gradeFiltered, searchTerm);
    
    setFilteredSubjects(searchFiltered);
  }, [searchTerm, filter, subjects]);
  
  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };
  
  const handleFilterChange = (e) => {
    setFilter(e.target.value);
  };
  
  const getSubjectCardColorClass = (index) => {
    const colors = [
      'bg-blue-100 border-blue-300',
      'bg-green-100 border-green-300',
      'bg-purple-100 border-purple-300',
      'bg-yellow-100 border-yellow-300',
      'bg-red-100 border-red-300',
      'bg-indigo-100 border-indigo-300',
      'bg-pink-100 border-pink-300',
      'bg-teal-100 border-teal-300'
    ];
    
    return colors[index % colors.length];
  };
  
  return (
    <div className="bg-gray-50 min-h-screen p-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Browse Subjects</h1>
        <p className="text-gray-600 mb-6">Find subjects you're interested in and explore available classes</p>
        
        {/* Search and Filter */}
        <div className="bg-white rounded-lg shadow p-4 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-grow">
              <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-1">
                Search Subjects
              </label>
              <div className="relative">
                <input
                  type="text"
                  id="search"
                  placeholder="Type to search..."
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  value={searchTerm}
                  onChange={handleSearch}
                />
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
              </div>
            </div>
            
            <div>
              <label htmlFor="filter" className="block text-sm font-medium text-gray-700 mb-1">
                Filter by Grade
              </label>
              <select
                id="filter"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                value={filter}
                onChange={handleFilterChange}
              >
                <option value="all">All Grades</option>
                <option value="elementary">Elementary School</option>
                <option value="middle">Middle School</option>
                <option value="high">High School</option>
                <option value="college">College Level</option>
              </select>
            </div>
          </div>
        </div>
        
        {/* Subject Cards */}
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
          </div>
        ) : (
          <>
            <div className="mb-4 text-sm text-gray-600">
              Showing {filteredSubjects.length} of {subjects.length} subjects
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredSubjects.length > 0 ? (
                filteredSubjects.map((subject, index) => (
                  <div 
                    key={subject.id}
                    className={`rounded-lg border-2 ${getSubjectCardColorClass(index)} p-5 hover:shadow-md transition-shadow`}
                  >
                    <div className="flex items-start">
                      {subject.icon && (
                        <img src={subject.icon} alt={subject.name} className="w-12 h-12 mr-4" />
                      )}
                      <div>
                        <h2 className="text-lg font-semibold text-gray-900">{subject.name}</h2>
                        <p className="text-gray-600 text-sm mt-1">{subject.grade || 'All levels'}</p>
                      </div>
                    </div>
                    
                    <p className="mt-3 text-gray-700">{subject.description}</p>
                    
                    <div className="mt-4 flex flex-wrap gap-2">
                      {subject.popularTopics?.slice(0, 3).map((topic, i) => (
                        <span key={i} className="text-xs bg-white px-2 py-1 rounded-full border border-gray-200">
                          {topic}
                        </span>
                      ))}
                      {subject.popularTopics?.length > 3 && (
                        <span className="text-xs bg-white px-2 py-1 rounded-full border border-gray-200">
                          +{subject.popularTopics.length - 3} more
                        </span>
                      )}
                    </div>
                    
                    <div className="mt-6 flex justify-between items-center">
                      <div className="text-sm text-gray-500">
                        {subject.totalClasses || 0} Classes Available
                      </div>
                      <Link
                        to={`/explore/subjects/${subject.id}`}
                        className="px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors"
                      >
                        View Details
                      </Link>
                    </div>
                  </div>
                ))
              ) : (
                <div className="col-span-full bg-white rounded-lg shadow p-8 text-center">
                  <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <h3 className="mt-2 text-lg font-medium text-gray-900">No subjects found</h3>
                  <p className="mt-1 text-gray-500">
                    {searchTerm 
                      ? `No subjects match "${searchTerm}". Try a different search term.` 
                      : 'No subjects match the selected filters. Try changing your filters.'}
                  </p>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
