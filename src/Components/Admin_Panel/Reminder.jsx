
// import { useState } from "react";
// import { Calendar, Clock, Bell, User, Building, PhoneCall, Mail, FileText, MoreHorizontal, Check, Filter, ChevronLeft, ChevronRight, Search } from "lucide-react";

// export default function UpcomingFollowups() {
//   const [selectedFilter, setSelectedFilter] = useState("all");
//   const [searchTerm, setSearchTerm] = useState("");
//   const [currentPage, setCurrentPage] = useState(1);
//   const [showActionMenu, setShowActionMenu] = useState(null);

//   // Sample data - in a real app, this would come from your backend
//   const followups = [
//     {
//       id: 1,
//       type: "call",
//       leadName: "Sarah Johnson",
//       company: "Acme Technologies",
//       dueDate: "2025-04-14",
//       dueTime: "10:30",
//       priority: "high",
//       status: "pending",
//       notes: "Discuss new product features and pricing options.",
//       assigned: "Alex Thompson"
//     },
//     {
//       id: 2,
//       type: "email",
//       leadName: "Robert Chen",
//       company: "Global Solutions Inc.",
//       dueDate: "2025-04-13",
//       dueTime: "14:00",
//       priority: "medium",
//       status: "pending",
//       notes: "Send proposal document with updated terms.",
//       assigned: "Jamie Rivera"
//     },
//     {
//       id: 3,
//       type: "meeting",
//       leadName: "Michelle Parker",
//       company: "Parker Innovations",
//       dueDate: "2025-04-12",
//       dueTime: "16:15",
//       priority: "high",
//       status: "pending",
//       notes: "Product demo for executive team.",
//       assigned: "Alex Thompson"
//     },
//     {
//       id: 4,
//       type: "call",
//       leadName: "David Wilson",
//       company: "Wilson Enterprises",
//       dueDate: "2025-04-15",
//       dueTime: "11:45",
//       priority: "low",
//       status: "pending",
//       notes: "Initial discovery call to understand needs.",
//       assigned: "Taylor Jordan"
//     },
//     {
//       id: 5,
//       type: "note",
//       leadName: "Priya Sharma",
//       company: "InnovateTech",
//       dueDate: "2025-04-12",
//       dueTime: "09:00",
//       priority: "medium",
//       status: "pending",
//       notes: "Prepare and review account history before next call.",
//       assigned: "Jamie Rivera"
//     }
//   ];

//   // Filter followups based on selected filter and search term
//   const filteredFollowups = followups.filter(followup => {
//     const matchesFilter = selectedFilter === "all" || followup.type === selectedFilter;
//     const matchesSearch = searchTerm === "" ||
//       followup.leadName.toLowerCase().includes(searchTerm.toLowerCase()) ||
//       followup.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
//       followup.notes.toLowerCase().includes(searchTerm.toLowerCase());

//     return matchesFilter && matchesSearch;
//   });

//   // Sort followups by date/time, with higher priority items first when dates are the same
//   const sortedFollowups = [...filteredFollowups].sort((a, b) => {
//     const dateA = new Date(`${a.dueDate}T${a.dueTime}`);
//     const dateB = new Date(`${b.dueDate}T${b.dueTime}`);

//     if (dateA.getTime() === dateB.getTime()) {
//       const priorityOrder = { high: 1, medium: 2, low: 3 };
//       return priorityOrder[a.priority] - priorityOrder[b.priority];
//     }

//     return dateA - dateB;
//   });

//   // Pagination
//   const itemsPerPage = 5;
//   const totalPages = Math.ceil(sortedFollowups.length / itemsPerPage);
//   const paginatedFollowups = sortedFollowups.slice(
//     (currentPage - 1) * itemsPerPage,
//     currentPage * itemsPerPage
//   );

//   const formatDate = (dateString) => {
//     const date = new Date(dateString);
//     return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
//   };

//   const formatTime = (timeString) => {
//     const [hours, minutes] = timeString.split(':');
//     const time = new Date();
//     time.setHours(hours, minutes);
//     return time.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
//   };

//   const getTimeLabel = (date, time) => {
//     const today = new Date();
//     today.setHours(0, 0, 0, 0);

//     const tomorrow = new Date(today);
//     tomorrow.setDate(tomorrow.getDate() + 1);

//     const followupDate = new Date(date);
//     followupDate.setHours(0, 0, 0, 0);

//     if (followupDate.getTime() === today.getTime()) {
//       return `Today at ${formatTime(time)}`;
//     } else if (followupDate.getTime() === tomorrow.getTime()) {
//       return `Tomorrow at ${formatTime(time)}`;
//     } else {
//       return `${formatDate(date)} at ${formatTime(time)}`;
//     }
//   };

//   const getActionIcon = (type) => {
//     switch (type) {
//       case 'call':
//         return <PhoneCall size={16} className="text-blue-500" />;
//       case 'email':
//         return <Mail size={16} className="text-green-500" />;
//       case 'meeting':
//         return <Calendar size={16} className="text-purple-500" />;
//       case 'note':
//         return <FileText size={16} className="text-yellow-500" />;
//       default:
//         return <Bell size={16} className="text-gray-500" />;
//     }
//   };

//   const handleComplete = (id) => {
//     // In a real app, you'd update the followup status in your database
//     console.log(`Marked followup ${id} as complete`);
//     setShowActionMenu(null);
//   };

//   const handleReschedule = (id) => {
//     // In a real app, you'd open a reschedule modal
//     console.log(`Opening reschedule dialog for followup ${id}`);
//     setShowActionMenu(null);
//   };

//   return (
//     <div className="bg-white rounded-lg shadow-lg overflow-hidden">
//       {/* Header */}
//       <div className="px-6 py-4 border-b border-gray-200 bg-white flex justify-between items-center">
//         <h2 className="text-lg font-semibold text-gray-800 flex items-center">
//           <Bell size={18} className="mr-2 text-blue-500" />
//           Upcoming Follow-ups
//         </h2>

//         <div className="flex items-center space-x-4">
//           <div className="relative">
//             <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
//             <input
//               type="text"
//               placeholder="Search follow-ups..."
//               value={searchTerm}
//               onChange={(e) => setSearchTerm(e.target.value)}
//               className="pl-10 pr-4 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
//             />
//           </div>

//           <div className="relative inline-block text-left">
//             <div className="flex items-center border border-gray-300 rounded-md overflow-hidden">
//               {['all', 'call', 'email', 'meeting', 'note'].map((filter) => (
//                 <button
//                   key={filter}
//                   onClick={() => setSelectedFilter(filter)}
//                   className={`px-3 py-2 text-sm font-medium ${
//                     selectedFilter === filter
//                       ? 'bg-blue-50 text-blue-600'
//                       : 'text-gray-700 hover:bg-gray-50'
//                   }`}
//                 >
//                   {filter === 'all' ? 'All' : filter.charAt(0).toUpperCase() + filter.slice(1)}
//                 </button>
//               ))}
//             </div>
//           </div>
//         </div>
//       </div>

//       {/* Follow-up List */}
//       <div className="overflow-hidden">
//         {paginatedFollowups.length === 0 ? (
//           <div className="py-16 flex flex-col items-center justify-center text-center px-6">
//             <Bell size={32} className="text-gray-300 mb-2" />
//             <h3 className="text-lg font-medium text-gray-900">No follow-ups found</h3>
//             <p className="mt-1 text-sm text-gray-500">
//               {searchTerm ? "Try adjusting your search or filter" : "You're all caught up!"}
//             </p>
//           </div>
//         ) : (
//           <ul className="divide-y divide-gray-200">
//             {paginatedFollowups.map((followup) => (
//               <li key={followup.id} className="px-6 py-4 hover:bg-gray-50 transition-colors">
//                 <div className="flex items-center justify-between">
//                   <div className="flex items-center min-w-0 flex-1">
//                     <div className="flex-shrink-0">
//                       <div className={`
//                         w-10 h-10 rounded-full flex items-center justify-center
//                         ${followup.type === 'call' ? 'bg-blue-100' :
//                           followup.type === 'email' ? 'bg-green-100' :
//                           followup.type === 'meeting' ? 'bg-purple-100' :
//                           'bg-yellow-100'}
//                       `}>
//                         {getActionIcon(followup.type)}
//                       </div>
//                     </div>

//                     <div className="ml-4 flex-1 min-w-0">
//                       <div className="flex items-center justify-between">
//                         <div className="flex items-center">
//                           <h3 className="text-sm font-medium text-gray-900 truncate">
//                             {followup.leadName}
//                           </h3>
//                           <span className="ml-1.5 flex-shrink-0">
//                             <span className={`
//                               inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
//                               ${followup.priority === 'high' ? 'bg-red-100 text-red-800' :
//                                 followup.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
//                                 'bg-green-100 text-green-800'}
//                             `}>
//                               {followup.priority.charAt(0).toUpperCase() + followup.priority.slice(1)}
//                             </span>
//                           </span>
//                         </div>

//                         <div className="flex items-center text-sm text-gray-500">
//                           <Clock size={14} className="mr-1" />
//                           {getTimeLabel(followup.dueDate, followup.dueTime)}
//                         </div>
//                       </div>

//                       <div className="mt-1 flex items-center">
//                         <Building size={14} className="text-gray-400 mr-1" />
//                         <span className="text-sm text-gray-500 truncate">{followup.company}</span>
//                       </div>

//                       <div className="mt-1">
//                         <p className="text-sm text-gray-600 line-clamp-1">{followup.notes}</p>
//                       </div>
//                     </div>
//                   </div>

//                   <div className="ml-4 flex-shrink-0 flex items-center">
//                     <span className="text-xs text-gray-500 mr-4 flex items-center">
//                       <User size={12} className="mr-1" />
//                       {followup.assigned}
//                     </span>

//                     <button
//                       onClick={() => handleComplete(followup.id)}
//                       className="mr-2 text-gray-400 hover:text-green-500"
//                       title="Mark as complete"
//                     >
//                       <Check size={18} />
//                     </button>

//                     <div className="relative">
//                       <button
//                         onClick={() => setShowActionMenu(showActionMenu === followup.id ? null : followup.id)}
//                         className="text-gray-400 hover:text-gray-500"
//                       >
//                         <MoreHorizontal size={18} />
//                       </button>

//                       {showActionMenu === followup.id && (
//                         <div className="absolute right-0 mt-2 w-48 rounded-md shadow-lg py-1 bg-white ring-1 ring-black ring-opacity-5 z-10">
//                           <button
//                             onClick={() => handleReschedule(followup.id)}
//                             className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
//                           >
//                             Reschedule
//                           </button>
//                           <button
//                             onClick={() => handleComplete(followup.id)}
//                             className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
//                           >
//                             Mark as Complete
//                           </button>
//                           <button
//                             onClick={() => setShowActionMenu(null)}
//                             className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
//                           >
//                             View Details
//                           </button>
//                         </div>
//                       )}
//                     </div>
//                   </div>
//                 </div>
//               </li>
//             ))}
//           </ul>
//         )}
//       </div>

//       {/* Pagination */}
//       {totalPages > 1 && (
//         <div className="px-6 py-3 flex items-center justify-between border-t border-gray-200 bg-gray-50">
//           <div className="flex-1 flex justify-between items-center">
//             <button
//               onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
//               disabled={currentPage === 1}
//               className={`relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md ${
//                 currentPage === 1
//                   ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
//                   : 'bg-white text-gray-700 hover:bg-gray-50'
//               }`}
//             >
//               <ChevronLeft size={16} className="mr-1" />
//               Previous
//             </button>

//             <p className="text-sm text-gray-700">
//               Showing <span className="font-medium">{(currentPage - 1) * itemsPerPage + 1}</span> to{' '}
//               <span className="font-medium">
//                 {Math.min(currentPage * itemsPerPage, sortedFollowups.length)}
//               </span>{' '}
//               of <span className="font-medium">{sortedFollowups.length}</span> results
//             </p>

//             <button
//               onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
//               disabled={currentPage === totalPages}
//               className={`relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md ${
//                 currentPage === totalPages
//                   ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
//                   : 'bg-white text-gray-700 hover:bg-gray-50'
//               }`}
//             >
//               Next
//               <ChevronRight size={16} className="ml-1" />
//             </button>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }

import { useState, useEffect } from 'react';
import {
  Calendar,
  Clock,
  Mail,
  Phone,
  Users,
  Edit,
  Plus,
  Check,
  X,
  ChevronDown,
  ChevronRight,
  Trash2,
  Loader
} from 'lucide-react';
import { remindersAPI } from '../../services/api';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export default function RemindersComponent() {
  const [activeTab, setActiveTab] = useState('all');
  const [reminders, setReminders] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Check if user is authenticated when component mounts
  useEffect(() => {
    const token = localStorage.getItem('token');
    console.log('Token from localStorage:', token);

    if (token) {
      setIsAuthenticated(true);

      // First test the API connection
      testApiConnection().then(result => {
        if (result) {
          fetchReminders();
        }
      });
    } else {
      toast.error('You need to be logged in to access reminders');
      setIsAuthenticated(false);
    }
  }, []);

  // Test the API connection
  const testApiConnection = async () => {
    try {
      console.log('Testing API connection...');
      // Use the axios instance from api.js
      const response = await fetch('https://lead-backend-jcyc.onrender.com/api/reminders/test', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      // Check if response is ok before trying to parse JSON
      if (!response.ok) {
        console.error('API test response not OK:', response.status, response.statusText);
        toast.error(`API connection test failed: ${response.status} ${response.statusText}`);
        return false;
      }

      try {
        const data = await response.json();
        console.log('Test API response:', data);

        if (data.success) {
          toast.success('API connection test successful');
          return true;
        } else {
          toast.error('API connection test failed');
          return false;
        }
      } catch (jsonError) {
        console.error('Error parsing JSON response:', jsonError);
        toast.error('API response format error: ' + jsonError.message);
        return false;
      }
    } catch (error) {
      console.error('API connection test error:', error);
      toast.error('API connection test failed: ' + error.message);
      return false;
    }
  };

  // Fetch reminders from API
  const fetchReminders = async () => {
    setIsLoading(true);
    try {
      // First test the API connection
      const testResult = await testApiConnection();
      if (!testResult) {
        console.log('Skipping reminder fetch due to failed API test');
        return;
      }

      const response = await remindersAPI.getAll();
      if (response && response.data) {
        setReminders(response.data.data.map(reminder => ({
          id: reminder._id,
          type: reminder.type,
          title: reminder.title,
          date: reminder.date,
          client: reminder.client,
          notes: reminder.notes,
          completed: reminder.completed
        })));
      }
    } catch (error) {
      console.error('Error fetching reminders:', error);
      toast.error('Failed to fetch reminders');
    } finally {
      setIsLoading(false);
    }
  };

  // Add delete reminder function
  const deleteReminder = async (id) => {
    if (window.confirm('Are you sure you want to delete this reminder?')) {
      setIsLoading(true);
      try {
        await remindersAPI.delete(id);
        setReminders(reminders.filter(reminder => reminder.id !== id));
        toast.success('Reminder deleted successfully');
      } catch (error) {
        console.error('Error deleting reminder:', error);
        toast.error('Failed to delete reminder');
      } finally {
        setIsLoading(false);
      }
    }
  };
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [newReminder, setNewReminder] = useState({
    type: 'meeting',
    title: '',
    date: '',
    client: '',
    notes: '',
    completed: false
  });
  const [expandedNoteId, setExpandedNoteId] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({});

  const tabs = [
    { id: 'all', label: 'All' },
    { id: 'meeting', label: 'Meetings', icon: <Users size={16} /> },
    { id: 'call', label: 'Calls', icon: <Phone size={16} /> },
    { id: 'email', label: 'Emails', icon: <Mail size={16} /> },
    // { id: 'calendar', label: 'Calendar', icon: <Calendar size={16} /> },
  ];

  const getIcon = (type) => {
    switch (type) {
      case 'meeting': return <Users className="text-blue-500" />;
      case 'call': return <Phone className="text-green-500" />;
      case 'email': return <Mail className="text-purple-500" />;
      case 'calendar': return <Calendar className="text-orange-500" />;
      default: return <Clock className="text-gray-500" />;
    }
  };

  // Filter reminders based on active tab
  const filteredReminders = activeTab === 'all'
    ? reminders
    : reminders.filter(reminder => reminder.type === activeTab);

  const handleAddNew = () => {
    setIsAddingNew(true);
  };

  const handleCancelAdd = () => {
    setIsAddingNew(false);
    setNewReminder({
      type: 'meeting',
      title: '',
      date: '',
      client: '',
      notes: '',
      completed: false
    });
  };

  const handleSaveNew = async () => {
    if (newReminder.title && newReminder.date) {
      setIsLoading(true);
      try {
        // First test the API connection
        const testResult = await testApiConnection();
        if (!testResult) {
          console.log('Skipping reminder creation due to failed API test');
          setIsLoading(false);
          return;
        }

        // Ensure date is properly formatted
        const reminderData = {
          ...newReminder,
          // Make sure date is in ISO format if it's not already
          date: new Date(newReminder.date).toISOString()
        };

        console.log('Sending reminder data to API:', reminderData);

        // Check if token exists before making the API call
        const token = localStorage.getItem('token');
        console.log('Token before API call:', token);

        if (!token) {
          toast.error('Authentication token missing. Please log in again.');
          setIsAuthenticated(false);
          setIsLoading(false);
          return;
        }

        // Try to log in again to get a fresh token
        try {
          // Get user credentials from localStorage
          const userEmail = localStorage.getItem('userEmail');
          const userId = localStorage.getItem('userId');

          if (!userEmail || !userId) {
            // If we don't have the user info, we can't refresh the token
            console.log('Missing user info for token refresh');
          } else {
            console.log('User info found, will try with existing token');
          }
        } catch (loginError) {
          console.error('Error refreshing token:', loginError);
        }

        // Use the API service instead of direct fetch
        const response = await remindersAPI.create(reminderData);
        console.log('Reminder creation response:', response);

        if (response && response.data && response.data.success) {
          console.log('Reminder saved successfully:', response.data);
          const savedReminder = response.data.data;
          setReminders([...reminders, {
            id: savedReminder._id,
            type: savedReminder.type,
            title: savedReminder.title,
            date: savedReminder.date,
            client: savedReminder.client,
            notes: savedReminder.notes,
            completed: savedReminder.completed
          }]);
          setIsAddingNew(false);
          setNewReminder({
            type: 'meeting',
            title: '',
            date: '',
            client: '',
            notes: '',
            completed: false
          });
          toast.success('Reminder created successfully');
        } else {
          console.error('Error response from server:', response);

          if (response && response.status === 401) {
            // If authentication failed, suggest logging in again
            toast.error('Your session has expired. Please log in again.');
            localStorage.removeItem('token'); // Clear the invalid token
            setIsAuthenticated(false);

            // Redirect to login page after a short delay
            setTimeout(() => {
              window.location.href = '/login';
            }, 2000);
          } else {
            const errorMessage = response?.data?.message || 'Unknown error';
            toast.error('Failed to create reminder: ' + errorMessage);
          }
        }
      } catch (error) {
        console.error('Error creating reminder:', error);
        toast.error('Failed to create reminder: ' + (error.message || 'Unknown error'));
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewReminder({ ...newReminder, [name]: value });
  };

  const toggleComplete = async (id) => {
    setIsLoading(true);
    try {
      const response = await remindersAPI.toggleComplete(id);
      if (response && response.data) {
        const updatedReminder = response.data.data;
        setReminders(reminders.map(reminder =>
          reminder.id === id ? {
            ...reminder,
            completed: updatedReminder.completed
          } : reminder
        ));
        toast.success(`Reminder marked as ${updatedReminder.completed ? 'completed' : 'incomplete'}`);
      }
    } catch (error) {
      console.error('Error toggling reminder completion:', error);
      toast.error('Failed to update reminder');
    } finally {
      setIsLoading(false);
    }
  };

  const startEditing = (reminder) => {
    setEditingId(reminder.id);
    setEditForm({ ...reminder });
  };

  const cancelEditing = () => {
    setEditingId(null);
    setEditForm({});
  };

  const saveEditing = async () => {
    if (editForm.title && editForm.date) {
      setIsLoading(true);
      try {
        // Ensure date is properly formatted
        const reminderData = {
          ...editForm,
          // Make sure date is in ISO format if it's not already
          date: new Date(editForm.date).toISOString()
        };

        const response = await remindersAPI.update(editingId, reminderData);
        if (response && response.data) {
          const updatedReminder = response.data.data;
          setReminders(reminders.map(reminder =>
            reminder.id === editingId ? {
              id: updatedReminder._id,
              type: updatedReminder.type,
              title: updatedReminder.title,
              date: updatedReminder.date,
              client: updatedReminder.client,
              notes: updatedReminder.notes,
              completed: updatedReminder.completed
            } : reminder
          ));
          setEditingId(null);
          setEditForm({});
          toast.success('Reminder updated successfully');
        }
      } catch (error) {
        console.error('Error updating reminder:', error);
        toast.error('Failed to update reminder');
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditForm({ ...editForm, [name]: value });
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit'
    }).format(date);
  };

  const toggleNoteExpansion = (id) => {
    setExpandedNoteId(expandedNoteId === id ? null : id);
  };

  return (
    <div className="w-full max-w-3xl mx-auto bg-white rounded-lg shadow mt-[40px]">
      <ToastContainer position="top-right" autoClose={3000} />

      {!isAuthenticated ? (
        <div className="p-8 text-center">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Authentication Required</h2>
          <p className="text-gray-600 mb-4">You need to be logged in to access reminders.</p>
          <button
            onClick={() => window.location.href = '/login'}
            className="px-4 py-2 bg-[#022d38] text-white rounded-md hover:bg-[#033e4e]"
          >
            Go to Login
          </button>
        </div>
      ) : (
        <>
          <div className="border-b border-gray-200">
            <div className="flex p-4 justify-between items-center">
              <h2 className="text-xl font-semibold text-gray-800">Follow-ups & Reminders</h2>
              <button
                onClick={handleAddNew}
                className="flex items-center px-3 py-2 bg-[#022d38] text-white rounded-md hover:bg-[#022d38] transition-colors"
              >
                <Plus size={18} className="mr-1" />
                New Reminder
              </button>
            </div>

            <div className="flex overflow-x-auto">
              {tabs.map(tab => (
                <button
                  key={tab.id}
                  className={`flex items-center px-4 py-3 transition-colors ${
                    activeTab === tab.id ?
                    'text-blue-600 border-b-2 border-blue-600 font-medium' :
                    'text-gray-500 hover:text-gray-700'
                  }`}
                  onClick={() => setActiveTab(tab.id)}
                >
                  {tab.icon && <span className="mr-2">{tab.icon}</span>}
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {isAddingNew && (
            <div className="p-4 border-b border-gray-200 bg-gray-50">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                  <select
                    name="type"
                    value={newReminder.type}
                    onChange={handleInputChange}
                    className="w-full p-2 border border-gray-300 rounded-md"
                  >
                    <option value="meeting">Meeting</option>
                    <option value="call">Call</option>
                    <option value="email">Email</option>
                    <option value="calendar">Calendar</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Client/Company</label>
                  <input
                    type="text"
                    name="client"
                    placeholder="Client name"
                    value={newReminder.client}
                    onChange={handleInputChange}
                    className="w-full p-2 border border-gray-300 rounded-md"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                  <input
                    type="text"
                    name="title"
                    placeholder="Reminder title"
                    value={newReminder.title}
                    onChange={handleInputChange}
                    className="w-full p-2 border border-gray-300 rounded-md"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Date & Time</label>
                  <input
                    type="datetime-local"
                    name="date"
                    value={newReminder.date}
                    onChange={handleInputChange}
                    className="w-full p-2 border border-gray-300 rounded-md"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                  <textarea
                    name="notes"
                    placeholder="Add notes about this reminder..."
                    value={newReminder.notes}
                    onChange={handleInputChange}
                    rows={3}
                    className="w-full p-2 border border-gray-300 rounded-md"
                  />
                </div>
              </div>
              <div className="flex justify-end mt-4 space-x-2">
                <button
                  onClick={handleCancelAdd}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveNew}
                  disabled={!newReminder.title || !newReminder.date || isLoading}
                  className={`px-4 py-2 rounded-md text-white flex items-center ${
                    newReminder.title && newReminder.date && !isLoading ?
                    'bg-[#022d38] hover:bg-[#022d38]' :
                    'bg-blue-400 cursor-not-allowed'
                  }`}
                >
                  {isLoading && <Loader size={16} className="animate-spin mr-2" />}
                  {isLoading ? 'Saving...' : 'Save Reminder'}
                </button>
              </div>
            </div>
          )}

          <div className="divide-y divide-gray-200">
            {isLoading ? (
              <div className="p-6 flex justify-center items-center">
                <Loader className="animate-spin h-8 w-8 text-blue-500 mr-2" />
                <span className="text-gray-600">Loading reminders...</span>
              </div>
            ) : filteredReminders.length === 0 ? (
              <div className="p-6 text-center text-gray-500">
                No reminders found in this category.
              </div>
            ) : (
              filteredReminders.map(reminder => (
                <div
                  key={reminder.id}
                  className={`p-4 hover:bg-gray-50 transition-colors ${reminder.completed ? 'bg-gray-50' : ''}`}
                >
                  {editingId === reminder.id ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                        <select
                          name="type"
                          value={editForm.type}
                          onChange={handleEditChange}
                          className="w-full p-2 border border-gray-300 rounded-md"
                        >
                          <option value="meeting">Meeting</option>
                          <option value="call">Call</option>
                          <option value="email">Email</option>
                          <option value="calendar">Calendar</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Client/Company</label>
                        <input
                          type="text"
                          name="client"
                          value={editForm.client}
                          onChange={handleEditChange}
                          className="w-full p-2 border border-gray-300 rounded-md"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                        <input
                          type="text"
                          name="title"
                          value={editForm.title}
                          onChange={handleEditChange}
                          className="w-full p-2 border border-gray-300 rounded-md"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Date & Time</label>
                        <input
                          type="datetime-local"
                          name="date"
                          value={editForm.date}
                          onChange={handleEditChange}
                          className="w-full p-2 border border-gray-300 rounded-md"
                        />
                      </div>
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                        <textarea
                          name="notes"
                          value={editForm.notes}
                          onChange={handleEditChange}
                          rows={3}
                          className="w-full p-2 border border-gray-300 rounded-md"
                        />
                      </div>
                      <div className="md:col-span-2 flex justify-end space-x-2 mt-2">
                        <button
                          onClick={cancelEditing}
                          className="px-3 py-1 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={saveEditing}
                          disabled={!editForm.title || !editForm.date || isLoading}
                          className={`px-3 py-1 rounded-md text-white flex items-center ${
                            editForm.title && editForm.date && !isLoading ?
                            'bg-blue-600 hover:bg-blue-700' :
                            'bg-blue-400 cursor-not-allowed'
                          }`}
                        >
                          {isLoading && <Loader size={14} className="animate-spin mr-1" />}
                          {isLoading ? 'Saving...' : 'Save Changes'}
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div>
                      <div className="flex items-start">
                        <div className="flex-shrink-0 mt-1">
                          {getIcon(reminder.type)}
                        </div>
                        <div className="ml-3 flex-1">
                          <div className="flex justify-between">
                            <div className="flex items-center">
                              <h3 className={`text-base font-medium ${reminder.completed ? 'text-gray-500 line-through' : 'text-gray-900'}`}>
                                {reminder.title}
                              </h3>
                              {reminder.client && (
                                <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800">
                                  {reminder.client}
                                </span>
                              )}
                            </div>
                            <div className="flex space-x-2 text-sm">
                              <button
                                onClick={() => toggleComplete(reminder.id)}
                                className={`p-1 rounded-full ${reminder.completed ? 'text-green-500 bg-green-50' : 'text-gray-400 hover:text-green-500 hover:bg-green-50'}`}
                                title={reminder.completed ? "Mark as incomplete" : "Mark as complete"}
                              >
                                <Check size={16} />
                              </button>
                              <button
                                onClick={() => startEditing(reminder)}
                                className="p-1 rounded-full text-gray-400 hover:text-blue-500 hover:bg-blue-50"
                                title="Edit reminder"
                              >
                                <Edit size={16} />
                              </button>
                              <button
                                onClick={() => deleteReminder(reminder.id)}
                                className="p-1 rounded-full text-gray-400 hover:text-red-500 hover:bg-red-50"
                                title="Delete reminder"
                              >
                                <Trash2 size={16} />
                              </button>
                            </div>
                          </div>
                          <div className="text-sm text-gray-500 mt-1">
                            {formatDate(reminder.date)}
                          </div>
                          {reminder.notes && (
                            <div className="mt-2">
                              <button
                                onClick={() => toggleNoteExpansion(reminder.id)}
                                className="flex items-center text-sm text-gray-600 hover:text-gray-900"
                              >
                                {expandedNoteId === reminder.id ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                                <span className="ml-1">Notes</span>
                              </button>
                              {expandedNoteId === reminder.id && (
                                <div className="mt-2 p-3 bg-gray-50 rounded-md text-sm text-gray-700">
                                  {reminder.notes}
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </>
      )}
    </div>
  );
}
