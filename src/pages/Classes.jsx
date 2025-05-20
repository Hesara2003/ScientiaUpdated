import { useState, useEffect } from "react";
import axios from "axios";
import { Link } from "react-router-dom";

export default function Classes() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [classes, setClasses] = useState([]);
  const [activeTab, setActiveTab] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [filterSubject, setFilterSubject] = useState("all");
  const [showAddModal, setShowAddModal] = useState(false);
  const [newClass, setNewClass] = useState({
    name: "",
    subject: "",
    tutor: "",
    room: "",
    startTime: "",
    endTime: "",
    days: [],
    capacity: 0,
    enrolledStudents: 0
  });

  const subjects = ["Mathematics", "Physics", "Chemistry", "Biology", "Computer Science", "English", "History"];
  
  const weekdays = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
  
  const timeSlots = [
    "8:00 AM", "9:00 AM", "10:00 AM", "11:00 AM", "12:00 PM", 
    "1:00 PM", "2:00 PM", "3:00 PM", "4:00 PM", "5:00 PM"
  ];

  useEffect(() => {
    const fetchClasses = async () => {
      setLoading(true);
      try {
        const response = await axios.get("http://localhost:8080/classes");
        // Make sure every class has a status property
        const classesWithStatus = response.data.map(cls => ({
          ...cls,
          status: cls.status || "active"
        }));
        setClasses(classesWithStatus);
      } catch (err) {
        console.error("Error fetching classes:", err);
        setError("Failed to load classes data. Please try refreshing the page.");
        // Sample data remains the same
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
            status: "active"
          },
          {
            id: 2,
            name: "Physics for Engineers",
            subject: "Physics",
            tutor: "Dr. Johnson",
            room: "B205",
            startTime: "9:00 AM",
            endTime: "10:30 AM",
            days: ["Tuesday", "Thursday"],
            capacity: 25,
            enrolledStudents: 20,
            status: "active"
          },
          {
            id: 3,
            name: "Organic Chemistry",
            subject: "Chemistry",
            tutor: "Prof. Williams",
            room: "C310",
            startTime: "1:00 PM",
            endTime: "2:30 PM",
            days: ["Monday", "Wednesday"],
            capacity: 20,
            enrolledStudents: 18,
            status: "active"
          },
          {
            id: 4,
            name: "Molecular Biology",
            subject: "Biology",
            tutor: "Dr. Davis",
            room: "D105",
            startTime: "3:00 PM",
            endTime: "4:30 PM",
            days: ["Tuesday", "Friday"],
            capacity: 22,
            enrolledStudents: 15,
            status: "active"
          },
          {
            id: 5,
            name: "Web Development",
            subject: "Computer Science",
            tutor: "Mr. Brown",
            room: "A220",
            startTime: "2:00 PM",
            endTime: "4:00 PM",
            days: ["Wednesday"],
            capacity: 20,
            enrolledStudents: 20,
            status: "full"
          },
          {
            id: 6,
            name: "Literature Analysis",
            subject: "English",
            tutor: "Ms. Wilson",
            room: "E115",
            startTime: "11:00 AM",
            endTime: "12:30 PM",
            days: ["Monday", "Thursday"],
            capacity: 25,
            enrolledStudents: 15,
            status: "active"
          },
          {
            id: 7,
            name: "Modern World History",
            subject: "History",
            tutor: "Prof. Taylor",
            room: "F220",
            startTime: "10:00 AM",
            endTime: "11:30 AM",
            days: ["Tuesday", "Friday"],
            capacity: 30,
            enrolledStudents: 22,
            status: "active"
          }
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchClasses();
  }, []);

  const filteredClasses = classes.filter(cls => {
    // Ensure every class has a status for filtering
    const status = cls.status || "active";
    
    if (activeTab !== "all" && status !== activeTab) {
      return false;
    }
    
    if (
      searchQuery && 
      !cls.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
      !cls.tutor.toLowerCase().includes(searchQuery.toLowerCase()) &&
      !cls.room.toLowerCase().includes(searchQuery.toLowerCase())
    ) {
      return false;
    }
    
    if (filterSubject !== "all" && cls.subject !== filterSubject) {
      return false;
    }
    
    return true;
  });

  const scheduleByDay = weekdays.map(day => {
    return {
      day,
      classes: classes.filter(cls => cls.days.includes(day))
    };
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewClass(prev => ({ ...prev, [name]: value }));
  };

  const handleDaySelection = (day) => {
    setNewClass(prev => {
      const updatedDays = prev.days.includes(day)
        ? prev.days.filter(d => d !== day)
        : [...prev.days, day];
      return { ...prev, days: updatedDays };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post("http://localhost:8080/classes", newClass);
      setClasses(prev => [...prev, { ...newClass, id: Date.now(), status: "active" }]);
      setShowAddModal(false);
      setNewClass({
        name: "",
        subject: "",
        tutor: "",
        room: "",
        startTime: "",
        endTime: "",
        days: [],
        capacity: 0,
        enrolledStudents: 0
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
    return Math.round((enrolled / capacity) * 100);
  };

  const getCapacityColor = (percentage) => {
    if (percentage >= 90) return "bg-red-500";
    if (percentage >= 70) return "bg-yellow-500";
    return "bg-green-500";
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-20 w-20 border-t-4 border-b-4 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Class Management</h1>
        <p className="text-gray-600">Manage and schedule classes for your institution.</p>
      </div>

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 space-y-4 md:space-y-0">
        <div className="flex space-x-1 bg-gray-100 rounded-lg p-1">
          <button
            onClick={() => setActiveTab("all")}
            className={`px-4 py-2 rounded-md ${
              activeTab === "all" ? "bg-white shadow" : "hover:bg-gray-200"
            }`}
          >
            All Classes
          </button>
          <button
            onClick={() => setActiveTab("active")}
            className={`px-4 py-2 rounded-md ${
              activeTab === "active" ? "bg-white shadow" : "hover:bg-gray-200"
            }`}
          >
            Active
          </button>
          <button
            onClick={() => setActiveTab("full")}
            className={`px-4 py-2 rounded-md ${
              activeTab === "full" ? "bg-white shadow" : "hover:bg-gray-200"
            }`}
          >
            Full
          </button>
          <button
            onClick={() => setActiveTab("cancelled")}
            className={`px-4 py-2 rounded-md ${
              activeTab === "cancelled" ? "bg-white shadow" : "hover:bg-gray-200"
            }`}
          >
            Cancelled
          </button>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md flex items-center"
        >
          <svg
            className="w-5 h-5 mr-2"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M12 6v6m0 0v6m0-6h6m-6 0H6"
            ></path>
          </svg>
          Add Class
        </button>
      </div>

      <div className="bg-white shadow-md rounded-lg p-4 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <input
                type="text"
                placeholder="Search classes by name, tutor or room..."
                className="w-full border border-gray-300 rounded-md pl-10 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <svg
                className="w-5 h-5 text-gray-400 absolute left-3 top-2.5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                ></path>
              </svg>
            </div>
          </div>

          <div className="w-full md:w-48">
            <select
              className="w-full border border-gray-300 rounded-md py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
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

      {error && (
        <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-6">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg
                className="h-5 w-5 text-red-400"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
        {filteredClasses.map((cls) => (
          <div
            key={cls.id}
            className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300"
          >
            <div className={`h-2 ${getCapacityColor(getCapacityPercentage(cls.enrolledStudents, cls.capacity))}`}></div>
            <div className="p-6">
              <div className="flex justify-between items-start">
                <h3 className="text-lg font-bold text-gray-800 mb-1">{cls.name}</h3>
                <span
                  className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(cls.status || "active")}`}
                >
                  {cls.status ? cls.status.charAt(0).toUpperCase() + cls.status.slice(1) : "Active"}
                </span>
              </div>

              <p className="text-sm text-blue-600 mb-4">{cls.subject}</p>

              <div className="space-y-2 mb-4">
                <div className="flex items-center">
                  <svg
                    className="w-4 h-4 text-gray-500 mr-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                    ></path>
                  </svg>
                  <span className="text-sm text-gray-700">{cls.tutor}</span>
                </div>
                <div className="flex items-center">
                  <svg
                    className="w-4 h-4 text-gray-500 mr-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                    ></path>
                  </svg>
                  <span className="text-sm text-gray-700">Room {cls.room}</span>
                </div>
                <div className="flex items-center">
                  <svg
                    className="w-4 h-4 text-gray-500 mr-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                    ></path>
                  </svg>
                  <span className="text-sm text-gray-700">
                    {cls.startTime} - {cls.endTime}
                  </span>
                </div>
                <div className="flex items-center">
                  <svg
                    className="w-4 h-4 text-gray-500 mr-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                    ></path>
                  </svg>
                  <span className="text-sm text-gray-700">
                    {cls.days.join(", ")}
                  </span>
                </div>
              </div>

              <div className="mb-4">
                <div className="flex justify-between text-sm mb-1">
                  <span>Class Capacity</span>
                  <span>
                    {cls.enrolledStudents}/{cls.capacity} Students
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full ${getCapacityColor(getCapacityPercentage(cls.enrolledStudents, cls.capacity))}`}
                    style={{
                      width: `${getCapacityPercentage(cls.enrolledStudents, cls.capacity)}%`,
                    }}
                  ></div>
                </div>
              </div>

              <div className="flex justify-between">
                <Link
                  to={`/classes/${cls.id}/students`}
                  className="text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center"
                >
                  <svg
                    className="w-4 h-4 mr-1"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                    ></path>
                  </svg>
                  Students
                </Link>
                <Link
                  to={`/classes/${cls.id}/edit`}
                  className="text-indigo-600 hover:text-indigo-800 text-sm font-medium flex items-center"
                >
                  <svg
                    className="w-4 h-4 mr-1"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                    ></path>
                  </svg>
                  Edit
                </Link>
              </div>
            </div>
          </div>
        ))}

        {filteredClasses.length === 0 && (
          <div className="col-span-full bg-white rounded-lg shadow-md p-6 text-center">
            <svg
              className="w-16 h-16 text-gray-300 mx-auto mb-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              ></path>
            </svg>
            <h3 className="text-lg font-medium text-gray-800 mb-1">No Classes Found</h3>
            <p className="text-gray-600 mb-4">
              No classes matching your current filters were found.
            </p>
            <button
              onClick={() => {
                setSearchQuery("");
                setFilterSubject("all");
                setActiveTab("all");
              }}
              className="text-blue-600 hover:text-blue-800 font-medium"
            >
              Clear Filters
            </button>
          </div>
        )}
      </div>

      {/* Weekly Schedule View */}
      <div className="mb-10">
        <h2 className="text-xl font-bold text-gray-800 mb-4">Weekly Schedule</h2>
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="bg-gray-50">
                  <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b border-gray-200 w-24">
                    Time / Day
                  </th>
                  {weekdays.map((day) => (
                    <th
                      key={day}
                      className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b border-gray-200"
                    >
                      {day}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {timeSlots.map((time, index) => (
                  <tr key={time} className={index % 2 === 0 ? "bg-gray-50" : "bg-white"}>
                    <td className="py-2 px-4 border-b border-gray-200 font-medium text-gray-500">
                      {time}
                    </td>
                    {weekdays.map((day) => {
                      const classesAtTimeAndDay = classes.filter(
                        (cls) =>
                          cls.days.includes(day) &&
                          cls.startTime === time
                      );
                      
                      return (
                        <td
                          key={day}
                          className="py-2 px-4 border-b border-gray-200"
                        >
                          {classesAtTimeAndDay.map((cls) => (
                            <div
                              key={cls.id}
                              className={`p-2 rounded text-sm mb-1 ${
                                cls.subject === "Mathematics"
                                  ? "bg-blue-100 border-l-4 border-blue-500"
                                  : cls.subject === "Physics"
                                  ? "bg-purple-100 border-l-4 border-purple-500"
                                  : cls.subject === "Chemistry"
                                  ? "bg-green-100 border-l-4 border-green-500"
                                  : cls.subject === "Biology"
                                  ? "bg-yellow-100 border-l-4 border-yellow-500"
                                  : cls.subject === "Computer Science"
                                  ? "bg-indigo-100 border-l-4 border-indigo-500"
                                  : cls.subject === "English"
                                  ? "bg-red-100 border-l-4 border-red-500"
                                  : "bg-pink-100 border-l-4 border-pink-500"
                              }`}
                            >
                              <div className="font-medium">{cls.name}</div>
                              <div className="text-xs text-gray-600">{cls.room} - {cls.tutor}</div>
                              <div className="text-xs text-gray-500">
                                {cls.startTime} - {cls.endTime}
                              </div>
                            </div>
                          ))}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {showAddModal && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-screen overflow-y-auto">
            <div className="flex justify-between items-center border-b border-gray-200 px-6 py-4">
              <h3 className="text-lg font-bold text-gray-800">Add New Class</h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-gray-400 hover:text-gray-500"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M6 18L18 6M6 6l12 12"
                  ></path>
                </svg>
              </button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="p-6 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Class Name
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={newClass.name}
                      onChange={handleInputChange}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Subject
                    </label>
                    <select
                      name="subject"
                      value={newClass.subject}
                      onChange={handleInputChange}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Tutor
                    </label>
                    <input
                      type="text"
                      name="tutor"
                      value={newClass.tutor}
                      onChange={handleInputChange}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Room
                    </label>
                    <input
                      type="text"
                      name="room"
                      value={newClass.room}
                      onChange={handleInputChange}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Start Time
                    </label>
                    <select
                      name="startTime"
                      value={newClass.startTime}
                      onChange={handleInputChange}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    >
                      <option value="">Select Start Time</option>
                      {timeSlots.map((time) => (
                        <option key={time} value={time}>
                          {time}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      End Time
                    </label>
                    <select
                      name="endTime"
                      value={newClass.endTime}
                      onChange={handleInputChange}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    >
                      <option value="">Select End Time</option>
                      {timeSlots.map((time) => (
                        <option key={time} value={time}>
                          {time}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Capacity
                    </label>
                    <input
                      type="number"
                      name="capacity"
                      value={newClass.capacity || ""}
                      onChange={handleInputChange}
                      min="1"
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Enrolled Students
                    </label>
                    <input
                      type="number"
                      name="enrolledStudents"
                      value={newClass.enrolledStudents || ""}
                      onChange={handleInputChange}
                      min="0"
                      max={newClass.capacity || 0}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Days
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {weekdays.map((day) => (
                      <button
                        key={day}
                        type="button"
                        onClick={() => handleDaySelection(day)}
                        className={`px-3 py-1 rounded-full text-sm ${
                          newClass.days.includes(day)
                            ? "bg-blue-600 text-white"
                            : "bg-gray-100 text-gray-800 hover:bg-gray-200"
                        }`}
                      >
                        {day.slice(0, 3)}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-6 py-4 flex justify-end space-x-3 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md"
                >
                  Save Class
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="text-center text-sm text-gray-500 mt-8">
        <p>Showing {filteredClasses.length} of {classes.length} classes</p>
      </div>
    </div>
  );
}