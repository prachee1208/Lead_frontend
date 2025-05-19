import { useState, useEffect } from 'react';
import axios from 'axios';
import {
    Search, Filter, Edit, Trash2, RefreshCw, AlertCircle,
    CheckCircle, UserPlus, Loader, Eye, Database,
    Save, X, Phone, Mail, Calendar, Info
} from 'lucide-react';
import { toast } from 'react-toastify';
import enhancedAPI, { getConnectionStatus } from '../../services/enhancedAPI';
import dataFetcher from '../../services/dataFetcher';
import ConnectionMonitor from '../../Components/common/ConnectionMonitor';

export default function AssignedLeads() {
    const [leads, setLeads] = useState([]);
    const [employees, setEmployees] = useState([]);
    const [isLoadingLeads, setIsLoadingLeads] = useState(true);
    const [isLoadingEmployees, setIsLoadingEmployees] = useState(true);
    const [error, setError] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [employeeFilter, setEmployeeFilter] = useState('all');
    const [sortConfig, setSortConfig] = useState({ key: 'updatedAt', direction: 'desc' });
    const [selectedLead, setSelectedLead] = useState(null);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [showReassignModal, setShowReassignModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showViewModal, setShowViewModal] = useState(false);
    const [selectedEmployee, setSelectedEmployee] = useState(null);
    const [isProcessing, setIsProcessing] = useState(false);

    // Edit lead form state
    const [editForm, setEditForm] = useState({
        name: '',
        company: '',
        email: '',
        phone: '',
        status: '',
        source: '',
        notes: ''
    });

    // Fetch assigned leads
    const fetchAssignedLeads = async () => {
        setIsLoadingLeads(true);
        setError(null);

        try {
            // Get the current user ID from localStorage
            const userId = localStorage.getItem('userId');

            if (!userId) {
                console.warn('User ID not found in localStorage');
                setIsLoadingLeads(false);
                setError('User ID not found. Please log in again.');
                return;
            }

            console.log('Fetching assigned leads for manager ID:', userId);

            // SIMPLIFIED APPROACH: Get all leads and filter on the client side
            // This is more reliable than depending on specific API endpoints
            try {
                console.log('Getting all leads and filtering on client side');
                const allLeadsResponse = await enhancedAPI.leads.getAll();
                console.log('All leads response:', allLeadsResponse);

                if (allLeadsResponse && allLeadsResponse.data && allLeadsResponse.data.data) {
                    const allLeads = allLeadsResponse.data.data;
                    console.log(`Found ${allLeads.length} total leads in database`);

                    // Filter leads that have both a manager and an employee assigned
                    const assignedLeads = allLeads.filter(lead => {
                        return lead.assignedEmployee && lead.assignedManager;
                    });

                    console.log(`Found ${assignedLeads.length} leads with both manager and employee assigned`);

                    // Create a response object in the expected format
                    const formattedResponse = {
                        data: {
                            success: true,
                            count: assignedLeads.length,
                            data: assignedLeads
                        }
                    };

                    processLeadsResponse(formattedResponse);
                    return;
                } else {
                    console.error('Invalid response format from getAll API');
                }
            } catch (error) {
                console.error('Error getting all leads:', error);
            }

            // Fallback to direct API call if the above approach fails
            try {
                console.log('Falling back to direct API call');
                const directResponse = await enhancedAPI.leads.getAssignedByManager(userId);
                console.log('Direct API response:', directResponse);

                if (directResponse && directResponse.data) {
                    processLeadsResponse(directResponse);
                    return;
                }
            } catch (directError) {
                console.error('Direct API call failed:', directError);
            }

            // Last resort: Use the data fetcher with caching
            console.log('Using data fetcher as last resort');
            const response = await dataFetcher.fetchAssignedLeads(userId, {}, {
                forceRefresh: true,
                offlineData: { data: { data: [] } },
                onError: (err) => {
                    console.error('Error in data fetcher:', err);
                }
            });

            processLeadsResponse(response);
        } catch (err) {
            console.error('Error fetching assigned leads:', err);
            setError('Failed to load assigned leads. Please try again.');
            toast.error('Failed to load assigned leads: ' + (err.message || 'Unknown error'));
        } finally {
            setIsLoadingLeads(false);
        }
    };

    // Process the leads API response
    const processLeadsResponse = (response) => {
        console.log('Processing leads response:', response);

        if (!response) {
            console.error('No response received from API');
            setError('No response received from API. Please try again.');
            return;
        }

        // Check for data in the response
        let responseData = [];

        try {
            // Handle different response structures
            if (response.data) {
                if (Array.isArray(response.data)) {
                    // Direct array response
                    responseData = response.data;
                    console.log('Response data is a direct array with', responseData.length, 'items');
                } else if (response.data.data && Array.isArray(response.data.data)) {
                    // Nested data.data array (most common format)
                    responseData = response.data.data;
                    console.log('Response has data.data array with', responseData.length, 'items');
                } else if (response.data.success && response.data.data && Array.isArray(response.data.data)) {
                    // Success response format
                    responseData = response.data.data;
                    console.log('Response has success.data array with', responseData.length, 'items');
                } else if (typeof response.data === 'object') {
                    // Try to find any array in the response
                    for (const key in response.data) {
                        if (Array.isArray(response.data[key])) {
                            responseData = response.data[key];
                            console.log(`Found array in response.data.${key} with`, responseData.length, 'items');
                            break;
                        }
                    }

                    // If still no data, check if response.data itself is a lead object
                    if (responseData.length === 0 && response.data._id) {
                        responseData = [response.data];
                        console.log('Response data is a single lead object');
                    }
                }
            }

            // Last resort: try to parse the entire response as an array
            if (responseData.length === 0 && Array.isArray(response)) {
                responseData = response;
                console.log('Response itself is an array with', responseData.length, 'items');
            }

            console.log('Final extracted response data:', responseData);
        } catch (error) {
            console.error('Error processing response data:', error);
        }

        if (responseData.length > 0) {
            try {
                // Transform the API response to match our component's data structure
                const formattedLeads = responseData.map(lead => {
                    try {
                        // Handle potential missing fields safely
                        return {
                            id: lead._id || lead.id || 'unknown-id',
                            name: lead.name || 'Unnamed Lead',
                            company: lead.company || 'N/A',
                            email: lead.email || 'N/A',
                            phone: lead.phone || 'N/A',
                            status: lead.status || 'New',
                            source: lead.source || 'N/A',
                            notes: lead.notes || '',
                            assignedEmployee: lead.assignedEmployee ?
                                (typeof lead.assignedEmployee === 'object' ?
                                    (lead.assignedEmployee.name || 'Employee ' + lead.assignedEmployee._id) :
                                    (typeof lead.assignedEmployee === 'string' ?
                                        lead.assignedEmployee :
                                        'Employee ID: ' + lead.assignedEmployee)) : 'Unassigned',
                            assignedEmployeeId: lead.assignedEmployee ?
                                (typeof lead.assignedEmployee === 'object' ?
                                    lead.assignedEmployee._id :
                                    (typeof lead.assignedEmployee === 'string' ?
                                        lead.assignedEmployee :
                                        lead.assignedEmployee.toString())) : null,
                            assignedDate: lead.updatedAt ? new Date(lead.updatedAt).toLocaleDateString() : 'N/A',
                            createdAt: lead.createdAt ? new Date(lead.createdAt).toLocaleDateString() : 'N/A'
                        };
                    } catch (err) {
                        console.error('Error formatting individual lead:', err, lead);
                        // Return a placeholder for malformed leads
                        return {
                            id: lead._id || 'error-id',
                            name: lead.name || 'Error: Malformed Lead',
                            company: 'Error',
                            email: 'N/A',
                            phone: 'N/A',
                            status: 'Error',
                            source: 'N/A',
                            notes: 'This lead has formatting errors',
                            assignedEmployee: 'Unknown',
                            assignedEmployeeId: null,
                            assignedDate: 'N/A',
                            createdAt: 'N/A'
                        };
                    }
                });

                console.log('Formatted leads:', formattedLeads);
                setLeads(formattedLeads);

                // Clear any previous error
                setError(null);

                // If we're offline but have cached data, show a toast
                if (!getConnectionStatus() && formattedLeads.length > 0) {
                    toast.info('Showing cached leads data. You are currently offline.');
                }

                // Show success message
                toast.success(`Found ${formattedLeads.length} assigned leads`);
            } catch (error) {
                console.error('Error formatting leads:', error);
                setError('Error formatting leads data. Please try again.');
                setLeads([]);
            }
        } else {
            // If no data is returned, use empty array
            setLeads([]);
            console.log('No assigned leads data returned from API');

            // Show a message to the user
            setError('No assigned leads found. Try assigning some leads to employees first.');

            // Offer to create test leads if in development
            if (process.env.NODE_ENV === 'development') {
                console.log('In development mode - could create test leads');
                toast.info('No assigned leads found. Use the "Create Test Leads" button to create some test data.');
            }
        }
    };





    // Fetch employees for reassignment
    const fetchEmployees = async () => {
        setIsLoadingEmployees(true);
        try {
            const response = await dataFetcher.fetchEmployees({}, {
                forceRefresh: true,
                offlineData: { data: { data: [] } }
            });

            if (response && response.data && response.data.data) {
                const formattedEmployees = response.data.data
                    .filter(user => user.role === 'employee')
                    .map(employee => ({
                        id: employee._id,
                        name: employee.name,
                        email: employee.email,
                        avatar: employee.name.charAt(0).toUpperCase(),
                        leadsAssigned: employee.leadsAssigned || 0
                    }));
                setEmployees(formattedEmployees);
            } else {
                setEmployees([]);
            }
        } catch (error) {
            console.error('Error fetching employees:', error);
            toast.error('Failed to load employees: ' + (error.message || 'Unknown error'));
        } finally {
            setIsLoadingEmployees(false);
        }
    };

    // Check if user is logged in and has a valid token
    const checkUserAuth = () => {
        const userId = localStorage.getItem('userId');
        const token = localStorage.getItem('token');
        const userRole = localStorage.getItem('userRole');

        console.log('User authentication check:');
        console.log('- User ID:', userId);
        console.log('- Token exists:', !!token);
        console.log('- User role:', userRole);

        if (!userId || !token) {
            setError('You are not logged in or your session has expired. Please log in again.');
            return false;
        }

        if (userRole !== 'manager' && userRole !== 'admin') {
            setError('You do not have permission to view this page. Only managers can view assigned leads.');
            return false;
        }

        // For testing purposes, set a hardcoded manager ID if needed
        if (process.env.NODE_ENV === 'development' && !userId) {
            console.log('Setting hardcoded manager ID for development');
            localStorage.setItem('userId', '6822d9e9585eed55a287e4c3');
            localStorage.setItem('userRole', 'manager');
        }

        return true;
    };



    // Load data on component mount
    useEffect(() => {
        if (checkUserAuth()) {
            fetchAssignedLeads();
            fetchEmployees();
        }
    }, []);

    // Handle sorting
    const requestSort = (key) => {
        let direction = 'asc';
        if (sortConfig.key === key && sortConfig.direction === 'asc') {
            direction = 'desc';
        }
        setSortConfig({ key, direction });
    };

    // Get sort icon
    const getSortIcon = (key) => {
        if (sortConfig.key !== key) return null;
        return sortConfig.direction === 'asc' ? '↑' : '↓';
    };

    // Filter and sort leads
    const filteredAndSortedLeads = leads
        .filter(lead => {
            // Apply search filter
            const matchesSearch =
                lead.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                lead.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
                lead.email.toLowerCase().includes(searchQuery.toLowerCase());

            // Apply status filter
            const matchesStatus = statusFilter === 'all' || lead.status === statusFilter;

            // Apply employee filter
            const matchesEmployee = employeeFilter === 'all' ||
                (lead.assignedEmployeeId && lead.assignedEmployeeId === employeeFilter);

            return matchesSearch && matchesStatus && matchesEmployee;
        })
        .sort((a, b) => {
            if (a[sortConfig.key] < b[sortConfig.key]) {
                return sortConfig.direction === 'asc' ? -1 : 1;
            }
            if (a[sortConfig.key] > b[sortConfig.key]) {
                return sortConfig.direction === 'asc' ? 1 : -1;
            }
            return 0;
        });

    // Get status color
    const getStatusColor = (status) => {
        switch(status) {
            case 'New': return 'bg-indigo-100 text-indigo-800 border border-indigo-200';
            case 'Contacted': return 'bg-amber-100 text-amber-800 border border-amber-200';
            case 'Qualified': return 'bg-blue-100 text-blue-800 border border-blue-200';
            case 'Converted': return 'bg-emerald-100 text-emerald-800 border border-emerald-200';
            case 'Lost': return 'bg-red-100 text-red-800 border border-red-200';
            default: return 'bg-slate-100 text-slate-800 border border-slate-200';
        }
    };

    // Handle lead deletion
    const handleDeleteLead = async () => {
        if (!selectedLead) return;

        setIsProcessing(true);
        try {
            console.log('Deleting lead with ID:', selectedLead.id);

            // First try the enhanced API
            try {
                const response = await enhancedAPI.leads.delete(selectedLead.id);
                console.log('Delete response:', response);

                if (response && response.success) {
                    // Remove the lead from the state
                    setLeads(leads.filter(lead => lead.id !== selectedLead.id));
                    toast.success('Lead deleted successfully from database');
                    setShowDeleteModal(false);
                    setSelectedLead(null);
                    return;
                }
            } catch (enhancedError) {
                console.error('Enhanced API delete failed, trying direct API call:', enhancedError);
            }

            // If enhanced API fails, try direct axios call
            try {
                const API_URL = 'https://lead-backend-jcyc.onrender.com/api';
                const token = localStorage.getItem('token');

                const axiosResponse = await axios.delete(`${API_URL}/leads/${selectedLead.id}`, {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });

                console.log('Direct axios delete response:', axiosResponse);

                if (axiosResponse && axiosResponse.data && axiosResponse.data.success) {
                    // Remove the lead from the state
                    setLeads(leads.filter(lead => lead.id !== selectedLead.id));
                    toast.success('Lead deleted successfully from database');
                } else {
                    toast.error('Failed to delete lead from database');
                }
            } catch (axiosError) {
                console.error('Direct axios delete failed:', axiosError);
                toast.error('Error deleting lead: ' + (axiosError.message || 'Unknown error'));

                // If both API calls fail but we're in development, remove from UI anyway
                if (process.env.NODE_ENV === 'development') {
                    setLeads(leads.filter(lead => lead.id !== selectedLead.id));
                    toast.warning('Lead removed from UI only (database operation failed)');
                }
            }
        } catch (error) {
            console.error('Error in delete process:', error);
            toast.error('Error deleting lead: ' + (error.message || 'Unknown error'));
        } finally {
            setIsProcessing(false);
            setShowDeleteModal(false);
            setSelectedLead(null);
        }
    };

    // Handle lead reassignment
    const handleReassignLead = async () => {
        if (!selectedLead || !selectedEmployee) return;

        setIsProcessing(true);
        try {
            const managerId = localStorage.getItem('userId');
            console.log('Reassigning lead:', selectedLead.id);
            console.log('From:', selectedLead.assignedEmployee);
            console.log('To:', selectedEmployee.name);
            console.log('Manager ID:', managerId);

            // First try the enhanced API
            try {
                const response = await enhancedAPI.leads.assignToEmployee(
                    selectedLead.id,
                    selectedEmployee.id,
                    managerId
                );

                console.log('Reassignment response:', response);

                if (response && response.success) {
                    // Update the lead in the state
                    updateLeadAssignmentInState();
                    toast.success(`Lead reassigned to ${selectedEmployee.name} in database`);
                    return;
                }
            } catch (enhancedError) {
                console.error('Enhanced API reassignment failed, trying direct API call:', enhancedError);
            }

            // If enhanced API fails, try direct axios call
            try {
                const API_URL = 'https://lead-backend-jcyc.onrender.com/api';
                const token = localStorage.getItem('token');

                const axiosResponse = await axios.post(
                    `${API_URL}/leads/assign/employee`,
                    {
                        leadId: selectedLead.id,
                        employeeId: selectedEmployee.id,
                        managerId: managerId
                    },
                    {
                        headers: {
                            'Authorization': `Bearer ${token}`,
                            'Content-Type': 'application/json'
                        }
                    }
                );

                console.log('Direct axios reassignment response:', axiosResponse);

                if (axiosResponse && axiosResponse.data && axiosResponse.data.success) {
                    // Update the lead in the state
                    updateLeadAssignmentInState();
                    toast.success(`Lead reassigned to ${selectedEmployee.name} in database`);
                } else {
                    toast.error('Failed to reassign lead in database');

                    // If in development, update UI anyway
                    if (process.env.NODE_ENV === 'development') {
                        updateLeadAssignmentInState();
                        toast.warning('Lead reassigned in UI only (database operation failed)');
                    }
                }
            } catch (axiosError) {
                console.error('Direct axios reassignment failed:', axiosError);
                toast.error('Error reassigning lead: ' + (axiosError.message || 'Unknown error'));

                // If in development, update UI anyway
                if (process.env.NODE_ENV === 'development') {
                    updateLeadAssignmentInState();
                    toast.warning('Lead reassigned in UI only (database operation failed)');
                }
            }
        } catch (error) {
            console.error('Error in reassignment process:', error);
            toast.error('Error reassigning lead: ' + (error.message || 'Unknown error'));
        } finally {
            setIsProcessing(false);
            setShowReassignModal(false);
            setSelectedLead(null);
            setSelectedEmployee(null);
        }
    };

    // Helper function to update lead assignment in state
    const updateLeadAssignmentInState = () => {
        setLeads(leads.map(lead => {
            if (lead.id === selectedLead.id) {
                return {
                    ...lead,
                    assignedEmployee: selectedEmployee.name,
                    assignedEmployeeId: selectedEmployee.id,
                    assignedDate: new Date().toLocaleDateString()
                };
            }
            return lead;
        }));
    };

    // Open edit modal with lead data
    const openEditModal = (lead) => {
        setSelectedLead(lead);
        setEditForm({
            name: lead.name,
            company: lead.company,
            email: lead.email,
            phone: lead.phone,
            status: lead.status,
            source: lead.source || '',
            notes: lead.notes || ''
        });
        setShowEditModal(true);
        setShowActionMenu(null);
    };

    // Handle form input changes
    const handleEditFormChange = (e) => {
        const { name, value } = e.target;
        setEditForm(prev => ({
            ...prev,
            [name]: value
        }));
    };

    // Handle lead update
    const handleUpdateLead = async () => {
        if (!selectedLead) return;

        setIsProcessing(true);
        try {
            console.log('Updating lead with ID:', selectedLead.id);
            console.log('Update data:', editForm);

            // First try the enhanced API
            try {
                const response = await enhancedAPI.leads.update(selectedLead.id, editForm);
                console.log('Update response:', response);

                if (response && response.success) {
                    // Update the lead in the state
                    updateLeadInState();
                    toast.success('Lead updated successfully in database');
                    setShowEditModal(false);
                    setSelectedLead(null);
                    return;
                }
            } catch (enhancedError) {
                console.error('Enhanced API update failed, trying direct API call:', enhancedError);
            }

            // If enhanced API fails, try direct axios call
            try {
                const API_URL = 'https://lead-backend-jcyc.onrender.com/api';
                const token = localStorage.getItem('token');

                const axiosResponse = await axios.put(
                    `${API_URL}/leads/${selectedLead.id}`,
                    editForm,
                    {
                        headers: {
                            'Authorization': `Bearer ${token}`,
                            'Content-Type': 'application/json'
                        }
                    }
                );

                console.log('Direct axios update response:', axiosResponse);

                if (axiosResponse && axiosResponse.data && axiosResponse.data.success) {
                    // Update the lead in the state
                    updateLeadInState();
                    toast.success('Lead updated successfully in database');
                } else {
                    toast.error('Failed to update lead in database');

                    // If in development, update UI anyway
                    if (process.env.NODE_ENV === 'development') {
                        updateLeadInState();
                        toast.warning('Lead updated in UI only (database operation failed)');
                    }
                }
            } catch (axiosError) {
                console.error('Direct axios update failed:', axiosError);
                toast.error('Error updating lead: ' + (axiosError.message || 'Unknown error'));

                // If in development, update UI anyway
                if (process.env.NODE_ENV === 'development') {
                    updateLeadInState();
                    toast.warning('Lead updated in UI only (database operation failed)');
                }
            }
        } catch (error) {
            console.error('Error in update process:', error);
            toast.error('Error updating lead: ' + (error.message || 'Unknown error'));
        } finally {
            setIsProcessing(false);
            setShowEditModal(false);
            setSelectedLead(null);
        }
    };

    // Helper function to update lead in state
    const updateLeadInState = () => {
        setLeads(leads.map(lead => {
            if (lead.id === selectedLead.id) {
                return {
                    ...lead,
                    name: editForm.name,
                    company: editForm.company,
                    email: editForm.email,
                    phone: editForm.phone,
                    status: editForm.status,
                    source: editForm.source,
                    notes: editForm.notes
                };
            }
            return lead;
        }));
    };

    return (
        <div className="space-y-6">
            {/* Connection status monitor */}
            <ConnectionMonitor />

            <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-3 md:space-y-0">
                <h1 className="text-2xl font-semibold text-gray-800">Assigned Leads</h1>
                <div className="flex flex-wrap items-center gap-2">
                    {!getConnectionStatus() && (
                        <span className="text-xs text-amber-600 flex items-center">
                            <Database size={14} className="mr-1" />
                            Using cached data
                        </span>
                    )}

                    <button
                        onClick={fetchAssignedLeads}
                        disabled={isLoadingLeads}
                        className={`px-4 py-2 rounded-md flex items-center ${
                            isLoadingLeads
                                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                : 'bg-blue-600 text-white hover:bg-blue-700'
                        }`}
                        title="Refresh leads"
                    >
                        {isLoadingLeads ? (
                            <>
                                <Loader size={16} className="mr-2 animate-spin" />
                                Refreshing...
                            </>
                        ) : (
                            <>
                                <RefreshCw size={16} className="mr-2" />
                                Refresh Leads
                            </>
                        )}
                    </button>
                </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 text-blue-800 px-4 py-3 rounded-md flex items-center mb-4">
                <AlertCircle size={20} className="mr-2 text-blue-500" />
                <div>
                    <p className="text-sm font-medium">This page shows all leads that have been assigned to employees from the database.</p>
                    <p className="text-xs mt-1">You can manage these leads by:</p>
                    <ul className="text-xs mt-1 list-disc list-inside ml-2">
                        <li>Editing lead details (name, contact info, status, etc.)</li>
                        <li>Reassigning leads to different employees</li>
                        <li>Deleting leads that are no longer needed</li>
                        <li>Filtering and searching for specific leads</li>
                    </ul>
                    <p className="text-xs mt-1">All changes are saved to the database and will be visible to the assigned employees.</p>
                </div>
            </div>

            {/* Error Message */}
            {error && (
                <div className="bg-red-100 border border-red-200 text-red-800 px-4 py-3 rounded-md flex items-center">
                    <AlertCircle size={20} className="mr-2" />
                    <span>{error}</span>
                    <button
                        onClick={fetchAssignedLeads}
                        className="ml-auto text-red-800 hover:text-red-900"
                    >
                        <RefreshCw size={16} />
                    </button>
                </div>
            )}

            {/* Loading State */}
            {isLoadingLeads ? (
                <div className="flex flex-col items-center justify-center min-h-[60vh] p-6">
                    <Loader className="w-12 h-12 text-blue-500 animate-spin mb-4" />
                    <h2 className="text-xl font-semibold text-gray-700">Loading Assigned Leads...</h2>
                    <p className="text-gray-500 mt-2">Please wait while we fetch the assigned leads</p>
                </div>
            ) : (
                <>
                    {/* Filters and Search */}
                    <div className="bg-white rounded-lg shadow p-4">
                        <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
                            <div className="flex flex-col md:flex-row md:items-center space-y-4 md:space-y-0 md:space-x-4">
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <Search size={18} className="text-gray-400" />
                                    </div>
                                    <input
                                        type="text"
                                        placeholder="Search leads..."
                                        className="pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#022d38] focus:border-[#022d38]"
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                    />
                                </div>
                                <div className="flex items-center space-x-2">
                                    <Filter size={18} className="text-gray-400" />
                                    <select
                                        className="border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#022d38] focus:border-[#022d38] py-2 px-3"
                                        value={statusFilter}
                                        onChange={(e) => setStatusFilter(e.target.value)}
                                    >
                                        <option value="all">All Statuses</option>
                                        <option value="New">New</option>
                                        <option value="Contacted">Contacted</option>
                                        <option value="Qualified">Qualified</option>
                                        <option value="Converted">Converted</option>
                                        <option value="Lost">Lost</option>
                                    </select>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <UserPlus size={18} className="text-gray-400" />
                                    <select
                                        className="border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#022d38] focus:border-[#022d38] py-2 px-3"
                                        value={employeeFilter}
                                        onChange={(e) => setEmployeeFilter(e.target.value)}
                                    >
                                        <option value="all">All Employees</option>
                                        {employees.map(employee => (
                                            <option key={employee.id} value={employee.id}>
                                                {employee.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Leads Table */}
                    <div className="bg-white rounded-lg shadow overflow-hidden">
                        {filteredAndSortedLeads.length === 0 ? (
                            <div className="text-center py-12">
                                <AlertCircle size={48} className="mx-auto text-gray-300 mb-4" />
                                <h3 className="text-lg font-medium text-gray-900">No assigned leads found</h3>
                                <p className="mt-1 text-sm text-gray-500">
                                    {searchQuery || statusFilter !== 'all' || employeeFilter !== 'all'
                                        ? "Try adjusting your search or filters"
                                        : "You haven't assigned any leads to employees yet"}
                                </p>

                                <div className="mt-4">
                                    <button
                                        onClick={() => window.location.href = '/manager/assignleads'}
                                        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center mx-auto"
                                    >
                                        <UserPlus size={16} className="mr-2" />
                                        Go to Assign Leads
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th
                                                scope="col"
                                                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                                                onClick={() => requestSort('name')}
                                            >
                                                <div className="flex items-center">
                                                    Lead {getSortIcon('name')}
                                                </div>
                                            </th>
                                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Contact Info
                                            </th>
                                            <th
                                                scope="col"
                                                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                                                onClick={() => requestSort('status')}
                                            >
                                                <div className="flex items-center">
                                                    Status {getSortIcon('status')}
                                                </div>
                                            </th>
                                            <th
                                                scope="col"
                                                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                                                onClick={() => requestSort('assignedEmployee')}
                                            >
                                                <div className="flex items-center">
                                                    Assigned To {getSortIcon('assignedEmployee')}
                                                </div>
                                            </th>
                                            <th
                                                scope="col"
                                                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                                                onClick={() => requestSort('assignedDate')}
                                            >
                                                <div className="flex items-center">
                                                    Assigned Date {getSortIcon('assignedDate')}
                                                </div>
                                            </th>
                                            <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Actions
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {filteredAndSortedLeads.map((lead) => (
                                            <tr key={lead.id} className="hover:bg-gray-50">
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="flex items-center">
                                                        <div>
                                                            <div className="text-sm font-medium text-gray-900">{lead.name}</div>
                                                            <div className="text-sm text-gray-500">{lead.company}</div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="text-sm text-gray-900">{lead.email}</div>
                                                    <div className="text-sm text-gray-500">{lead.phone}</div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(lead.status)}`}>
                                                        {lead.status}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                    {lead.assignedEmployee}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                    {lead.assignedDate}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                    <div className="flex items-center justify-end space-x-2">
                                                        {/* View button */}
                                                        <button
                                                            onClick={() => {
                                                                setSelectedLead(lead);
                                                                // Show lead details in a modal
                                                                setShowViewModal(true);
                                                            }}
                                                            className="p-1.5 rounded-full hover:bg-blue-50 text-blue-600 hover:text-blue-800 transition-colors"
                                                            title="View Lead Details"
                                                        >
                                                            <Eye size={18} />
                                                        </button>

                                                        {/* Edit button */}
                                                        <button
                                                            onClick={() => openEditModal(lead)}
                                                            className="p-1.5 rounded-full hover:bg-green-50 text-green-600 hover:text-green-800 transition-colors"
                                                            title="Edit Lead"
                                                        >
                                                            <Edit size={18} />
                                                        </button>

                                                        {/* Reassign button */}
                                                        <button
                                                            onClick={() => {
                                                                setSelectedLead(lead);
                                                                setShowReassignModal(true);
                                                            }}
                                                            className="p-1.5 rounded-full hover:bg-amber-50 text-amber-600 hover:text-amber-800 transition-colors"
                                                            title="Reassign Lead"
                                                        >
                                                            <UserPlus size={18} />
                                                        </button>

                                                        {/* Delete button */}
                                                        <button
                                                            onClick={() => {
                                                                setSelectedLead(lead);
                                                                setShowDeleteModal(true);
                                                            }}
                                                            className="p-1.5 rounded-full hover:bg-red-50 text-red-600 hover:text-red-800 transition-colors"
                                                            title="Delete Lead"
                                                        >
                                                            <Trash2 size={18} />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </>
            )}

            {/* Delete Confirmation Modal */}
            {showDeleteModal && selectedLead && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg shadow-lg w-full max-w-md">
                        <div className="px-6 py-4 border-b border-gray-200">
                            <h3 className="text-lg font-medium text-gray-900">Confirm Deletion</h3>
                        </div>
                        <div className="p-6">
                            <p className="text-gray-700">
                                Are you sure you want to delete the lead: <span className="font-medium">{selectedLead.name}</span>?
                            </p>
                            <p className="text-sm text-red-500 mt-2">
                                This action cannot be undone.
                            </p>
                            <div className="mt-6 flex justify-end space-x-3">
                                <button
                                    onClick={() => {
                                        setShowDeleteModal(false);
                                        setSelectedLead(null);
                                    }}
                                    className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleDeleteLead}
                                    disabled={isProcessing}
                                    className={`px-4 py-2 rounded-md ${
                                        isProcessing
                                            ? 'bg-gray-400 text-white cursor-not-allowed'
                                            : 'bg-red-600 text-white hover:bg-red-700'
                                    }`}
                                >
                                    {isProcessing ? (
                                        <>
                                            <Loader size={16} className="inline mr-2 animate-spin" />
                                            Deleting...
                                        </>
                                    ) : (
                                        'Delete Lead'
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Reassign Modal */}
            {showReassignModal && selectedLead && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg shadow-lg w-full max-w-md">
                        <div className="px-6 py-4 border-b border-gray-200">
                            <h3 className="text-lg font-medium text-gray-900">Reassign Lead</h3>
                        </div>
                        <div className="p-6">
                            <p className="text-gray-700 mb-4">
                                Reassign <span className="font-medium">{selectedLead.name}</span> to a different employee:
                            </p>

                            {isLoadingEmployees ? (
                                <div className="flex justify-center items-center p-4">
                                    <Loader size={24} className="text-blue-500 animate-spin" />
                                </div>
                            ) : (
                                <div className="max-h-60 overflow-y-auto space-y-2">
                                    {employees.length === 0 ? (
                                        <p className="text-center text-gray-500">No employees found</p>
                                    ) : (
                                        employees.map(employee => (
                                            <button
                                                key={employee.id}
                                                onClick={() => setSelectedEmployee(employee)}
                                                className={`w-full flex items-center p-3 rounded-md ${
                                                    selectedEmployee?.id === employee.id
                                                        ? 'bg-indigo-50 border border-indigo-200'
                                                        : 'border border-gray-200 hover:bg-gray-50'
                                                }`}
                                            >
                                                <div className="h-10 w-10 rounded-full bg-gradient-to-tr from-indigo-500 to-[#022d38] flex items-center justify-center text-white font-bold">
                                                    {employee.avatar}
                                                </div>
                                                <div className="ml-3 text-left">
                                                    <div className="text-sm font-medium text-gray-900">{employee.name}</div>
                                                    <div className="text-xs text-gray-500">{employee.leadsAssigned} leads assigned</div>
                                                </div>
                                                {selectedEmployee?.id === employee.id && (
                                                    <CheckCircle size={18} className="ml-auto text-indigo-600" />
                                                )}
                                            </button>
                                        ))
                                    )}
                                </div>
                            )}

                            <div className="mt-6 flex justify-end space-x-3">
                                <button
                                    onClick={() => {
                                        setShowReassignModal(false);
                                        setSelectedLead(null);
                                        setSelectedEmployee(null);
                                    }}
                                    className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleReassignLead}
                                    disabled={isProcessing || !selectedEmployee}
                                    className={`px-4 py-2 rounded-md ${
                                        isProcessing || !selectedEmployee
                                            ? 'bg-gray-400 text-white cursor-not-allowed'
                                            : 'bg-[#022d38] text-white hover:bg-[#043c4a]'
                                    }`}
                                >
                                    {isProcessing ? (
                                        <>
                                            <Loader size={16} className="inline mr-2 animate-spin" />
                                            Reassigning...
                                        </>
                                    ) : (
                                        'Reassign Lead'
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* View Lead Modal */}
            {showViewModal && selectedLead && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg shadow-lg w-full max-w-2xl">
                        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
                            <h3 className="text-lg font-medium text-gray-900">Lead Details</h3>
                            <button
                                onClick={() => setShowViewModal(false)}
                                className="text-gray-400 hover:text-gray-500"
                            >
                                <X size={20} />
                            </button>
                        </div>
                        <div className="p-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-4">
                                    <div>
                                        <h4 className="text-sm font-medium text-gray-500">Lead Information</h4>
                                        <div className="mt-2 p-4 bg-gray-50 rounded-md">
                                            <div className="mb-3">
                                                <span className="block text-xs text-gray-500">Name</span>
                                                <span className="block text-sm font-medium">{selectedLead.name}</span>
                                            </div>
                                            <div className="mb-3">
                                                <span className="block text-xs text-gray-500">Company</span>
                                                <span className="block text-sm font-medium">{selectedLead.company}</span>
                                            </div>
                                            <div className="mb-3">
                                                <span className="block text-xs text-gray-500">Status</span>
                                                <span className={`inline-block px-2 py-1 text-xs rounded-full ${getStatusColor(selectedLead.status)}`}>
                                                    {selectedLead.status}
                                                </span>
                                            </div>
                                            <div>
                                                <span className="block text-xs text-gray-500">Source</span>
                                                <span className="block text-sm">{selectedLead.source}</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div>
                                        <h4 className="text-sm font-medium text-gray-500">Assignment Information</h4>
                                        <div className="mt-2 p-4 bg-gray-50 rounded-md">
                                            <div className="mb-3">
                                                <span className="block text-xs text-gray-500">Assigned To</span>
                                                <span className="block text-sm font-medium">{selectedLead.assignedEmployee}</span>
                                            </div>
                                            <div>
                                                <span className="block text-xs text-gray-500">Assigned Date</span>
                                                <span className="block text-sm">{selectedLead.assignedDate}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <div>
                                        <h4 className="text-sm font-medium text-gray-500">Contact Information</h4>
                                        <div className="mt-2 p-4 bg-gray-50 rounded-md">
                                            <div className="mb-3 flex items-center">
                                                <Mail size={16} className="text-gray-400 mr-2" />
                                                <div>
                                                    <span className="block text-xs text-gray-500">Email</span>
                                                    <span className="block text-sm">{selectedLead.email}</span>
                                                </div>
                                            </div>
                                            <div className="flex items-center">
                                                <Phone size={16} className="text-gray-400 mr-2" />
                                                <div>
                                                    <span className="block text-xs text-gray-500">Phone</span>
                                                    <span className="block text-sm">{selectedLead.phone}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div>
                                        <h4 className="text-sm font-medium text-gray-500">Notes</h4>
                                        <div className="mt-2 p-4 bg-gray-50 rounded-md min-h-[120px]">
                                            <p className="text-sm whitespace-pre-wrap">{selectedLead.notes || 'No notes available'}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-6 flex justify-end space-x-3">
                                <button
                                    onClick={() => {
                                        setShowViewModal(false);
                                        openEditModal(selectedLead);
                                    }}
                                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center"
                                >
                                    <Edit size={16} className="mr-2" />
                                    Edit Lead
                                </button>
                                <button
                                    onClick={() => setShowViewModal(false)}
                                    className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                                >
                                    Close
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Edit Lead Modal */}
            {showEditModal && selectedLead && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg shadow-lg w-full max-w-2xl">
                        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
                            <h3 className="text-lg font-medium text-gray-900">Edit Lead</h3>
                            <button
                                onClick={() => setShowEditModal(false)}
                                className="text-gray-400 hover:text-gray-500"
                            >
                                <X size={20} />
                            </button>
                        </div>
                        <div className="p-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Name
                                    </label>
                                    <input
                                        type="text"
                                        name="name"
                                        value={editForm.name}
                                        onChange={handleEditFormChange}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#022d38] focus:border-[#022d38]"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Company
                                    </label>
                                    <input
                                        type="text"
                                        name="company"
                                        value={editForm.company}
                                        onChange={handleEditFormChange}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#022d38] focus:border-[#022d38]"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        <div className="flex items-center">
                                            <Mail size={16} className="mr-1 text-gray-500" />
                                            Email
                                        </div>
                                    </label>
                                    <input
                                        type="email"
                                        name="email"
                                        value={editForm.email}
                                        onChange={handleEditFormChange}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#022d38] focus:border-[#022d38]"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        <div className="flex items-center">
                                            <Phone size={16} className="mr-1 text-gray-500" />
                                            Phone
                                        </div>
                                    </label>
                                    <input
                                        type="text"
                                        name="phone"
                                        value={editForm.phone}
                                        onChange={handleEditFormChange}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#022d38] focus:border-[#022d38]"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Status
                                    </label>
                                    <select
                                        name="status"
                                        value={editForm.status}
                                        onChange={handleEditFormChange}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#022d38] focus:border-[#022d38]"
                                    >
                                        <option value="New">New</option>
                                        <option value="Contacted">Contacted</option>
                                        <option value="Qualified">Qualified</option>
                                        <option value="Converted">Converted</option>
                                        <option value="Lost">Lost</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Source
                                    </label>
                                    <select
                                        name="source"
                                        value={editForm.source}
                                        onChange={handleEditFormChange}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#022d38] focus:border-[#022d38]"
                                    >
                                        <option value="Website">Website</option>
                                        <option value="Referral">Referral</option>
                                        <option value="Social Media">Social Media</option>
                                        <option value="Email Campaign">Email Campaign</option>
                                        <option value="Other">Other</option>
                                    </select>
                                </div>
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Notes
                                    </label>
                                    <textarea
                                        name="notes"
                                        value={editForm.notes}
                                        onChange={handleEditFormChange}
                                        rows={4}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#022d38] focus:border-[#022d38]"
                                    ></textarea>
                                </div>
                            </div>

                            <div className="mt-6 flex justify-end space-x-3">
                                <button
                                    onClick={() => setShowEditModal(false)}
                                    className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleUpdateLead}
                                    disabled={isProcessing}
                                    className={`px-4 py-2 rounded-md flex items-center ${
                                        isProcessing
                                            ? 'bg-gray-400 text-white cursor-not-allowed'
                                            : 'bg-[#022d38] text-white hover:bg-[#043c4a]'
                                    }`}
                                >
                                    {isProcessing ? (
                                        <>
                                            <Loader size={16} className="mr-2 animate-spin" />
                                            Updating...
                                        </>
                                    ) : (
                                        <>
                                            <Save size={16} className="mr-2" />
                                            Save Changes
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
