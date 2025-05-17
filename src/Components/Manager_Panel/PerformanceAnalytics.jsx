import { useState, useEffect } from 'react';
import {
    Activity, Search, Filter, Calendar, Clock,
    AlertCircle, CheckCircle, User, MessageSquare,
    Phone, Mail, ArrowRight, BarChart2, RefreshCw,
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
            // Try to use the performance API endpoints first
            try {
                console.log('Fetching performance data with dateRange:', dateRange);

                // Get employee performance data
                try {
                    const performanceResponse = await enhancedAPI.performance.getEmployeePerformance(dateRange);
                    console.log('Employee performance response:', performanceResponse);

                    // Get lead status distribution
                    const statusResponse = await enhancedAPI.performance.getLeadStatusDistribution(dateRange);
                    console.log('Lead status distribution response:', statusResponse);

                    // Get conversion trend data
                    const trendResponse = await enhancedAPI.performance.getConversionTrend(7); // Last 7 days
                    console.log('Conversion trend response:', trendResponse);

                    // Check if we have valid responses
                    const hasValidPerformanceData = performanceResponse?.data?.success &&
                                                  Array.isArray(performanceResponse.data.data) &&
                                                  performanceResponse.data.data.length > 0;

                    const hasValidStatusData = statusResponse?.data?.success &&
                                             Array.isArray(statusResponse.data.data) &&
                                             statusResponse.data.data.length > 0;

                    const hasValidTrendData = trendResponse?.data?.success &&
                                            Array.isArray(trendResponse.data.data) &&
                                            trendResponse.data.data.length > 0;

                    console.log('Data validation:', {
                        hasValidPerformanceData,
                        hasValidStatusData,
                        hasValidTrendData
                    });

                    if (hasValidPerformanceData && hasValidStatusData && hasValidTrendData) {
                        // Set employees for the filter dropdown
                        const employeesData = performanceResponse.data.data;
                        setEmployees(employeesData.map(emp => ({
                            _id: emp.id,
                            name: emp.name,
                            email: emp.email
                        })));

                        // Set performance data
                        setPerformanceData(performanceResponse.data.data);

                        // Set summary metrics
                        setSummaryMetrics(performanceResponse.data.summaryMetrics);

                        // Set chart data
                        setLeadStatusData(statusResponse.data.data);
                        setConversionTrendData(trendResponse.data.data);
                        setEmployeePerformanceData(performanceResponse.data.data);

                        setIsLoading(false);
                        toast.success('Performance data loaded successfully');
                        return;
                    } else {
                        // If we have some data but not all, use what we have
                        if (hasValidPerformanceData) {
                            const employeesData = performanceResponse.data.data;
                            setEmployees(employeesData.map(emp => ({
                                _id: emp.id,
                                name: emp.name,
                                email: emp.email
                            })));
                            setPerformanceData(performanceResponse.data.data);
                            setEmployeePerformanceData(performanceResponse.data.data);

                            if (performanceResponse.data.summaryMetrics) {
                                setSummaryMetrics(performanceResponse.data.summaryMetrics);
                            }
                        }

                        if (hasValidStatusData) {
                            setLeadStatusData(statusResponse.data.data);
                        }

                        if (hasValidTrendData) {
                            setConversionTrendData(trendResponse.data.data);
                        }

                        // If we have at least some data, don't throw an error
                        if (hasValidPerformanceData || hasValidStatusData || hasValidTrendData) {
                            console.warn('Partial data available, using what we have');
                            toast.warning('Some performance data could not be loaded');
                            setIsLoading(false);
                            return;
                        }

                        console.warn('No valid data in API responses, generating mock data');
                        toast.info('Using mock data for demonstration purposes');
                        generateMockData();
                        setIsLoading(false);
                        return;
                    }
                } catch (endpointError) {
                    console.error('Error calling specific performance endpoint:', endpointError);
                    throw endpointError;
                }
            } catch (apiError) {
                console.error('Error using performance API, falling back to client-side processing:', apiError);
                toast.warning('Performance API unavailable, using client-side processing instead');
            }

            // Fallback: Get data and process it on the client side
            // Get employees
            const employeesResponse = await enhancedAPI.users.getByRole('employee');

            // Get all leads
            const leadsResponse = await enhancedAPI.leads.getAll();

            if (employeesResponse?.data?.data && leadsResponse?.data?.data) {
                const employeesData = employeesResponse.data.data;
                const leadsData = leadsResponse.data.data;

                setEmployees(employeesData);
                setLeads(leadsData);

                // Process data for performance metrics
                processPerformanceData(employeesData, leadsData);
                toast.info('Using client-side data processing (performance API not available)');
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

    // Process data for performance metrics
    const processPerformanceData = (employeesData, leadsData) => {
        // Calculate lead status distribution
        const statusCounts = {};
        leadsData.forEach(lead => {
            const status = lead.status || 'Unknown';
            statusCounts[status] = (statusCounts[status] || 0) + 1;
        });

        const statusChartData = Object.keys(statusCounts).map(status => ({
            name: status,
            value: statusCounts[status]
        }));
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
                lead.status === 'Contacted' || lead.status === 'Qualified' ||
                lead.status === 'Converted' || lead.status === 'Closed'
            ).length;
            const leadsConverted = employeeLeads.filter(lead =>
                lead.status === 'Converted' || lead.status === 'Closed'
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
            lead.status === 'Converted' || lead.status === 'Closed'
        ).length;
        const conversionRate = assignedLeads > 0
            ? Math.round((convertedLeads / assignedLeads) * 100)
            : 0;

        setSummaryMetrics({
            totalLeads,
            assignedLeads,
            convertedLeads,
            conversionRate,
            avgResponseTime: 24 // Mock data in hours
        });

        // Generate mock conversion trend data (would be from real historical data)
        const trendData = [];
        const today = new Date();
        for (let i = 6; i >= 0; i--) {
            const date = new Date(today);
            date.setDate(date.getDate() - i);
            trendData.push({
                date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
                conversions: Math.floor(Math.random() * 5) + 1,
                leads: Math.floor(Math.random() * 10) + 5
            });
        }
        setConversionTrendData(trendData);

        // Set performance data for the table
        setPerformanceData(employeePerformance);
    };

    // Generate mock data for demonstration purposes
    const generateMockData = () => {
        // Generate mock employees
        const mockEmployees = [
            { _id: 'emp1', id: 'emp1', name: 'John Smith', email: 'john@example.com' },
            { _id: 'emp2', id: 'emp2', name: 'Sarah Johnson', email: 'sarah@example.com' },
            { _id: 'emp3', id: 'emp3', name: 'Michael Brown', email: 'michael@example.com' },
            { _id: 'emp4', id: 'emp4', name: 'Emily Davis', email: 'emily@example.com' },
            { _id: 'emp5', id: 'emp5', name: 'Robert Wilson', email: 'robert@example.com' }
        ];

        // Generate mock performance data
        const mockPerformanceData = mockEmployees.map(emp => ({
            id: emp.id,
            name: emp.name,
            email: emp.email,
            leadsAssigned: Math.floor(Math.random() * 30) + 10,
            leadsContacted: Math.floor(Math.random() * 20) + 5,
            leadsConverted: Math.floor(Math.random() * 10) + 1,
            conversionRate: Math.floor(Math.random() * 50) + 10
        }));

        // Generate mock lead status data
        const mockLeadStatusData = [
            { name: 'New', value: 35 },
            { name: 'Contacted', value: 25 },
            { name: 'Qualified', value: 15 },
            { name: 'Proposal', value: 10 },
            { name: 'Negotiation', value: 8 },
            { name: 'Closed', value: 5 },
            { name: 'Lost', value: 2 }
        ];

        // Generate mock conversion trend data
        const mockTrendData = [];
        const today = new Date();
        for (let i = 6; i >= 0; i--) {
            const date = new Date(today);
            date.setDate(date.getDate() - i);
            mockTrendData.push({
                date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
                conversions: Math.floor(Math.random() * 5) + 1,
                leads: Math.floor(Math.random() * 10) + 5
            });
        }

        // Generate mock summary metrics
        const mockSummaryMetrics = {
            totalLeads: 100,
            assignedLeads: 80,
            convertedLeads: 25,
            conversionRate: 31,
            avgResponseTime: 24
        };

        // Set the mock data
        setEmployees(mockEmployees);
        setPerformanceData(mockPerformanceData);
        setEmployeePerformanceData(mockPerformanceData);
        setLeadStatusData(mockLeadStatusData);
        setConversionTrendData(mockTrendData);
        setSummaryMetrics(mockSummaryMetrics);
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
                    <button
                        onClick={generateMockData}
                        disabled={isLoading}
                        className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 flex items-center"
                        title="Use demo data"
                    >
                        <BarChart2 size={16} className="mr-2" />
                        Demo Data
                    </button>
                </div>
            </div>

            {/* Error Message */}
            {error && (
                <div className="bg-red-100 border border-red-200 text-red-800 px-4 py-3 rounded-md flex items-center">
                    <AlertCircle size={20} className="mr-2" />
                    <span>{error}</span>
                    <div className="ml-auto flex space-x-2">
                        <button
                            onClick={generateMockData}
                            className="px-3 py-1 bg-blue-500 text-white rounded-md hover:bg-blue-600 flex items-center"
                            title="Use mock data for demonstration"
                        >
                            <BarChart2 size={16} className="mr-1" />
                            Use Demo Data
                        </button>
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
                                            {leadStatusData.map((entry, index) => (
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
