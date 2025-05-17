import { useState, useMemo } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, 
  ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line
} from 'recharts';
import { 
  Calendar, Download, FileText, Filter, RefreshCw, 
  ChevronDown, Printer, ArrowUpRight, ArrowDownRight,
  Clock, TrendingUp
} from 'lucide-react';

export default function SalesPerformanceReport() {
  const [dateRange, setDateRange] = useState('weekly');
  const [exportFormat, setExportFormat] = useState('pdf');
  const [showExportDropdown, setShowExportDropdown] = useState(false);
  const [selectedTeamMembers, setSelectedTeamMembers] = useState('all');
  
  // Sample data - would be fetched from API in a real application
  const teamData = {
    daily: [
      { name: 'Sarah Wilson', leads: 5, conversions: 2, value: 8500 },
      { name: 'Mike Brown', leads: 7, conversions: 3, value: 9200 },
      { name: 'Alex Johnson', leads: 4, conversions: 1, value: 4300 },
      { name: 'Taylor Smith', leads: 6, conversions: 2, value: 7800 },
      { name: 'Jordan Lee', leads: 3, conversions: 1, value: 3600 }
    ],
    weekly: [
      { name: 'Sarah Wilson', leads: 28, conversions: 15, value: 49000 },
      { name: 'Mike Brown', leads: 32, conversions: 12, value: 43000 },
      { name: 'Alex Johnson', leads: 26, conversions: 8, value: 32000 },
      { name: 'Taylor Smith', leads: 19, conversions: 7, value: 25500 },
      { name: 'Jordan Lee', leads: 15, conversions: 4, value: 18000 }
    ],
    monthly: [
      { name: 'Sarah Wilson', leads: 112, conversions: 46, value: 175000 },
      { name: 'Mike Brown', leads: 98, conversions: 37, value: 143000 },
      { name: 'Alex Johnson', leads: 86, conversions: 29, value: 92000 },
      { name: 'Taylor Smith', leads: 75, conversions: 28, value: 85500 },
      { name: 'Jordan Lee', leads: 64, conversions: 19, value: 58000 }
    ]
  };

  const timeframeData = {
    daily: [
      { name: 'Mon', leads: 25, conversions: 9 },
      { name: 'Tue', leads: 18, conversions: 6 },
      { name: 'Wed', leads: 22, conversions: 8 },
      { name: 'Thu', leads: 28, conversions: 11 },
      { name: 'Fri', leads: 30, conversions: 12 },
      { name: 'Sat', leads: 12, conversions: 5 },
      { name: 'Sun', leads: 8, conversions: 3 }
    ],
    weekly: [
      { name: 'Week 1', leads: 110, conversions: 42 },
      { name: 'Week 2', leads: 98, conversions: 38 },
      { name: 'Week 3', leads: 120, conversions: 45 },
      { name: 'Week 4', leads: 135, conversions: 52 }
    ],
    monthly: [
      { name: 'Jan', leads: 410, conversions: 152 },
      { name: 'Feb', leads: 385, conversions: 140 },
      { name: 'Mar', leads: 450, conversions: 168 },
      { name: 'Apr', leads: 520, conversions: 195 },
      { name: 'May', leads: 480, conversions: 182 },
      { name: 'Jun', leads: 520, conversions: 198 }
    ]
  };

  const conversionRateData = {
    daily: [
      { name: 'Mon', rate: 36 },
      { name: 'Tue', rate: 33 },
      { name: 'Wed', rate: 36 },
      { name: 'Thu', rate: 39 },
      { name: 'Fri', rate: 40 },
      { name: 'Sat', rate: 42 },
      { name: 'Sun', rate: 38 }
    ],
    weekly: [
      { name: 'Week 1', rate: 38 },
      { name: 'Week 2', rate: 39 },
      { name: 'Week 3', rate: 37 },
      { name: 'Week 4', rate: 38 }
    ],
    monthly: [
      { name: 'Jan', rate: 37 },
      { name: 'Feb', rate: 36 },
      { name: 'Mar', rate: 37 },
      { name: 'Apr', rate: 37 },
      { name: 'May', rate: 38 },
      { name: 'Jun', rate: 38 }
    ]
  };

  // Calculate summary metrics
  const summaryMetrics = useMemo(() => {
    const currentData = teamData[dateRange];
    const totalLeads = currentData.reduce((total, item) => total + item.leads, 0);
    const totalConversions = currentData.reduce((total, item) => total + item.conversions, 0);
    const totalValue = currentData.reduce((total, item) => total + item.value, 0);
    const conversionRate = totalLeads > 0 ? (totalConversions / totalLeads * 100).toFixed(1) : 0;
    
    // Calculate percent change from previous period (sample data)
    const changes = {
      daily: { leadsChange: 15.2, conversionsChange: 8.5, valueChange: 12.3 },
      weekly: { leadsChange: 5.8, conversionsChange: 4.2, valueChange: 7.1 },
      monthly: { leadsChange: -2.3, conversionsChange: 3.5, valueChange: 5.4 }
    };
    
    return {
      totalLeads,
      totalConversions,
      totalValue,
      conversionRate,
      ...changes[dateRange]
    };
  }, [dateRange, teamData]);

  // Calculate individual performance data for pie chart
  const individualPerformanceData = useMemo(() => {
    return teamData[dateRange].map(member => ({
      name: member.name,
      value: member.value
    }));
  }, [dateRange, teamData]);

  // Colors for charts
  const COLORS = ['#4f46e5', '#2563eb', '#3b82f6', '#60a5fa', '#93c5fd'];
  const lineChartColors = {
    leads: '#2563eb',
    conversions: '#10b981'
  };

  // Report title based on date range
  const reportTitle = {
    daily: 'Daily Sales Performance Report',
    weekly: 'Weekly Sales Performance Report',
    monthly: 'Monthly Sales Performance Report'
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
    let startDate, endDate;
    
    switch(dateRange) {
      case 'daily':
        return today.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
      case 'weekly':
        startDate = new Date(today);
        startDate.setDate(today.getDate() - 7);
        return `${startDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${today.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`;
      case 'monthly':
        startDate = new Date(today);
        startDate.setMonth(today.getMonth() - 1);
        return `${startDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${today.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`;
      default:
        return currentDate;
    }
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
                      onClick={() => {
                        setExportFormat('pdf');
                        setShowExportDropdown(false);
                      }}
                    >
                      Export as PDF
                    </button>
                    <button
                      className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      onClick={() => {
                        setExportFormat('excel');
                        setShowExportDropdown(false);
                      }}
                    >
                      Export as Excel
                    </button>
                    <button
                      className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      onClick={() => {
                        setExportFormat('csv');
                        setShowExportDropdown(false);
                      }}
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
              <div className="inline-flex items-center space-x-1 border border-gray-200 rounded-lg p-1 bg-gray-50">
                <button
                  onClick={() => setDateRange('daily')}
                  className={`px-3 py-1 text-sm rounded-md ${dateRange === 'daily' ? 'bg-white shadow-sm' : 'hover:bg-gray-100'}`}
                >
                  Daily
                </button>
                <button
                  onClick={() => setDateRange('weekly')}
                  className={`px-3 py-1 text-sm rounded-md ${dateRange === 'weekly' ? 'bg-white shadow-sm' : 'hover:bg-gray-100'}`}
                >
                  Weekly
                </button>
                <button
                  onClick={() => setDateRange('monthly')}
                  className={`px-3 py-1 text-sm rounded-md ${dateRange === 'monthly' ? 'bg-white shadow-sm' : 'hover:bg-gray-100'}`}
                >
                  Monthly
                </button>
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
                  {teamData.daily.map((member, index) => (
                    <option key={index} value={member.name}>{member.name}</option>
                  ))}
                </select>
              </div>
              
              <button className="text-blue-600 hover:text-blue-800 flex items-center">
                <RefreshCw size={16} className="mr-1" />
                <span className="text-sm">Refresh</span>
              </button>
            </div>
          </div>
          
          <div className="mt-4 pt-3 border-t border-gray-100 flex items-center">
            <Clock size={16} className="text-gray-500 mr-2" />
            <span className="text-sm text-gray-500">Report generated for: {getReportDateRange()}</span>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
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
          
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Total Value</p>
                <p className="text-2xl font-semibold text-gray-900 mt-1">{formatCurrency(summaryMetrics.totalValue)}</p>
              </div>
              <div className={`flex items-center ${summaryMetrics.valueChange >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                {summaryMetrics.valueChange >= 0 ? (
                  <ArrowUpRight size={16} className="mr-1" />
                ) : (
                  <ArrowDownRight size={16} className="mr-1" />
                )}
                <span className="text-sm font-medium">{Math.abs(summaryMetrics.valueChange)}%</span>
              </div>
            </div>
            <div className="mt-2 text-xs text-gray-500">vs previous period</div>
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
                  data={timeframeData[dateRange]}
                  margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="leads" 
                    name="Leads" 
                    stroke={lineChartColors.leads} 
                    activeDot={{ r: 8 }} 
                  />
                  <Line 
                    type="monotone" 
                    dataKey="conversions" 
                    name="Conversions" 
                    stroke={lineChartColors.conversions} 
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
          
          {/* Conversion Rate Trend */}
          <div className="bg-white p-4 rounded-lg shadow">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Conversion Rate Trend</h2>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={conversionRateData[dateRange]}
                  margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis domain={[0, 50]} />
                  <Tooltip formatter={(value) => [`${value}%`, 'Conversion Rate']} />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="rate" 
                    name="Conversion Rate (%)" 
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
                  data={teamData[dateRange]}
                  margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="leads" name="Leads" fill="#3b82f6" />
                  <Bar dataKey="conversions" name="Conversions" fill="#10b981" />
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
                    {individualPerformanceData.map((entry, index) => (
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
                {teamData[dateRange].map((member, index) => (
                  <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{member.name}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{member.leads}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{member.conversions}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {(member.conversions / member.leads * 100).toFixed(1)}%
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{formatCurrency(member.value)}</div>
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
                    {formatCurrency(summaryMetrics.totalValue)}
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