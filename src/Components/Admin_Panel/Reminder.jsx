

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
