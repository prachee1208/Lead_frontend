import { useState, useEffect } from 'react';
import {
    FileText, Download, Calendar, Filter,
    BarChart2, PieChart, TrendingUp, Users,
    RefreshCw, Printer, Mail, Share2,
    AlertCircle, Loader, ArrowUpRight, ArrowDownRight
} from 'lucide-react';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
    LineChart, Line, PieChart as RechartsPieChart, Pie, Cell, Area, AreaChart
} from 'recharts';
import { toast } from 'react-toastify';
import { reportAPI } from '../../services/reportAPI';

export default function ReportsEnhanced() {
    // State for report configuration
    const [reportType, setReportType] = useState('employee-performance');
    const [dateRange, setDateRange] = useState('last-30-days');
    const [isGeneratingReport, setIsGeneratingReport] = useState(false);
    const [showReport, setShowReport] = useState(false);

    // State for report data
    const [employeePerformanceData, setEmployeePerformanceData] = useState([]);
    const [leadStatusData, setLeadStatusData] = useState([]);
    const [leadSourceData, setLeadSourceData] = useState([]);
    const [conversionTrendData, setConversionTrendData] = useState([]);

    // State for loading and errors
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    // Colors for pie charts
    const COLORS = ['#6366f1', '#f59e0b', '#10b981', '#3b82f6', '#ef4444', '#8b5cf6', '#ec4899'];

    // Fetch data based on report type
    const fetchReportData = async () => {
        setIsGeneratingReport(true);
        setError(null);

        try {
            // Fetch data based on report type
            if (reportType === 'employee-performance' || reportType === 'all') {
                const employeeData = await reportAPI.getEmployeePerformance(dateRange);
                setEmployeePerformanceData(employeeData.data);
            }

            if (reportType === 'lead-status' || reportType === 'all') {
                const statusData = await reportAPI.getLeadStatusDistribution(dateRange);
                setLeadStatusData(statusData.data);

                const sourceData = await reportAPI.getLeadSourceDistribution(dateRange);
                setLeadSourceData(sourceData.data);
            }

            if (reportType === 'conversion-rate' || reportType === 'all') {
                const trendData = await reportAPI.getConversionTrend(dateRange);
                setConversionTrendData(trendData.data);
            }

            setShowReport(true);
            toast.success('Report generated successfully');
        } catch (err) {
            console.error('Error generating report:', err);
            setError('Failed to generate report. Please try again.');
            toast.error('Failed to generate report: ' + (err.message || 'Unknown error'));

            // Use mock data if API fails
            setMockData();
        } finally {
            setIsGeneratingReport(false);
        }
    };

    // Set mock data for testing
    const setMockData = () => {
        setEmployeePerformanceData([
            { name: 'John Smith', leadsAssigned: 24, leadsConverted: 18, conversionRate: 75 },
            { name: 'Sarah Johnson', leadsAssigned: 18, leadsConverted: 10, conversionRate: 55 },
            { name: 'Michael Brown', leadsAssigned: 15, leadsConverted: 5, conversionRate: 33 },
            { name: 'Emily Davis', leadsAssigned: 20, leadsConverted: 14, conversionRate: 70 },
            { name: 'Robert Wilson', leadsAssigned: 22, leadsConverted: 9, conversionRate: 41 }
        ]);

        setLeadStatusData([
            { name: 'New', value: 45 },
            { name: 'Contacted', value: 30 },
            { name: 'Qualified', value: 15 },
            { name: 'Converted', value: 8 },
            { name: 'Lost', value: 12 }
        ]);

        setLeadSourceData([
            { name: 'Website', value: 35 },
            { name: 'Referral', value: 25 },
            { name: 'Cold Call', value: 15 },
            { name: 'Trade Show', value: 10 },
            { name: 'Email Campaign', value: 15 }
        ]);

        setConversionTrendData([
            { name: 'Week 1', leads: 25, conversions: 5 },
            { name: 'Week 2', leads: 30, conversions: 7 },
            { name: 'Week 3', leads: 22, conversions: 4 },
            { name: 'Week 4', leads: 28, conversions: 9 }
        ]);
    };

    // Handle generate report button click
    const handleGenerateReport = () => {
        fetchReportData();
    };

    // Handle download report
    const handleDownloadReport = (format) => {
        // In a real app, this would trigger a download of the report in the specified format
        toast.info(`Downloading report in ${format.toUpperCase()} format`);
    };

    // Calculate summary metrics
    const calculateSummaryMetrics = () => {
        if (employeePerformanceData.length === 0) return null;

        const totalLeadsAssigned = employeePerformanceData.reduce((sum, emp) => sum + emp.leadsAssigned, 0);
        const totalLeadsConverted = employeePerformanceData.reduce((sum, emp) => sum + emp.leadsConverted, 0);
        const avgConversionRate = totalLeadsAssigned > 0
            ? Math.round((totalLeadsConverted / totalLeadsAssigned) * 100)
            : 0;

        return {
            totalLeadsAssigned,
            totalLeadsConverted,
            avgConversionRate,
            // Mock change percentages (would be calculated from historical data)
            leadsChange: 8.5,
            conversionsChange: 12.3,
            rateChange: 3.7
        };
    };

    // Get status color for badges
    const getStatusColor = (status) => {
        switch (status) {
            case 'New':
                return 'bg-blue-100 text-blue-800';
            case 'Contacted':
                return 'bg-yellow-100 text-yellow-800';
            case 'Qualified':
                return 'bg-green-100 text-green-800';
            case 'Proposal':
                return 'bg-purple-100 text-purple-800';
            case 'Negotiation':
                return 'bg-indigo-100 text-indigo-800';
            case 'Closed':
            case 'Converted':
                return 'bg-emerald-100 text-emerald-800';
            case 'Lost':
                return 'bg-red-100 text-red-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    // Format currency
    const formatCurrency = (value) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 0
        }).format(value);
    };

    // Render report content based on type
    const renderReportContent = () => {
        switch (reportType) {
            case 'employee-performance':
                return renderEmployeePerformanceReport();
            case 'lead-status':
                return renderLeadStatusReport();
            case 'conversion-rate':
                return renderConversionRateReport();
            default:
                return <div>Select a report type to generate</div>;
        }
    };

    // Render employee performance report
    const renderEmployeePerformanceReport = () => {
        const summaryMetrics = calculateSummaryMetrics();

        if (!summaryMetrics) return <div>No data available</div>;

        return (
            <div className="space-y-6">
                <h2 className="text-xl font-semibold text-gray-800">Employee Performance Report</h2>
                <p className="text-gray-600">
                    Performance metrics for all sales team members for the selected period.
                </p>

                {/* Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-white rounded-lg shadow p-4">
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="text-sm font-medium text-gray-500">Total Leads Assigned</p>
                                <p className="text-2xl font-semibold text-gray-900 mt-1">{summaryMetrics.totalLeadsAssigned}</p>
                            </div>
                            <div className={`flex items-center ${summaryMetrics.leadsChange >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                                {summaryMetrics.leadsChange >= 0 ? (
                                    <ArrowUpRight size={16} className="mr-1" />
                                ) : (
                                    <ArrowDownRight size={16} className="mr-1" />
                                )}
                                <span>{Math.abs(summaryMetrics.leadsChange)}%</span>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-lg shadow p-4">
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="text-sm font-medium text-gray-500">Total Conversions</p>
                                <p className="text-2xl font-semibold text-gray-900 mt-1">{summaryMetrics.totalLeadsConverted}</p>
                            </div>
                            <div className={`flex items-center ${summaryMetrics.conversionsChange >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                                {summaryMetrics.conversionsChange >= 0 ? (
                                    <ArrowUpRight size={16} className="mr-1" />
                                ) : (
                                    <ArrowDownRight size={16} className="mr-1" />
                                )}
                                <span>{Math.abs(summaryMetrics.conversionsChange)}%</span>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-lg shadow p-4">
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="text-sm font-medium text-gray-500">Avg. Conversion Rate</p>
                                <p className="text-2xl font-semibold text-gray-900 mt-1">{summaryMetrics.avgConversionRate}%</p>
                            </div>
                            <div className={`flex items-center ${summaryMetrics.rateChange >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                                {summaryMetrics.rateChange >= 0 ? (
                                    <ArrowUpRight size={16} className="mr-1" />
                                ) : (
                                    <ArrowDownRight size={16} className="mr-1" />
                                )}
                                <span>{Math.abs(summaryMetrics.rateChange)}%</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow p-6">
                    <h3 className="text-lg font-medium text-gray-800 mb-4">Conversion Rate by Employee</h3>
                    <div className="h-80">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart
                                data={employeePerformanceData}
                                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                            >
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="name" />
                                <YAxis unit="%" />
                                <Tooltip formatter={(value) => [`${value}%`, 'Conversion Rate']} />
                                <Legend />
                                <Bar dataKey="conversionRate" name="Conversion Rate" fill="#6366f1" />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-200">
                        <h3 className="text-lg font-medium text-gray-800">Detailed Performance Metrics</h3>
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
                                        Leads Converted
                                    </th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Conversion Rate
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {employeePerformanceData.map((employee, index) => (
                                    <tr key={index} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                            {employee.name}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {employee.leadsAssigned}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {employee.leadsConverted}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {employee.conversionRate}%
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        );
    };

    // Render lead status report
    const renderLeadStatusReport = () => {
        return (
            <div className="space-y-6">
                <h2 className="text-xl font-semibold text-gray-800">Lead Status Report</h2>
                <p className="text-gray-600">
                    Distribution of leads by their current status in the sales pipeline.
                </p>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="bg-white rounded-lg shadow p-6">
                        <h3 className="text-lg font-medium text-gray-800 mb-4">Lead Status Distribution</h3>
                        <div className="h-80">
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

                    <div className="bg-white rounded-lg shadow p-6">
                        <h3 className="text-lg font-medium text-gray-800 mb-4">Lead Source Distribution</h3>
                        <div className="h-80">
                            <ResponsiveContainer width="100%" height="100%">
                                <RechartsPieChart>
                                    <Pie
                                        data={leadSourceData}
                                        cx="50%"
                                        cy="50%"
                                        labelLine={false}
                                        outerRadius={80}
                                        fill="#8884d8"
                                        dataKey="value"
                                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                                    >
                                        {leadSourceData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Legend />
                                    <Tooltip />
                                </RechartsPieChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-200">
                        <h3 className="text-lg font-medium text-gray-800">Lead Status Breakdown</h3>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Status
                                    </th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Count
                                    </th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Percentage
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {leadStatusData.map((status, index) => {
                                    const totalLeads = leadStatusData.reduce((sum, item) => sum + item.value, 0);
                                    const percentage = totalLeads > 0
                                        ? ((status.value / totalLeads) * 100).toFixed(1)
                                        : 0;

                                    return (
                                        <tr key={index} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(status.name)}`}>
                                                    {status.name}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {status.value}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {percentage}%
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-200">
                        <h3 className="text-lg font-medium text-gray-800">Lead Source Breakdown</h3>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Source
                                    </th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Count
                                    </th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Percentage
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {leadSourceData.map((source, index) => {
                                    const totalLeads = leadSourceData.reduce((sum, item) => sum + item.value, 0);
                                    const percentage = totalLeads > 0
                                        ? ((source.value / totalLeads) * 100).toFixed(1)
                                        : 0;

                                    return (
                                        <tr key={index} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                                {source.name}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {source.value}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {percentage}%
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        );
    };

    // Render conversion rate report
    const renderConversionRateReport = () => {
        return (
            <div className="space-y-6">
                <h2 className="text-xl font-semibold text-gray-800">Conversion Rate Report</h2>
                <p className="text-gray-600">
                    Analysis of lead conversion rates over time.
                </p>

                <div className="bg-white rounded-lg shadow p-6">
                    <h3 className="text-lg font-medium text-gray-800 mb-4">Weekly Conversion Trend</h3>
                    <div className="h-80">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart
                                data={conversionTrendData}
                                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                            >
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="name" />
                                <YAxis />
                                <Tooltip />
                                <Legend />
                                <Line type="monotone" dataKey="leads" name="Total Leads" stroke="#3b82f6" activeDot={{ r: 8 }} />
                                <Line type="monotone" dataKey="conversions" name="Conversions" stroke="#10b981" />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow p-6">
                    <h3 className="text-lg font-medium text-gray-800 mb-4">Conversion Rate Trend</h3>
                    <div className="h-80">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart
                                data={conversionTrendData.map(item => ({
                                    name: item.name,
                                    rate: item.leads > 0 ? (item.conversions / item.leads) * 100 : 0
                                }))}
                                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                            >
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="name" />
                                <YAxis unit="%" />
                                <Tooltip formatter={(value) => [`${value.toFixed(1)}%`, 'Conversion Rate']} />
                                <Legend />
                                <Area type="monotone" dataKey="rate" name="Conversion Rate" stroke="#6366f1" fill="#6366f1" fillOpacity={0.2} />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-200">
                        <h3 className="text-lg font-medium text-gray-800">Weekly Conversion Data</h3>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Week
                                    </th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Total Leads
                                    </th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Conversions
                                    </th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Conversion Rate
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {conversionTrendData.map((week, index) => {
                                    const rate = week.leads > 0
                                        ? ((week.conversions / week.leads) * 100).toFixed(1)
                                        : 0;

                                    return (
                                        <tr key={index} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                                {week.name}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {week.leads}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {week.conversions}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {rate}%
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        );
    };

    // Main component render
    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-semibold text-gray-800">Reports</h1>
                {showReport && (
                    <div className="flex items-center space-x-2">
                        <div className="relative">
                            <button
                                className="px-4 py-2 bg-[#022d38] text-white rounded-md hover:bg-[#043c4a] flex items-center"
                                onClick={() => document.getElementById('download-menu').classList.toggle('hidden')}
                            >
                                <Download size={16} className="mr-2" />
                                Download
                            </button>
                            <div
                                id="download-menu"
                                className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-10 hidden"
                            >
                                <button
                                    onClick={() => handleDownloadReport('pdf')}
                                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                >
                                    PDF Document
                                </button>
                                <button
                                    onClick={() => handleDownloadReport('csv')}
                                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                >
                                    CSV Spreadsheet
                                </button>
                                <button
                                    onClick={() => handleDownloadReport('xlsx')}
                                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                >
                                    Excel Spreadsheet
                                </button>
                            </div>
                        </div>
                        <button
                            className="p-2 text-gray-500 hover:text-gray-700 rounded-md hover:bg-gray-100"
                            title="Print Report"
                            onClick={() => window.print()}
                        >
                            <Printer size={20} />
                        </button>
                        <button
                            className="p-2 text-gray-500 hover:text-gray-700 rounded-md hover:bg-gray-100"
                            title="Email Report"
                            onClick={() => toast.info('Email functionality will be implemented soon')}
                        >
                            <Mail size={20} />
                        </button>
                        <button
                            className="p-2 text-gray-500 hover:text-gray-700 rounded-md hover:bg-gray-100"
                            title="Share Report"
                            onClick={() => toast.info('Share functionality will be implemented soon')}
                        >
                            <Share2 size={20} />
                        </button>
                    </div>
                )}
            </div>

            {/* Error Message */}
            {error && (
                <div className="bg-red-100 border border-red-200 text-red-800 px-4 py-3 rounded-md flex items-center">
                    <AlertCircle size={20} className="mr-2" />
                    <span>{error}</span>
                    <button
                        onClick={() => setError(null)}
                        className="ml-auto text-red-800 hover:text-red-900"
                    >
                        <RefreshCw size={16} />
                    </button>
                </div>
            )}

            {/* Report Configuration */}
            <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-lg font-medium text-gray-800 mb-4">Generate Report</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Report Type</label>
                        <div className="relative">
                            <select
                                value={reportType}
                                onChange={(e) => setReportType(e.target.value)}
                                className="block w-full pl-3 pr-10 py-2 text-base border border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 rounded-md"
                            >
                                <option value="employee-performance">Employee Performance</option>
                                <option value="lead-status">Lead Status</option>
                                <option value="conversion-rate">Conversion Rate</option>
                                <option value="all">All Reports</option>
                            </select>
                            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                                <svg className="h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                                    <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                                </svg>
                            </div>
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Date Range</label>
                        <div className="relative">
                            <select
                                value={dateRange}
                                onChange={(e) => setDateRange(e.target.value)}
                                className="block w-full pl-3 pr-10 py-2 text-base border border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 rounded-md"
                            >
                                <option value="last-7-days">Last 7 Days</option>
                                <option value="last-30-days">Last 30 Days</option>
                                <option value="last-90-days">Last 90 Days</option>
                                <option value="year-to-date">Year to Date</option>
                                <option value="custom">Custom Range</option>
                            </select>
                            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                                <svg className="h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                                    <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                                </svg>
                            </div>
                        </div>
                    </div>
                    <div className="flex items-end">
                        <button
                            onClick={handleGenerateReport}
                            disabled={isGeneratingReport}
                            className={`w-full px-4 py-2 rounded-md flex items-center justify-center ${
                                isGeneratingReport
                                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                    : 'bg-[#022d38] text-white hover:bg-[#043c4a]'
                            }`}
                        >
                            {isGeneratingReport ? (
                                <>
                                    <Loader size={16} className="mr-2 animate-spin" />
                                    Generating...
                                </>
                            ) : (
                                <>
                                    <FileText size={16} className="mr-2" />
                                    Generate Report
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </div>

            {/* Report Types Quick Access */}
            {!showReport && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <button
                        onClick={() => {
                            setReportType('employee-performance');
                            handleGenerateReport();
                        }}
                        className="bg-white rounded-lg shadow p-6 hover:shadow-md transition-shadow duration-200 text-left"
                    >
                        <div className="flex items-center mb-4">
                            <div className="p-2 bg-indigo-100 rounded-md">
                                <Users size={24} className="text-indigo-600" />
                            </div>
                            <h3 className="ml-3 text-lg font-medium text-gray-800">Employee Performance</h3>
                        </div>
                        <p className="text-sm text-gray-600">
                            View performance metrics for all sales team members.
                        </p>
                    </button>
                    <button
                        onClick={() => {
                            setReportType('lead-status');
                            handleGenerateReport();
                        }}
                        className="bg-white rounded-lg shadow p-6 hover:shadow-md transition-shadow duration-200 text-left"
                    >
                        <div className="flex items-center mb-4">
                            <div className="p-2 bg-amber-100 rounded-md">
                                <PieChart size={24} className="text-amber-600" />
                            </div>
                            <h3 className="ml-3 text-lg font-medium text-gray-800">Lead Status</h3>
                        </div>
                        <p className="text-sm text-gray-600">
                            Analyze lead distribution by status and source.
                        </p>
                    </button>
                    <button
                        onClick={() => {
                            setReportType('conversion-rate');
                            handleGenerateReport();
                        }}
                        className="bg-white rounded-lg shadow p-6 hover:shadow-md transition-shadow duration-200 text-left"
                    >
                        <div className="flex items-center mb-4">
                            <div className="p-2 bg-emerald-100 rounded-md">
                                <TrendingUp size={24} className="text-emerald-600" />
                            </div>
                            <h3 className="ml-3 text-lg font-medium text-gray-800">Conversion Rate</h3>
                        </div>
                        <p className="text-sm text-gray-600">
                            Track lead conversion rates over time.
                        </p>
                    </button>
                    <button
                        onClick={() => {
                            setReportType('all');
                            handleGenerateReport();
                        }}
                        className="bg-white rounded-lg shadow p-6 hover:shadow-md transition-shadow duration-200 text-left"
                    >
                        <div className="flex items-center mb-4">
                            <div className="p-2 bg-blue-100 rounded-md">
                                <BarChart2 size={24} className="text-blue-600" />
                            </div>
                            <h3 className="ml-3 text-lg font-medium text-gray-800">All Reports</h3>
                        </div>
                        <p className="text-sm text-gray-600">
                            Generate comprehensive reports with all metrics.
                        </p>
                    </button>
                </div>
            )}

            {/* Report Content */}
            {showReport && (
                <div className="bg-white rounded-lg shadow p-6">
                    {renderReportContent()}
                </div>
            )}
        </div>
    );
}