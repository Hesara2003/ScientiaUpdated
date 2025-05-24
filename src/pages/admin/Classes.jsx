import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import classService from "../../services/classService";

export default function Classes() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [classes, setClasses] = useState([]);
  const [activeTab, setActiveTab] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [filterSubject, setFilterSubject] = useState("all");
  const [showAddModal, setShowAddModal] = useState(false);
  const [newClass, setNewClass] = useState({
    className: "",
    description: "",
    tutorId: "",
    price: 0,
  });

  const subjects = [
    "Mathematics",
    "Physics",
    "Chemistry",
    "Biology",
    "Computer Science",
    "English",
    "History",
  ];

  // Subject color mapping for visual appeal
  const subjectColors = {
    Mathematics: "from-blue-500 to-blue-600",
    Physics: "from-purple-500 to-purple-600",
    Chemistry: "from-green-500 to-green-600",
    Biology: "from-yellow-500 to-yellow-600",
    "Computer Science": "from-indigo-500 to-indigo-600",
    English: "from-red-500 to-red-600",
    History: "from-pink-500 to-pink-600",
    default: "from-gray-500 to-gray-600",
  };

  const getSubjectGradient = (subject) => {
    return subjectColors[subject] || subjectColors.default;
  };

  // Helper function to get tutor display name
  const getTutorDisplayName = (tutor) => {
    if (!tutor) return "Unknown";

    if (typeof tutor === "string") return tutor;

    if (typeof tutor === "object") {
      if (tutor.firstName && tutor.lastName) {
        return `${tutor.firstName} ${tutor.lastName}`;
      } else if (tutor.firstName) {
        return tutor.firstName;
      } else if (tutor.lastName) {
        return tutor.lastName;
      } else if (tutor.email) {
        return tutor.email;
      } else if (tutor.tutorName) {
        return tutor.tutorName;
      } else if (tutor.name) {
        return tutor.name;
      }
    }

    return "Unknown";
  };
  useEffect(() => {
    const fetchClasses = async () => {
      setLoading(true);
      try {
        const response = await classService.getAllClasses();
        console.log("Fetched classes:", response);

        // Normalize data from backend ClassEntity structure
        const classesWithStatus = response.map((cls) => ({
          ...cls,
          id: cls.classId || cls.id || Date.now() + Math.random(),
          name: cls.className || cls.name || "Unnamed Class",
          subject: cls.description || cls.subject || "Unknown",
          tutor: cls.tutor || "Unknown",
          room: "N/A", // Not available in backend
          startTime: "N/A", // Not available in backend
          endTime: "N/A", // Not available in backend
          days: [], // Not available in backend
          capacity: 30, // Default value since not in backend
          enrolledStudents: 0, // Default value since not in backend
          status: "active", // Default status
          price: cls.price || 0,
        }));
        setClasses(classesWithStatus);
      } catch (err) {
        console.error("Error fetching classes:", err);
        setError("Failed to load classes data. Please try refreshing the page.");

        // Use sample data as fallback
        setClasses([
          {
            id: 1,
            name: "Advanced Calculus",
            subject: "Mathematics",
            tutor: "Dr. Smith",
            room: "A101",
            startTime: "10:00 AM",
            endTime: "11:30 AM",
            days: ["Monday", "Wednesday", "Friday"],
            capacity: 30,
            enrolledStudents: 25,
            status: "active",
          },
          {
            id: 2,
            name: "Introduction to Psychology",
            subject: "Psychology",
            tutor: "Dr. Brown",
            room: "B202",
            startTime: "9:00 AM",
            endTime: "10:30 AM",
            days: ["Tuesday", "Thursday"],
            capacity: 25,
            enrolledStudents: 20,
            status: "active",
          },
          {
            id: 3,
            name: "Organic Chemistry",
            subject: "Chemistry",
            tutor: "Dr. Green",
            room: "C303",
            startTime: "1:00 PM",
            endTime: "2:30 PM",
            days: ["Monday", "Wednesday"],
            capacity: 30,
            enrolledStudents: 30,
            status: "full",
          },
          {
            id: 4,
            name: "World History",
            subject: "History",
            tutor: "Prof. White",
            room: "D404",
            startTime: "11:00 AM",
            endTime: "12:30 PM",
            days: ["Tuesday", "Thursday"],
            capacity: 20,
            enrolledStudents: 15,
            status: "active",
          },
          {
            id: 5,
            name: "Data Structures",
            subject: "Computer Science",
            tutor: "Dr. Black",
            room: "E505",
            startTime: "3:00 PM",
            endTime: "4:30 PM",
            days: ["Monday", "Wednesday"],
            capacity: 25,
            enrolledStudents: 10,
            status: "active",
          },
          {
            id: 6,
            name: "Calculus I",
            subject: "Mathematics",
            tutor: "Dr. Smith",
            room: "A101",
            startTime: "10:00 AM",
            endTime: "11:30 AM",
            days: ["Monday", "Wednesday", "Friday"],
            capacity: 30,
            enrolledStudents: 25,
            status: "active",
          },
          {
            id: 7,
            name: "Modern World History",
            tutor: "Prof. Taylor",
            room: "F220",
            startTime: "10:00 AM",
            endTime: "11:30 AM",
            days: ["Tuesday", "Friday"],
            capacity: 30,
            enrolledStudents: 22,
            status: "active",
          },
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchClasses();
  }, []);
  const filteredClasses = classes.filter((cls) => {
    const status = cls.status || "active";
    if (activeTab !== "all" && status !== activeTab) {
      return false;
    }
    if (searchQuery) {
      const tutorName = getTutorDisplayName(cls.tutor).toLowerCase();
      if (
        !cls.name?.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !tutorName.includes(searchQuery.toLowerCase()) &&
        !cls.room?.toLowerCase().includes(searchQuery.toLowerCase())
      ) {
        return false;
      }
    }
    if (filterSubject !== "all" && cls.subject !== filterSubject) {
      return false;
    }
    return true;
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewClass((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const classData = {
        className: newClass.className,
        description: newClass.description,
        tutorId: newClass.tutorId ? parseInt(newClass.tutorId) : null,
        price: parseFloat(newClass.price) || 0,
      };

      const response = await classService.createClass(classData);

      // Format the response data to match our component's expected structure
      const formattedClass = {
        ...response,
        id: response.classId || response.id || Date.now(),
        name: response.className || response.name,
        subject: response.description || response.subject,
        tutor: response.tutor || "Unknown",
        room: "N/A",
        startTime: "N/A",
        endTime: "N/A",
        days: [],
        capacity: 30,
        enrolledStudents: 0,
        status: "active",
      };

      setClasses((prev) => [...prev, formattedClass]);
      setShowAddModal(false);
      setNewClass({
        className: "",
        description: "",
        tutorId: "",
        price: 0,
      });
    } catch (err) {
      console.error("Error creating class:", err);
      alert("Failed to create class. Please try again.");
    }
  };

  const getStatusColor = (status = "active") => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800";
      case "full":
        return "bg-yellow-100 text-yellow-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getCapacityPercentage = (enrolled, capacity) => {
    return capacity > 0 ? Math.round((enrolled / capacity) * 100) : 0;
  };

  const getCapacityColor = (percentage) => {
    if (percentage >= 90) return "bg-red-500";
    if (percentage >= 70) return "bg-yellow-500";
    return "bg-green-500";
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <div className="animate-spin rounded-full h-20 w-20 border-4 border-blue-200"></div>
            <div className="animate-spin rounded-full h-20 w-20 border-t-4 border-blue-600 absolute top-0 left-0"></div>
          </div>
          <p className="mt-4 text-gray-600 font-medium">Loading classes...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Enhanced Header */}
        <div className="mb-8 text-center">
          <div className="relative inline-block">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
              Class Management
            </h1>
            <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-24 h-1 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full"></div>
          </div>
          <p className="text-gray-600 mt-4 text-lg">
            Manage and organize your institution's classes with ease
          </p>
        </div>

        {/* Enhanced Tab Navigation and Add Button */}
        <div className="flex flex-col lg:flex-row justify-between items-center mb-8 space-y-4 lg:space-y-0">
          <div className="flex space-x-1 bg-white rounded-xl p-1 shadow-lg border border-gray-100">
            {["all", "active", "full", "cancelled"].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-6 py-3 rounded-lg font-medium transition-all duration-300 ${
                  activeTab === tab
                    ? "bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-md transform scale-105"
                    : "text-gray-600 hover:text-blue-600 hover:bg-blue-50"
                }`}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)} Classes
              </button>
            ))}
          </div>

          <button
            onClick={() => setShowAddModal(true)}
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-6 py-3 rounded-xl flex items-center shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
          >
            <svg
              className="w-5 h-5 mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M12 6v6m0 0v6m0-6h6m-6 0H6"
              />
            </svg>
            Add New Class
          </button>
        </div>

        {/* Enhanced Search and Filter */}
        <div className="bg-white shadow-xl rounded-2xl p-6 mb-8 border border-gray-100">
          <div className="flex flex-col md:flex-row gap-6">
            <div className="flex-1">
              <div className="relative group">
                <input
                  type="text"
                  placeholder="Search classes by name, tutor, or subject..."
                  className="w-full border-2 border-gray-200 rounded-xl pl-12 py-4 focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all duration-300 bg-gray-50 focus:bg-white"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <svg
                  className="w-6 h-6 text-gray-400 group-focus-within:text-blue-500 absolute left-4 top-4 transition-colors duration-300"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </div>
            </div>

            <div className="w-full md:w-64">
              <select
                className="w-full border-2 border-gray-200 rounded-xl py-4 px-4 focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all duration-300 bg-gray-50 focus:bg-white"
                value={filterSubject}
                onChange={(e) => setFilterSubject(e.target.value)}
              >
                <option value="all">All Subjects</option>
                {subjects.map((subject) => (
                  <option key={subject} value={subject}>
                    {subject}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Enhanced Error Display */}
        {error && (
          <div className="bg-gradient-to-r from-red-50 to-red-100 border-l-4 border-red-400 p-6 mb-8 rounded-xl shadow-lg">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <svg
                  className="h-6 w-6 text-red-400"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-red-700 font-medium">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Enhanced Classes Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8 mb-12">
          {filteredClasses.map((cls, index) => (
            <div
              key={cls.id}
              className="group bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 overflow-hidden border border-gray-100 hover:border-blue-200 transform hover:-translate-y-2"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              {/* Gradient Header */}
              <div
                className={`h-3 bg-gradient-to-r ${getSubjectGradient(
                  cls.subject
                )}`}
              ></div>

              <div className="p-6">
                {/* Class Header */}
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-gray-800 mb-2 group-hover:text-blue-600 transition-colors duration-300">
                      {cls.name || "Unnamed Class"}
                    </h3>
                    <div
                      className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gradient-to-r ${getSubjectGradient(
                        cls.subject
                      )} text-white shadow-md`}
                    >
                      {cls.subject || "Unknown"}
                    </div>
                  </div>
                  <span className="px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 shadow-sm">
                    Active
                  </span>
                </div>

                {/* Class Details */}
                <div className="space-y-3 mb-6">
                  <div className="flex items-center group/item">
                    <div className="p-2 rounded-lg bg-blue-50 group-hover/item:bg-blue-100 transition-colors duration-300 mr-3">
                      <svg
                        className="w-4 h-4 text-blue-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                        />
                      </svg>
                    </div>
                    <span className="text-gray-700 font-medium">
                      {getTutorDisplayName(cls.tutor)}
                    </span>
                  </div>

                  {cls.price > 0 && (
                    <div className="flex items-center group/item">
                      <div className="p-2 rounded-lg bg-green-50 group-hover/item:bg-green-100 transition-colors duration-300 mr-3">
                        <svg
                          className="w-4 h-4 text-green-600"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"
                          />
                        </svg>
                      </div>
                      <span className="text-gray-700 font-medium">
                        ${cls.price}
                      </span>
                    </div>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="flex space-x-3">
                  <Link
                    to={`/classes/${cls.id}/students`}
                    className="flex-1 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white text-center py-3 rounded-xl font-medium transition-all duration-300 transform hover:scale-105 shadow-md hover:shadow-lg flex items-center justify-center"
                  >
                    <svg
                      className="w-4 h-4 mr-2"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                      />
                    </svg>
                    Students
                  </Link>
                  <Link
                    to={`/classes/${cls.id}/edit`}
                    className="flex-1 bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white text-center py-3 rounded-xl font-medium transition-all duration-300 transform hover:scale-105 shadow-md hover:shadow-lg flex items-center justify-center"
                  >
                    <svg
                      className="w-4 h-4 mr-2"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                      />
                    </svg>
                    Edit
                  </Link>
                </div>
              </div>
            </div>
          ))}

          {/* Enhanced No Classes Found */}
          {filteredClasses.length === 0 && (
            <div className="col-span-full bg-white rounded-2xl shadow-lg p-12 text-center border border-gray-100">
              <div className="max-w-md mx-auto">
                <div className="mb-6">
                  <div className="w-24 h-24 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg
                      className="w-12 h-12 text-gray-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                    </svg>
                  </div>
                </div>
                <h3 className="text-2xl font-bold text-gray-800 mb-3">
                  No Classes Found
                </h3>
                <p className="text-gray-600 mb-6 leading-relaxed">
                  No classes match your current search criteria. Try adjusting
                  your filters or create a new class.
                </p>
                <div className="space-y-3">
                  <button
                    onClick={() => {
                      setSearchQuery("");
                      setFilterSubject("all");
                      setActiveTab("all");
                    }}
                    className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white px-6 py-3 rounded-xl font-medium transition-all duration-300 transform hover:scale-105 shadow-md hover:shadow-lg"
                  >
                    Clear All Filters
                  </button>
                  <div className="text-sm text-gray-500">or</div>
                  <button
                    onClick={() => setShowAddModal(true)}
                    className="bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white px-6 py-3 rounded-xl font-medium transition-all duration-300 transform hover:scale-105 shadow-md hover:shadow-lg"
                  >
                    Create New Class
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Enhanced Modal */}
        {showAddModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full transform transition-all duration-300 scale-100">
              {/* Modal Header */}
              <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-t-2xl px-6 py-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-xl font-bold text-white">Add New Class</h3>
                  <button
                    onClick={() => setShowAddModal(false)}
                    className="text-white hover:text-gray-200 transition-colors duration-200 p-1 rounded-lg hover:bg-white hover:bg-opacity-20"
                  >
                    <svg
                      className="w-6 h-6"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                </div>
              </div>

              {/* Modal Form */}
              <form onSubmit={handleSubmit}>
                <div className="p-6 space-y-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Class Name
                    </label>
                    <input
                      type="text"
                      name="className"
                      value={newClass.className}
                      onChange={handleInputChange}
                      className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all duration-300"
                      placeholder="Enter class name"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Subject
                    </label>
                    <select
                      name="description"
                      value={newClass.description}
                      onChange={handleInputChange}
                      className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all duration-300"
                      required
                    >
                      <option value="">Select Subject</option>
                      {subjects.map((subject) => (
                        <option key={subject} value={subject}>
                          {subject}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Tutor ID
                    </label>
                    <input
                      type="number"
                      name="tutorId"
                      value={newClass.tutorId}
                      onChange={handleInputChange}
                      className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all duration-300"
                      placeholder="Enter tutor ID (optional)"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Price ($)
                    </label>
                    <input
                      type="number"
                      name="price"
                      value={newClass.price}
                      onChange={handleInputChange}
                      min="0"
                      step="0.01"
                      className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all duration-300"
                      placeholder="0.00"
                    />
                  </div>
                </div>

                {/* Modal Footer */}
                <div className="bg-gray-50 px-6 py-4 flex space-x-3 rounded-b-2xl">
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="flex-1 px-4 py-3 border-2 border-gray-300 rounded-xl text-gray-700 hover:bg-gray-100 hover:border-gray-400 transition-all duration-300 font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-xl transition-all duration-300 transform hover:scale-105 shadow-md hover:shadow-lg font-medium"
                  >
                    Create Class
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Enhanced Footer Stats */}
        <div className="bg-white rounded-2xl shadow-lg p-6 text-center border border-gray-100">
          <div className="flex items-center justify-center space-x-2 text-gray-600">
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
              />
            </svg>
            <span className="font-medium">
              Showing {filteredClasses.length} of {classes.length} classes
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}