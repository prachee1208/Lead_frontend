import { useState, useEffect } from 'react';
import {
    CheckCircle, Circle, Plus, Trash2, Clock,
    Calendar, ArrowUp, ArrowDown, Filter, Search,
    User, Phone, Mail, MessageSquare, Loader, AlertCircle,
    RefreshCw
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { enhancedAPI } from '../../services/enhancedAPI';
import { toast } from 'react-toastify';
import ConnectionMonitor from '../common/ConnectionMonitor';

export default function DailyTasks() {
    const [filter, setFilter] = useState('all');
    const [searchTerm, setSearchTerm] = useState('');
    const [isAddingTask, setIsAddingTask] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [tasks, setTasks] = useState([]);
    const [leads, setLeads] = useState([]);
    const [isLoadingLeads, setIsLoadingLeads] = useState(true);
    const [newTask, setNewTask] = useState({
        description: '',
        priority: 'medium',
        relatedLeadId: '',
        dueDate: new Date().toISOString().split('T')[0]
    });

    // Fetch tasks from the database
    const fetchTasks = async () => {
        setIsLoading(true);
        setError(null);

        try {
            // Get the current user ID from localStorage
            const userId = localStorage.getItem('userId');

            if (!userId) {
                console.warn('User ID not found in localStorage');
                setIsLoading(false);
                setError('User ID not found. Please log in again.');
                return;
            }

            // Fetch tasks for the current employee
            const response = await enhancedAPI.tasks.getAll();
            console.log('Tasks response:', response);

            if (response && response.data) {
                // Filter tasks for the current user
                const userTasks = response.data.filter(task => task.employeeId === userId);

                // Transform the API response to match our component's data structure
                const formattedTasks = userTasks.map(task => ({
                    id: task._id,
                    description: task.description,
                    completed: task.completed || false,
                    priority: task.priority || 'medium',
                    createdAt: new Date(task.createdAt).toISOString().split('T')[0],
                    dueDate: new Date(task.dueDate).toISOString().split('T')[0],
                    relatedLeadId: task.leadId || null,
                    relatedLeadName: task.leadName || null,
                    relatedLeadCompany: task.company || null
                }));

                setTasks(formattedTasks);
            } else {
                // If no data is returned, use empty array
                setTasks([]);
            }
        } catch (err) {
            console.error('Error fetching tasks:', err);
            setError('Failed to load tasks. Please try again.');
            toast.error('Failed to load tasks: ' + (err.message || 'Unknown error'));
        } finally {
            setIsLoading(false);
        }
    };

    // Fetch leads from the database
    const fetchLeads = async () => {
        setIsLoadingLeads(true);

        try {
            // Get the current user ID from localStorage
            const userId = localStorage.getItem('userId');

            if (!userId) {
                console.warn('User ID not found in localStorage');
                setIsLoadingLeads(false);
                return;
            }

            // Fetch leads assigned to the current employee
            const response = await enhancedAPI.leads.getByEmployee(userId);
            console.log('Leads response:', response);

            if (response && response.data && response.data.data) {
                // Transform the API response to match our component's data structure
                const formattedLeads = response.data.data.map(lead => ({
                    id: lead._id,
                    name: lead.name,
                    company: lead.company || 'N/A'
                }));

                setLeads(formattedLeads);
            } else {
                // If no data is returned, use empty array
                setLeads([]);
            }
        } catch (err) {
            console.error('Error fetching leads:', err);
            toast.error('Failed to load leads: ' + (err.message || 'Unknown error'));
        } finally {
            setIsLoadingLeads(false);
        }
    };

    // Load data on component mount
    useEffect(() => {
        fetchTasks();
        fetchLeads();
    }, []);

    const filteredTasks = tasks.filter(task => {
        // Apply search filter
        const matchesSearch =
            task.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (task.relatedLeadName && task.relatedLeadName.toLowerCase().includes(searchTerm.toLowerCase())) ||
            (task.relatedLeadCompany && task.relatedLeadCompany.toLowerCase().includes(searchTerm.toLowerCase()));

        // Apply status filter
        const matchesFilter =
            filter === 'all' ||
            (filter === 'completed' && task.completed) ||
            (filter === 'pending' && !task.completed) ||
            (filter === 'high' && task.priority === 'high') ||
            (filter === 'today' && task.dueDate === new Date().toISOString().split('T')[0]);

        return matchesSearch && matchesFilter;
    });

    const toggleTaskCompletion = async (taskId) => {
        try {
            // Optimistically update UI
            setTasks(tasks.map(task =>
                task.id === taskId ? { ...task, completed: !task.completed } : task
            ));

            // Update in the database
            const response = await enhancedAPI.tasks.toggleComplete(taskId);
            console.log('Toggle task completion response:', response);

            toast.success('Task status updated successfully');
        } catch (err) {
            console.error('Error updating task status:', err);
            toast.error('Failed to update task status: ' + (err.message || 'Unknown error'));

            // Revert the optimistic update
            setTasks(tasks.map(task =>
                task.id === taskId ? { ...task, completed: !task.completed } : task
            ));

            // Refresh tasks to ensure consistency
            fetchTasks();
        }
    };

    const deleteTask = async (taskId) => {
        try {
            // Optimistically update UI
            const deletedTask = tasks.find(task => task.id === taskId);
            setTasks(tasks.filter(task => task.id !== taskId));

            // Delete from the database
            const response = await enhancedAPI.tasks.delete(taskId);
            console.log('Delete task response:', response);

            toast.success('Task deleted successfully');
        } catch (err) {
            console.error('Error deleting task:', err);
            toast.error('Failed to delete task: ' + (err.message || 'Unknown error'));

            // Refresh tasks to ensure consistency
            fetchTasks();
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setNewTask({
            ...newTask,
            [name]: value
        });
    };

    const handleAddTask = async () => {
        if (!newTask.description.trim()) {
            toast.error('Please enter a task description');
            return;
        }

        try {
            // Get the current user ID from localStorage
            const userId = localStorage.getItem('userId');

            if (!userId) {
                toast.error('User ID not found. Please log in again.');
                return;
            }

            let relatedLeadName = null;
            let relatedLeadCompany = null;

            if (newTask.relatedLeadId) {
                const selectedLead = leads.find(lead => lead.id === newTask.relatedLeadId);
                if (selectedLead) {
                    relatedLeadName = selectedLead.name;
                    relatedLeadCompany = selectedLead.company;
                }
            }

            // Prepare data for API
            const taskData = {
                description: newTask.description,
                priority: newTask.priority,
                dueDate: new Date(newTask.dueDate).toISOString(),
                completed: false,
                employeeId: userId,
                leadId: newTask.relatedLeadId || null,
                leadName: relatedLeadName,
                company: relatedLeadCompany
            };

            // Save to API
            const response = await enhancedAPI.tasks.create(taskData);
            console.log('Create task response:', response);

            if (response && response.data) {
                // Format the new task for our component
                const formattedTask = {
                    id: response.data._id,
                    description: response.data.description,
                    completed: false,
                    priority: response.data.priority,
                    createdAt: new Date().toISOString().split('T')[0],
                    dueDate: new Date(response.data.dueDate).toISOString().split('T')[0],
                    relatedLeadId: response.data.leadId,
                    relatedLeadName: response.data.leadName,
                    relatedLeadCompany: response.data.company
                };

                // Add to state
                setTasks([...tasks, formattedTask]);
                toast.success('Task added successfully');

                // Reset form
                setNewTask({
                    description: '',
                    priority: 'medium',
                    relatedLeadId: '',
                    dueDate: new Date().toISOString().split('T')[0]
                });
                setIsAddingTask(false);
            } else {
                throw new Error('Failed to create task');
            }
        } catch (err) {
            console.error('Error creating task:', err);
            toast.error('Failed to create task: ' + (err.message || 'Unknown error'));
        }
    };

    const getPriorityColor = (priority) => {
        switch(priority) {
            case 'high': return 'text-red-500';
            case 'medium': return 'text-amber-500';
            case 'low': return 'text-blue-500';
            default: return 'text-gray-500';
        }
    };

    const getPriorityBadgeColor = (priority) => {
        switch(priority) {
            case 'high': return 'bg-red-100 text-red-800 border border-red-200';
            case 'medium': return 'bg-amber-100 text-amber-800 border border-amber-200';
            case 'low': return 'bg-blue-100 text-blue-800 border border-blue-200';
            default: return 'bg-gray-100 text-gray-800 border border-gray-200';
        }
    };

    return (
        <div className="space-y-6">
            {/* Connection status monitor */}
            <ConnectionMonitor />

            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-semibold text-gray-800">Daily Tasks</h1>
                <div className="flex items-center space-x-2">
                    {!isLoading && (
                        <button
                            onClick={fetchTasks}
                            className="p-2 rounded-md hover:bg-gray-100"
                            title="Refresh tasks"
                        >
                            <RefreshCw size={20} className="text-gray-500" />
                        </button>
                    )}
                    <button
                        onClick={() => setIsAddingTask(true)}
                        className="px-4 py-2 bg-[#022d38] text-white rounded-md hover:bg-[#043c4a] flex items-center"
                        disabled={isLoading}
                    >
                        <Plus size={16} className="mr-2" />
                        Add Task
                    </button>
                </div>
            </div>

            {/* Error Message */}
            {error && (
                <div className="bg-red-100 border border-red-200 text-red-800 px-4 py-3 rounded-md flex items-center">
                    <AlertCircle size={20} className="mr-2" />
                    <span>{error}</span>
                    <button
                        onClick={fetchTasks}
                        className="ml-auto text-red-800 hover:text-red-900"
                    >
                        <RefreshCw size={16} />
                    </button>
                </div>
            )}

            {/* Add New Task Form */}
            {isAddingTask && (
                <div className="bg-white rounded-lg shadow p-6">
                    <h2 className="text-lg font-medium text-gray-900 mb-4">Add New Task</h2>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Task Description</label>
                            <input
                                type="text"
                                name="description"
                                value={newTask.description}
                                onChange={handleInputChange}
                                className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#022d38] focus:border-[#022d38]"
                                placeholder="Enter task description"
                                required
                            />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
                                <select
                                    name="priority"
                                    value={newTask.priority}
                                    onChange={handleInputChange}
                                    className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#022d38] focus:border-[#022d38]"
                                >
                                    <option value="high">High</option>
                                    <option value="medium">Medium</option>
                                    <option value="low">Low</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Due Date</label>
                                <input
                                    type="date"
                                    name="dueDate"
                                    value={newTask.dueDate}
                                    onChange={handleInputChange}
                                    className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#022d38] focus:border-[#022d38]"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Related Lead (Optional)</label>
                                <div className="relative">
                                    <select
                                        name="relatedLeadId"
                                        value={newTask.relatedLeadId}
                                        onChange={handleInputChange}
                                        className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#022d38] focus:border-[#022d38]"
                                        disabled={isLoadingLeads}
                                    >
                                        <option value="">None</option>
                                        {leads.map(lead => (
                                            <option key={lead.id} value={lead.id}>
                                                {lead.name} - {lead.company}
                                            </option>
                                        ))}
                                    </select>
                                    {isLoadingLeads && (
                                        <div className="absolute right-2 top-1/2 transform -translate-y-1/2">
                                            <Loader size={16} className="text-gray-400 animate-spin" />
                                        </div>
                                    )}
                                </div>
                                {leads.length === 0 && !isLoadingLeads && (
                                    <p className="text-xs text-gray-500 mt-1">
                                        No leads assigned to you yet
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>
                    <div className="mt-6 flex justify-end space-x-3">
                        <button
                            onClick={() => setIsAddingTask(false)}
                            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleAddTask}
                            className="px-4 py-2 bg-[#022d38] text-white rounded-md hover:bg-[#043c4a]"
                        >
                            Add Task
                        </button>
                    </div>
                </div>
            )}

            {/* Filters and Search */}
            <div className="bg-white rounded-lg shadow p-4">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
                    <div className="flex flex-wrap gap-2">
                        <button
                            onClick={() => setFilter('all')}
                            className={`px-3 py-1.5 text-sm font-medium rounded-md ${
                                filter === 'all'
                                    ? 'bg-[#022d38] text-white'
                                    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                            }`}
                        >
                            All Tasks
                        </button>
                        <button
                            onClick={() => setFilter('pending')}
                            className={`px-3 py-1.5 text-sm font-medium rounded-md ${
                                filter === 'pending'
                                    ? 'bg-[#022d38] text-white'
                                    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                            }`}
                        >
                            Pending
                        </button>
                        <button
                            onClick={() => setFilter('completed')}
                            className={`px-3 py-1.5 text-sm font-medium rounded-md ${
                                filter === 'completed'
                                    ? 'bg-[#022d38] text-white'
                                    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                            }`}
                        >
                            Completed
                        </button>
                        <button
                            onClick={() => setFilter('high')}
                            className={`px-3 py-1.5 text-sm font-medium rounded-md ${
                                filter === 'high'
                                    ? 'bg-[#022d38] text-white'
                                    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                            }`}
                        >
                            High Priority
                        </button>
                        <button
                            onClick={() => setFilter('today')}
                            className={`px-3 py-1.5 text-sm font-medium rounded-md ${
                                filter === 'today'
                                    ? 'bg-[#022d38] text-white'
                                    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                            }`}
                        >
                            Due Today
                        </button>
                    </div>
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Search size={16} className="text-gray-400" />
                        </div>
                        <input
                            type="text"
                            placeholder="Search tasks..."
                            className="pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#022d38] focus:border-[#022d38]"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>
            </div>

            {/* Tasks List */}
            <div className="bg-white rounded-lg shadow overflow-hidden">
                {isLoading ? (
                    <div className="flex flex-col items-center justify-center min-h-[60vh] p-6">
                        <Loader className="w-12 h-12 text-blue-500 animate-spin mb-4" />
                        <h2 className="text-xl font-semibold text-gray-700">Loading Tasks...</h2>
                        <p className="text-gray-500 mt-2">Please wait while we fetch your tasks</p>
                    </div>
                ) : filteredTasks.length === 0 ? (
                    <div className="text-center py-12">
                        <CheckCircle size={48} className="mx-auto text-gray-300 mb-4" />
                        <h3 className="text-lg font-medium text-gray-900">No tasks found</h3>
                        <p className="mt-1 text-sm text-gray-500">
                            {searchTerm || filter !== 'all'
                                ? "Try adjusting your search or filter"
                                : "You're all caught up!"}
                        </p>
                    </div>
                ) : (
                    <ul className="divide-y divide-gray-200">
                        {filteredTasks.map((task) => (
                            <li key={task.id} className="p-4 hover:bg-gray-50">
                                <div className="flex items-start">
                                    <div className="flex-shrink-0 pt-0.5">
                                        <button
                                            onClick={() => toggleTaskCompletion(task.id)}
                                            className="p-1 rounded-full hover:bg-gray-100"
                                        >
                                            {task.completed ? (
                                                <CheckCircle size={20} className="text-green-500" />
                                            ) : (
                                                <Circle size={20} className="text-gray-300" />
                                            )}
                                        </button>
                                    </div>
                                    <div className="ml-3 flex-1">
                                        <div className="flex items-center justify-between">
                                            <p className={`text-sm font-medium ${task.completed ? 'text-gray-400 line-through' : 'text-gray-900'}`}>
                                                {task.description}
                                            </p>
                                            <div className="flex items-center">
                                                <span className={`text-xs px-2 py-1 rounded-full ${getPriorityBadgeColor(task.priority)}`}>
                                                    {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
                                                </span>
                                                <button
                                                    onClick={() => deleteTask(task.id)}
                                                    className="ml-2 p-1 rounded-full hover:bg-red-100"
                                                >
                                                    <Trash2 size={16} className="text-red-500" />
                                                </button>
                                            </div>
                                        </div>
                                        <div className="mt-1 flex items-center text-xs text-gray-500">
                                            <Calendar size={12} className="mr-1" />
                                            <span>Due: {task.dueDate}</span>
                                            {task.relatedLeadId && (
                                                <div className="ml-4 flex items-center">
                                                    <User size={12} className="mr-1" />
                                                    <Link
                                                        to={`/employee-panel/leads/${task.relatedLeadId}`}
                                                        className="text-blue-500 hover:underline"
                                                    >
                                                        {task.relatedLeadName} ({task.relatedLeadCompany})
                                                    </Link>
                                                </div>
                                            )}
                                        </div>
                                        {task.relatedLeadId && (
                                            <div className="mt-2 flex space-x-2">
                                                <Link
                                                    to={`/employee-panel/leads/${task.relatedLeadId}/contact/phone`}
                                                    className="inline-flex items-center px-2 py-1 text-xs font-medium rounded-md bg-blue-50 text-blue-700 hover:bg-blue-100"
                                                >
                                                    <Phone size={12} className="mr-1" />
                                                    Call
                                                </Link>
                                                <Link
                                                    to={`/employee-panel/leads/${task.relatedLeadId}/contact/email`}
                                                    className="inline-flex items-center px-2 py-1 text-xs font-medium rounded-md bg-green-50 text-green-700 hover:bg-green-100"
                                                >
                                                    <Mail size={12} className="mr-1" />
                                                    Email
                                                </Link>
                                                <Link
                                                    to={`/employee-panel/leads/${task.relatedLeadId}/contact/message`}
                                                    className="inline-flex items-center px-2 py-1 text-xs font-medium rounded-md bg-orange-50 text-orange-700 hover:bg-orange-100"
                                                >
                                                    <MessageSquare size={12} className="mr-1" />
                                                    Message
                                                </Link>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </div>
    );
}
