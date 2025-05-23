import { useState, useEffect } from 'react';
import {
    Users, UserPlus,
    Calendar, Clock, List, CheckCircle,
    ArrowUp, ArrowDown, Phone, Mail, MessageSquare,
    AlertCircle, Loader, RefreshCw
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { dataFetcher } from '../../services/dataFetcher';
import { enhancedAPI } from '../../services/enhancedAPI';
import { toast } from 'react-toastify';
import ConnectionMonitor from '../common/ConnectionMonitor';
import LeadStatusChart from './LeadStatusChart';
import '../../../src/utils/dashboardUpdater';

export default function DashboardHome() {
    // State for leads data
    const [recentLeads, setRecentLeads] = useState([]);
    const [isLoadingLeads, setIsLoadingLeads] = useState(true);
    const [error, setError] = useState(null);

    // Last updated timestamp
    const [lastUpdated, setLastUpdated] = useState(new Date());
    const [isUpdating, setIsUpdating] = useState(false);

    // Stats state
    const [stats, setStats] = useState([
        { id: 1, name: 'Assigned Leads', value: '0', icon: <UserPlus className="text-blue-500" />, change: '+0', changeType: 'increase' },
        { id: 2, name: 'Pending Follow-ups', value: '0', icon: <Calendar className="text-orange-500" />, change: '0', changeType: 'neutral' },
        { id: 3, name: 'Converted Leads', value: '0', icon: <CheckCircle className="text-green-500" />, change: '+0', changeType: 'increase' },
        { id: 4, name: 'Today\'s Tasks', value: '0', icon: <List className="text-purple-500" />, change: '+0', changeType: 'increase' },
    ]);

    // Fetch leads assigned to the current employee using enhanced data fetcher
    const fetchLeads = async (options = {}) => {
        const { silent = false, isPartOfBatchUpdate = false, forceRefresh = false } = options;

        // Only show loading indicator if this is not a silent update or part of a batch update
        if (!silent && !isPartOfBatchUpdate && !forceRefresh) {
            setIsLoadingLeads(true);
        }

        // Only clear errors if this is not a silent update
        if (!silent) {
            setError(null);
        }

        try {
            // Get the current user ID from localStorage
            const userId = localStorage.getItem('userId');

            if (!userId) {
                console.warn('User ID not found in localStorage');
                setIsLoadingLeads(false);
                return;
            }

            console.log(`Fetching leads for employee ID: ${userId} (silent: ${silent}, forceRefresh: ${forceRefresh})`);

            // Use the enhanced data fetcher with caching and offline support
            const response = await dataFetcher.fetchEmployeeLeads(userId, {}, {
                // Force refresh data from server if specified
                forceRefresh: forceRefresh,
                // Provide offline fallback data
                offlineData: { data: { data: [] } },
                // Handle errors
                onError: (err) => {
                    console.error('Error in data fetcher:', err);
                    // Only show error toast if this is not a silent update
                    if (!silent) {
                        setError('Failed to load leads. Please try again.');
                        toast.error('Failed to load leads: ' + (err.message || 'Unknown error'));
                    }
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
                    assignedDate: new Date(lead.updatedAt).toLocaleDateString(),
                    updatedAt: lead.updatedAt || lead.createdAt, // Use for sorting
                    createdAt: lead.createdAt // Backup for sorting
                }));

                // Update stats based on real data
                const totalLeads = formattedLeads.length;
                const convertedLeads = formattedLeads.filter(lead => lead.status === 'Converted').length;
                const contactedLeads = formattedLeads.filter(lead => lead.status === 'Contacted').length;
                const qualifiedLeads = formattedLeads.filter(lead => lead.status === 'Qualified').length;

                // Calculate change from previous values
                const prevTotalLeads = parseInt(stats[0].value) || 0;
                const prevConvertedLeads = parseInt(stats[2].value) || 0;

                const totalLeadsChange = totalLeads - prevTotalLeads;
                const convertedLeadsChange = convertedLeads - prevConvertedLeads;

                // Update stats with real data
                setStats(prevStats => {
                    const newStats = [...prevStats];

                    // Update Total Leads card
                    newStats[0] = {
                        ...newStats[0],
                        value: totalLeads.toString(),
                        change: totalLeadsChange >= 0 ? `+${totalLeadsChange}` : `${totalLeadsChange}`,
                        changeType: totalLeadsChange > 0 ? 'increase' : (totalLeadsChange < 0 ? 'decrease' : 'neutral')
                    };

                    // Update Converted Leads card
                    newStats[2] = {
                        ...newStats[2],
                        value: convertedLeads.toString(),
                        change: convertedLeadsChange >= 0 ? `+${convertedLeadsChange}` : `${convertedLeadsChange}`,
                        changeType: convertedLeadsChange > 0 ? 'increase' : (convertedLeadsChange < 0 ? 'decrease' : 'neutral')
                    };

                    return newStats;
                });

                // Log stats update for debugging
                console.log('Dashboard stats updated:', {
                    totalLeads,
                    convertedLeads,
                    contactedLeads,
                    qualifiedLeads
                });

                // Take only the 3 most recent leads for the dashboard
                // Sort by updatedAt or createdAt (most recent first)
                const sortedLeads = [...formattedLeads].sort((a, b) => {
                    // First try to sort by updatedAt
                    if (a.updatedAt && b.updatedAt) {
                        return new Date(b.updatedAt) - new Date(a.updatedAt);
                    }
                    // Fall back to createdAt if updatedAt is not available
                    else if (a.createdAt && b.createdAt) {
                        return new Date(b.createdAt) - new Date(a.createdAt);
                    }
                    // Last resort: use assignedDate string (less accurate)
                    return new Date(b.assignedDate) - new Date(a.assignedDate);
                });

                console.log('Recent leads before filtering:', sortedLeads.map(lead => ({
                    id: lead.id,
                    name: lead.name,
                    updatedAt: lead.updatedAt,
                    assignedDate: lead.assignedDate
                })));

                // Take the 5 most recent leads instead of just 3
                setRecentLeads(sortedLeads.slice(0, 5));

                // Update last updated timestamp if this was a manual refresh
                if (options.forceRefresh && !options.isPartOfBatchUpdate) {
                    setLastUpdated(new Date());
                }
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

    // Function to update all data
    const updateAllData = async () => {
        setIsUpdating(true);

        try {
            // Fetch all data in parallel
            await Promise.all([
                fetchLeads({ forceRefresh: true, isPartOfBatchUpdate: true }),
                fetchFollowUps({ forceRefresh: true, isPartOfBatchUpdate: true }),
                fetchTasks({ forceRefresh: true, isPartOfBatchUpdate: true })
            ]);

            // Update the last updated timestamp
            setLastUpdated(new Date());
            console.log('All data updated successfully at', new Date().toLocaleTimeString());
        } catch (error) {
            console.error('Error updating data:', error);
        } finally {
            setIsUpdating(false);
        }
    };

    // Load data on component mount and set up real-time updates
    useEffect(() => {
        // Initial data fetch with force refresh to ensure we get the latest data
        console.log('Initial data fetch for dashboard');
        fetchLeads({ forceRefresh: true });
        fetchFollowUps({ forceRefresh: true });
        fetchTasks({ forceRefresh: true });

        // Clear cache before fetching to ensure fresh data
        dataFetcher.invalidateCache('leads:employee');
        dataFetcher.invalidateCache('followUps');
        dataFetcher.invalidateCache('tasks');

        // Set up interval for real-time updates (every 30 seconds)
        const updateInterval = setInterval(() => {
            console.log('Performing scheduled real-time data update');
            updateAllData();
        }, 30000); // 30 seconds for regular updates

        // Set up a more frequent check for new leads (every 10 seconds)
        const newLeadsInterval = setInterval(() => {
            console.log('Checking for new leads');
            fetchLeads({ forceRefresh: true, silent: true });
        }, 10000); // 10 seconds for lead checks

        // Clean up intervals on component unmount
        return () => {
            clearInterval(updateInterval);
            clearInterval(newLeadsInterval);
            console.log('Cleared real-time update intervals');
        };
    }, []);

    // Set up a listener for database changes (simulated with localStorage events)
    useEffect(() => {
        // Function to handle storage events (used for cross-tab communication)
        const handleStorageChange = (event) => {
            // Get the current user ID to check if updates are relevant
            const currentUserId = localStorage.getItem('userId');

            if (event.key === 'lead_assigned') {
                try {
                    const data = JSON.parse(event.newValue);
                    console.log('Lead assignment detected:', data);

                    // Check if this lead was assigned to the current user
                    if (data.employeeId === currentUserId) {
                        console.log('New lead assigned to current user, refreshing dashboard data');

                        // Show notification to user
                        toast.success(`New lead assigned: ${data.leadName || 'Unknown lead'}`, {
                            position: "top-right",
                            autoClose: 5000,
                            hideProgressBar: false,
                            closeOnClick: true,
                            pauseOnHover: true,
                            draggable: true,
                        });

                        // Force refresh leads data immediately
                        fetchLeads({ forceRefresh: true });

                        // Update stats and other data
                        updateAllData();
                    }
                } catch (err) {
                    console.error('Error processing lead assignment notification:', err);
                }
            } else if (event.key === 'lead_updated') {
                try {
                    const data = JSON.parse(event.newValue);
                    console.log('Lead update detected:', data);

                    // Check if this lead belongs to the current user
                    if (data.employeeId === currentUserId) {
                        console.log('Lead update for current user, refreshing dashboard data');
                        fetchLeads({ forceRefresh: true });
                    }
                } catch (err) {
                    console.error('Error processing lead update notification:', err);
                }
            } else if (event.key === 'lead_status_changed') {
                try {
                    const data = JSON.parse(event.newValue);
                    console.log('Lead status change detected:', data);

                    // Check if this lead belongs to the current user
                    if (data.employeeId === currentUserId) {
                        console.log('Lead status change for current user, refreshing dashboard data');

                        // Show notification for important status changes
                        if (data.newStatus === 'Converted' || data.newStatus === 'Lost') {
                            toast.info(`Lead status changed: ${data.leadName} is now ${data.newStatus}`, {
                                position: "top-right",
                                autoClose: 5000,
                            });
                        }

                        // Refresh leads and update stats
                        fetchLeads({ forceRefresh: true });
                    }
                } catch (err) {
                    console.error('Error processing lead status change notification:', err);
                }
            } else if (event.key === 'followup_changed') {
                try {
                    const data = JSON.parse(event.newValue);
                    console.log('Follow-up change detected:', data);

                    // Only refresh follow-ups when a follow-up is changed for this user
                    if (data.employeeId === currentUserId) {
                        console.log('Follow-up change for current user, refreshing follow-ups data');
                        fetchFollowUps({ forceRefresh: true });
                    }
                } catch (err) {
                    console.error('Error processing follow-up change notification:', err);
                }
            } else if (event.key === 'task_changed') {
                try {
                    const data = JSON.parse(event.newValue);
                    console.log('Task change detected:', data);

                    // Only refresh tasks when a task is changed for this user
                    if (data.employeeId === currentUserId) {
                        console.log('Task change for current user, refreshing tasks data');
                        fetchTasks({ forceRefresh: true });
                    }
                } catch (err) {
                    console.error('Error processing task change notification:', err);
                }
            }
        };

        // Listen for storage events
        window.addEventListener('storage', handleStorageChange);

        // Also check for direct localStorage changes (for same-tab updates)
        const checkLocalStorage = () => {
            const leadAssigned = localStorage.getItem('lead_assigned');
            if (leadAssigned) {
                try {
                    const data = JSON.parse(leadAssigned);
                    console.log('Lead assignment detected in same tab', data);

                    // Show notification to user
                    toast.success(`New lead assigned: ${data.leadName || 'Unknown lead'}`, {
                        position: "top-right",
                        autoClose: 5000,
                        hideProgressBar: false,
                        closeOnClick: true,
                        pauseOnHover: true,
                        draggable: true,
                    });

                    // Force refresh all data
                    updateAllData();
                } catch (err) {
                    console.error('Error processing lead assignment notification:', err);
                }
            }
        };

        // Check for direct changes every 5 seconds
        const directCheckInterval = setInterval(checkLocalStorage, 5000);

        // Clean up event listener and interval
        return () => {
            window.removeEventListener('storage', handleStorageChange);
            clearInterval(directCheckInterval);
        };
    }, []);

    // State for follow-ups
    const [followUps, setFollowUps] = useState([]);
    const [isLoadingFollowUps, setIsLoadingFollowUps] = useState(true);
    const [followUpError, setFollowUpError] = useState(null);

    // Fetch follow-ups for the current employee
    const fetchFollowUps = async (options = {}) => {
        const { silent = false, isPartOfBatchUpdate = false, forceRefresh = false } = options;

        // Only show loading indicator if this is not a silent update or part of a batch update
        if (!silent && !isPartOfBatchUpdate && !forceRefresh) {
            setIsLoadingFollowUps(true);
        }

        // Only clear errors if this is not a silent update
        if (!silent) {
            setFollowUpError(null);
        }

        try {
            // Get the current user ID from localStorage
            const userId = localStorage.getItem('userId');

            if (!userId) {
                console.warn('User ID not found in localStorage');
                setIsLoadingFollowUps(false);
                return;
            }

            console.log(`Fetching follow-ups for employee ID: ${userId} (silent: ${silent}, forceRefresh: ${forceRefresh})`);

            // Use the direct API call to get follow-ups for the employee
            const response = await enhancedAPI.followUps.getByEmployee(userId);
            console.log('Follow-ups response:', response);

            if (response && response.data) {
                // Transform the API response to match our component's data structure
                const formattedFollowUps = response.data.map(followUp => ({
                    id: followUp._id,
                    leadId: followUp.leadId,
                    leadName: followUp.leadName || 'Unknown Lead',
                    company: followUp.company || 'N/A',
                    type: followUp.type || 'call',
                    dueDate: new Date(followUp.dueDate).toLocaleDateString(),
                    dueTime: new Date(followUp.dueDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                    notes: followUp.notes || '',
                    completed: followUp.completed || false
                }));

                // Filter out completed follow-ups
                const pendingFollowUps = formattedFollowUps.filter(followUp => !followUp.completed);

                // Sort by due date (ascending)
                const sortedFollowUps = pendingFollowUps.sort((a, b) =>
                    new Date(a.dueDate + ' ' + a.dueTime) - new Date(b.dueDate + ' ' + b.dueTime)
                );

                // Take only the 3 most recent follow-ups for the dashboard
                setFollowUps(sortedFollowUps.slice(0, 3));

                // Calculate change from previous value
                const prevFollowUpsCount = parseInt(stats[1].value) || 0;
                const followUpsChange = pendingFollowUps.length - prevFollowUpsCount;

                // Update stats with follow-up count
                setStats(prevStats => {
                    const newStats = [...prevStats];
                    newStats[1] = {
                        ...newStats[1],
                        value: pendingFollowUps.length.toString(),
                        change: followUpsChange >= 0 ? `+${followUpsChange}` : `${followUpsChange}`,
                        changeType: followUpsChange > 0 ? 'increase' : (followUpsChange < 0 ? 'decrease' : 'neutral')
                    };
                    return newStats;
                });

                // Log follow-ups update for debugging
                console.log('Follow-ups updated:', {
                    total: pendingFollowUps.length,
                    change: followUpsChange,
                    upcoming: sortedFollowUps.slice(0, 3).map(f => f.leadName)
                });
            } else {
                setFollowUps([]);

                // Update stats with zero follow-ups
                setStats(prevStats => {
                    const newStats = [...prevStats];
                    newStats[1] = {
                        ...newStats[1],
                        value: '0',
                        change: '0',
                        changeType: 'neutral'
                    };
                    return newStats;
                });
            }
        } catch (err) {
            console.error('Error fetching follow-ups:', err);

            // Only show errors if this is not a silent update
            if (!silent) {
                setFollowUpError('Failed to load follow-ups. Please try again.');
                toast.error('Failed to load follow-ups: ' + (err.message || 'Unknown error'));
            }
        } finally {
            setIsLoadingFollowUps(false);
        }
    };

    // State for tasks
    const [tasks, setTasks] = useState([]);
    const [isLoadingTasks, setIsLoadingTasks] = useState(true);
    const [taskError, setTaskError] = useState(null);

    // Fetch tasks for the current employee
    const fetchTasks = async (options = {}) => {
        const { silent = false, isPartOfBatchUpdate = false, forceRefresh = false } = options;

        // Only show loading indicator if this is not a silent update or part of a batch update
        if (!silent && !isPartOfBatchUpdate && !forceRefresh) {
            setIsLoadingTasks(true);
        }

        // Only clear errors if this is not a silent update
        if (!silent) {
            setTaskError(null);
        }

        try {
            // Get the current user ID from localStorage
            const userId = localStorage.getItem('userId');

            if (!userId) {
                console.warn('User ID not found in localStorage');
                setIsLoadingTasks(false);
                return;
            }

            console.log(`Fetching tasks for employee ID: ${userId} (silent: ${silent}, forceRefresh: ${forceRefresh})`);

            // Use the direct API call to get tasks
            // First try the tasks API, then fall back to reminders if needed
            let response;
            try {
                response = await enhancedAPI.tasks.getAll();
                console.log('Tasks response:', response);
            } catch (err) {
                console.log('Error fetching from tasks API, falling back to reminders:', err);
                response = await enhancedAPI.reminders.getAll();
                console.log('Reminders response (fallback):', response);
            }

            if (response && response.data) {
                // Filter tasks for the current user
                const userTasks = response.data.filter(task => task.employeeId === userId);

                // Transform the API response to match our component's data structure
                const formattedTasks = userTasks.map(task => ({
                    id: task._id,
                    task: task.description || 'Untitled Task',
                    completed: task.completed || false,
                    priority: task.priority || 'medium',
                    dueDate: task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'No due date'
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

                // Calculate change from previous value
                const prevTasksCount = parseInt(stats[3].value) || 0;
                const tasksChange = todaysTasks.length - prevTasksCount;

                // Update stats with task count
                setStats(prevStats => {
                    const newStats = [...prevStats];
                    newStats[3] = {
                        ...newStats[3],
                        value: todaysTasks.length.toString(),
                        change: tasksChange >= 0 ? `+${tasksChange}` : `${tasksChange}`,
                        changeType: tasksChange > 0 ? 'increase' : (tasksChange < 0 ? 'decrease' : 'neutral')
                    };
                    return newStats;
                });

                // Log tasks update for debugging
                console.log('Tasks updated:', {
                    total: todaysTasks.length,
                    change: tasksChange,
                    completed: todaysTasks.filter(task => task.completed).length,
                    pending: todaysTasks.filter(task => !task.completed).length
                });

                // If there are new tasks and this is a background update, show a notification
                if (tasksChange > 0 && forceRefresh && !isPartOfBatchUpdate && !silent) {
                    toast.info(`${tasksChange} new task${tasksChange > 1 ? 's' : ''} for today`, {
                        position: "top-right",
                        autoClose: 5000,
                    });
                }
            } else {
                setTasks([]);

                // Update stats with zero tasks
                setStats(prevStats => {
                    const newStats = [...prevStats];
                    newStats[3] = {
                        ...newStats[3],
                        value: '0',
                        change: '0',
                        changeType: 'neutral'
                    };
                    return newStats;
                });
            }
        } catch (err) {
            console.error('Error fetching tasks:', err);

            // Only show errors if this is not a silent update
            if (!silent) {
                setTaskError('Failed to load tasks. Please try again.');
                toast.error('Failed to load tasks: ' + (err.message || 'Unknown error'));
            }
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
                <div className="flex items-center space-x-4">
                    <button
                        onClick={updateAllData}
                        className={`flex items-center text-sm text-indigo-600 hover:text-indigo-800 ${isUpdating ? 'opacity-50 cursor-wait' : ''}`}
                        disabled={isUpdating}
                    >
                        <RefreshCw size={16} className={`mr-1 ${isUpdating ? 'animate-spin' : ''}`} />
                        {isUpdating ? 'Updating...' : 'Refresh Data'}
                    </button>
                    <div className="text-sm text-gray-500 flex items-center">
                        <Clock size={16} className="inline mr-1" />
                        {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                    </div>
                </div>
            </div>

            {/* Last updated indicator */}
            <div className="flex items-center justify-end text-xs text-gray-500 -mt-2 mb-2">
                Last updated: {lastUpdated.toLocaleTimeString()}
                {isUpdating && <span className="ml-2 text-indigo-500">(Updating...)</span>}
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
                                <p className={`text-xs ${
                                    stat.changeType === 'increase' ? 'text-emerald-500' :
                                    stat.changeType === 'decrease' ? 'text-red-500' :
                                    'text-gray-500'
                                } font-medium`}>
                                    {stat.changeType === 'increase' ? <ArrowUp size={12} className="inline" /> :
                                     stat.changeType === 'decrease' ? <ArrowDown size={12} className="inline" /> :
                                     null}
                                    {' '}{stat.change} since last update
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
                            <button
                                onClick={() => fetchLeads({ forceRefresh: true, showErrors: true })}
                                className={`p-1 rounded-md hover:bg-gray-100 ${isUpdating || isLoadingLeads ? 'opacity-50' : ''}`}
                                title="Refresh leads"
                                disabled={isUpdating || isLoadingLeads}
                            >
                                <RefreshCw size={16} className={`text-gray-500 ${isUpdating && 'animate-spin'}`} />
                            </button>
                        </div>
                    </div>

                    {/* Error Message */}
                    {error && (
                        <div className="mx-6 mt-4 bg-red-100 border border-red-200 text-red-800 px-4 py-3 rounded-md flex items-center">
                            <AlertCircle size={20} className="mr-2" />
                            <span>{error}</span>
                            <button
                                onClick={() => fetchLeads({ forceRefresh: true, showErrors: true })}
                                className={`ml-auto text-red-800 hover:text-red-900 ${isUpdating ? 'opacity-50' : ''}`}
                                disabled={isUpdating}
                            >
                                <RefreshCw size={16} className={isUpdating ? 'animate-spin' : ''} />
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
                            <button
                                onClick={() => fetchFollowUps({ forceRefresh: true, showErrors: true })}
                                className={`p-1 rounded-md hover:bg-gray-100 ${isUpdating || isLoadingFollowUps ? 'opacity-50' : ''}`}
                                title="Refresh follow-ups"
                                disabled={isUpdating || isLoadingFollowUps}
                            >
                                <RefreshCw size={16} className={`text-gray-500 ${isUpdating && 'animate-spin'}`} />
                            </button>
                        </div>
                    </div>

                    {/* Error Message */}
                    {followUpError && (
                        <div className="mx-6 mt-4 bg-red-100 border border-red-200 text-red-800 px-4 py-3 rounded-md flex items-center">
                            <AlertCircle size={20} className="mr-2" />
                            <span>{followUpError}</span>
                            <button
                                onClick={() => fetchFollowUps({ forceRefresh: true, showErrors: true })}
                                className={`ml-auto text-red-800 hover:text-red-900 ${isUpdating ? 'opacity-50' : ''}`}
                                disabled={isUpdating}
                            >
                                <RefreshCw size={16} className={isUpdating ? 'animate-spin' : ''} />
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
                        <button
                            onClick={() => fetchTasks({ forceRefresh: true, showErrors: true })}
                            className={`p-1 rounded-md hover:bg-gray-100 ${isUpdating || isLoadingTasks ? 'opacity-50' : ''}`}
                            title="Refresh tasks"
                            disabled={isUpdating || isLoadingTasks}
                        >
                            <RefreshCw size={16} className={`text-gray-500 ${isUpdating && 'animate-spin'}`} />
                        </button>
                    </div>
                </div>

                {/* Error Message */}
                {taskError && (
                    <div className="mx-6 mt-4 bg-red-100 border border-red-200 text-red-800 px-4 py-3 rounded-md flex items-center">
                        <AlertCircle size={20} className="mr-2" />
                        <span>{taskError}</span>
                        <button
                            onClick={() => fetchTasks({ forceRefresh: true, showErrors: true })}
                            className={`ml-auto text-red-800 hover:text-red-900 ${isUpdating ? 'opacity-50' : ''}`}
                            disabled={isUpdating}
                        >
                            <RefreshCw size={16} className={isUpdating ? 'animate-spin' : ''} />
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
