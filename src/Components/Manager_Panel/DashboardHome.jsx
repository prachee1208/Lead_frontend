import { useState, useEffect } from 'react';
import {
    BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
    PieChart, Pie, Cell, Legend
} from 'recharts';
import {
    UserPlus, Users, CheckCircle, X,
    ArrowUp, ArrowDown, Calendar, Clock,
    BarChart2, Activity, AlertCircle, Loader, RefreshCw
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { enhancedAPI } from '../../services/enhancedAPI';
import { toast } from 'react-toastify';

// Stats Card Component
const StatsCard = ({ title, value, icon, trend, trendType, bgColor, iconColor }) => (
    <div className="bg-white rounded-lg shadow-md border border-gray-100 p-4 hover:shadow-lg transition-shadow duration-300">
        <div className="flex items-center justify-between mb-3">
            <h3 className="text-gray-600 text-sm font-medium">{title}</h3>
            <div className={`p-2 rounded-md ${bgColor}`}>
                {icon}
            </div>
        </div>
        <div className="flex items-end justify-between">
            <div>
                <p className="text-2xl font-bold text-gray-800">{value}</p>
                <p className={`text-xs ${trendType === 'increase' ? 'text-emerald-500' : 'text-red-500'} font-medium`}>
                    {trendType === 'increase' ? <ArrowUp size={12} className="inline" /> : <ArrowDown size={12} className="inline" />}
                    {' '}{trend}
                </p>
            </div>
        </div>
    </div>
);

// Team Performance Table Row Component
const TeamMemberRow = ({ member }) => {
    const getStatusColor = (status) => {
        switch(status) {
            case 'high': return 'bg-emerald-100 text-emerald-800 border border-emerald-200';
            case 'medium': return 'bg-amber-100 text-amber-800 border border-amber-200';
            case 'low': return 'bg-red-100 text-red-800 border border-red-200';
            default: return 'bg-slate-100 text-slate-800 border border-slate-200';
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
                {member.leadsAssigned}
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {member.leadsConverted}
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {member.conversionRate}
            </td>
            <td className="px-6 py-4 whitespace-nowrap">
                <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(member.performance)}`}>
                    {member.performance === 'high' ? 'High' : member.performance === 'medium' ? 'Medium' : 'Low'}
                </span>
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <Link to={`/manager-panel/employees/${member.id}`} className="text-indigo-600 hover:text-indigo-900">
                    View
                </Link>
            </td>
        </tr>
    );
};

export default function DashboardHome() {
    // State for loading and error handling
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    // State for dashboard data
    const [dashboardStats, setDashboardStats] = useState({
        totalLeads: 0,
        convertedLeads: 0,
        lostLeads: 0,
        conversionRate: 0,
        trends: {
            totalLeadsTrend: '+0%',
            convertedLeadsTrend: '+0%',
            lostLeadsTrend: '+0%',
            conversionRateTrend: '+0%'
        }
    });

    // State for chart data
    const [leadStatusData, setLeadStatusData] = useState([]);
    const [monthlyConversionData, setMonthlyConversionData] = useState([]);
    const [teamMembers, setTeamMembers] = useState([]);
    const [recentActivities, setRecentActivities] = useState([]);

    // State for auto-refresh
    const [autoRefresh, setAutoRefresh] = useState(true);
    const [refreshInterval, setRefreshInterval] = useState(30); // seconds
    const [lastUpdated, setLastUpdated] = useState(new Date());
    const [countdown, setCountdown] = useState(refreshInterval);

    // Colors for pie chart
    const COLORS = ['#6366f1', '#f59e0b', '#10b981', '#3b82f6', '#ef4444'];

    // Fetch dashboard data on component mount and set up auto-refresh
    useEffect(() => {
        // Initial data fetch with error handling
        const initialFetch = async () => {
            try {
                await fetchDashboardData();
            } catch (error) {
                console.error('Error during initial dashboard data fetch:', error);
                setError('Failed to load dashboard data. Please try refreshing the page.');
                setIsLoading(false);
            }
        };

        initialFetch();

        // Set up auto-refresh
        const intervalId = setInterval(() => {
            setCountdown(prev => {
                if (prev <= 1) {
                    // Time to refresh
                    if (autoRefresh && !isLoading) {
                        console.log('Auto-refreshing dashboard data...');
                        // Use try-catch to prevent auto-refresh from breaking if there's an error
                        try {
                            fetchDashboardData().catch(error => {
                                console.error('Error during auto-refresh:', error);
                                // Don't show toast for auto-refresh errors to avoid spamming the user
                            });
                        } catch (error) {
                            console.error('Unexpected error during auto-refresh:', error);
                        }
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [autoRefresh, refreshInterval]);

    // Function to fetch all dashboard data
    const fetchDashboardData = async () => {
        setIsLoading(true);
        setError(null);

        try {
            // Get current user (manager) ID directly from localStorage
            // This is more reliable than the API call which might fail due to token issues
            const managerId = localStorage.getItem('userId');

            if (!managerId) {
                console.error('No user ID found in localStorage');
                throw new Error('User ID not found. Please log in again.');
            }

            console.log('Using manager ID from localStorage:', managerId);

            console.log('Fetching dashboard data for manager:', managerId);

            // Fetch leads and employees in parallel to improve performance
            const [leadsResponse, employeesResponse] = await Promise.all([
                // Fetch leads assigned to this manager
                enhancedAPI.leads.getByManager(managerId, { limit: 1000 })
                    .catch(error => {
                        console.error('Error fetching leads:', error);
                        // Return empty data instead of throwing
                        return { data: [] };
                    }),

                // Fetch employees under this manager
                enhancedAPI.users.getByRole('employee')
                    .catch(error => {
                        console.error('Error fetching employees:', error);
                        // Return empty data instead of throwing
                        return { data: [] };
                    })
            ]);

            console.log('Leads response:', leadsResponse);
            console.log('Employees response:', employeesResponse);

            // Ensure we have arrays even if the API returns unexpected data
            const leadsData = Array.isArray(leadsResponse?.data) ? leadsResponse.data : [];
            const employeesData = Array.isArray(employeesResponse?.data) ? employeesResponse.data : [];

            // Process dashboard data even if we have empty arrays
            processDashboardData(leadsData, employeesData, managerId);

            // Update last updated timestamp
            setLastUpdated(new Date());
            setCountdown(refreshInterval);

            // Show success message only on manual refresh to avoid too many notifications
            if (!autoRefresh) {
                toast.success('Dashboard data refreshed successfully');
            }

            // If we have no data, show a warning but don't treat it as an error
            if (leadsData.length === 0 && employeesData.length === 0) {
                console.warn('No leads or employees data available');
                toast.warning('No leads or employees data available');
            }
        } catch (error) {
            console.error('Error fetching dashboard data:', error);
            setError('Error fetching dashboard data: ' + (error.message || 'Unknown error'));
            toast.error('Error loading dashboard data: ' + (error.message || 'Unknown error'));
        } finally {
            setIsLoading(false);
        }
    };

    // Process dashboard data
    const processDashboardData = (leadsData, employeesData, managerId) => {
        // Ensure we have arrays to work with
        const leads = Array.isArray(leadsData) ? leadsData : [];
        const employees = Array.isArray(employeesData) ? employeesData : [];

        console.log(`Processing dashboard data: ${leads.length} leads, ${employees.length} employees`);

        try {
            // Process dashboard stats
            processStats(leads);
        } catch (error) {
            console.error('Error processing stats:', error);
        }

        try {
            // Process lead status distribution
            processLeadStatusDistribution(leads);
        } catch (error) {
            console.error('Error processing lead status distribution:', error);
        }

        try {
            // Process monthly conversion data
            processMonthlyConversionData(leads);
        } catch (error) {
            console.error('Error processing monthly conversion data:', error);
        }

        try {
            // Process team members data
            processTeamMembersData(employees, leads);
        } catch (error) {
            console.error('Error processing team members data:', error);
        }

        try {
            // Process recent activities
            processRecentActivities(leads, employees);
        } catch (error) {
            console.error('Error processing recent activities:', error);
        }
    };

    // Process dashboard stats
    const processStats = (leadsData) => {
        // Count leads by status
        const totalLeads = leadsData.length;

        // For Converted Leads, check for both 'Converted' and 'Closed' statuses
        const convertedLeads = leadsData.filter(lead =>
            lead.status === 'Converted' ||
            lead.status === 'Closed' ||
            lead.status === 'Won'
        ).length;

        // For Lost Leads
        const lostLeads = leadsData.filter(lead =>
            lead.status === 'Lost' ||
            lead.status === 'Rejected'
        ).length;

        // Calculate conversion rate
        const conversionRate = totalLeads > 0
            ? Math.round((convertedLeads / totalLeads) * 100)
            : 0;

        // Calculate trends (mock data for now, would be from historical data)
        // In a real implementation, you would compare with previous period data
        const totalLeadsTrend = '+12%';
        const convertedLeadsTrend = '+8%';
        const lostLeadsTrend = '-3%';
        const conversionRateTrend = '+5%';

        // Update dashboard stats
        setDashboardStats({
            totalLeads,
            convertedLeads,
            lostLeads,
            conversionRate,
            trends: {
                totalLeadsTrend,
                convertedLeadsTrend,
                lostLeadsTrend,
                conversionRateTrend
            }
        });
    };

    // Process lead status distribution
    const processLeadStatusDistribution = (leadsData) => {
        // Count leads by status
        const statusCounts = {};

        leadsData.forEach(lead => {
            // Normalize status values
            let status = lead.status || 'Unknown';

            // Group similar statuses
            if (status === 'New Lead' || status === 'New') status = 'New';
            if (status === 'Contact Made' || status === 'Contacted') status = 'Contacted';
            if (status === 'Qualified' || status === 'In Progress' || status === 'Negotiation') status = 'Qualified';
            if (status === 'Converted' || status === 'Closed' || status === 'Won') status = 'Converted';
            if (status === 'Lost' || status === 'Rejected') status = 'Lost';

            statusCounts[status] = (statusCounts[status] || 0) + 1;
        });

        // Convert to array format for chart
        const statusData = Object.keys(statusCounts).map(status => ({
            name: status,
            value: statusCounts[status]
        }));

        setLeadStatusData(statusData);
    };

    // Process monthly conversion data
    const processMonthlyConversionData = (leadsData) => {
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

        // Count conversions by month
        const monthlyData = months.map(monthData => {
            const conversions = leadsData.filter(lead => {
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

        setMonthlyConversionData(monthlyData);
    };

    // Process team members data
    const processTeamMembersData = (employeesData, leadsData) => {
        // Calculate performance metrics for each team member
        const teamMembersData = employeesData.map(employee => {
            // Get leads assigned to this employee
            const assignedLeads = leadsData.filter(lead =>
                lead.assignedEmployee &&
                (typeof lead.assignedEmployee === 'object'
                    ? lead.assignedEmployee._id === employee._id
                    : lead.assignedEmployee === employee._id)
            );

            // Count leads and conversions
            const leadsAssigned = assignedLeads.length;
            const leadsConverted = assignedLeads.filter(lead =>
                lead.status === 'Converted' || lead.status === 'Closed' || lead.status === 'Won'
            ).length;

            // Calculate conversion rate
            const conversionRate = leadsAssigned > 0
                ? Math.round((leadsConverted / leadsAssigned) * 100)
                : 0;

            // Determine performance level
            let performance = 'low';
            if (conversionRate >= 70) performance = 'high';
            else if (conversionRate >= 40) performance = 'medium';

            // Get employee initials for avatar
            const nameParts = employee.name.split(' ');
            const avatar = nameParts.length > 1
                ? `${nameParts[0][0]}${nameParts[1][0]}`
                : employee.name.substring(0, 2);

            return {
                id: employee._id,
                name: employee.name,
                email: employee.email,
                avatar: avatar.toUpperCase(),
                leadsAssigned,
                leadsConverted,
                conversionRate: `${conversionRate}%`,
                performance
            };
        });

        // Sort by leads assigned (descending)
        teamMembersData.sort((a, b) => b.leadsAssigned - a.leadsAssigned);

        // Take top 4 team members
        setTeamMembers(teamMembersData.slice(0, 4));
    };

    // Process recent activities
    const processRecentActivities = (leadsData, employeesData) => {
        const activities = [];

        // Process lead status changes
        leadsData.forEach(lead => {
            if (lead.status === 'Converted' || lead.status === 'Closed' || lead.status === 'Won') {
                // Find the employee who converted the lead
                const employee = employeesData.find(emp =>
                    lead.assignedEmployee &&
                    (typeof lead.assignedEmployee === 'object'
                        ? lead.assignedEmployee._id === emp._id
                        : lead.assignedEmployee === emp._id)
                );

                if (employee && lead.updatedAt) {
                    activities.push({
                        id: `convert-${lead._id}`,
                        type: 'conversion',
                        message: `${employee.name} converted ${lead.name || 'a lead'}`,
                        timestamp: new Date(lead.updatedAt),
                        iconBg: 'bg-indigo-100',
                        icon: <CheckCircle size={16} className="text-indigo-600" />
                    });
                }
            }
        });

        // Process lead assignments
        leadsData.forEach(lead => {
            if (lead.assignedEmployee && lead.createdAt) {
                // Find the employee who was assigned the lead
                const employee = employeesData.find(emp =>
                    typeof lead.assignedEmployee === 'object'
                        ? lead.assignedEmployee._id === emp._id
                        : lead.assignedEmployee === emp._id
                );

                if (employee) {
                    activities.push({
                        id: `assign-${lead._id}`,
                        type: 'assignment',
                        message: `New lead ${lead.name || 'unnamed'} assigned to ${employee.name}`,
                        timestamp: new Date(lead.createdAt),
                        iconBg: 'bg-blue-100',
                        icon: <UserPlus size={16} className="text-blue-600" />
                    });
                }
            }
        });

        // Sort activities by timestamp (most recent first)
        activities.sort((a, b) => b.timestamp - a.timestamp);

        // Take the 3 most recent activities
        setRecentActivities(activities.slice(0, 3));
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-2 md:space-y-0">
                <h1 className="text-2xl font-semibold text-gray-800">Manager Dashboard</h1>
                <div className="flex items-center space-x-4">
                    <div className="text-sm text-gray-500">
                        <Clock size={16} className="inline mr-1" />
                        {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                    </div>
                    <button
                        onClick={() => fetchDashboardData()}
                        disabled={isLoading}
                        className={`px-3 py-1 rounded-md flex items-center text-sm ${
                            isLoading
                                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                : 'bg-[#022d38] text-white hover:bg-[#043c4a]'
                        }`}
                        title="Refresh data"
                    >
                        {isLoading ? (
                            <>
                                <Loader size={14} className="mr-1 animate-spin" />
                                Loading...
                            </>
                        ) : (
                            <>
                                <RefreshCw size={14} className="mr-1" />
                                Refresh
                            </>
                        )}
                    </button>
                    <div className="text-xs text-gray-500">
                        {autoRefresh ? (
                            <>Auto-refresh in {countdown}s</>
                        ) : (
                            <>Auto-refresh off</>
                        )}
                        <button
                            onClick={() => setAutoRefresh(!autoRefresh)}
                            className="ml-2 text-indigo-600 hover:text-indigo-800"
                        >
                            {autoRefresh ? 'Turn off' : 'Turn on'}
                        </button>
                    </div>
                </div>
            </div>

            {/* Error Message */}
            {error && (
                <div className="bg-red-100 border border-red-200 text-red-800 px-4 py-3 rounded-md flex items-center">
                    <AlertCircle size={20} className="mr-2" />
                    <span>{error}</span>
                    <button
                        onClick={() => fetchDashboardData()}
                        className="ml-auto px-3 py-1 bg-red-700 text-white rounded-md hover:bg-red-800 flex items-center"
                    >
                        <RefreshCw size={14} className="mr-1" />
                        Retry
                    </button>
                </div>
            )}

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {isLoading ? (
                    // Loading skeleton for stats cards
                    <>
                        {[1, 2, 3, 4].map(i => (
                            <div key={i} className="bg-white rounded-lg shadow-md border border-gray-100 p-4 animate-pulse">
                                <div className="flex items-center justify-between mb-3">
                                    <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                                    <div className="h-8 w-8 bg-gray-200 rounded-md"></div>
                                </div>
                                <div className="flex items-end justify-between">
                                    <div>
                                        <div className="h-8 bg-gray-200 rounded w-16 mb-1"></div>
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
                            trendType={dashboardStats.trends.totalLeadsTrend.includes('+') ? 'increase' : 'decrease'}
                            bgColor="bg-indigo-100"
                            iconColor="text-indigo-600"
                        />
                        <StatsCard
                            title="Converted Leads"
                            value={dashboardStats.convertedLeads.toString()}
                            icon={<CheckCircle size={20} className="text-emerald-600" />}
                            trend={dashboardStats.trends.convertedLeadsTrend}
                            trendType={dashboardStats.trends.convertedLeadsTrend.includes('+') ? 'increase' : 'decrease'}
                            bgColor="bg-emerald-100"
                            iconColor="text-emerald-600"
                        />
                        <StatsCard
                            title="Lost Leads"
                            value={dashboardStats.lostLeads.toString()}
                            icon={<X size={20} className="text-red-600" />}
                            trend={dashboardStats.trends.lostLeadsTrend}
                            trendType={dashboardStats.trends.lostLeadsTrend.includes('+') ? 'increase' : 'decrease'}
                            bgColor="bg-red-100"
                            iconColor="text-red-600"
                        />
                        <StatsCard
                            title="Conversion Rate"
                            value={`${dashboardStats.conversionRate}%`}
                            icon={<Activity size={20} className="text-amber-600" />}
                            trend={dashboardStats.trends.conversionRateTrend}
                            trendType={dashboardStats.trends.conversionRateTrend.includes('+') ? 'increase' : 'decrease'}
                            bgColor="bg-amber-100"
                            iconColor="text-amber-600"
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
                    ) : leadStatusData.length === 0 ? (
                        <div className="h-64 flex items-center justify-center">
                            <div className="text-center">
                                <BarChart2 size={40} className="text-gray-400 mx-auto mb-4" />
                                <p className="text-gray-500">No lead data available</p>
                                <p className="text-sm text-gray-400 mt-2">Add leads to see distribution</p>
                            </div>
                        </div>
                    ) : (
                        <div className="h-64">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={leadStatusData}
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
                    <Link to="/manager-panel/employees" className="text-sm text-indigo-600 hover:text-indigo-900">
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
                                        Leads Assigned
                                    </th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Leads Converted
                                    </th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Conversion Rate
                                    </th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Performance
                                    </th>
                                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {teamMembers.map((member) => (
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
                    <Link to="/manager-panel/performance" className="text-sm font-medium text-indigo-600 hover:text-indigo-900">
                        View all activity
                    </Link>
                </div>
            </div>
        </div>
    );
}
