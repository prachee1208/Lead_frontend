import { useState, useEffect } from 'react';
import {
    BarChart3, Users, UserPlus, PhoneCall,
    Calendar, Clock, List, CheckCircle,
    ArrowUp, ArrowDown, Phone, Mail, MessageSquare,
    AlertCircle, Loader, RefreshCw, Database,
    PieChart, TrendingUp
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { dataFetcher } from '../../services/dataFetcher';
import { getConnectionStatus, enhancedAPI } from '../../services/enhancedAPI';
import { toast } from 'react-toastify';
import ConnectionMonitor from '../common/ConnectionMonitor';
import LeadStatusChart from './LeadStatusChart';

export default function DashboardHome() {
    // State for leads data
    const [recentLeads, setRecentLeads] = useState([]);
    const [isLoadingLeads, setIsLoadingLeads] = useState(true);
    const [error, setError] = useState(null);

    // Stats state
    const [stats, setStats] = useState([
        { id: 1, name: 'Assigned Leads', value: '0', icon: <UserPlus className="text-blue-500" />, change: '+0', changeType: 'increase' },
        { id: 2, name: 'Pending Follow-ups', value: '0', icon: <Calendar className="text-orange-500" />, change: '0', changeType: 'neutral' },
        { id: 3, name: 'Converted Leads', value: '0', icon: <CheckCircle className="text-green-500" />, change: '+0', changeType: 'increase' },
        { id: 4, name: 'Today\'s Tasks', value: '0', icon: <List className="text-purple-500" />, change: '+0', changeType: 'increase' },
    ]);

    // Fetch leads assigned to the current employee using enhanced data fetcher
    const fetchLeads = async () => {
        setIsLoadingLeads(true);
        setError(null);

        try {
            // Get the current user ID from localStorage
            const userId = localStorage.getItem('userId');

            if (!userId) {
                console.warn('User ID not found in localStorage');
                setIsLoadingLeads(false);
                return;
            }

            // Use the enhanced data fetcher with caching and offline support
            const response = await dataFetcher.fetchEmployeeLeads(userId, {}, {
                // Force refresh data from server
                forceRefresh: true,
                // Provide offline fallback data
                offlineData: { data: { data: [] } },
                // Handle errors
                onError: (err) => {
                    console.error('Error in data fetcher:', err);
                    setError('Failed to load leads. Please try again.');
                    toast.error('Failed to load leads: ' + (err.message || 'Unknown error'));
                }
            });

            console.log('Employee leads response:', response);

            if (response && response.data && response.data.data) {
                // Transform the API response to match our component's data structure
                const formattedLeads = response.data.data.map(lead => ({
                    id: lead._id,
                    name: lead.name,
                    company: lead.company || 'N/A',
                    email: lead.email || 'N/A',
                    phone: lead.phone || 'N/A',
                    status: lead.status || 'New',
                    source: lead.source || 'N/A',
                    assignedDate: new Date(lead.updatedAt).toLocaleDateString()
                }));

                // Update stats based on real data
                const totalLeads = formattedLeads.length;
                const convertedLeads = formattedLeads.filter(lead => lead.status === 'Converted').length;

                // Update stats with real data
                setStats(prevStats => {
                    const newStats = [...prevStats];
                    newStats[0] = { ...newStats[0], value: totalLeads.toString(), change: `+${totalLeads}`, changeType: 'increase' };
                    newStats[2] = { ...newStats[2], value: convertedLeads.toString(), change: `+${convertedLeads}`, changeType: 'increase' };
                    return newStats;
                });

                // Take only the 3 most recent leads for the dashboard
                // Sort by assignedDate (most recent first)
                const sortedLeads = [...formattedLeads].sort((a, b) =>
                    new Date(b.assignedDate) - new Date(a.assignedDate)
                );
                setRecentLeads(sortedLeads.slice(0, 3));
            } else {
                // If no data is returned, use empty array
                setRecentLeads([]);
                console.log('No leads data returned from API');
            }
        } catch (err) {
            console.error('Error fetching leads:', err);
            setError('Failed to load leads. Please try again.');
            toast.error('Failed to load leads: ' + (err.message || 'Unknown error'));
        } finally {
            setIsLoadingLeads(false);
        }
    };

    // Load data on component mount
    useEffect(() => {
        fetchLeads();
        fetchFollowUps();
        fetchTasks();
    }, []);

    // State for follow-ups
    const [followUps, setFollowUps] = useState([]);
    const [isLoadingFollowUps, setIsLoadingFollowUps] = useState(true);
    const [followUpError, setFollowUpError] = useState(null);

    // Fetch follow-ups for the current employee
    const fetchFollowUps = async () => {
        setIsLoadingFollowUps(true);
        setFollowUpError(null);

        try {
            // Get the current user ID from localStorage
            const userId = localStorage.getItem('userId');

            if (!userId) {
                console.warn('User ID not found in localStorage');
                setIsLoadingFollowUps(false);
                return;
            }

            // Use the enhanced data fetcher to get leads with follow-ups
            const response = await dataFetcher.fetch(
                `followups:employee:${userId}`,
                () => enhancedAPI.leads.getByEmployee(userId, { hasFollowUp: true }),
                {
                    // Provide offline fallback data
                    offlineData: { data: { data: [] } },
                    // Handle errors
                    onError: (err) => {
                        console.error('Error fetching follow-ups:', err);
                        setFollowUpError('Failed to load follow-ups. Please try again.');
                    }
                }
            );

            if (response && response.data && response.data.data) {
                // Transform the API response to match our component's data structure
                const formattedFollowUps = response.data.data
                    .filter(lead => lead.followUp && lead.followUp.nextFollowUpDate) // Only include leads with follow-ups
                    .map(lead => ({
                        id: lead._id,
                        leadId: lead._id,
                        leadName: lead.name,
                        company: lead.company || 'N/A',
                        type: lead.followUp.type || 'call',
                        dueDate: new Date(lead.followUp.nextFollowUpDate).toLocaleDateString(),
                        dueTime: new Date(lead.followUp.nextFollowUpDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                        notes: lead.followUp.notes
                    }));

                // Sort by due date (ascending)
                const sortedFollowUps = formattedFollowUps.sort((a, b) =>
                    new Date(a.dueDate + ' ' + a.dueTime) - new Date(b.dueDate + ' ' + b.dueTime)
                );

                // Take only the 3 most recent follow-ups for the dashboard
                setFollowUps(sortedFollowUps.slice(0, 3));
            } else {
                setFollowUps([]);
            }
        } catch (err) {
            console.error('Error fetching follow-ups:', err);
            setFollowUpError('Failed to load follow-ups. Please try again.');
        } finally {
            setIsLoadingFollowUps(false);
        }
    };

    // State for tasks
    const [tasks, setTasks] = useState([]);
    const [isLoadingTasks, setIsLoadingTasks] = useState(true);
    const [taskError, setTaskError] = useState(null);

    // Fetch tasks for the current employee
    const fetchTasks = async () => {
        setIsLoadingTasks(true);
        setTaskError(null);

        try {
            // Get the current user ID from localStorage
            const userId = localStorage.getItem('userId');

            if (!userId) {
                console.warn('User ID not found in localStorage');
                setIsLoadingTasks(false);
                return;
            }

            // Use the enhanced data fetcher to get tasks
            const response = await dataFetcher.fetch(
                `tasks:employee:${userId}`,
                () => enhancedAPI.reminders.getAll(),
                {
                    // Provide offline fallback data
                    offlineData: { data: [] },
                    // Handle errors
                    onError: (err) => {
                        console.error('Error fetching tasks:', err);
                        setTaskError('Failed to load tasks. Please try again.');
                    }
                }
            );

            if (response && response.data) {
                // Transform the API response to match our component's data structure
                const formattedTasks = response.data.map(task => ({
                    id: task._id,
                    task: task.title || 'Untitled Task',
                    completed: task.completed || false,
                    priority: task.priority || 'medium',
                    dueDate: task.date ? new Date(task.date).toLocaleDateString() : 'No due date'
                }));

                // Filter for today's tasks
                const today = new Date().toLocaleDateString();
                const todaysTasks = formattedTasks.filter(task =>
                    task.dueDate === today || task.dueDate === 'No due date'
                );

                // Sort by priority (high, medium, low) and completion status
                const sortedTasks = todaysTasks.sort((a, b) => {
                    // First sort by completion status
                    if (a.completed !== b.completed) {
                        return a.completed ? 1 : -1;
                    }

                    // Then sort by priority
                    const priorityOrder = { high: 1, medium: 2, low: 3 };
                    return priorityOrder[a.priority] - priorityOrder[b.priority];
                });

                setTasks(sortedTasks);

                // Update stats with task count
                setStats(prevStats => {
                    const newStats = [...prevStats];
                    newStats[3] = {
                        ...newStats[3],
                        value: todaysTasks.length.toString(),
                        change: `+${todaysTasks.length}`,
                        changeType: 'increase'
                    };
                    return newStats;
                });
            } else {
                setTasks([]);
            }
        } catch (err) {
            console.error('Error fetching tasks:', err);
            setTaskError('Failed to load tasks. Please try again.');
        } finally {
            setIsLoadingTasks(false);
        }
    };

    // Toggle task completion status
    const toggleTaskCompletion = async (taskId) => {
        try {
            // Optimistically update the UI
            setTasks(tasks.map(task =>
                task.id === taskId ? { ...task, completed: !task.completed } : task
            ));

            // Update the task in the database
            await enhancedAPI.reminders.toggleComplete(taskId);
        } catch (err) {
            console.error('Error toggling task completion:', err);
            toast.error('Failed to update task. Please try again.');

            // Revert the optimistic update
            setTasks(tasks.map(task =>
                task.id === taskId ? { ...task, completed: !task.completed } : task
            ));
        }
    };

    const getStatusColor = (status) => {
        switch(status) {
            case 'New': return 'bg-indigo-100 text-indigo-800 border border-indigo-200';
            case 'Contacted': return 'bg-amber-100 text-amber-800 border border-amber-200';
            case 'Converted': return 'bg-emerald-100 text-emerald-800 border border-emerald-200';
            case 'Lost': return 'bg-red-100 text-red-800 border border-red-200';
            default: return 'bg-slate-100 text-slate-800 border border-slate-200';
        }
    };

    const getFollowUpTypeIcon = (type) => {
        switch(type) {
            case 'call': return <Phone size={16} className="text-blue-500" />;
            case 'email': return <Mail size={16} className="text-green-500" />;
            case 'meeting': return <Users size={16} className="text-purple-500" />;
            case 'message': return <MessageSquare size={16} className="text-orange-500" />;
            default: return <Calendar size={16} className="text-gray-500" />;
        }
    };

    const getPriorityColor = (priority) => {
        switch(priority) {
            case 'high': return 'text-red-500';
            case 'medium': return 'text-yellow-500';
            case 'low': return 'text-blue-500';
            default: return 'text-gray-500';
        }
    };

    return (
        <div className="space-y-6">
            {/* Connection status monitor */}
            <ConnectionMonitor />

            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-semibold text-gray-800">Employee Dashboard</h1>
                <div className="text-sm text-gray-500">
                    <Clock size={16} className="inline mr-1" />
                    {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map((stat) => (
                    <div key={stat.id} className="bg-white rounded-lg shadow-md border border-gray-100 p-4 hover:shadow-lg transition-shadow duration-300">
                        <div className="flex items-center justify-between mb-3">
                            <h3 className="text-gray-600 text-sm font-medium">{stat.name}</h3>
                            <div className={`p-2 rounded-md ${
                                stat.id === 1 ? 'bg-indigo-100' :
                                stat.id === 2 ? 'bg-amber-100' :
                                stat.id === 3 ? 'bg-emerald-100' :
                                'bg-purple-100'
                            }`}>
                                {stat.icon}
                            </div>
                        </div>
                        <div className="flex items-end justify-between">
                            <div>
                                <p className="text-2xl font-bold text-gray-800">{stat.value}</p>
                                <p className={`text-xs ${stat.changeType === 'increase' ? 'text-emerald-500' : 'text-red-500'} font-medium`}>
                                    {stat.changeType === 'increase' ? <ArrowUp size={12} className="inline" /> : <ArrowDown size={12} className="inline" />}
                                    {' '}{stat.change} from yesterday
                                </p>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Recent Leads */}
                <div className="bg-white rounded-lg shadow">
                    <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
                        <h2 className="text-lg font-semibold text-gray-800">My Recently Assigned Leads</h2>
                        <div className="flex items-center space-x-2">
                            <Link to="/employee-panel/leads" className="text-sm text-blue-500 hover:text-blue-700">View all</Link>
                            {!isLoadingLeads && (
                                <button
                                    onClick={fetchLeads}
                                    className="p-1 rounded-md hover:bg-gray-100"
                                    title="Refresh leads"
                                >
                                    <RefreshCw size={16} className="text-gray-500" />
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Error Message */}
                    {error && (
                        <div className="mx-6 mt-4 bg-red-100 border border-red-200 text-red-800 px-4 py-3 rounded-md flex items-center">
                            <AlertCircle size={20} className="mr-2" />
                            <span>{error}</span>
                            <button
                                onClick={fetchLeads}
                                className="ml-auto text-red-800 hover:text-red-900"
                            >
                                <RefreshCw size={16} />
                            </button>
                        </div>
                    )}

                    {/* Loading State */}
                    {isLoadingLeads ? (
                        <div className="flex flex-col items-center justify-center p-6 h-40">
                            <Loader className="w-8 h-8 text-blue-500 animate-spin mb-2" />
                            <p className="text-sm text-gray-500">Loading your leads...</p>
                        </div>
                    ) : (
                        <div className="p-6">
                            {recentLeads.length === 0 ? (
                                <div className="text-center py-8">
                                    <AlertCircle size={32} className="mx-auto text-gray-300 mb-2" />
                                    <p className="text-sm text-gray-500">You don't have any leads assigned to you yet</p>
                                    <p className="text-xs text-gray-500 mt-2">Only leads assigned to you by managers will appear here</p>
                                    <p className="text-xs text-gray-500 mt-1">Check back later or contact your manager for lead assignments</p>
                                </div>
                            ) : (
                                <ul className="divide-y divide-gray-200">
                                    {recentLeads.map((lead) => (
                                        <li key={lead.id} className="py-3">
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <p className="text-sm font-medium text-gray-800">{lead.name}</p>
                                                    <p className="text-xs text-gray-500">{lead.company}</p>
                                                </div>
                                                <div className="flex items-center space-x-3">
                                                    <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(lead.status)}`}>
                                                        {lead.status}
                                                    </span>
                                                    <Link to={`/employee-panel/leads/${lead.id}`} className="text-sm text-blue-500 hover:text-blue-700">
                                                        View
                                                    </Link>
                                                </div>
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>
                    )}
                </div>

                {/* Upcoming Follow-ups */}
                <div className="bg-white rounded-lg shadow">
                    <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
                        <h2 className="text-lg font-semibold text-gray-800">Upcoming Follow-ups</h2>
                        <div className="flex items-center space-x-2">
                            <Link to="/employee-panel/follow-ups" className="text-sm text-blue-500 hover:text-blue-700">View all</Link>
                            {!isLoadingFollowUps && (
                                <button
                                    onClick={fetchFollowUps}
                                    className="p-1 rounded-md hover:bg-gray-100"
                                    title="Refresh follow-ups"
                                >
                                    <RefreshCw size={16} className="text-gray-500" />
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Error Message */}
                    {followUpError && (
                        <div className="mx-6 mt-4 bg-red-100 border border-red-200 text-red-800 px-4 py-3 rounded-md flex items-center">
                            <AlertCircle size={20} className="mr-2" />
                            <span>{followUpError}</span>
                            <button
                                onClick={fetchFollowUps}
                                className="ml-auto text-red-800 hover:text-red-900"
                            >
                                <RefreshCw size={16} />
                            </button>
                        </div>
                    )}

                    {/* Loading State */}
                    {isLoadingFollowUps ? (
                        <div className="flex flex-col items-center justify-center p-6 h-40">
                            <Loader className="w-8 h-8 text-blue-500 animate-spin mb-2" />
                            <p className="text-sm text-gray-500">Loading follow-ups...</p>
                        </div>
                    ) : (
                        <div className="p-6">
                            {followUps.length === 0 ? (
                                <div className="text-center py-8">
                                    <Calendar size={32} className="mx-auto text-gray-300 mb-2" />
                                    <p className="text-sm text-gray-500">No upcoming follow-ups scheduled</p>
                                </div>
                            ) : (
                                <ul className="divide-y divide-gray-200">
                                    {followUps.map((followUp) => (
                                        <li key={followUp.id} className="py-3">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center">
                                                    <div className="mr-3">
                                                        {getFollowUpTypeIcon(followUp.type)}
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-medium text-gray-800">{followUp.leadName}</p>
                                                        <p className="text-xs text-gray-500">{followUp.company}</p>
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <p className="text-xs font-medium text-gray-800">{followUp.dueDate}</p>
                                                    <p className="text-xs text-gray-500">{followUp.dueTime}</p>
                                                </div>
                                            </div>
                                            {followUp.notes && (
                                                <div className="mt-2 ml-8">
                                                    <p className="text-xs text-gray-600 italic line-clamp-2">{followUp.notes}</p>
                                                </div>
                                            )}
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* Lead Status Chart */}
            <div className="mt-6 mb-6">
                <LeadStatusChart userId={localStorage.getItem('userId')} />
            </div>

            {/* Today's Tasks */}
            <div className="bg-white rounded-lg shadow">
                <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
                    <h2 className="text-lg font-semibold text-gray-800">Today's Tasks</h2>
                    <div className="flex items-center space-x-2">
                        <Link to="/employee-panel/tasks" className="text-sm text-blue-500 hover:text-blue-700">View all</Link>
                        {!isLoadingTasks && (
                            <button
                                onClick={fetchTasks}
                                className="p-1 rounded-md hover:bg-gray-100"
                                title="Refresh tasks"
                            >
                                <RefreshCw size={16} className="text-gray-500" />
                            </button>
                        )}
                    </div>
                </div>

                {/* Error Message */}
                {taskError && (
                    <div className="mx-6 mt-4 bg-red-100 border border-red-200 text-red-800 px-4 py-3 rounded-md flex items-center">
                        <AlertCircle size={20} className="mr-2" />
                        <span>{taskError}</span>
                        <button
                            onClick={fetchTasks}
                            className="ml-auto text-red-800 hover:text-red-900"
                        >
                            <RefreshCw size={16} />
                        </button>
                    </div>
                )}

                {/* Loading State */}
                {isLoadingTasks ? (
                    <div className="flex flex-col items-center justify-center p-6 h-40">
                        <Loader className="w-8 h-8 text-blue-500 animate-spin mb-2" />
                        <p className="text-sm text-gray-500">Loading tasks...</p>
                    </div>
                ) : (
                    <div className="p-6">
                        {tasks.length === 0 ? (
                            <div className="text-center py-8">
                                <List size={32} className="mx-auto text-gray-300 mb-2" />
                                <p className="text-sm text-gray-500">No tasks for today</p>
                            </div>
                        ) : (
                            <ul className="space-y-3">
                                {tasks.map((task) => (
                                    <li key={task.id} className="flex items-start py-2">
                                        <div className="flex-shrink-0 pt-1">
                                            <button
                                                onClick={() => toggleTaskCompletion(task.id)}
                                                className={`w-5 h-5 rounded-full border ${
                                                    task.completed
                                                        ? 'bg-green-500 border-green-500 text-white'
                                                        : 'border-gray-300'
                                                } flex items-center justify-center`}
                                                aria-label={task.completed ? "Mark as incomplete" : "Mark as complete"}
                                            >
                                                {task.completed && <CheckCircle size={16} />}
                                            </button>
                                        </div>
                                        <div className="ml-3 flex-1">
                                            <p className={`text-sm ${task.completed ? 'line-through text-gray-500' : 'text-gray-800'}`}>
                                                {task.task}
                                            </p>
                                            <div className="flex items-center mt-1 space-x-2">
                                                <span className={`inline-block px-2 py-0.5 text-xs rounded-full ${getPriorityColor(task.priority)}`}>
                                                    {task.priority}
                                                </span>
                                                {task.dueDate && task.dueDate !== 'No due date' && (
                                                    <span className="text-xs text-gray-500 flex items-center">
                                                        <Calendar size={12} className="mr-1" />
                                                        {task.dueDate}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
