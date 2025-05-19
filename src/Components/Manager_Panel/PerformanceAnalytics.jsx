import { useState, useEffect } from 'react';
import {
    Activity, Search, Filter, Calendar, Clock,
    AlertCircle, CheckCircle, User, MessageSquare,
    Phone, Mail, ArrowRight, RefreshCw,
    Loader, UserPlus, Users, PieChart, TrendingUp,
    TrendingDown, Percent, DollarSign
} from 'lucide-react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import { enhancedAPI } from '../../services/enhancedAPI';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
    Legend, ResponsiveContainer, PieChart as RechartsPieChart,
    Pie, Cell, LineChart, Line
} from 'recharts';

// Colors for charts
const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

export default function PerformanceAnalytics() {
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [dateRange, setDateRange] = useState('last-30-days');
    const [employeeFilter, setEmployeeFilter] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');

    // Data states
    const [employees, setEmployees] = useState([]);
    const [leads, setLeads] = useState([]);
    const [performanceData, setPerformanceData] = useState([]);
    const [summaryMetrics, setSummaryMetrics] = useState({
        totalLeads: 0,
        assignedLeads: 0,
        convertedLeads: 0,
        conversionRate: 0,
        avgResponseTime: 0
    });

    // Chart data states
    const [leadStatusData, setLeadStatusData] = useState([]);
    const [employeePerformanceData, setEmployeePerformanceData] = useState([]);
    const [conversionTrendData, setConversionTrendData] = useState([]);

    // Fetch data on component mount
    useEffect(() => {
        fetchData();
    }, [dateRange]);

    // Fetch all required data
    const fetchData = async () => {
        setIsLoading(true);
        setError(null);

        try {
            console.log('Fetching performance data with dateRange:', dateRange);

            // Get employees data
            const employeesResponse = await enhancedAPI.users.getByRole('employee');
            console.log('Employees response:', employeesResponse);

            // Get all leads with a high limit to ensure we get all data
            const leadsResponse = await enhancedAPI.leads.getAll({ limit: 1000 });
            console.log('Leads response:', leadsResponse);

            if (employeesResponse?.data && leadsResponse?.data) {
                const employeesData = employeesResponse.data;
                const leadsData = leadsResponse.data;

                // Store the raw data
                setEmployees(employeesData);
                setLeads(leadsData);

                // Process data for performance metrics
                processPerformanceData(employeesData, leadsData);
                toast.success('Performance data loaded successfully');
            } else {
                setError('Failed to fetch data from the server');
                toast.error('Failed to load performance data');
            }
        } catch (error) {
            console.error('Error fetching performance data:', error);
            setError('Error fetching performance data. Please try again.');
            toast.error('Error loading performance data: ' + (error.message || 'Unknown error'));
        } finally {
            setIsLoading(false);
        }
    };

    // Process data for performance metrics based on real database data
    const processPerformanceData = (employeesData, leadsData) => {
        // Calculate lead status distribution
        const statusCounts = {};
        leadsData.forEach(lead => {
            // Handle different status values that might be in the database
            let status = lead.status || 'Unknown';

            // Normalize status values for better visualization
            if (status === 'New Lead' || status === 'New') status = 'New';
            if (status === 'Contact Made' || status === 'Contacted') status = 'Contacted';
            if (status === 'Qualified' || status === 'In Progress' || status === 'Negotiation') status = 'In Progress';
            if (status === 'Converted' || status === 'Closed' || status === 'Won') status = 'Converted';
            if (status === 'Lost' || status === 'Rejected') status = 'Lost';

            statusCounts[status] = (statusCounts[status] || 0) + 1;
        });

        const statusChartData = Object.keys(statusCounts).map(status => ({
            name: status,
            value: statusCounts[status]
        }));

        // Sort by status progression
        const statusOrder = {
            'New': 1,
            'Contacted': 2,
            'In Progress': 3,
            'Converted': 4,
            'Lost': 5,
            'Unknown': 6
        };

        statusChartData.sort((a, b) => {
            return (statusOrder[a.name] || 999) - (statusOrder[b.name] || 999);
        });

        setLeadStatusData(statusChartData);

        // Calculate employee performance
        const employeePerformance = employeesData.map(employee => {
            // Filter leads assigned to this employee
            const employeeLeads = leadsData.filter(lead =>
                lead.assignedEmployee &&
                (typeof lead.assignedEmployee === 'object'
                    ? lead.assignedEmployee._id === employee._id
                    : lead.assignedEmployee === employee._id)
            );

            // Count leads by status
            const leadsAssigned = employeeLeads.length;
            const leadsContacted = employeeLeads.filter(lead =>
                lead.status === 'Contacted' || lead.status === 'Contact Made' ||
                lead.status === 'Qualified' || lead.status === 'In Progress' ||
                lead.status === 'Negotiation' || lead.status === 'Converted' ||
                lead.status === 'Closed' || lead.status === 'Won'
            ).length;

            const leadsConverted = employeeLeads.filter(lead =>
                lead.status === 'Converted' || lead.status === 'Closed' || lead.status === 'Won'
            ).length;

            // Calculate conversion rate
            const conversionRate = leadsAssigned > 0
                ? Math.round((leadsConverted / leadsAssigned) * 100)
                : 0;

            return {
                id: employee._id,
                name: employee.name,
                email: employee.email,
                leadsAssigned,
                leadsContacted,
                leadsConverted,
                conversionRate
            };
        });

        // Sort by leads assigned (descending)
        employeePerformance.sort((a, b) => b.leadsAssigned - a.leadsAssigned);
        setEmployeePerformanceData(employeePerformance);

        // Calculate summary metrics
        const totalLeads = leadsData.length;
        const assignedLeads = leadsData.filter(lead => lead.assignedEmployee).length;
        const convertedLeads = leadsData.filter(lead =>
            lead.status === 'Converted' || lead.status === 'Closed' || lead.status === 'Won'
        ).length;
        const conversionRate = assignedLeads > 0
            ? Math.round((convertedLeads / assignedLeads) * 100)
            : 0;

        // Calculate average response time based on lead timestamps
        let totalResponseTime = 0;
        let leadsWithResponseTime = 0;

        leadsData.forEach(lead => {
            if (lead.createdAt && lead.updatedAt && lead.status !== 'New') {
                const createdDate = new Date(lead.createdAt);
                const updatedDate = new Date(lead.updatedAt);
                const responseTimeHours = Math.round((updatedDate - createdDate) / (1000 * 60 * 60));

                if (responseTimeHours > 0 && responseTimeHours < 720) { // Filter out unreasonable values (>30 days)
                    totalResponseTime += responseTimeHours;
                    leadsWithResponseTime++;
                }
            }
        });

        const avgResponseTime = leadsWithResponseTime > 0
            ? Math.round(totalResponseTime / leadsWithResponseTime)
            : 24; // Default if no data

        setSummaryMetrics({
            totalLeads,
            assignedLeads,
            convertedLeads,
            conversionRate,
            avgResponseTime
        });

        // Generate conversion trend data from actual lead data
        const trendData = [];
        const today = new Date();

        // Create a map of dates to track leads and conversions
        const dateMap = {};

        // Initialize the last 7 days in the map
        for (let i = 6; i >= 0; i--) {
            const date = new Date(today);
            date.setDate(date.getDate() - i);
            const dateString = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
            dateMap[dateString] = { date: dateString, leads: 0, conversions: 0 };
        }

        // Count leads and conversions by date
        leadsData.forEach(lead => {
            if (lead.createdAt) {
                const createdDate = new Date(lead.createdAt);
                // Only consider leads from the last 7 days
                const daysDiff = Math.floor((today - createdDate) / (1000 * 60 * 60 * 24));

                if (daysDiff >= 0 && daysDiff <= 6) {
                    const dateString = createdDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

                    if (dateMap[dateString]) {
                        dateMap[dateString].leads++;

                        // Count as conversion if the lead was converted on the same day
                        if (lead.status === 'Converted' || lead.status === 'Closed' || lead.status === 'Won') {
                            const updatedDate = lead.updatedAt ? new Date(lead.updatedAt) : null;
                            const updatedDateString = updatedDate ?
                                updatedDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) :
                                dateString;

                            if (dateMap[updatedDateString]) {
                                dateMap[updatedDateString].conversions++;
                            }
                        }
                    }
                }
            }
        });

        // Convert the map to an array and sort by date
        Object.values(dateMap).forEach(item => {
            trendData.push(item);
        });

        // Sort by date
        trendData.sort((a, b) => {
            const dateA = new Date(a.date);
            const dateB = new Date(b.date);
            return dateA - dateB;
        });

        setConversionTrendData(trendData);

        // Set performance data for the table
        setPerformanceData(employeePerformance);
    };

    // Filter performance data based on search and filters
    const filteredPerformanceData = performanceData.filter(employee => {
        // Apply employee filter
        if (employeeFilter !== 'all' && employee.id !== employeeFilter) {
            return false;
        }

        // Apply search filter
        if (searchQuery && !employee.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
            !employee.email.toLowerCase().includes(searchQuery.toLowerCase())) {
            return false;
        }

        return true;
    });

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
                <h1 className="text-2xl font-semibold text-gray-800">Performance Analytics</h1>
                <div className="flex items-center space-x-3">
                    <select
                        className="border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#022d38] focus:border-[#022d38] py-2 px-3"
                        value={dateRange}
                        onChange={(e) => setDateRange(e.target.value)}
                    >
                        <option value="last-7-days">Last 7 Days</option>
                        <option value="last-30-days">Last 30 Days</option>
                        <option value="last-90-days">Last 90 Days</option>
                        <option value="year-to-date">Year to Date</option>
                    </select>
                    <button
                        onClick={fetchData}
                        disabled={isLoading}
                        className={`px-4 py-2 rounded-md flex items-center ${
                            isLoading
                                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                : 'bg-[#022d38] text-white hover:bg-[#043c4a]'
                        }`}
                        title="Refresh data"
                    >
                        {isLoading ? (
                            <>
                                <Loader size={16} className="mr-2 animate-spin" />
                                Loading...
                            </>
                        ) : (
                            <>
                                <RefreshCw size={16} className="mr-2" />
                                Refresh
                            </>
                        )}
                    </button>

                </div>
            </div>

            {/* Error Message */}
            {error && (
                <div className="bg-red-100 border border-red-200 text-red-800 px-4 py-3 rounded-md flex items-center">
                    <AlertCircle size={20} className="mr-2" />
                    <span>{error}</span>
                    <div className="ml-auto">
                        <button
                            onClick={fetchData}
                            className="px-3 py-1 bg-red-700 text-white rounded-md hover:bg-red-800 flex items-center"
                            title="Try again"
                        >
                            <RefreshCw size={16} className="mr-1" />
                            Retry
                        </button>
                    </div>
                </div>
            )}

            {/* Loading State */}
            {isLoading ? (
                <div className="flex flex-col items-center justify-center min-h-[60vh] p-6">
                    <Loader className="w-12 h-12 text-[#022d38] animate-spin mb-4" />
                    <h2 className="text-xl font-semibold text-gray-700">Loading Performance Data...</h2>
                    <p className="text-gray-500 mt-2">Please wait while we fetch the latest performance metrics</p>
                </div>
            ) : (
                <>
                    {/* Summary Metrics */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
                        <div className="bg-white rounded-lg shadow-md border border-gray-100 p-4">
                            <div className="flex items-center justify-between mb-3">
                                <h3 className="text-gray-600 text-sm font-medium">Total Leads</h3>
                                <div className="p-2 rounded-md bg-indigo-100">
                                    <UserPlus size={20} className="text-indigo-600" />
                                </div>
                            </div>
                            <p className="text-2xl font-bold text-gray-800">{summaryMetrics.totalLeads}</p>
                        </div>
                        <div className="bg-white rounded-lg shadow-md border border-gray-100 p-4">
                            <div className="flex items-center justify-between mb-3">
                                <h3 className="text-gray-600 text-sm font-medium">Assigned Leads</h3>
                                <div className="p-2 rounded-md bg-blue-100">
                                    <Users size={20} className="text-blue-600" />
                                </div>
                            </div>
                            <p className="text-2xl font-bold text-gray-800">{summaryMetrics.assignedLeads}</p>
                        </div>
                        <div className="bg-white rounded-lg shadow-md border border-gray-100 p-4">
                            <div className="flex items-center justify-between mb-3">
                                <h3 className="text-gray-600 text-sm font-medium">Converted Leads</h3>
                                <div className="p-2 rounded-md bg-emerald-100">
                                    <CheckCircle size={20} className="text-emerald-600" />
                                </div>
                            </div>
                            <p className="text-2xl font-bold text-gray-800">{summaryMetrics.convertedLeads}</p>
                        </div>
                        <div className="bg-white rounded-lg shadow-md border border-gray-100 p-4">
                            <div className="flex items-center justify-between mb-3">
                                <h3 className="text-gray-600 text-sm font-medium">Conversion Rate</h3>
                                <div className="p-2 rounded-md bg-amber-100">
                                    <Percent size={20} className="text-amber-600" />
                                </div>
                            </div>
                            <p className="text-2xl font-bold text-gray-800">{summaryMetrics.conversionRate}%</p>
                        </div>
                        <div className="bg-white rounded-lg shadow-md border border-gray-100 p-4">
                            <div className="flex items-center justify-between mb-3">
                                <h3 className="text-gray-600 text-sm font-medium">Avg Response Time</h3>
                                <div className="p-2 rounded-md bg-purple-100">
                                    <Clock size={20} className="text-purple-600" />
                                </div>
                            </div>
                            <p className="text-2xl font-bold text-gray-800">{summaryMetrics.avgResponseTime}h</p>
                        </div>
                    </div>

                    {/* Charts Section */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Lead Status Distribution */}
                        <div className="bg-white rounded-lg shadow p-6">
                            <h2 className="text-lg font-medium text-gray-800 mb-4">Lead Status Distribution</h2>
                            <div className="h-64">
                                <ResponsiveContainer width="100%" height="100%">
                                    <RechartsPieChart>
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
                                        <Tooltip />
                                    </RechartsPieChart>
                                </ResponsiveContainer>
                            </div>
                        </div>

                        {/* Conversion Trend */}
                        <div className="bg-white rounded-lg shadow p-6">
                            <h2 className="text-lg font-medium text-gray-800 mb-4">Conversion Trend</h2>
                            <div className="h-64">
                                <ResponsiveContainer width="100%" height="100%">
                                    <LineChart
                                        data={conversionTrendData}
                                        margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                                    >
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis dataKey="date" />
                                        <YAxis />
                                        <Tooltip />
                                        <Legend />
                                        <Line type="monotone" dataKey="leads" stroke="#8884d8" name="Leads" />
                                        <Line type="monotone" dataKey="conversions" stroke="#82ca9d" name="Conversions" />
                                    </LineChart>
                                </ResponsiveContainer>
                            </div>
                        </div>

                        {/* Employee Performance Chart */}
                        <div className="bg-white rounded-lg shadow p-6 lg:col-span-2">
                            <h2 className="text-lg font-medium text-gray-800 mb-4">Employee Performance</h2>
                            <div className="h-80">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart
                                        data={employeePerformanceData.slice(0, 5)} // Show top 5 employees
                                        margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                                    >
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis dataKey="name" />
                                        <YAxis />
                                        <Tooltip />
                                        <Legend />
                                        <Bar dataKey="leadsAssigned" fill="#8884d8" name="Leads Assigned" />
                                        <Bar dataKey="leadsContacted" fill="#82ca9d" name="Leads Contacted" />
                                        <Bar dataKey="leadsConverted" fill="#ffc658" name="Leads Converted" />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    </div>

                    {/* Filters and Search */}
                    <div className="bg-white rounded-lg shadow p-4">
                        <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
                            <div className="flex flex-wrap items-center gap-4">
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <Search size={18} className="text-gray-400" />
                                    </div>
                                    <input
                                        type="text"
                                        placeholder="Search employees..."
                                        className="pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#022d38] focus:border-[#022d38]"
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                    />
                                </div>
                                <div className="flex items-center space-x-2">
                                    <User size={18} className="text-gray-400" />
                                    <select
                                        className="border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#022d38] focus:border-[#022d38] py-2 px-3"
                                        value={employeeFilter}
                                        onChange={(e) => setEmployeeFilter(e.target.value)}
                                    >
                                        <option value="all">All Employees</option>
                                        {employees.map(employee => (
                                            <option key={employee._id} value={employee._id}>
                                                {employee.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Employee Performance Table */}
                    <div className="bg-white rounded-lg shadow overflow-hidden">
                        <div className="px-6 py-4 border-b border-gray-200">
                            <h2 className="text-lg font-medium text-gray-800">Employee Performance Details</h2>
                        </div>
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
                                            Leads Contacted
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
                                    {filteredPerformanceData.length === 0 ? (
                                        <tr>
                                            <td colSpan="5" className="px-6 py-4 text-center text-sm text-gray-500">
                                                No employee data found matching your criteria
                                            </td>
                                        </tr>
                                    ) : (
                                        filteredPerformanceData.map(employee => (
                                            <tr key={employee.id} className="hover:bg-gray-50">
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="flex items-center">
                                                        <div className="flex-shrink-0 h-10 w-10 rounded-full bg-[#022d38] flex items-center justify-center text-white">
                                                            {employee.name.charAt(0)}
                                                        </div>
                                                        <div className="ml-4">
                                                            <div className="text-sm font-medium text-gray-900">{employee.name}</div>
                                                            <div className="text-sm text-gray-500">{employee.email}</div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                    {employee.leadsAssigned}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                    {employee.leadsContacted}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                    {employee.leadsConverted}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                                        employee.conversionRate >= 50 ? 'bg-green-100 text-green-800' :
                                                        employee.conversionRate >= 30 ? 'bg-blue-100 text-blue-800' :
                                                        employee.conversionRate >= 10 ? 'bg-yellow-100 text-yellow-800' :
                                                        'bg-red-100 text-red-800'
                                                    }`}>
                                                        {employee.conversionRate}%
                                                    </span>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}
