import { useState, useEffect, useMemo } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line
} from 'recharts';
import {
  Calendar, Download, FileText, Filter, RefreshCw,
  ChevronDown, Printer, ArrowUpRight, ArrowDownRight,
  Clock, TrendingUp, Users, PieChart as PieChartIcon,
  BarChart2, Mail, Share2, Loader, AlertCircle
} from 'lucide-react';
import { enhancedAPI } from '../../services/enhancedAPI';
import { toast } from 'react-toastify';
import * as XLSX from 'xlsx';

export default function AdminReports() {
  const [reportType, setReportType] = useState('employee-performance');
  const [dateRange, setDateRange] = useState('last-30-days');
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);
  const [showReport, setShowReport] = useState(true); // Always show report by default
  const [showExportDropdown, setShowExportDropdown] = useState(false);
  const [selectedTeamMembers, setSelectedTeamMembers] = useState('all');

  // State for storing data from API
  const [employeePerformanceData, setEmployeePerformanceData] = useState([]);
  const [leadStatusData, setLeadStatusData] = useState([]);
  const [conversionTrendData, setConversionTrendData] = useState([]);
  const [leadSourceData, setLeadSourceData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch data from API
  useEffect(() => {
    fetchEmployeePerformanceData();
    fetchLeadStatusData();
  }, [dateRange]);

  // Fetch employee performance data
  const fetchEmployeePerformanceData = async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Use the performance API to get employee performance data
      const response = await enhancedAPI.performance.syncPerformanceData();

      if (response && response.success) {
        const { employees, leads } = response;

        // Process the data to calculate performance metrics
        const performanceData = employees.map(employee => {
          // Filter leads assigned to this employee
          const employeeLeads = leads.filter(lead =>
            lead.assignedEmployee === employee._id ||
            lead.assignedEmployee?._id === employee._id
          );

          // Calculate metrics
          const totalLeads = employeeLeads.length;
          const convertedLeads = employeeLeads.filter(lead => lead.status === 'converted').length;
          const conversionRate = totalLeads > 0 ? Math.round((convertedLeads / totalLeads) * 100) : 0;

          return {
            id: employee._id,
            name: employee.name || 'Unknown Employee',
            leadsAssigned: totalLeads,
            leadsConverted: convertedLeads,
            conversionRate: conversionRate
          };
        });

        // Sort by conversion rate (descending)
        performanceData.sort((a, b) => b.conversionRate - a.conversionRate);

        setEmployeePerformanceData(performanceData);
      } else {
        throw new Error(response?.message || 'Failed to fetch employee performance data');
      }
    } catch (err) {
      console.error('Error fetching employee performance data:', err);
      setError('Failed to load employee performance data. Please try again.');
      toast.error('Failed to load employee performance data: ' + (err.message || 'Unknown error'));

      // Use sample data as fallback
      setEmployeePerformanceData([
        { name: 'Sarah Wilson', leadsAssigned: 28, leadsConverted: 15, conversionRate: 54 },
        { name: 'Mike Brown', leadsAssigned: 32, leadsConverted: 12, conversionRate: 38 },
        { name: 'Alex Johnson', leadsAssigned: 26, leadsConverted: 8, conversionRate: 31 },
        { name: 'Taylor Smith', leadsAssigned: 19, leadsConverted: 7, conversionRate: 37 },
        { name: 'Jordan Lee', leadsAssigned: 15, leadsConverted: 4, conversionRate: 27 }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch lead status data
  const fetchLeadStatusData = async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Get all leads
      const response = await enhancedAPI.leads.getAll();

      if (response && response.data) {
        const leads = Array.isArray(response.data) ? response.data :
                     (response.data.data ? response.data.data : []);

        // Calculate lead status distribution
        const statusCounts = {};
        const sourceCounts = {};

        leads.forEach(lead => {
          // Count by status
          const status = lead.status || 'new';
          statusCounts[status] = (statusCounts[status] || 0) + 1;

          // Count by source
          const source = lead.source || 'direct';
          sourceCounts[source] = (sourceCounts[source] || 0) + 1;
        });

        // Format for pie charts
        const statusData = Object.entries(statusCounts).map(([name, value]) => ({ name, value }));
        const sourceData = Object.entries(sourceCounts).map(([name, value]) => ({ name, value }));

        setLeadStatusData(statusData);
        setLeadSourceData(sourceData);

        // Calculate conversion trend (last 4 weeks)
        const now = new Date();
        const fourWeeksAgo = new Date(now);
        fourWeeksAgo.setDate(now.getDate() - 28);

        // Group converted leads by week
        const weeklyConversions = [
          { name: 'Week 1', conversions: 0 },
          { name: 'Week 2', conversions: 0 },
          { name: 'Week 3', conversions: 0 },
          { name: 'Week 4', conversions: 0 }
        ];

        leads.forEach(lead => {
          if (lead.status === 'converted' && lead.convertedAt) {
            const convertedDate = new Date(lead.convertedAt);
            if (convertedDate >= fourWeeksAgo) {
              // Calculate which week this belongs to (0-3)
              const daysDiff = Math.floor((now - convertedDate) / (1000 * 60 * 60 * 24));
              const weekIndex = Math.min(3, Math.floor(daysDiff / 7));
              weeklyConversions[weekIndex].conversions++;
            }
          }
        });

        setConversionTrendData(weeklyConversions.reverse()); // Most recent week last
      } else {
        throw new Error('Failed to fetch lead data');
      }
    } catch (err) {
      console.error('Error fetching lead data:', err);
      setError('Failed to load lead data. Please try again.');
      toast.error('Failed to load lead data: ' + (err.message || 'Unknown error'));

      // Use sample data as fallback
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
        { name: 'Direct', value: 15 },
        { name: 'Social', value: 10 },
        { name: 'Email', value: 15 }
      ]);

      setConversionTrendData([
        { name: 'Week 1', conversions: 5 },
        { name: 'Week 2', conversions: 7 },
        { name: 'Week 3', conversions: 4 },
        { name: 'Week 4', conversions: 9 }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle generating report
  const handleGenerateReport = () => {
    setIsGeneratingReport(true);

    // Fetch fresh data
    Promise.all([
      fetchEmployeePerformanceData(),
      fetchLeadStatusData()
    ]).then(() => {
      setIsGeneratingReport(false);
      setShowReport(true);
    }).catch(err => {
      console.error('Error generating report:', err);
      setIsGeneratingReport(false);
      toast.error('Error generating report: ' + (err.message || 'Unknown error'));
    });
  };

  // Export data to CSV or Excel
  const handleExportData = (format) => {
    try {
      // Prepare the data for export
      let exportData = [];

      if (reportType === 'employee-performance') {
        // Format employee performance data for export
        exportData = employeePerformanceData.map(employee => ({
          'Employee Name': employee.name,
          'Leads Assigned': employee.leadsAssigned,
          'Leads Converted': employee.leadsConverted,
          'Conversion Rate (%)': employee.conversionRate
        }));
      } else if (reportType === 'lead-status') {
        // Format lead status data for export
        exportData = [
          ...leadStatusData.map(item => ({
            'Category': 'Lead Status',
            'Name': item.name,
            'Count': item.value
          })),
          ...leadSourceData.map(item => ({
            'Category': 'Lead Source',
            'Name': item.name,
            'Count': item.value
          }))
        ];
      }

      if (exportData.length === 0) {
        toast.error('No data to export');
        return;
      }

      if (format === 'csv') {
        // Export as CSV
        const headers = Object.keys(exportData[0]);
        const csvContent = [
          headers.join(','),
          ...exportData.map(row => headers.map(header => `"${row[header]}"`).join(','))
        ].join('\n');

        // Create a blob and download
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `${reportType}_report.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        toast.success('CSV file downloaded successfully');
      } else if (format === 'xlsx') {
        // Export as Excel
        const worksheet = XLSX.utils.json_to_sheet(exportData);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Report');
        XLSX.writeFile(workbook, `${reportType}_report.xlsx`);

        toast.success('Excel file downloaded successfully');
      }

      setShowExportDropdown(false);
    } catch (err) {
      console.error('Error exporting data:', err);
      toast.error('Failed to export data: ' + (err.message || 'Unknown error'));
    }
  };



  // Calculate summary metrics
  const summaryMetrics = useMemo(() => {
    // Calculate total leads and conversions from employee performance data
    const totalLeads = employeePerformanceData.reduce((total, item) => total + item.leadsAssigned, 0);
    const totalConversions = employeePerformanceData.reduce((total, item) => total + item.leadsConverted, 0);
    const conversionRate = totalLeads > 0 ? (totalConversions / totalLeads * 100).toFixed(1) : 0;

    // Sample data for changes (would be calculated from historical data in a real app)
    const changes = {
      'last-7-days': { leadsChange: 15.2, conversionsChange: 8.5 },
      'last-30-days': { leadsChange: 5.8, conversionsChange: 4.2 },
      'last-90-days': { leadsChange: -2.3, conversionsChange: 3.5 }
    };

    return {
      totalLeads,
      totalConversions,
      conversionRate,
      ...(changes[dateRange] || { leadsChange: 0, conversionsChange: 0 })
    };
  }, [employeePerformanceData, dateRange]);

  // Calculate individual performance data for pie chart
  const individualPerformanceData = useMemo(() => {
    return employeePerformanceData.map(employee => ({
      name: employee.name,
      value: employee.leadsConverted
    }));
  }, [employeePerformanceData]);

  // Colors for charts
  const COLORS = ['#4f46e5', '#2563eb', '#3b82f6', '#60a5fa', '#93c5fd'];
  const lineChartColors = {
    leads: '#2563eb',
    conversions: '#10b981'
  };

  // Report title based on date range
  const reportTitle = {
    'last-7-days': 'Weekly Performance Report',
    'last-30-days': 'Monthly Performance Report',
    'last-90-days': 'Quarterly Performance Report',
    'year-to-date': 'Year-to-Date Performance Report',
    'custom': 'Custom Period Performance Report'
  };

  // Current date for the report
  const currentDate = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  // Calculate the date range for the report
  const getReportDateRange = () => {
    const today = new Date();
    let startDate = new Date(today);

    switch(dateRange) {
      case 'last-7-days':
        startDate.setDate(today.getDate() - 7);
        break;
      case 'last-30-days':
        startDate.setDate(today.getDate() - 30);
        break;
      case 'last-90-days':
        startDate.setDate(today.getDate() - 90);
        break;
      case 'year-to-date':
        startDate = new Date(today.getFullYear(), 0, 1); // January 1st of current year
        break;
      case 'custom':
        // For custom, we could show a date picker in a real app
        startDate.setDate(today.getDate() - 30); // Default to 30 days
        break;
      default:
        startDate.setDate(today.getDate() - 30);
    }

    return `${startDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${today.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`;
  };

  // Format currency values
  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };

  return (
    <div className="bg-gray-50 min-h-screen  overflow-auto">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8 flex justify-between items-center">
          <div className="flex items-center">
            <FileText className="h-8 w-8 text-blue-600 mr-3" />
            <h1 className="text-2xl font-semibold text-gray-900">{reportTitle[dateRange]}</h1>
          </div>

          <div className="flex items-center space-x-3">
            <div className="relative inline-block text-left">
              <button
                onClick={() => setShowExportDropdown(!showExportDropdown)}
                className="border border-gray-300 bg-white px-4 py-2 rounded-md flex items-center space-x-2 hover:bg-gray-50"
              >
                <Download size={18} />
                <span>Export</span>
                <ChevronDown size={16} />
              </button>

              {showExportDropdown && (
                <div className="absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-50">
                  <div className="py-1" role="menu" aria-orientation="vertical">
                    <button
                      className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      onClick={() => handleExportData('xlsx')}
                    >
                      Export as Excel
                    </button>
                    <button
                      className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      onClick={() => handleExportData('csv')}
                    >
                      Export as CSV
                    </button>
                    <button
                      className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      onClick={() => {
                        setShowExportDropdown(false);
                      }}
                    >
                      <div className="flex items-center">
                        <Printer size={16} className="mr-2" />
                        <span>Print Report</span>
                      </div>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
        {/* Report Controls */}
        <div className="bg-white p-4 rounded-lg shadow mb-6">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="flex flex-col md:flex-row items-center space-y-3 md:space-y-0 md:space-x-4">
              <div className="flex items-center">
                <Calendar size={18} className="text-gray-500 mr-2" />
                <span className="text-sm font-medium text-gray-700">Report Period:</span>
              </div>
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

            <div className="flex items-center space-x-4">
              <div className="flex items-center">
                <Filter size={18} className="text-gray-500 mr-2" />
                <span className="text-sm font-medium text-gray-700 mr-2">Team Members:</span>
                <select
                  value={selectedTeamMembers}
                  onChange={(e) => setSelectedTeamMembers(e.target.value)}
                  className="border border-gray-300 rounded-md px-3 py-1 text-sm"
                >
                  <option value="all">All Members</option>
                  <option value="top">Top Performers</option>
                  {employeePerformanceData.map((employee) => (
                    <option key={employee.id} value={employee.name}>{employee.name}</option>
                  ))}
                </select>
              </div>

              <button
                onClick={() => {
                  fetchEmployeePerformanceData();
                  fetchLeadStatusData();
                  toast.info('Refreshing report data...');
                }}
                className="text-blue-600 hover:text-blue-800 flex items-center"
              >
                <RefreshCw size={16} className={`mr-1 ${isLoading ? 'animate-spin' : ''}`} />
                <span className="text-sm">{isLoading ? 'Loading...' : 'Refresh'}</span>
              </button>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-gray-100 flex items-center">
            <Clock size={16} className="text-gray-500 mr-2" />
            <span className="text-sm text-gray-500">Report generated for: {getReportDateRange()}</span>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-6">
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Total Leads</p>
                <p className="text-2xl font-semibold text-gray-900 mt-1">{summaryMetrics.totalLeads}</p>
              </div>
              <div className={`flex items-center ${summaryMetrics.leadsChange >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                {summaryMetrics.leadsChange >= 0 ? (
                  <ArrowUpRight size={16} className="mr-1" />
                ) : (
                  <ArrowDownRight size={16} className="mr-1" />
                )}
                <span className="text-sm font-medium">{Math.abs(summaryMetrics.leadsChange)}%</span>
              </div>
            </div>
            <div className="mt-2 text-xs text-gray-500">vs previous period</div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Conversions</p>
                <p className="text-2xl font-semibold text-gray-900 mt-1">{summaryMetrics.totalConversions}</p>
              </div>
              <div className={`flex items-center ${summaryMetrics.conversionsChange >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                {summaryMetrics.conversionsChange >= 0 ? (
                  <ArrowUpRight size={16} className="mr-1" />
                ) : (
                  <ArrowDownRight size={16} className="mr-1" />
                )}
                <span className="text-sm font-medium">{Math.abs(summaryMetrics.conversionsChange)}%</span>
              </div>
            </div>
            <div className="mt-2 text-xs text-gray-500">vs previous period</div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Conversion Rate</p>
                <p className="text-2xl font-semibold text-gray-900 mt-1">{summaryMetrics.conversionRate}%</p>
              </div>
              <div className="flex items-center text-blue-500">
                <TrendingUp size={16} />
              </div>
            </div>
            <div className="mt-2 text-xs text-gray-500">of all leads</div>
          </div>
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Performance Over Time Chart */}
          <div className="bg-white p-4 rounded-lg shadow">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Performance Over Time</h2>
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
                  <Line
                    type="monotone"
                    dataKey="conversions"
                    name="Conversions"
                    stroke={lineChartColors.conversions}
                    activeDot={{ r: 8 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Lead Status Distribution */}
          <div className="bg-white p-4 rounded-lg shadow">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Lead Status Distribution</h2>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={leadStatusData}
                  margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="value"
                    name="Lead Count"
                    stroke="#8884d8"
                    activeDot={{ r: 8 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Second Row of Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Team Performance Bar Chart */}
          <div className="bg-white p-4 rounded-lg shadow">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Team Member Performance</h2>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={employeePerformanceData}
                  margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="leadsAssigned" name="Leads Assigned" fill="#3b82f6" />
                  <Bar dataKey="leadsConverted" name="Leads Converted" fill="#10b981" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Sales Value Distribution Pie Chart */}
          <div className="bg-white p-4 rounded-lg shadow">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Sales Value Distribution</h2>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={individualPerformanceData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  >
                    {individualPerformanceData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => [formatCurrency(value), 'Sales Value']} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Team Performance Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden mb-6">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900">Detailed Team Performance</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Team Member</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Leads</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Conversions</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Conversion Rate</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Value</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {employeePerformanceData.map((employee, index) => (
                  <tr key={employee.id} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{employee.name}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{employee.leadsAssigned}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{employee.leadsConverted}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {employee.conversionRate}%
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">-</div>
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="bg-gray-100">
                <tr>
                  <td className="px-6 py-3 text-sm font-semibold text-gray-900">Total</td>
                  <td className="px-6 py-3 text-sm font-semibold text-gray-900">
                    {summaryMetrics.totalLeads}
                  </td>
                  <td className="px-6 py-3 text-sm font-semibold text-gray-900">
                    {summaryMetrics.totalConversions}
                  </td>
                  <td className="px-6 py-3 text-sm font-semibold text-gray-900">
                    {summaryMetrics.conversionRate}%
                  </td>
                  <td className="px-6 py-3 text-sm font-semibold text-gray-900">
                    -
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>

        {/* Report Footer */}
        <div className="bg-white p-4 rounded-lg shadow text-center">
          <p className="text-sm text-gray-500">
            This report was generated on {currentDate}. For questions or assistance, contact the system administrator.
          </p>
        </div>
      </div>
    </div>
  );
}