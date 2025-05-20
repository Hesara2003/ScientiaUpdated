import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

export default function Materials() {
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentFolder, setCurrentFolder] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [breadcrumbs, setBreadcrumbs] = useState([{ id: 'root', name: 'My Materials' }]);

  // Mock data
  useEffect(() => {
    setTimeout(() => {
      const mockMaterials = [
        {
          id: 'folder-1',
          name: 'Advanced Mathematics',
          type: 'folder',
          items: 12,
          lastModified: '2025-05-10',
          size: null,
          class: 'Advanced Mathematics',
          shared: false,
          children: [
            {
              id: 'file-1',
              name: 'Calculus - Derivatives Lecture.pptx',
              type: 'presentation',
              lastModified: '2025-05-08',
              size: '4.2 MB',
              class: 'Advanced Mathematics',
              shared: true
            },
            {
              id: 'file-2',
              name: 'Integration Practice Problems.pdf',
              type: 'document',
              lastModified: '2025-05-09',
              size: '2.8 MB',
              class: 'Advanced Mathematics',
              shared: true
            },
            {
              id: 'file-3',
              name: 'Calculus Formula Sheet.pdf',
              type: 'document',
              lastModified: '2025-05-10',
              size: '1.5 MB',
              class: 'Advanced Mathematics',
              shared: false
            },
            {
              id: 'folder-1-1',
              name: 'Chapter 5 - Integrals',
              type: 'folder',
              items: 4,
              lastModified: '2025-05-07',
              size: null,
              class: 'Advanced Mathematics',
              shared: false,
              children: [
                {
                  id: 'file-4',
                  name: 'Lecture Notes - Integrals.docx',
                  type: 'document',
                  lastModified: '2025-05-07',
                  size: '1.8 MB',
                  class: 'Advanced Mathematics',
                  shared: true
                },
                {
                  id: 'file-5',
                  name: 'Integration Techniques.pdf',
                  type: 'document',
                  lastModified: '2025-05-06',
                  size: '3.2 MB',
                  class: 'Advanced Mathematics',
                  shared: true
                }
              ]
            }
          ]
        },
        {
          id: 'folder-2',
          name: 'Physics Fundamentals',
          type: 'folder',
          items: 8,
          lastModified: '2025-05-12',
          size: null,
          class: 'Physics Fundamentals',
          shared: false,
          children: [
            {
              id: 'file-6',
              name: 'Newton\'s Laws Presentation.pptx',
              type: 'presentation',
              lastModified: '2025-05-12',
              size: '5.6 MB',
              class: 'Physics Fundamentals',
              shared: true
            },
            {
              id: 'file-7',
              name: 'Pendulum Lab Instructions.pdf',
              type: 'document',
              lastModified: '2025-05-11',
              size: '2.1 MB',
              class: 'Physics Fundamentals',
              shared: true
            }
          ]
        },
        {
          id: 'folder-3',
          name: 'Chemistry Lab',
          type: 'folder',
          items: 10,
          lastModified: '2025-05-14',
          size: null,
          class: 'Chemistry Lab',
          shared: false,
          children: [
            {
              id: 'file-8',
              name: 'Periodic Table Review.pptx',
              type: 'presentation',
              lastModified: '2025-05-14',
              size: '3.8 MB',
              class: 'Chemistry Lab',
              shared: true
            },
            {
              id: 'file-9',
              name: 'Lab Safety Guidelines.pdf',
              type: 'document',
              lastModified: '2025-05-13',
              size: '1.2 MB',
              class: 'Chemistry Lab',
              shared: true
            },
            {
              id: 'file-10',
              name: 'Chemical Reactions Demo.mp4',
              type: 'video',
              lastModified: '2025-05-12',
              size: '86.5 MB',
              class: 'Chemistry Lab',
              shared: false
            }
          ]
        },
        {
          id: 'file-11',
          name: 'Teaching Schedule - Spring 2025.xlsx',
          type: 'spreadsheet',
          lastModified: '2025-05-01',
          size: '1.1 MB',
          class: null,
          shared: false
        },
        {
          id: 'file-12',
          name: 'Student Progress Tracker.xlsx',
          type: 'spreadsheet',
          lastModified: '2025-05-15',
          size: '2.4 MB',
          class: null,
          shared: false
        },
      ];
      
      setMaterials(mockMaterials);
      setLoading(false);
    }, 800);
  }, []);

  // Get current display items based on current folder
  const getCurrentItems = () => {
    if (!currentFolder) {
      return materials;
    }
    
    // Navigate breadcrumbs to find the current folder
    let currentItems = materials;
    let currentPath = [...breadcrumbs];
    
    // Skip the root element (index 0)
    for (let i = 1; i < currentPath.length; i++) {
      const folder = currentItems.find(item => item.id === currentPath[i].id);
      if (folder && folder.children) {
        currentItems = folder.children;
      }
    }
    
    return currentItems;
  };

  // Filter and sort items
  const getFilteredItems = () => {
    const currentItems = getCurrentItems();
    
    return currentItems.filter(item => {
      const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesType = filterType === 'all' || item.type === filterType;
      return matchesSearch && matchesType;
    }).sort((a, b) => {
      // Folders first
      if (a.type === 'folder' && b.type !== 'folder') {
        return -1;
      }
      if (a.type !== 'folder' && b.type === 'folder') {
        return 1;
      }
      
      // Then sort by name
      return a.name.localeCompare(b.name);
    });
  };

  // Handle folder navigation
  const handleOpenFolder = (folder) => {
    setCurrentFolder(folder.id);
    setBreadcrumbs([...breadcrumbs, { id: folder.id, name: folder.name }]);
  };

  // Handle breadcrumb navigation
  const handleBreadcrumbClick = (index) => {
    if (index === 0) {
      // Root folder
      setCurrentFolder(null);
      setBreadcrumbs([{ id: 'root', name: 'My Materials' }]);
    } else {
      const newBreadcrumbs = breadcrumbs.slice(0, index + 1);
      setCurrentFolder(newBreadcrumbs[newBreadcrumbs.length - 1].id);
      setBreadcrumbs(newBreadcrumbs);
    }
  };

  // Get icon based on item type
  const getItemIcon = (type) => {
    switch (type) {
      case 'folder':
        return (
          <svg className="w-10 h-10 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"></path>
          </svg>
        );
      case 'document':
        return (
          <svg className="w-10 h-10 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"></path>
          </svg>
        );
      case 'presentation':
        return (
          <svg className="w-10 h-10 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z"></path>
          </svg>
        );
      case 'spreadsheet':
        return (
          <svg className="w-10 h-10 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"></path>
          </svg>
        );
      case 'video':
        return (
          <svg className="w-10 h-10 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"></path>
          </svg>
        );
      default:
        return (
          <svg className="w-10 h-10 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
          </svg>
        );
    }
  };

  // Format date display
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: "spring",
        stiffness: 80
      }
    }
  };

  return (
    <div className="px-4 py-6">
      <header className="mb-8">
        <h1 className="text-2xl font-bold text-gray-800 mb-2">Materials</h1>
        <p className="text-gray-600">Manage and share your teaching resources and materials</p>
      </header>

      {/* Filter and search bar */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 gap-4">
        <div className="flex space-x-2 overflow-x-auto pb-2 md:pb-0">
          <button 
            onClick={() => setFilterType('all')}
            className={`px-4 py-2 rounded-lg whitespace-nowrap ${filterType === 'all' 
              ? 'bg-cyan-600 text-white' 
              : 'bg-white text-gray-600 hover:bg-gray-100'}`}
          >
            All Files
          </button>
          <button 
            onClick={() => setFilterType('folder')}
            className={`px-4 py-2 rounded-lg whitespace-nowrap ${filterType === 'folder' 
              ? 'bg-yellow-600 text-white' 
              : 'bg-white text-gray-600 hover:bg-gray-100'}`}
          >
            Folders
          </button>
          <button 
            onClick={() => setFilterType('document')}
            className={`px-4 py-2 rounded-lg whitespace-nowrap ${filterType === 'document' 
              ? 'bg-blue-600 text-white' 
              : 'bg-white text-gray-600 hover:bg-gray-100'}`}
          >
            Documents
          </button>
          <button 
            onClick={() => setFilterType('presentation')}
            className={`px-4 py-2 rounded-lg whitespace-nowrap ${filterType === 'presentation' 
              ? 'bg-red-600 text-white' 
              : 'bg-white text-gray-600 hover:bg-gray-100'}`}
          >
            Presentations
          </button>
        </div>

        <div className="relative">
          <input
            type="text"
            placeholder="Search materials..."
            className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 w-full md:w-64"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <svg className="w-5 h-5 text-gray-400 absolute left-3 top-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
          </svg>
        </div>
      </div>

      {/* Upload buttons */}
      <div className="mb-6 flex flex-wrap gap-3">
        <button className="px-4 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 transition-colors flex items-center">
          <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"></path>
          </svg>
          Upload Files
        </button>
        <button className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors flex items-center">
          <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
          </svg>
          New Folder
        </button>
      </div>

      {/* Breadcrumbs */}
      <nav className="mb-4">
        <ol className="flex flex-wrap items-center space-x-1 text-sm text-gray-600">
          {breadcrumbs.map((crumb, index) => (
            <li key={crumb.id} className="flex items-center">
              {index > 0 && (
                <svg className="w-4 h-4 mx-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path>
                </svg>
              )}
              <button 
                className={`hover:text-cyan-600 ${index === breadcrumbs.length - 1 ? 'font-medium text-cyan-600' : ''}`}
                onClick={() => handleBreadcrumbClick(index)}
              >
                {crumb.name}
              </button>
            </li>
          ))}
        </ol>
      </nav>

      {loading ? (
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="p-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 animate-pulse">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="border border-gray-100 rounded-lg p-4">
                <div className="w-10 h-10 bg-gray-200 rounded mb-3"></div>
                <div className="h-5 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {getFilteredItems().length === 0 ? (
            <div className="bg-white rounded-xl shadow-sm p-8 text-center">
              <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4"></path>
              </svg>
              <h3 className="text-lg font-medium text-gray-900 mb-1">No materials found</h3>
              <p className="text-gray-500">Try adjusting your filters or upload new files</p>
            </div>
          ) : (
            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 p-6">
                {getFilteredItems().map(item => (
                  <motion.div
                    key={item.id}
                    variants={itemVariants}
                    className={`border border-gray-100 rounded-lg p-4 hover:shadow-md transition-shadow ${item.type === 'folder' ? 'cursor-pointer hover:bg-gray-50' : ''}`}
                    onClick={() => item.type === 'folder' ? handleOpenFolder(item) : null}
                  >
                    <div className="flex items-start">
                      <div className="mr-3">
                        {getItemIcon(item.type)}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <h3 className="text-sm font-medium text-gray-900 truncate">{item.name}</h3>
                        <div className="mt-1 flex items-center text-xs text-gray-500">
                          {item.type === 'folder' ? (
                            <span>{item.items} items</span>
                          ) : (
                            <span>{item.size}</span>
                          )}
                          
                          <span className="mx-1">•</span>
                          <span>Modified {formatDate(item.lastModified)}</span>
                        </div>
                        
                        {item.class && (
                          <div className="mt-2">
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-cyan-100 text-cyan-800">
                              {item.class}
                            </span>
                          </div>
                        )}
                      </div>
                      
                      <div className="ml-2">
                        <button className="p-1 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100">
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z"></path>
                          </svg>
                        </button>
                      </div>
                    </div>
                    
                    {item.shared && (
                      <div className="mt-3 pt-3 border-t border-gray-100 flex items-center text-xs text-gray-500">
                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"></path>
                        </svg>
                        Shared with students
                      </div>
                    )}
                  </motion.div>
                ))}
              </div>
            </div>
          )}
        </motion.div>
      )}
    </div>
  );
}
