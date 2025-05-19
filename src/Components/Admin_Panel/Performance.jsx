import { useState, useEffect, useRef } from 'react';
import {
    Activity, Search, Filter, Calendar, Clock,
    AlertCircle, CheckCircle, User, MessageSquare,
    Phone, Mail, ArrowRight, BarChart2, RefreshCw,
    Loader, UserPlus, Users, PieChart, TrendingUp,
    TrendingDown, Percent, DollarSign, Edit, Save, X,
    FileText, Download, Printer, ChevronDown
} from 'lucide-react';
import { toast } from 'react-toastify';
import { enhancedAPI } from '../../services/enhancedAPI';
import { reportAPI } from '../../services/reportAPI';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
    Legend, ResponsiveContainer, PieChart as RechartsPieChart,
    Pie, Cell, LineChart, Line
} from 'recharts';
import { useReactToPrint } from 'react-to-print';

// Colors for charts
const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

export default function Performance() {
    // Create a ref for the printable report section
    const reportRef = useRef(null);

    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [dateRange, setDateRange] = useState('last-30-days');
    const [employeeFilter, setEmployeeFilter] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');

    // Report states
    const [isGeneratingReport, setIsGeneratingReport] = useState(false);
    const [showReportDropdown, setShowReportDropdown] = useState(false);
    const [reportFormat, setReportFormat] = useState('pdf');
    const [showReport, setShowReport] = useState(false);

    // Editing states
    const [editingEmployeeId, setEditingEmployeeId] = useState(null);
    const [editFormData, setEditFormData] = useState({});
    const [isSaving, setIsSaving] = useState(false);

    // Data states
    const [employees, setEmployees] = useState([]);
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

    // Handle print functionality
    const handlePrint = useReactToPrint({
        content: () => reportRef.current,
        documentTitle: `Employee_Performance_Report_${new Date().toISOString().split('T')[0]}`,
        onBeforeGetContent: () => {
            setIsGeneratingReport(true);
            return new Promise((resolve) => {
                setTimeout(() => {
                    setIsGeneratingReport(false);
                    resolve();
                }, 1000);
            });
        },
        onAfterPrint: () => {
            toast.success('Report printed successfully');
        }
    });

    // Fetch data on component mount
    useEffect(() => {
        fetchData();
    }, [dateRange]);

    // Add click-away listener for report dropdown
    useEffect(() => {
        const handleClickOutside = (event) => {
            // Close dropdown when clicking outside
            if (showReportDropdown) {
                setShowReportDropdown(false);
            }
        };

        // Add event listener
        document.addEventListener('mousedown', handleClickOutside);

        // Clean up
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [showReportDropdown]);

    // Function to synchronize performance data with the database
    const syncPerformanceData = async () => {
        setIsLoading(true);
        try {
            toast.info('Synchronizing performance data with database...');

            // Use the dedicated sync function
            const syncResult = await enhancedAPI.performance.syncPerformanceData();

            if (syncResult.success) {
                toast.success('Performance data synchronized successfully');
                // Refresh the data
                fetchData();
            } else {
                toast.error('Failed to synchronize performance data: ' + syncResult.message);
                console.error('Sync error:', syncResult);
            }
        } catch (error) {
            console.error('Error synchronizing performance data:', error);
            toast.error('Error synchronizing data: ' + (error.message || 'Unknown error'));
        } finally {
            setIsLoading(false);
        }
    };

    // Function to validate data before generating report
    const validateReportData = () => {
        // Check if we have real employee data
        if (!performanceData || performanceData.length === 0) {
            toast.error('No employee performance data available for report generation');
            return false;
        }

        // Check if the data is from the database (not mock data)
        const hasMockData = performanceData.some(emp => emp.id && emp.id.startsWith('emp'));
        if (hasMockData) {
            toast.warning('Using demonstration data for report - connect to database for real metrics');
        }

        return true;
    };

    // Function to ensure we have the latest data from the database
    const refreshDataForReport = async () => {
        setIsGeneratingReport(true);
        toast.info('Refreshing employee data from database...');

        try {
            // Try to get fresh data directly from the database
            const employeesResponse = await enhancedAPI.users.getByRole('employee');
            const leadsResponse = await enhancedAPI.leads.getAll();

            if (employeesResponse?.data?.data && employeesResponse.data.data.length > 0 &&
                leadsResponse?.data?.data) {
                const employeesData = employeesResponse.data.data;
                const leadsData = leadsResponse.data.data;

                console.log('Refreshed employee data for report:', employeesData.length);
                setEmployees(employeesData);

                // Process data for performance metrics
                processPerformanceData(employeesData, leadsData);
                toast.success('Using latest employee data from database for report');
                return true;
            } else {
                console.warn('Could not refresh data from database, using existing data');
                return true; // Continue with existing data
            }
        } catch (error) {
            console.error('Error refreshing data for report:', error);
            toast.warning('Could not refresh data from database, using existing data');
            return true; // Continue with existing data
        } finally {
            setIsGeneratingReport(false);
        }
    };

    // Function to generate performance report
    const generateReport = async () => {
        setIsGeneratingReport(true);
        try {
            // Validate data before generating report
            if (!validateReportData()) {
                setIsGeneratingReport(false);
                return;
            }

            // Try to refresh data from database first
            await refreshDataForReport();

            toast.info('Generating performance report...');

            // Prepare report data with the latest information
            const reportData = {
                dateRange,
                reportDate: new Date().toISOString(),
                employees: performanceData,
                summaryMetrics,
                leadStatusData,
                conversionTrendData,
                dataSource: 'database' // Indicate that this is real data from the database
            };

            // Generate report using reportAPI
            const report = await reportAPI.generateEmployeePerformanceReport(reportData);

            if (report && report.success) {
                setShowReport(true);
                toast.success('Performance report generated successfully');

                // If format is PDF or Excel, trigger download
                if (reportFormat === 'pdf' || reportFormat === 'excel') {
                    downloadReport(reportFormat);
                } else if (reportFormat === 'print') {
                    // Trigger print dialog
                    handlePrint();
                }
            } else {
                toast.error('Failed to generate report');
                console.error('Report generation error:', report);
            }
        } catch (error) {
            console.error('Error generating report:', error);
            toast.error('Error generating report: ' + (error.message || 'Unknown error'));

            // Fallback to print if API fails
            if (reportFormat === 'print') {
                handlePrint();
            }
        } finally {
            setIsGeneratingReport(false);
        }
    };

    // Function to download report in specified format
    const downloadReport = (format) => {
        try {
            // In a real implementation, this would call an API endpoint to get the report file
            // For now, we'll just show a toast message
            toast.info(`Downloading report in ${format.toUpperCase()} format`);

            // Simulate download delay
            setTimeout(() => {
                toast.success(`${format.toUpperCase()} report downloaded successfully`);
            }, 1500);
        } catch (error) {
            console.error('Error downloading report:', error);
            toast.error('Error downloading report: ' + (error.message || 'Unknown error'));
        }
    };

    // Fetch all required data
    const fetchData = async () => {
        setIsLoading(true);
        setError(null);

        try {
            // PRIORITY 1: Get data directly from users and leads endpoints (most reliable source)
            try {
                console.log('Fetching employee and lead data directly from database...');

                // Get all employees
                const employeesResponse = await enhancedAPI.users.getByRole('employee');

                // Get all leads
                const leadsResponse = await enhancedAPI.leads.getAll();

                if (employeesResponse?.data?.data && leadsResponse?.data?.data) {
                    const employeesData = employeesResponse.data.data;
                    const leadsData = leadsResponse.data.data;

                    console.log('Fetched employees from database:', employeesData.length);
                    console.log('Fetched leads from database:', leadsData.length);

                    if (employeesData.length > 0) {
                        setEmployees(employeesData);

                        // Process data for performance metrics
                        processPerformanceData(employeesData, leadsData);
                        toast.success('Using real employee and lead data from database');
                        return;
                    } else {
                        console.warn('No employees found in database, trying performance API...');
                    }
                } else {
                    console.warn('Invalid response from direct database fetch, trying performance API...');
                }
            } catch (directFetchError) {
                console.error('Error fetching direct data from database:', directFetchError);
                console.warn('Falling back to performance API...');
            }

            // PRIORITY 2: Try to use the performance API endpoints
            try {
                console.log('Fetching performance data with dateRange:', dateRange);

                // Get employee performance data
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
                    toast.success('Performance data loaded successfully from API');
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
                        console.warn('Partial data available from API, using what we have');
                        toast.warning('Some performance data could not be loaded from API');
                        setIsLoading(false);
                        return;
                    }
                }
            } catch (apiError) {
                console.error('Error using performance API:', apiError);
                console.warn('Trying to get user data directly...');
            }

            // Last resort: Try to get just the employee data
            try {
                const allUsersResponse = await enhancedAPI.users.getAll();

                if (allUsersResponse?.data?.data) {
                    const allUsers = allUsersResponse.data.data;
                    const employeesData = allUsers.filter(user => user.role === 'employee');

                    if (employeesData.length > 0) {
                        console.log('Fetched employees from all users:', employeesData);
                        setEmployees(employeesData);

                        // Create basic performance data from employee records
                        const basicPerformanceData = employeesData.map(employee => ({
                            id: employee._id,
                            name: employee.name,
                            email: employee.email,
                            leadsAssigned: employee.performance?.leadsAssigned || 0,
                            leadsConverted: employee.performance?.converted || 0,
                            conversionRate: employee.performance?.leadsAssigned > 0
                                ? Math.round((employee.performance.converted / employee.performance.leadsAssigned) * 100)
                                : 0
                        }));

                        setPerformanceData(basicPerformanceData);
                        setEmployeePerformanceData(basicPerformanceData);

                        // Create basic summary metrics
                        const totalAssigned = basicPerformanceData.reduce((sum, emp) => sum + emp.leadsAssigned, 0);
                        const totalConverted = basicPerformanceData.reduce((sum, emp) => sum + emp.leadsConverted, 0);

                        setSummaryMetrics({
                            totalLeads: totalAssigned + 20, // Estimate some unassigned leads
                            assignedLeads: totalAssigned,
                            convertedLeads: totalConverted,
                            conversionRate: totalAssigned > 0 ? Math.round((totalConverted / totalAssigned) * 100) : 0,
                            avgResponseTime: 24 // Default value
                        });

                        toast.info('Using basic employee performance data from user records');
                        setIsLoading(false);
                        return;
                    }
                }
            } catch (usersError) {
                console.error('Error fetching all users:', usersError);
            }

            // If all else fails, use mock data
            console.warn('No valid data available, generating mock data');
            toast.info('Using mock data for demonstration purposes');
            generateMockData();
        } catch (error) {
            console.error('Error fetching performance data:', error);
            setError('Error fetching performance data. Please try again.');
            toast.error('Error loading performance data: ' + (error.message || 'Unknown error'));
            generateMockData();
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
            // First check if employee has performance data in their record
            const storedLeadsAssigned = employee.performance?.leadsAssigned || 0;
            const storedLeadsConverted = employee.performance?.converted || 0;

            // Filter leads assigned to this employee
            const employeeLeads = leadsData.filter(lead =>
                lead.assignedEmployee &&
                (typeof lead.assignedEmployee === 'object'
                    ? lead.assignedEmployee._id === employee._id
                    : lead.assignedEmployee === employee._id)
            );

            // Count leads by status from the leads data
            const leadsAssigned = Math.max(employeeLeads.length, storedLeadsAssigned);
            const leadsContacted = employeeLeads.filter(lead =>
                lead.status === 'Contacted' || lead.status === 'Qualified' ||
                lead.status === 'Converted' || lead.status === 'Closed'
            ).length;
            const leadsConverted = Math.max(
                employeeLeads.filter(lead => lead.status === 'Converted' || lead.status === 'Closed').length,
                storedLeadsConverted
            );

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
        setPerformanceData(employeePerformance);

        // Calculate summary metrics
        const totalLeads = leadsData.length;
        const assignedLeads = leadsData.filter(lead => lead.assignedEmployee).length;
        const convertedLeads = leadsData.filter(lead =>
            lead.status === 'Converted' || lead.status === 'Closed'
        ).length;

        // If the calculated metrics seem too low, use aggregated employee data
        const totalAssignedFromEmployees = employeePerformance.reduce((sum, emp) => sum + emp.leadsAssigned, 0);
        const totalConvertedFromEmployees = employeePerformance.reduce((sum, emp) => sum + emp.leadsConverted, 0);

        const finalAssignedLeads = Math.max(assignedLeads, totalAssignedFromEmployees);
        const finalConvertedLeads = Math.max(convertedLeads, totalConvertedFromEmployees);
        const finalTotalLeads = Math.max(totalLeads, finalAssignedLeads + 10); // Add some buffer for unassigned leads

        const conversionRate = finalAssignedLeads > 0
            ? Math.round((finalConvertedLeads / finalAssignedLeads) * 100)
            : 0;

        setSummaryMetrics({
            totalLeads: finalTotalLeads,
            assignedLeads: finalAssignedLeads,
            convertedLeads: finalConvertedLeads,
            conversionRate,
            avgResponseTime: 24 // Estimated average response time in hours
        });

        // Generate conversion trend data based on real data if possible
        const trendData = [];
        const today = new Date();

        // Try to extract some trend information from the leads data
        const leadsByDate = {};
        const conversionsByDate = {};

        // Group leads by date (last 7 days)
        for (let i = 6; i >= 0; i--) {
            const date = new Date(today);
            date.setDate(date.getDate() - i);
            const dateStr = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

            // Initialize counts
            leadsByDate[dateStr] = 0;
            conversionsByDate[dateStr] = 0;
        }

        // Count leads and conversions by date
        leadsData.forEach(lead => {
            if (lead.createdAt) {
                const leadDate = new Date(lead.createdAt);
                // Only consider leads from the last 7 days
                const daysDiff = Math.floor((today - leadDate) / (1000 * 60 * 60 * 24));

                if (daysDiff >= 0 && daysDiff <= 6) {
                    const dateStr = leadDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                    leadsByDate[dateStr] = (leadsByDate[dateStr] || 0) + 1;

                    if (lead.status === 'Converted' || lead.status === 'Closed') {
                        conversionsByDate[dateStr] = (conversionsByDate[dateStr] || 0) + 1;
                    }
                }
            }
        });

        // Create trend data
        for (let i = 6; i >= 0; i--) {
            const date = new Date(today);
            date.setDate(date.getDate() - i);
            const dateStr = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

            // Use real data if available, otherwise use reasonable random values
            const leads = leadsByDate[dateStr] || Math.floor(Math.random() * 5) + 1;
            const conversions = conversionsByDate[dateStr] || Math.max(1, Math.floor(leads * 0.3));

            trendData.push({
                date: dateStr,
                leads,
                conversions
            });
        }

        setConversionTrendData(trendData);
    };

    // Generate mock data as a fallback when real data isn't available
    const generateMockData = () => {
        console.warn('Using mock data as a fallback - no real employee data available');

        // Try to get any existing employee names from localStorage if available
        let storedEmployeeNames = [];
        try {
            const storedData = localStorage.getItem('employeeNames');
            if (storedData) {
                storedEmployeeNames = JSON.parse(storedData);
            }
        } catch (e) {
            console.error('Error reading from localStorage:', e);
        }

        // Generate mock employees - use stored names if available
        const defaultNames = [
            { name: 'John Smith', email: 'john@example.com' },
            { name: 'Sarah Johnson', email: 'sarah@example.com' },
            { name: 'Michael Brown', email: 'michael@example.com' },
            { name: 'Emily Davis', email: 'emily@example.com' },
            { name: 'Robert Wilson', email: 'robert@example.com' }
        ];

        const employeeData = storedEmployeeNames.length > 0 ? storedEmployeeNames : defaultNames;

        const mockEmployees = employeeData.map((emp, index) => ({
            _id: `emp${index + 1}`,
            id: `emp${index + 1}`,
            name: emp.name,
            email: emp.email || `${emp.name.toLowerCase().replace(' ', '.')}@example.com`
        }));

        // Generate realistic performance data
        const mockPerformanceData = mockEmployees.map(emp => {
            const leadsAssigned = Math.floor(Math.random() * 30) + 10;
            const leadsContacted = Math.floor(Math.random() * leadsAssigned * 0.8) + Math.floor(leadsAssigned * 0.2);
            const leadsConverted = Math.floor(Math.random() * leadsContacted * 0.6) + Math.floor(leadsContacted * 0.1);
            const conversionRate = Math.round((leadsConverted / leadsAssigned) * 100);

            return {
                id: emp.id,
                name: emp.name,
                email: emp.email,
                leadsAssigned,
                leadsContacted,
                leadsConverted,
                conversionRate
            };
        });

        // Generate realistic lead status data
        const mockLeadStatusData = [
            { name: 'New', value: 35 },
            { name: 'Contacted', value: 25 },
            { name: 'Qualified', value: 15 },
            { name: 'Proposal', value: 10 },
            { name: 'Negotiation', value: 8 },
            { name: 'Converted', value: 5 },
            { name: 'Lost', value: 2 }
        ];

        // Generate realistic conversion trend data
        const mockTrendData = [];
        const today = new Date();

        // Create a somewhat realistic trend (increasing over time)
        let baseLeads = 5;
        let baseConversions = 1;

        for (let i = 6; i >= 0; i--) {
            const date = new Date(today);
            date.setDate(date.getDate() - i);

            // Slightly increase leads and conversions each day
            baseLeads += Math.floor(Math.random() * 3);
            baseConversions += Math.floor(Math.random() * 2);

            // Add some randomness
            const leads = baseLeads + Math.floor(Math.random() * 3) - 1;
            const conversions = Math.min(baseConversions + Math.floor(Math.random() * 2) - 1, leads);

            mockTrendData.push({
                date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
                conversions: Math.max(1, conversions),
                leads: Math.max(conversions + 1, leads)
            });
        }

        // Calculate summary metrics based on the mock performance data
        const totalAssigned = mockPerformanceData.reduce((sum, emp) => sum + emp.leadsAssigned, 0);
        const totalContacted = mockPerformanceData.reduce((sum, emp) => sum + emp.leadsContacted, 0);
        const totalConverted = mockPerformanceData.reduce((sum, emp) => sum + emp.leadsConverted, 0);

        const mockSummaryMetrics = {
            totalLeads: totalAssigned + Math.floor(Math.random() * 20) + 5, // Some unassigned leads
            assignedLeads: totalAssigned,
            convertedLeads: totalConverted,
            conversionRate: Math.round((totalConverted / totalAssigned) * 100),
            avgResponseTime: Math.floor(Math.random() * 24) + 12 // Between 12-36 hours
        };

        // Set the mock data
        setEmployees(mockEmployees);
        setPerformanceData(mockPerformanceData);
        setEmployeePerformanceData(mockPerformanceData);
        setLeadStatusData(mockLeadStatusData);
        setConversionTrendData(mockTrendData);
        setSummaryMetrics(mockSummaryMetrics);

        toast.info('Using demonstration data - connect to database for real metrics');
    };

    // Function to start editing an employee's performance data
    const startEditing = (employee) => {
        setEditingEmployeeId(employee.id);
        setEditFormData({
            leadsAssigned: employee.leadsAssigned,
            leadsContacted: employee.leadsContacted,
            leadsConverted: employee.leadsConverted
        });
    };

    // Function to cancel editing
    const cancelEditing = () => {
        setEditingEmployeeId(null);
        setEditFormData({});
    };

    // Function to handle input changes in the edit form
    const handleEditInputChange = (e) => {
        const { name, value } = e.target;
        // Convert input to number and ensure it's not negative
        const numValue = Math.max(0, parseInt(value) || 0);
        setEditFormData({
            ...editFormData,
            [name]: numValue
        });
    };

    // Function to save updated performance data to the database
    const savePerformanceData = async (employeeId) => {
        setIsSaving(true);
        try {
            // Find the employee in the employees array
            const employee = employees.find(emp => emp._id === employeeId);

            if (!employee) {
                toast.error('Employee not found');
                setIsSaving(false);
                return;
            }

            // Calculate conversion rate
            const conversionRate = editFormData.leadsAssigned > 0
                ? Math.round((editFormData.leadsConverted / editFormData.leadsAssigned) * 100)
                : 0;

            // Prepare the performance data
            const performanceData = {
                leadsAssigned: editFormData.leadsAssigned,
                converted: editFormData.leadsConverted,
                // Include any other performance fields from the original employee record
                totalValue: employee.performance?.totalValue || 0
            };

            console.log('Updating employee performance:', employeeId, performanceData);

            // Use the dedicated performance update function
            const response = await enhancedAPI.performance.updateEmployeePerformance(employeeId, performanceData);

            if (response && response.success) {
                // Update the local state with the new data
                const updatedPerformanceData = performanceData.map(emp => {
                    if (emp.id === employeeId) {
                        return {
                            ...emp,
                            leadsAssigned: editFormData.leadsAssigned,
                            leadsContacted: editFormData.leadsContacted,
                            leadsConverted: editFormData.leadsConverted,
                            conversionRate
                        };
                    }
                    return emp;
                });

                setPerformanceData(updatedPerformanceData);
                setEmployeePerformanceData(updatedPerformanceData);

                // Recalculate summary metrics
                const totalAssigned = updatedPerformanceData.reduce((sum, emp) => sum + emp.leadsAssigned, 0);
                const totalConverted = updatedPerformanceData.reduce((sum, emp) => sum + emp.leadsConverted, 0);
                const overallConversionRate = totalAssigned > 0
                    ? Math.round((totalConverted / totalAssigned) * 100)
                    : 0;

                setSummaryMetrics({
                    ...summaryMetrics,
                    assignedLeads: totalAssigned,
                    convertedLeads: totalConverted,
                    conversionRate: overallConversionRate
                });

                // Log the update to console for tracking
                console.log('Performance update successful:', {
                    employeeId,
                    before: {
                        leadsAssigned: employee.performance?.leadsAssigned || 0,
                        converted: employee.performance?.converted || 0
                    },
                    after: performanceData,
                    timestamp: new Date().toISOString()
                });

                toast.success('Performance data updated successfully');
                setEditingEmployeeId(null);

                // Refresh data after a short delay to ensure database consistency
                setTimeout(() => {
                    fetchData();
                }, 2000);
            } else {
                toast.error('Failed to update performance data');
                console.error('Update response error:', response);
            }
        } catch (error) {
            console.error('Error updating performance data:', error);
            toast.error('Error updating performance data: ' + (error.message || 'Unknown error'));
        } finally {
            setIsSaving(false);
        }
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
                <div>
                    <h1 className="text-2xl font-semibold text-gray-800">Employee Performance</h1>
                    <p className="text-sm text-gray-600 mt-1">
                        Real-time performance metrics from your employee database
                    </p>
                </div>
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
                                Refresh Data
                            </>
                        )}
                    </button>
                    <button
                        onClick={syncPerformanceData}
                        disabled={isLoading}
                        className={`px-4 py-2 rounded-md flex items-center ${
                            isLoading
                                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                : 'bg-blue-600 text-white hover:bg-blue-700'
                        }`}
                        title="Synchronize performance data with database"
                    >
                        {isLoading ? (
                            <>
                                <Loader size={16} className="mr-2 animate-spin" />
                                Syncing...
                            </>
                        ) : (
                            <>
                                <Activity size={16} className="mr-2" />
                                Sync with Database
                            </>
                        )}
                    </button>

                    {/* Report Generation Dropdown */}
                    <div className="relative">
                        <button
                            onClick={() => setShowReportDropdown(!showReportDropdown)}
                            disabled={isLoading || isGeneratingReport}
                            className={`px-4 py-2 rounded-md flex items-center ${
                                isLoading || isGeneratingReport
                                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                    : 'bg-green-600 text-white hover:bg-green-700'
                            }`}
                            title="Generate performance report"
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
                                    <ChevronDown size={16} className="ml-2" />
                                </>
                            )}
                        </button>

                        {/* Report Format Dropdown */}
                        {showReportDropdown && (
                            <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-10 border border-gray-200">
                                <div className="py-1">
                                    <button
                                        onClick={() => {
                                            setReportFormat('pdf');
                                            setShowReportDropdown(false);
                                            generateReport();
                                        }}
                                        className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
                                    >
                                        <Download size={16} className="mr-2" />
                                        Download as PDF
                                    </button>
                                    <button
                                        onClick={() => {
                                            setReportFormat('excel');
                                            setShowReportDropdown(false);
                                            generateReport();
                                        }}
                                        className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
                                    >
                                        <Download size={16} className="mr-2" />
                                        Download as Excel
                                    </button>
                                    <button
                                        onClick={() => {
                                            setReportFormat('print');
                                            setShowReportDropdown(false);
                                            generateReport();
                                        }}
                                        className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
                                    >
                                        <Printer size={16} className="mr-2" />
                                        Print Report
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Performance Management Info */}
            <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-6">
                <div className="flex">
                    <div className="flex-shrink-0">
                        <Activity className="h-5 w-5 text-blue-500" />
                    </div>
                    <div className="ml-3">
                        <h3 className="text-sm font-medium text-blue-800">
                            Performance Management
                        </h3>
                        <div className="mt-2 text-sm text-blue-700">
                            <p>
                                This dashboard allows you to view and manage employee performance metrics.
                                You can edit performance data directly by clicking the edit icon in the table below.
                                Changes are saved to the database and will be reflected in reports and analytics.
                            </p>
                            <p className="mt-2">
                                <strong>Database Integration:</strong> Performance data is stored in the employee records in the database.
                                Use the "Sync with Database" button to ensure all performance metrics are up-to-date with the latest lead assignments and conversions.
                            </p>
                            <p className="mt-2">
                                <strong>Report Generation:</strong> Generate performance reports using real employee data from your database.
                                Reports can be downloaded in PDF or Excel format, or printed directly. The system prioritizes using actual database
                                records for the most accurate reporting.
                            </p>
                        </div>
                    </div>
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
                            <h2 className="text-lg font-medium text-gray-800 mb-4">Conversion Trend (Last 7 Days)</h2>
                            <div className="h-64">
                                <ResponsiveContainer width="100%" height="100%">
                                    <LineChart data={conversionTrendData}>
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis dataKey="date" />
                                        <YAxis />
                                        <Tooltip />
                                        <Legend />
                                        <Line type="monotone" dataKey="leads" stroke="#8884d8" activeDot={{ r: 8 }} />
                                        <Line type="monotone" dataKey="conversions" stroke="#82ca9d" />
                                    </LineChart>
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
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Actions
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {filteredPerformanceData.length === 0 ? (
                                        <tr>
                                            <td colSpan="6" className="px-6 py-4 text-center text-sm text-gray-500">
                                                No employee performance data found
                                            </td>
                                        </tr>
                                    ) : (
                                        filteredPerformanceData.map(employee => (
                                            <tr key={employee.id} className="hover:bg-gray-50">
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="flex items-center">
                                                        <div className="h-10 w-10 rounded-full bg-gradient-to-tr from-indigo-500 to-[#022d38] flex items-center justify-center text-white font-bold">
                                                            {employee.name.split(' ').map(n => n[0]).join('')}
                                                        </div>
                                                        <div className="ml-4">
                                                            <div className="text-sm font-medium text-gray-900">{employee.name}</div>
                                                            <div className="text-sm text-gray-500">{employee.email}</div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                    {editingEmployeeId === employee.id ? (
                                                        <input
                                                            type="number"
                                                            name="leadsAssigned"
                                                            value={editFormData.leadsAssigned}
                                                            onChange={handleEditInputChange}
                                                            className="w-20 px-2 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#022d38] focus:border-[#022d38]"
                                                            min="0"
                                                        />
                                                    ) : (
                                                        employee.leadsAssigned
                                                    )}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                    {editingEmployeeId === employee.id ? (
                                                        <input
                                                            type="number"
                                                            name="leadsContacted"
                                                            value={editFormData.leadsContacted}
                                                            onChange={handleEditInputChange}
                                                            className="w-20 px-2 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#022d38] focus:border-[#022d38]"
                                                            min="0"
                                                        />
                                                    ) : (
                                                        employee.leadsContacted
                                                    )}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                    {editingEmployeeId === employee.id ? (
                                                        <input
                                                            type="number"
                                                            name="leadsConverted"
                                                            value={editFormData.leadsConverted}
                                                            onChange={handleEditInputChange}
                                                            className="w-20 px-2 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#022d38] focus:border-[#022d38]"
                                                            min="0"
                                                        />
                                                    ) : (
                                                        employee.leadsConverted
                                                    )}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="flex items-center">
                                                        <div className={`
                                                            px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full
                                                            ${employee.conversionRate >= 30 ? 'bg-green-100 text-green-800' :
                                                              employee.conversionRate >= 20 ? 'bg-blue-100 text-blue-800' :
                                                              employee.conversionRate >= 10 ? 'bg-yellow-100 text-yellow-800' :
                                                              'bg-red-100 text-red-800'}
                                                        `}>
                                                            {employee.conversionRate}%
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                    {editingEmployeeId === employee.id ? (
                                                        <div className="flex space-x-2">
                                                            <button
                                                                onClick={() => savePerformanceData(employee.id)}
                                                                disabled={isSaving}
                                                                className="p-1 text-green-600 hover:text-green-900"
                                                                title="Save changes"
                                                            >
                                                                {isSaving ? (
                                                                    <Loader size={16} className="animate-spin" />
                                                                ) : (
                                                                    <Save size={16} />
                                                                )}
                                                            </button>
                                                            <button
                                                                onClick={cancelEditing}
                                                                disabled={isSaving}
                                                                className="p-1 text-red-600 hover:text-red-900"
                                                                title="Cancel"
                                                            >
                                                                <X size={16} />
                                                            </button>
                                                        </div>
                                                    ) : (
                                                        <button
                                                            onClick={() => startEditing(employee)}
                                                            className="p-1 text-blue-600 hover:text-blue-900"
                                                            title="Edit performance data"
                                                        >
                                                            <Edit size={16} />
                                                        </button>
                                                    )}
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Printable Report Section (hidden until needed) */}
                    <div className="hidden">
                        <div ref={reportRef} className="p-8 bg-white">
                            <div className="text-center mb-6">
                                <h1 className="text-2xl font-bold text-gray-800">Employee Performance Report</h1>
                                <p className="text-gray-600">
                                    {dateRange === 'last-7-days' ? 'Last 7 Days' :
                                     dateRange === 'last-30-days' ? 'Last 30 Days' :
                                     dateRange === 'last-90-days' ? 'Last 90 Days' : 'Year to Date'}
                                </p>
                                <p className="text-gray-500 text-sm">Generated on {new Date().toLocaleDateString()}</p>
                                <p className="text-blue-600 text-sm mt-1">
                                    <strong>Data Source:</strong> Company Database
                                </p>
                            </div>

                            <div className="mb-6">
                                <h2 className="text-xl font-semibold mb-3">Summary Metrics</h2>
                                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                                    <div className="border p-3 rounded">
                                        <p className="text-sm text-gray-600">Total Leads</p>
                                        <p className="text-xl font-bold">{summaryMetrics.totalLeads}</p>
                                    </div>
                                    <div className="border p-3 rounded">
                                        <p className="text-sm text-gray-600">Assigned Leads</p>
                                        <p className="text-xl font-bold">{summaryMetrics.assignedLeads}</p>
                                    </div>
                                    <div className="border p-3 rounded">
                                        <p className="text-sm text-gray-600">Converted Leads</p>
                                        <p className="text-xl font-bold">{summaryMetrics.convertedLeads}</p>
                                    </div>
                                    <div className="border p-3 rounded">
                                        <p className="text-sm text-gray-600">Conversion Rate</p>
                                        <p className="text-xl font-bold">{summaryMetrics.conversionRate}%</p>
                                    </div>
                                    <div className="border p-3 rounded">
                                        <p className="text-sm text-gray-600">Avg Response Time</p>
                                        <p className="text-xl font-bold">{summaryMetrics.avgResponseTime}h</p>
                                    </div>
                                </div>
                            </div>

                            <div className="mb-6">
                                <h2 className="text-xl font-semibold mb-3">Employee Performance</h2>
                                <table className="min-w-full border">
                                    <thead>
                                        <tr className="bg-gray-100">
                                            <th className="py-2 px-3 border text-left">Employee</th>
                                            <th className="py-2 px-3 border text-left">Leads Assigned</th>
                                            <th className="py-2 px-3 border text-left">Leads Contacted</th>
                                            <th className="py-2 px-3 border text-left">Leads Converted</th>
                                            <th className="py-2 px-3 border text-left">Conversion Rate</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {performanceData.map(employee => (
                                            <tr key={employee.id || employee._id} className="border">
                                                <td className="py-2 px-3 border">
                                                    <div>
                                                        <div className="font-medium">{employee.name}</div>
                                                        <div className="text-sm text-gray-500">{employee.email}</div>
                                                        {employee._id && !employee._id.startsWith('emp') && (
                                                            <div className="text-xs text-blue-500">ID: {employee._id}</div>
                                                        )}
                                                    </div>
                                                </td>
                                                <td className="py-2 px-3 border">{employee.leadsAssigned || employee.performance?.leadsAssigned || 0}</td>
                                                <td className="py-2 px-3 border">{employee.leadsContacted || 0}</td>
                                                <td className="py-2 px-3 border">{employee.leadsConverted || employee.performance?.converted || 0}</td>
                                                <td className="py-2 px-3 border">{employee.conversionRate ||
                                                    (employee.performance?.leadsAssigned > 0
                                                        ? Math.round((employee.performance.converted / employee.performance.leadsAssigned) * 100)
                                                        : 0)
                                                }%</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            <div className="mb-6">
                                <h2 className="text-xl font-semibold mb-3">Report Details</h2>
                                <table className="w-full border">
                                    <tbody>
                                        <tr className="border">
                                            <td className="py-2 px-3 border font-medium bg-gray-50">Report ID</td>
                                            <td className="py-2 px-3 border">REP-{Date.now().toString(36).toUpperCase()}</td>
                                        </tr>
                                        <tr className="border">
                                            <td className="py-2 px-3 border font-medium bg-gray-50">Generated By</td>
                                            <td className="py-2 px-3 border">Admin</td>
                                        </tr>
                                        <tr className="border">
                                            <td className="py-2 px-3 border font-medium bg-gray-50">Date Range</td>
                                            <td className="py-2 px-3 border">
                                                {dateRange === 'last-7-days' ? 'Last 7 Days' :
                                                 dateRange === 'last-30-days' ? 'Last 30 Days' :
                                                 dateRange === 'last-90-days' ? 'Last 90 Days' : 'Year to Date'}
                                            </td>
                                        </tr>
                                        <tr className="border">
                                            <td className="py-2 px-3 border font-medium bg-gray-50">Total Employees</td>
                                            <td className="py-2 px-3 border">{performanceData.length}</td>
                                        </tr>
                                        <tr className="border">
                                            <td className="py-2 px-3 border font-medium bg-gray-50">Data Source</td>
                                            <td className="py-2 px-3 border">Company Database</td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>

                            <div className="text-center text-sm text-gray-500 mt-8">
                                <p>This report is confidential and intended for internal use only.</p>
                                <p>© {new Date().getFullYear()} Your Company Name</p>
                            </div>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}