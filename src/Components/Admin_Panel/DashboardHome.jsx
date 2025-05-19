import { useState, useEffect } from 'react';
import {
    BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
    PieChart, Pie, Cell, Legend
} from 'recharts';
import {
    UserPlus, Users, CheckCircle, X,
    ArrowUp, ArrowDown, Calendar, Clock,
    BarChart2, Activity, AlertCircle, Settings,
    Shield, UserCheck, Database, Loader, RefreshCw,
    Pause, Play, RotateCw
} from 'lucide-react';
import { Link } from 'react-router-dom';
import enhancedAPI from '../../services/enhancedAPI';
import { toast } from 'react-toastify';

// Stats Card Component
const StatsCard = ({
    title,
    value,
    icon,
    trend,
    trendType,
    bgColor,
    iconColor,
    badge,
    badgeColor,
    highlight,
    noBorder = false,
    textColor = null
}) => (
    <div className={`bg-white rounded-lg shadow-md ${noBorder ? '' : `border ${highlight ? 'border-indigo-300' : 'border-gray-100'}`} p-4 hover:shadow-lg transition-all duration-300 ${highlight ? 'transform hover:-translate-y-1' : ''}`}>
        <div className="flex items-center justify-between mb-3">
            <div className="flex items-center">
                <h3 className={`${textColor ? textColor : 'text-gray-600'} text-sm font-medium`}>{title}</h3>
                {badge && (
                    <span className={`ml-2 px-1.5 py-0.5 text-xs font-bold rounded-full ${badgeColor}`}>
                        {badge}
                    </span>
                )}
            </div>
            <div className={`p-2 rounded-md ${bgColor} ${highlight ? 'animate-pulse' : ''}`}>
                {icon}
            </div>
        </div>
        <div className="flex items-end justify-between">
            <div>
                <p className={`text-2xl font-bold ${textColor ? textColor : (highlight ? 'text-indigo-700' : 'text-gray-800')}`}>{value}</p>
                <p className={`text-xs ${trend.includes('+') ? 'text-emerald-500' : 'text-red-500'} font-medium`}>
                    {trend.includes('+') ? <ArrowUp size={12} className="inline" /> : <ArrowDown size={12} className="inline" />}
                    {' '}{trend}
                </p>
            </div>
        </div>
    </div>
);

// Team Member Row Component
const TeamMemberRow = ({ member }) => {
    const getPerformanceColor = (performance) => {
        switch(performance) {
            case 'high': return 'text-emerald-500';
            case 'medium': return 'text-amber-500';
            case 'low': return 'text-red-500';
            default: return 'text-gray-500';
        }
    };

    return (
        <tr className="hover:bg-gray-50">
            <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex items-center">
                    <div className="h-10 w-10 rounded-full bg-gradient-to-tr from-indigo-500 to-[#022d38] flex items-center justify-center text-white font-bold">
                        {member.avatar}
                    </div>
                    <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{member.name}</div>
                        <div className="text-sm text-gray-500">{member.email}</div>
                    </div>
                </div>
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {member.role}
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {member.leadsAssigned}
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {member.leadsConverted}
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                <span className={getPerformanceColor(member.performance)}>
                    {member.conversionRate}
                </span>
            </td>
        </tr>
    );
};

export default function DashboardHome() {
    // State for loading and error handling
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    // State for dashboard data
    const [dashboardStats, setDashboardStats] = useState({
        totalLeads: 0,
        contactedLeads: 0,
        inProgressLeads: 0,
        closedDeals: 0,
        trends: {
            totalLeadsTrend: '+0%',
            contactedLeadsTrend: '+0%',
            inProgressLeadsTrend: '+0%',
            closedDealsTrend: '+0%'
        }
    });

    // State for chart data
    const [leadStatusData, setLeadStatusData] = useState([
        { name: 'New', value: 0 },
        { name: 'Contacted', value: 0 },
        { name: 'Qualified', value: 0 },
        { name: 'Converted', value: 0 },
        { name: 'Lost', value: 0 }
    ]);

    // Generate initial sample data for monthly conversion trend
    const generateInitialMonthlyData = () => {
        const currentDate = new Date();
        const months = [];
        for (let i = 5; i >= 0; i--) {
            const month = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
            months.push({
                name: month.toLocaleString('default', { month: 'short' }),
                conversions: Math.floor(Math.random() * 10) + (5 - i) // Random value with trend
            });
        }
        return months;
    };

    const [monthlyConversionData, setMonthlyConversionData] = useState(generateInitialMonthlyData());

    // State for team members data
    const [teamMembers, setTeamMembers] = useState([]);

    // State for recent activities
    const [recentActivities, setRecentActivities] = useState([]);

    // State for auto-refresh
    const [autoRefresh, setAutoRefresh] = useState(true);
    const [refreshInterval, setRefreshInterval] = useState(30); // seconds
    const [lastUpdated, setLastUpdated] = useState(new Date());
    const [countdown, setCountdown] = useState(refreshInterval);



    // State for tracking data changes
    const [previousData, setPreviousData] = useState({
        totalLeads: 0,
        contactedLeads: 0,
        inProgressLeads: 0,
        closedDeals: 0
    });
    const [dataChanges, setDataChanges] = useState({
        newLeads: 0,
        newContacts: 0,
        newProgress: 0,
        newDeals: 0,
        hasChanges: false
    });

    // Fetch dashboard data from the database
    useEffect(() => {
        // Initial data fetch
        fetchDashboardData();

        // Set up auto-refresh
        const intervalId = setInterval(() => {
            setCountdown(prev => {
                if (prev <= 1) {
                    // Time to refresh
                    if (autoRefresh && !isLoading) {
                        console.log('Auto-refreshing dashboard data...');
                        fetchDashboardData();
                    }
                    return refreshInterval;
                }
                return prev - 1;
            });
        }, 1000);

        // Clean up interval on component unmount
        return () => {
            console.log('Cleaning up dashboard refresh interval');
            clearInterval(intervalId);
        };
    }, [autoRefresh, refreshInterval]);

    // Function to fetch all dashboard data
    const fetchDashboardData = async () => {
        setIsLoading(true);
        setError(null);

        try {
            // Fetch leads data with a very high limit to get all leads
            const leadsResponse = await enhancedAPI.leads.getAll({ limit: 1000 });
            console.log('Leads response:', leadsResponse);

            // Fetch employees data
            const employeesResponse = await enhancedAPI.users.getByRole('employee');
            console.log('Employees response:', employeesResponse);

            // Fetch managers data
            const managersResponse = await enhancedAPI.users.getByRole('manager');
            console.log('Managers response:', managersResponse);

            // Process data if responses are successful
            if (leadsResponse && employeesResponse && managersResponse) {
                const leads = leadsResponse.data || [];
                const employees = employeesResponse.data || [];
                const managers = managersResponse.data || [];

                // Process dashboard stats
                processDashboardStats(leads);

                // Process lead status distribution
                processLeadStatusDistribution(leads);

                // Process monthly conversion data
                processMonthlyConversionData(leads);

                // Process team members data
                processTeamMembersData(employees, managers, leads);

                // Process recent activities
                processRecentActivities(leads, employees, managers);

                // Update last updated timestamp
                setLastUpdated(new Date());
                setCountdown(refreshInterval);

                // Show success message only on manual refresh to avoid too many notifications
                if (!autoRefresh || isLoading) {
                    toast.success('Dashboard data loaded successfully');
                }
            } else {
                setError('Failed to fetch dashboard data');
                toast.error('Failed to fetch dashboard data');
            }
        } catch (error) {
            console.error('Error fetching dashboard data:', error);
            const errorMessage = error.message || 'Unknown error';
            console.log('Error message:', errorMessage);
            setError('Error fetching dashboard data: ' + errorMessage);
            toast.error('Error fetching dashboard data: ' + errorMessage);

            // Set default empty data to prevent rendering errors
            setDashboardStats({
                totalLeads: 0,
                contactedLeads: 0,
                inProgressLeads: 0,
                closedDeals: 0,
                trends: {
                    totalLeadsTrend: '+0%',
                    contactedLeadsTrend: '+0%',
                    inProgressLeadsTrend: '+0%',
                    closedDealsTrend: '+0%'
                }
            });
            setLeadStatusData([
                { name: 'New', value: 0 },
                { name: 'Contacted', value: 0 },
                { name: 'Qualified', value: 0 },
                { name: 'Converted', value: 0 },
                { name: 'Lost', value: 0 }
            ]);
            setMonthlyConversionData(generateInitialMonthlyData());
            setTeamMembers([]);
            setRecentActivities([]);
        } finally {
            setIsLoading(false);
        }
    };

    // Process dashboard stats
    const processDashboardStats = (leads) => {
        // Count leads by status
        const totalLeads = leads.length;
        const contactedLeads = leads.filter(lead => lead.status === 'Contacted').length;

        // For In Progress, check for both 'Qualified' and 'In Progress' statuses
        const inProgressLeads = leads.filter(lead =>
            lead.status === 'Qualified' ||
            lead.status === 'In Progress' ||
            lead.status === 'Negotiation'
        ).length;

        // For Closed Deals, check for both 'Converted' and 'Closed' statuses
        const closedDeals = leads.filter(lead =>
            lead.status === 'Converted' ||
            lead.status === 'Closed' ||
            lead.status === 'Won'
        ).length;

        // Calculate changes from previous data
        const newLeads = Math.max(0, totalLeads - previousData.totalLeads);
        const newContacts = Math.max(0, contactedLeads - previousData.contactedLeads);
        const newProgress = Math.max(0, inProgressLeads - previousData.inProgressLeads);
        const newDeals = Math.max(0, closedDeals - previousData.closedDeals);

        // Log changes for debugging
        console.log('Data changes detected:', {
            newLeads,
            newContacts,
            newProgress,
            newDeals,
            previousData,
            currentData: { totalLeads, contactedLeads, inProgressLeads, closedDeals }
        });

        // Calculate percentage trends (with safeguards for division by zero)
        const calculateTrend = (current, previous) => {
            if (previous <= 0) return '+0%';
            const percentChange = Math.round((current - previous) / previous * 100);
            return percentChange >= 0 ? `+${percentChange}%` : `${percentChange}%`;
        };

        const totalLeadsTrend = calculateTrend(totalLeads, previousData.totalLeads);
        const contactedLeadsTrend = calculateTrend(contactedLeads, previousData.contactedLeads);
        const inProgressLeadsTrend = calculateTrend(inProgressLeads, previousData.inProgressLeads);
        const closedDealsTrend = calculateTrend(closedDeals, previousData.closedDeals);

        // Update dashboard stats
        setDashboardStats({
            totalLeads,
            contactedLeads,
            inProgressLeads,
            closedDeals,
            trends: {
                totalLeadsTrend,
                contactedLeadsTrend,
                inProgressLeadsTrend,
                closedDealsTrend
            }
        });

        // Track data changes for notifications
        const hasChanges = newLeads > 0 || newContacts > 0 || newProgress > 0 || newDeals > 0;

        if (hasChanges) {
            setDataChanges({
                newLeads,
                newContacts,
                newProgress,
                newDeals,
                hasChanges
            });

            // Show notification for new data if auto-refreshing
            if (autoRefresh && previousData.totalLeads > 0) {
                let changeMessage = '';

                if (newLeads > 0) {
                    changeMessage += `${newLeads} new lead${newLeads > 1 ? 's' : ''}, `;
                }
                if (newContacts > 0) {
                    changeMessage += `${newContacts} new contact${newContacts > 1 ? 's' : ''}, `;
                }
                if (newProgress > 0) {
                    changeMessage += `${newProgress} new in progress, `;
                }
                if (newDeals > 0) {
                    changeMessage += `${newDeals} new deal${newDeals > 1 ? 's' : ''}, `;
                }

                if (changeMessage) {
                    changeMessage = changeMessage.slice(0, -2); // Remove trailing comma and space
                    toast.info(`Dashboard updated: ${changeMessage}`);
                }
            }
        } else {
            setDataChanges({
                newLeads: 0,
                newContacts: 0,
                newProgress: 0,
                newDeals: 0,
                hasChanges: false
            });
        }

        // Update previous data for next comparison
        setPreviousData({
            totalLeads,
            contactedLeads,
            inProgressLeads,
            closedDeals
        });
    };

    // Process lead status distribution
    const processLeadStatusDistribution = (leads) => {
        // Count leads by status
        const newLeads = leads.filter(lead => lead.status === 'New').length;
        const contactedLeads = leads.filter(lead => lead.status === 'Contacted').length;

        // Group all in-progress type statuses
        const inProgressLeads = leads.filter(lead =>
            lead.status === 'Qualified' ||
            lead.status === 'In Progress' ||
            lead.status === 'Negotiation'
        ).length;

        // Group all converted/closed type statuses
        const closedLeads = leads.filter(lead =>
            lead.status === 'Converted' ||
            lead.status === 'Closed' ||
            lead.status === 'Won'
        ).length;

        const lostLeads = leads.filter(lead => lead.status === 'Lost').length;

        setLeadStatusData([
            { name: 'New', value: newLeads },
            { name: 'Contacted', value: contactedLeads },
            { name: 'In Progress', value: inProgressLeads },
            { name: 'Closed', value: closedLeads },
            { name: 'Lost', value: lostLeads }
        ]);
    };

    // Process monthly conversion data
    const processMonthlyConversionData = (leads) => {
        console.log('Processing monthly conversion data with leads:', leads);

        // Get current date
        const currentDate = new Date();
        const currentYear = currentDate.getFullYear();

        // Create an array of the last 6 months
        const months = [];
        for (let i = 5; i >= 0; i--) {
            const month = new Date(currentYear, currentDate.getMonth() - i, 1);
            months.push({
                name: month.toLocaleString('default', { month: 'short' }),
                month: month.getMonth(),
                year: month.getFullYear()
            });
        }

        // Generate sample data if no leads with conversions
        const hasConvertedLeads = leads.some(lead =>
            lead.status === 'Converted' || lead.status === 'Closed' || lead.status === 'Won'
        );

        if (!hasConvertedLeads) {
            console.log('No converted leads found, generating sample data');
            // Generate sample data for demonstration
            const sampleData = months.map((monthData, index) => ({
                name: monthData.name,
                conversions: Math.floor(Math.random() * 10) + (5 - index) // Random value with decreasing trend
            }));

            setMonthlyConversionData(sampleData);
            return;
        }

        // Count conversions by month
        const monthlyData = months.map(monthData => {
            const conversions = leads.filter(lead => {
                if (!lead.updatedAt) return false;

                const leadDate = new Date(lead.updatedAt);
                return leadDate.getMonth() === monthData.month &&
                       leadDate.getFullYear() === monthData.year &&
                       (lead.status === 'Converted' || lead.status === 'Closed' || lead.status === 'Won');
            }).length;

            return {
                name: monthData.name,
                conversions
            };
        });

        console.log('Monthly conversion data:', monthlyData);
        setMonthlyConversionData(monthlyData);
    };

    // Process team members data
    const processTeamMembersData = (employees, managers, leads) => {
        // Combine employees and managers
        const allTeamMembers = [...employees, ...managers];

        // Calculate performance metrics for each team member
        const teamMembersData = allTeamMembers.map(member => {
            // Get leads assigned to this team member
            const assignedLeads = leads.filter(lead => {
                if (member.role === 'employee') {
                    return lead.assignedEmployee &&
                           (typeof lead.assignedEmployee === 'object'
                            ? lead.assignedEmployee._id === member._id
                            : lead.assignedEmployee === member._id);
                } else {
                    return lead.assignedManager &&
                           (typeof lead.assignedManager === 'object'
                            ? lead.assignedManager._id === member._id
                            : lead.assignedManager === member._id);
                }
            });

            // Count leads and conversions
            const leadsAssigned = assignedLeads.length;
            const leadsConverted = assignedLeads.filter(lead =>
                lead.status === 'Converted' || lead.status === 'Closed' || lead.status === 'Won'
            ).length;

            // Calculate conversion rate
            const conversionRate = leadsAssigned > 0
                ? Math.round((leadsConverted / leadsAssigned) * 100) + '%'
                : '0%';

            // Determine performance level
            let performance = 'medium';
            const conversionRateNum = parseInt(conversionRate);
            if (conversionRateNum >= 70) {
                performance = 'high';
            } else if (conversionRateNum <= 30) {
                performance = 'low';
            }

            // Get initials for avatar
            const nameParts = member.name.split(' ');
            const avatar = nameParts.length > 1
                ? (nameParts[0][0] + nameParts[1][0]).toUpperCase()
                : member.name.substring(0, 2).toUpperCase();

            return {
                id: member._id,
                name: member.name,
                email: member.email,
                avatar,
                role: member.role === 'employee' ? 'Sales Rep' : 'Manager',
                leadsAssigned,
                leadsConverted,
                conversionRate,
                performance
            };
        });

        // Sort by performance (high to low)
        teamMembersData.sort((a, b) => {
            const performanceOrder = { high: 3, medium: 2, low: 1 };
            return performanceOrder[b.performance] - performanceOrder[a.performance];
        });

        // Take top 4 team members
        setTeamMembers(teamMembersData.slice(0, 4));
    };

    // Process recent activities
    const processRecentActivities = (leads, employees, managers) => {
        const activities = [];

        // Process lead status changes
        leads.forEach(lead => {
            if (lead.status === 'Converted' || lead.status === 'Closed' || lead.status === 'Won') {
                // Find the employee who converted the lead
                const employee = employees.find(emp =>
                    lead.assignedEmployee &&
                    (typeof lead.assignedEmployee === 'object'
                     ? lead.assignedEmployee._id === emp._id
                     : lead.assignedEmployee === emp._id)
                );

                if (employee) {
                    activities.push({
                        id: `conv_${lead._id}`,
                        type: 'conversion',
                        icon: <CheckCircle size={16} className="text-indigo-600" />,
                        iconBg: 'bg-indigo-100',
                        message: `${employee.name} converted ${lead.name} lead`,
                        timestamp: lead.updatedAt || new Date().toISOString(),
                        date: new Date(lead.updatedAt || new Date())
                    });
                }
            }
        });

        // Add lead assignment activities
        leads.forEach(lead => {
            if (lead.assignedEmployee) {
                // Find the employee and manager
                const employee = employees.find(emp =>
                    typeof lead.assignedEmployee === 'object'
                    ? lead.assignedEmployee._id === emp._id
                    : lead.assignedEmployee === emp._id
                );

                const manager = managers.find(mgr =>
                    lead.assignedManager &&
                    (typeof lead.assignedManager === 'object'
                     ? lead.assignedManager._id === mgr._id
                     : lead.assignedManager === mgr._id)
                );

                if (employee && manager) {
                    activities.push({
                        id: `assign_${lead._id}`,
                        type: 'assignment',
                        icon: <Users size={16} className="text-emerald-600" />,
                        iconBg: 'bg-emerald-100',
                        message: `${manager.name} assigned ${lead.name} lead to ${employee.name}`,
                        timestamp: lead.updatedAt || new Date().toISOString(),
                        date: new Date(lead.updatedAt || new Date())
                    });
                }
            }
        });

        // Add new lead activities
        const newLeads = leads.filter(lead => lead.status === 'New');
        if (newLeads.length > 0) {
            activities.push({
                id: 'new_leads',
                type: 'new_leads',
                icon: <UserPlus size={16} className="text-blue-600" />,
                iconBg: 'bg-blue-100',
                message: `${newLeads.length} new leads added to the system`,
                timestamp: new Date().toISOString(),
                date: new Date()
            });
        }

        // Add overdue follow-ups
        const overdueFollowUps = leads.filter(lead => {
            if (!lead.followUp || !lead.followUp.date) return false;
            const followUpDate = new Date(lead.followUp.date);
            return followUpDate < new Date() && !lead.followUp.completed;
        });

        if (overdueFollowUps.length > 0) {
            activities.push({
                id: 'overdue_followups',
                type: 'overdue',
                icon: <AlertCircle size={16} className="text-red-600" />,
                iconBg: 'bg-red-100',
                message: `${overdueFollowUps.length} overdue follow-ups require attention`,
                timestamp: new Date().toISOString(),
                date: new Date()
            });
        }

        // Sort activities by date (newest first)
        activities.sort((a, b) => b.date - a.date);

        // Take the 4 most recent activities
        setRecentActivities(activities.slice(0, 4));
    };

    // Format time ago function for last updated timestamp
    const formatTimeAgo = (date) => {
        const now = new Date();
        const diffMs = now - date;
        const diffSecs = Math.floor(diffMs / 1000);
        const diffMins = Math.floor(diffSecs / 60);
        const diffHours = Math.floor(diffMins / 60);

        if (diffSecs < 60) {
            return 'Just now';
        } else if (diffMins < 60) {
            return `${diffMins} ${diffMins === 1 ? 'minute' : 'minutes'} ago`;
        } else if (diffHours < 24) {
            return `${diffHours} ${diffHours === 1 ? 'hour' : 'hours'} ago`;
        } else {
            return date.toLocaleString('en-US', {
                month: 'short',
                day: 'numeric',
                hour: 'numeric',
                minute: '2-digit'
            });
        }
    };

    // Colors for pie chart
    const COLORS = ['#6366f1', '#f59e0b', '#10b981', '#3b82f6', '#ef4444'];

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-semibold text-gray-800">Admin Dashboard</h1>
                <div className="flex items-center space-x-4">
                    {/* Auto-refresh controls */}
                    <div className="flex items-center bg-gray-50 rounded-md p-1 border border-gray-200">
                        <button
                            onClick={() => setAutoRefresh(!autoRefresh)}
                            className={`flex items-center text-xs px-2 py-1 rounded ${
                                autoRefresh ? 'text-green-600' : 'text-gray-500'
                            }`}
                            title={autoRefresh ? "Pause auto-refresh" : "Enable auto-refresh"}
                        >
                            {autoRefresh ? (
                                <>
                                    <Pause size={12} className="mr-1" />
                                    Auto-refresh
                                </>
                            ) : (
                                <>
                                    <Play size={12} className="mr-1" />
                                    Auto-refresh
                                </>
                            )}
                        </button>

                        {autoRefresh && (
                            <div className="text-xs text-gray-500 px-2 border-l border-gray-300">
                                <RotateCw size={10} className="inline mr-1 animate-spin" style={{ animationDuration: '3s' }} />
                                <span>{countdown}s</span>
                            </div>
                        )}

                        <div className="text-xs text-gray-500 px-2 border-l border-gray-300">
                            <select
                                value={refreshInterval}
                                onChange={(e) => {
                                    const newInterval = parseInt(e.target.value);
                                    setRefreshInterval(newInterval);
                                    setCountdown(newInterval);
                                }}
                                className="bg-transparent border-none text-xs"
                            >
                                <option value="10">10s</option>
                                <option value="30">30s</option>
                                <option value="60">1m</option>
                                <option value="300">5m</option>
                            </select>
                        </div>
                    </div>

                    {/* Manual refresh button */}
                    <button
                        onClick={fetchDashboardData}
                        disabled={isLoading}
                        className={`flex items-center text-sm px-3 py-1.5 rounded-md ${
                            isLoading
                                ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                                : 'bg-indigo-50 text-indigo-600 hover:bg-indigo-100'
                        }`}
                        title="Refresh dashboard data"
                    >
                        {isLoading ? (
                            <>
                                <Loader size={14} className="mr-1.5 animate-spin" />
                                Refreshing...
                            </>
                        ) : (
                            <>
                                <RefreshCw size={14} className="mr-1.5" />
                                Refresh Now
                            </>
                        )}
                    </button>

                    {/* Last updated timestamp */}
                    <div className="text-sm text-gray-500">
                        <Clock size={16} className="inline mr-1" />
                        <span title={lastUpdated.toLocaleString()}>
                            Updated: {formatTimeAgo(lastUpdated)}
                        </span>
                    </div>
                </div>
            </div>

            {/* Error Message */}
            {error && (
                <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6">
                    <div className="flex">
                        <div className="flex-shrink-0">
                            <AlertCircle className="h-5 w-5 text-red-500" />
                        </div>
                        <div className="ml-3">
                            <h3 className="text-sm font-medium text-red-800">
                                Error Loading Dashboard Data
                            </h3>
                            <div className="mt-2 text-sm text-red-700">
                                <p>{error}</p>
                                <p className="mt-1">
                                    Try refreshing the page or click the "Refresh Data" button above.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {isLoading ? (
                    // Loading skeleton for stats cards
                    <>
                        {[1, 2, 3, 4].map(i => (
                            <div key={i} className={`bg-white rounded-lg shadow-md ${i <= 2 ? '' : 'border border-gray-100'} p-4 animate-pulse`}>
                                <div className="flex items-center justify-between mb-3">
                                    <div className={`h-4 ${i <= 2 ? 'bg-gray-400' : 'bg-gray-200'} rounded w-1/3`}></div>
                                    <div className="h-8 w-8 bg-gray-200 rounded-md"></div>
                                </div>
                                <div className="flex items-end justify-between">
                                    <div>
                                        <div className={`h-8 ${i <= 2 ? 'bg-gray-400' : 'bg-gray-200'} rounded w-16 mb-1`}></div>
                                        <div className="h-3 bg-gray-200 rounded w-24"></div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </>
                ) : (
                    <>
                        <StatsCard
                            title="Total Leads"
                            value={dashboardStats.totalLeads.toString()}
                            icon={<UserPlus size={20} className="text-indigo-600" />}
                            trend={dashboardStats.trends.totalLeadsTrend}
                            trendType="increase"
                            bgColor={dataChanges.newLeads > 0 ? "bg-indigo-200" : "bg-indigo-100"}
                            iconColor="text-indigo-600"
                            badge={dataChanges.newLeads > 0 ? `+${dataChanges.newLeads}` : null}
                            badgeColor="bg-indigo-500 text-white"
                            highlight={dataChanges.newLeads > 0}
                            noBorder={true}
                            textColor="text-black"
                        />
                        <StatsCard
                            title="Contacted"
                            value={dashboardStats.contactedLeads.toString()}
                            icon={<Users size={20} className="text-amber-600" />}
                            trend={dashboardStats.trends.contactedLeadsTrend}
                            trendType="increase"
                            bgColor={dataChanges.newContacts > 0 ? "bg-amber-200" : "bg-amber-100"}
                            iconColor="text-amber-600"
                            badge={dataChanges.newContacts > 0 ? `+${dataChanges.newContacts}` : null}
                            badgeColor="bg-amber-500 text-white"
                            highlight={dataChanges.newContacts > 0}
                            noBorder={true}
                            textColor="text-black"
                        />
                        <StatsCard
                            title="In Progress"
                            value={dashboardStats.inProgressLeads.toString()}
                            icon={<Activity size={20} className="text-emerald-600" />}
                            trend={dashboardStats.trends.inProgressLeadsTrend}
                            trendType="increase"
                            bgColor={dataChanges.newProgress > 0 ? "bg-emerald-200" : "bg-emerald-100"}
                            iconColor="text-emerald-600"
                            badge={dataChanges.newProgress > 0 ? `+${dataChanges.newProgress}` : null}
                            badgeColor="bg-emerald-500 text-white"
                            highlight={dataChanges.newProgress > 0}
                        />
                        <StatsCard
                            title="Closed Deals"
                            value={dashboardStats.closedDeals.toString()}
                            icon={<CheckCircle size={20} className="text-purple-600" />}
                            trend={dashboardStats.trends.closedDealsTrend}
                            trendType="increase"
                            bgColor={dataChanges.newDeals > 0 ? "bg-purple-200" : "bg-purple-100"}
                            iconColor="text-purple-600"
                            badge={dataChanges.newDeals > 0 ? `+${dataChanges.newDeals}` : null}
                            badgeColor="bg-purple-500 text-white"
                            highlight={dataChanges.newDeals > 0}
                        />
                    </>
                )}
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Lead Status Distribution */}
                <div className="bg-white rounded-lg shadow p-6">
                    <h2 className="text-lg font-medium text-gray-800 mb-4">Lead Status Distribution</h2>
                    {isLoading ? (
                        <div className="h-64 flex items-center justify-center">
                            <div className="flex flex-col items-center">
                                <Loader size={40} className="text-indigo-600 animate-spin mb-4" />
                                <p className="text-gray-500">Loading chart data...</p>
                            </div>
                        </div>
                    ) : leadStatusData.every(item => item.value === 0) ? (
                        <div className="h-64 flex items-center justify-center">
                            <div className="text-center">
                                <Database size={40} className="text-gray-400 mx-auto mb-4" />
                                <p className="text-gray-500">No lead data available</p>
                                <p className="text-sm text-gray-400 mt-2">Add leads to see distribution</p>
                            </div>
                        </div>
                    ) : (
                        <div className="h-64">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={leadStatusData.filter(item => item.value > 0)}
                                        cx="50%"
                                        cy="50%"
                                        labelLine={false}
                                        outerRadius={80}
                                        fill="#8884d8"
                                        dataKey="value"
                                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                                    >
                                        {leadStatusData.map((_, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Legend />
                                    <Tooltip formatter={(value) => [`${value} leads`, 'Count']} />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    )}
                </div>

                {/* Monthly Conversion Trend */}
                <div className="bg-white rounded-lg shadow p-6">
                    <h2 className="text-lg font-medium text-gray-800 mb-4">Monthly Conversion Trend</h2>
                    {isLoading ? (
                        <div className="h-64 flex items-center justify-center">
                            <div className="flex flex-col items-center">
                                <Loader size={40} className="text-indigo-600 animate-spin mb-4" />
                                <p className="text-gray-500">Loading chart data...</p>
                            </div>
                        </div>
                    ) : monthlyConversionData.length === 0 || monthlyConversionData.every(item => item.conversions === 0) ? (
                        <div className="h-64 flex items-center justify-center">
                            <div className="text-center">
                                <BarChart2 size={40} className="text-gray-400 mx-auto mb-4" />
                                <p className="text-gray-500">No conversion data available</p>
                                <p className="text-sm text-gray-400 mt-2">Convert leads to see trends</p>
                            </div>
                        </div>
                    ) : (
                        <div className="h-64">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart
                                    data={monthlyConversionData}
                                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                                >
                                    <XAxis dataKey="name" />
                                    <YAxis />
                                    <Tooltip formatter={(value) => [`${value} conversions`, 'Count']} />
                                    <Bar dataKey="conversions" fill="#6366f1" />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    )}
                </div>
            </div>

            {/* Team Performance Table */}
            <div className="bg-white rounded-lg shadow overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
                    <h2 className="text-lg font-medium text-gray-800">Team Performance</h2>
                    <Link to="/dashboard-panel/team" className="text-sm text-indigo-600 hover:text-indigo-900">
                        View All
                    </Link>
                </div>
                {isLoading ? (
                    <div className="py-12 flex justify-center items-center">
                        <div className="flex flex-col items-center">
                            <Loader size={40} className="text-indigo-600 animate-spin mb-4" />
                            <p className="text-gray-500">Loading team data...</p>
                        </div>
                    </div>
                ) : teamMembers.length === 0 ? (
                    <div className="py-12 flex justify-center items-center">
                        <div className="text-center">
                            <Users size={40} className="text-gray-400 mx-auto mb-4" />
                            <p className="text-gray-500">No team members found</p>
                            <p className="text-sm text-gray-400 mt-2">Add employees to see performance data</p>
                        </div>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Employee
                                    </th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Role
                                    </th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Leads Assigned
                                    </th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Leads Converted
                                    </th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Conversion Rate
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {teamMembers.map(member => (
                                    <TeamMemberRow key={member.id} member={member} />
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Recent Activities */}
            <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-lg font-medium text-gray-800 mb-4">Recent Activities</h2>
                {isLoading ? (
                    <div className="py-12 flex justify-center items-center">
                        <div className="flex flex-col items-center">
                            <Loader size={40} className="text-indigo-600 animate-spin mb-4" />
                            <p className="text-gray-500">Loading activity data...</p>
                        </div>
                    </div>
                ) : recentActivities.length === 0 ? (
                    <div className="py-12 flex justify-center items-center">
                        <div className="text-center">
                            <Activity size={40} className="text-gray-400 mx-auto mb-4" />
                            <p className="text-gray-500">No recent activities found</p>
                            <p className="text-sm text-gray-400 mt-2">Activities will appear as you work with leads</p>
                        </div>
                    </div>
                ) : (
                    <div className="flow-root">
                        <ul className="-mb-8">
                            {recentActivities.map((activity, index) => {
                                // Format the timestamp as relative time
                                const activityDate = new Date(activity.timestamp);
                                const now = new Date();
                                const diffMs = now - activityDate;
                                const diffMins = Math.floor(diffMs / 60000);
                                const diffHours = Math.floor(diffMins / 60);
                                const diffDays = Math.floor(diffHours / 24);

                                let timeAgo;
                                if (diffMins < 60) {
                                    timeAgo = diffMins <= 1 ? 'just now' : `${diffMins} minutes ago`;
                                } else if (diffHours < 24) {
                                    timeAgo = diffHours === 1 ? '1 hour ago' : `${diffHours} hours ago`;
                                } else {
                                    timeAgo = diffDays === 1 ? '1 day ago' : `${diffDays} days ago`;
                                }

                                return (
                                    <li key={activity.id}>
                                        <div className="relative pb-8">
                                            {index < recentActivities.length - 1 && (
                                                <span className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-gray-200" aria-hidden="true"></span>
                                            )}
                                            <div className="relative flex space-x-3">
                                                <div>
                                                    <span className={`h-8 w-8 rounded-full ${activity.iconBg} flex items-center justify-center`}>
                                                        {activity.icon}
                                                    </span>
                                                </div>
                                                <div className="min-w-0 flex-1 pt-1.5 flex justify-between space-x-4">
                                                    <div>
                                                        <p className="text-sm text-gray-900">{activity.message}</p>
                                                    </div>
                                                    <div className="text-right text-sm whitespace-nowrap text-gray-500">
                                                        {timeAgo}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </li>
                                );
                            })}
                        </ul>
                    </div>
                )}
                <div className="mt-6 text-center">
                    <Link to="/dashboard-panel/report" className="text-sm font-medium text-indigo-600 hover:text-indigo-900">
                        View all activity
                    </Link>
                </div>
            </div>
        </div>
    );
}
