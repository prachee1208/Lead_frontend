import { useState, useEffect } from 'react';
import {
    UserPlus, Search, Filter, Check, X,
    ArrowLeft, ArrowRight, ChevronDown, ChevronUp,
    RefreshCw, AlertCircle, CheckCircle, Loader
} from 'lucide-react';
import { useLocation, Link } from 'react-router-dom';
import { leadsAPI, usersAPI } from '../../services/api';
import { toast } from 'react-toastify';
import enhancedAPI from '../../services/enhancedAPI';

export default function AssignLeads() {
    const location = useLocation();
    const queryParams = new URLSearchParams(location.search);
    const preSelectedEmployeeId = queryParams.get('employee');

    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [selectedLeads, setSelectedLeads] = useState([]);
    const [selectedEmployee, setSelectedEmployee] = useState(null);
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [showSuccessMessage, setShowSuccessMessage] = useState(false);
    const [sortConfig, setSortConfig] = useState({ key: 'name', direction: 'ascending' });
    const [isLoadingEmployees, setIsLoadingEmployees] = useState(false);
    const [isLoadingLeads, setIsLoadingLeads] = useState(false);
    const [isAssigning, setIsAssigning] = useState(false);
    const [error, setError] = useState(null);

    // Mock data - in a real app, this would come from your API
    const [leads, setLeads] = useState([
        {
            id: 1,
            name: 'John Doe',
            company: 'Acme Corp',
            email: 'john@acmecorp.com',
            phone: '(555) 123-4567',
            status: 'New',
            source: 'Website',
            assignedTo: null,
            createdAt: '2023-05-15'
        },
        {
            id: 2,
            name: 'Sarah Smith',
            company: 'XYZ Inc',
            email: 'sarah@xyzinc.com',
            phone: '(555) 234-5678',
            status: 'Contacted',
            source: 'Referral',
            assignedTo: 'Emily Davis',
            createdAt: '2023-05-14'
        },
        {
            id: 3,
            name: 'Michael Johnson',
            company: 'ABC Ltd',
            email: 'michael@abcltd.com',
            phone: '(555) 345-6789',
            status: 'New',
            source: 'Cold Call',
            assignedTo: null,
            createdAt: '2023-05-16'
        },
        {
            id: 4,
            name: 'Emily Wilson',
            company: 'Tech Solutions',
            email: 'emily@techsolutions.com',
            phone: '(555) 456-7890',
            status: 'New',
            source: 'Trade Show',
            assignedTo: null,
            createdAt: '2023-05-13'
        },
        {
            id: 5,
            name: 'Robert Brown',
            company: 'Global Services',
            email: 'robert@globalservices.com',
            phone: '(555) 567-8901',
            status: 'Contacted',
            source: 'Website',
            assignedTo: 'John Smith',
            createdAt: '2023-05-12'
        },
        {
            id: 6,
            name: 'Jennifer Lee',
            company: 'Innovate Inc',
            email: 'jennifer@innovateinc.com',
            phone: '(555) 678-9012',
            status: 'New',
            source: 'Email Campaign',
            assignedTo: null,
            createdAt: '2023-05-16'
        },
        {
            id: 7,
            name: 'David Miller',
            company: 'First Choice',
            email: 'david@firstchoice.com',
            phone: '(555) 789-0123',
            status: 'New',
            source: 'Website',
            assignedTo: null,
            createdAt: '2023-05-15'
        }
    ]);

    const [employees, setEmployees] = useState([
        { id: 1, name: 'John Smith', email: 'john@example.com', avatar: 'JS', leadsAssigned: 24 },
        { id: 2, name: 'Sarah Johnson', email: 'sarah@example.com', avatar: 'SJ', leadsAssigned: 18 },
        { id: 3, name: 'Michael Brown', email: 'michael@example.com', avatar: 'MB', leadsAssigned: 15 },
        { id: 4, name: 'Emily Davis', email: 'emily@example.com', avatar: 'ED', leadsAssigned: 20 },
        { id: 5, name: 'Robert Wilson', email: 'robert@example.com', avatar: 'RW', leadsAssigned: 22 }
    ]);

    // Fetch leads and employees when component mounts
    useEffect(() => {
        fetchLeads();
        fetchEmployees();
    }, []);

    // Function to fetch leads from the API
    const fetchLeads = async () => {
        setIsLoadingLeads(true);
        setError(null);
        try {
            const response = await leadsAPI.getAll();
            console.log('Leads API response:', response);

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
                    assignedTo: lead.assignedEmployee ? lead.assignedEmployee.name : null,
                    assignedToId: lead.assignedEmployee ? lead.assignedEmployee._id : null,
                    createdAt: new Date(lead.createdAt).toLocaleDateString()
                }));
                setLeads(formattedLeads);
            } else {
                // If no data is returned, use the mock data
                console.log('No leads data returned from API, using mock data');
            }

            setIsLoadingLeads(false);
        } catch (err) {
            console.error('Error fetching leads:', err);
            setError('Failed to load leads. Please try again.');
            toast.error('Failed to load leads: ' + (err.message || 'Unknown error'));
            setIsLoadingLeads(false);
        }
    };

    // Function to fetch employees from the API
    const fetchEmployees = async () => {
        setIsLoadingEmployees(true);
        setError(null);
        try {
            // Get users with role 'employee' from the API
            const response = await usersAPI.getByRole('employee');
            console.log('Employees API response:', response);

            if (response && response.data && response.data.data) {
                // Transform the API response to match our component's data structure
                const formattedEmployees = response.data.data.map(user => ({
                    id: user._id,
                    name: user.name,
                    email: user.email || 'N/A',
                    avatar: user.name.split(' ').map(name => name[0]).join(''),
                    leadsAssigned: user.leadsAssigned || 0
                }));

                setEmployees(formattedEmployees);

                // Set pre-selected employee if provided in URL
                if (preSelectedEmployeeId) {
                    const employee = formattedEmployees.find(emp => emp.id === preSelectedEmployeeId);
                    if (employee) {
                        setSelectedEmployee(employee);
                    }
                }
            } else {
                // If no data is returned, use the mock data
                console.log('No employees data returned from API, using mock data');
            }

            setIsLoadingEmployees(false);
        } catch (err) {
            console.error('Error fetching employees:', err);
            setError('Failed to load employees. Please try again.');
            toast.error('Failed to load employees: ' + (err.message || 'Unknown error'));
            setIsLoadingEmployees(false);
        }
    };

    const requestSort = (key) => {
        let direction = 'ascending';
        if (sortConfig.key === key && sortConfig.direction === 'ascending') {
            direction = 'descending';
        }
        setSortConfig({ key, direction });
    };

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

    const getSortIcon = (key) => {
        if (sortConfig.key === key) {
            return sortConfig.direction === 'ascending' ?
                <ChevronUp size={16} className="ml-1" /> :
                <ChevronDown size={16} className="ml-1" />;
        }
        return <ChevronDown size={16} className="ml-1 opacity-30" />;
    };

    // Apply filters and sorting
    const filteredAndSortedLeads = [...leads]
        .filter(lead => {
            // Apply search filter
            const matchesSearch =
                lead.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                lead.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
                lead.email.toLowerCase().includes(searchQuery.toLowerCase());

            // Apply status filter
            const matchesStatus =
                statusFilter === 'all' ||
                (statusFilter === 'unassigned' && lead.assignedTo === null) ||
                (statusFilter === 'assigned' && lead.assignedTo !== null) ||
                lead.status === statusFilter;

            return matchesSearch && matchesStatus;
        })
        .sort((a, b) => {
            if (sortConfig.key === 'name') {
                return sortConfig.direction === 'ascending'
                    ? a.name.localeCompare(b.name)
                    : b.name.localeCompare(a.name);
            }
            if (sortConfig.key === 'company') {
                return sortConfig.direction === 'ascending'
                    ? a.company.localeCompare(b.company)
                    : b.company.localeCompare(a.company);
            }
            if (sortConfig.key === 'status') {
                return sortConfig.direction === 'ascending'
                    ? a.status.localeCompare(b.status)
                    : b.status.localeCompare(a.status);
            }
            if (sortConfig.key === 'createdAt') {
                return sortConfig.direction === 'ascending'
                    ? new Date(a.createdAt) - new Date(b.createdAt)
                    : new Date(b.createdAt) - new Date(a.createdAt);
            }
            return 0;
        });

    const toggleLeadSelection = (leadId) => {
        if (selectedLeads.includes(leadId)) {
            setSelectedLeads(selectedLeads.filter(id => id !== leadId));
        } else {
            setSelectedLeads([...selectedLeads, leadId]);
        }
    };

    const selectAllLeads = () => {
        if (selectedLeads.length === filteredAndSortedLeads.length) {
            setSelectedLeads([]);
        } else {
            setSelectedLeads(filteredAndSortedLeads.map(lead => lead.id));
        }
    };

    // Debug function to test lead assignment directly
    const testDirectAssignment = async () => {
        if (!selectedEmployee) {
            toast.error('Please select an employee first');
            return;
        }

        try {
            const userId = localStorage.getItem('userId') || "6822d9e9585eed55a287e4c3";
            console.log('Testing direct lead assignment');
            console.log('Manager ID:', userId);
            console.log('Employee ID:', selectedEmployee.id);

            // Create a test lead
            const testLead = {
                name: 'Test Lead for ' + selectedEmployee.name,
                company: 'Test Company',
                email: 'test@example.com',
                phone: '555-TEST',
                value: '1000',
                source: 'Website',
                status: 'New',
                notes: 'This is a test lead created for debugging'
            };

            // Create the lead
            const createResponse = await leadsAPI.create(testLead);
            console.log('Create lead response:', createResponse);

            if (createResponse && createResponse.data && createResponse.data.data) {
                const newLeadId = createResponse.data.data._id;
                console.log('New lead created with ID:', newLeadId);

                // Assign the lead to the employee
                const assignResponse = await enhancedAPI.leads.assignToEmployee(
                    newLeadId,
                    selectedEmployee.id,
                    userId
                );

                console.log('Assign lead response:', assignResponse);

                if (assignResponse && assignResponse.data && assignResponse.data.success) {
                    toast.success(`Test lead successfully assigned to ${selectedEmployee.name}`);
                    // Refresh leads to show the new lead
                    fetchLeads();
                } else {
                    toast.error('Failed to assign test lead');
                }
            } else {
                toast.error('Failed to create test lead');
            }
        } catch (error) {
            console.error('Error in test assignment:', error);
            toast.error('Error in test assignment: ' + (error.message || 'Unknown error'));
        }
    };

    const handleAssignLeads = async () => {
        if (selectedLeads.length === 0 || !selectedEmployee) {
            return;
        }

        setIsAssigning(true);

        try {
            // Get current user ID from localStorage or use a default for testing
            const userId = localStorage.getItem('userId') || "6822d9e9585eed55a287e4c3";
            const userName = localStorage.getItem('userName') || "Manager User";
            const userRole = localStorage.getItem('userRole') || "manager";

            console.log('Current manager ID:', userId);
            console.log('Current user name:', userName);
            console.log('Current user role:', userRole);
            console.log('Selected employee:', selectedEmployee);
            console.log('Selected leads:', selectedLeads);

            // Track assignment results
            let successCount = 0;
            let failCount = 0;

            for (const leadId of selectedLeads) {
                try {
                    console.log(`Assigning lead ${leadId} to employee ${selectedEmployee.id}`);

                    // Use the assignToEmployee endpoint for proper assignment
                    const response = await enhancedAPI.leads.assignToEmployee(
                        leadId,
                        selectedEmployee.id,
                        userId
                    );

                    console.log('Assignment response:', response);

                    if (response && response.data && response.data.success) {
                        console.log(`Successfully assigned lead ${leadId} to employee ${selectedEmployee.id}`);
                        console.log('Response data:', response.data);
                        successCount++;
                    } else {
                        console.error(`Assignment returned unsuccessful for lead ${leadId}`);
                        console.error('Response:', response);
                        failCount++;
                    }
                } catch (error) {
                    console.error(`Failed to assign lead ${leadId}:`, error);
                    failCount++;
                }
            }

            // Update leads with new assignment
            const updatedLeads = leads.map(lead => {
                if (selectedLeads.includes(lead.id)) {
                    return {
                        ...lead,
                        assignedTo: selectedEmployee.name,
                        assignedToId: selectedEmployee.id
                    };
                }
                return lead;
            });

            setLeads(updatedLeads);
            setShowConfirmModal(false);
            setShowSuccessMessage(true);
            toast.success(`Successfully assigned ${selectedLeads.length} lead(s) to ${selectedEmployee.name}`);

            // Reset selection after assignment
            setTimeout(() => {
                setSelectedLeads([]);
                setShowSuccessMessage(false);
            }, 3000);

            // Refresh leads to get the updated data
            fetchLeads();
        } catch (err) {
            console.error('Error assigning leads:', err);
            setError('Failed to assign leads. Please try again.');
            toast.error('Failed to assign leads: ' + (err.message || 'Unknown error'));
        } finally {
            setIsAssigning(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-semibold text-gray-800">Assign Leads</h1>
                <div className="flex items-center space-x-2">
                    {selectedLeads.length > 0 && (
                        <div className="text-sm text-gray-600">
                            {selectedLeads.length} lead{selectedLeads.length !== 1 ? 's' : ''} selected
                        </div>
                    )}
                    <button
                        onClick={() => setShowConfirmModal(true)}
                        disabled={selectedLeads.length === 0 || !selectedEmployee || isAssigning}
                        className={`px-4 py-2 rounded-md flex items-center ${
                            selectedLeads.length === 0 || !selectedEmployee || isAssigning
                                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                : 'bg-[#022d38] text-white hover:bg-[#043c4a]'
                        }`}
                    >
                        {isAssigning ? (
                            <>
                                <Loader size={16} className="mr-2 animate-spin" />
                                Assigning...
                            </>
                        ) : (
                            <>
                                <UserPlus size={16} className="mr-2" />
                                Assign Selected
                            </>
                        )}
                    </button>
                </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 text-blue-800 px-4 py-3 rounded-md flex items-center mb-4">
                <AlertCircle size={20} className="mr-2 text-blue-500" />
                <div className="flex-1">
                    <p className="text-sm font-medium">Leads assigned to employees will appear on their dashboard.</p>
                    <p className="text-xs mt-1">Employees will only see leads that have been specifically assigned to them.</p>
                </div>
                {selectedEmployee && (
                    <button
                        onClick={testDirectAssignment}
                        className="text-xs bg-blue-200 text-blue-800 px-3 py-1 rounded ml-4"
                        title="Create and assign a test lead"
                    >
                        Test Assignment
                    </button>
                )}
            </div>

            {/* Success Message */}
            {showSuccessMessage && (
                <div className="bg-emerald-100 border border-emerald-200 text-emerald-800 px-4 py-3 rounded-md flex items-center">
                    <CheckCircle size={20} className="mr-2" />
                    <div>
                        <p className="font-medium">Successfully assigned {selectedLeads.length} lead{selectedLeads.length !== 1 ? 's' : ''} to {selectedEmployee?.name}</p>
                        <p className="text-xs mt-1">These leads will now appear on {selectedEmployee?.name}'s dashboard.</p>
                    </div>
                </div>
            )}

            {/* Error Message */}
            {error && (
                <div className="bg-red-100 border border-red-200 text-red-800 px-4 py-3 rounded-md flex items-center">
                    <AlertCircle size={20} className="mr-2" />
                    <span>{error}</span>
                    <button
                        onClick={() => {
                            setError(null);
                            fetchLeads();
                            fetchEmployees();
                        }}
                        className="ml-auto text-red-800 hover:text-red-900"
                    >
                        <RefreshCw size={16} />
                    </button>
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                {/* Employee Selection */}
                <div className="lg:col-span-1">
                    <div className="bg-white rounded-lg shadow p-4">
                        <h2 className="text-lg font-medium text-gray-800 mb-4">Select Employee</h2>
                        {isLoadingEmployees ? (
                            <div className="flex justify-center items-center p-8">
                                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#022d38]"></div>
                                <span className="ml-3 text-gray-600">Loading employees...</span>
                            </div>
                        ) : employees.length === 0 ? (
                            <div className="p-4 text-center">
                                <p className="text-gray-500">No employees found</p>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {employees.map(employee => (
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
                                            <Check size={18} className="ml-auto text-indigo-600" />
                                        )}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Leads Table */}
                <div className="lg:col-span-3">
                    <div className="bg-white rounded-lg shadow">
                        <div className="px-4 py-3 border-b border-gray-200">
                            <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-3 md:space-y-0">
                                <div className="flex items-center space-x-3">
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <Search size={16} className="text-gray-400" />
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
                                        <Filter size={16} className="text-gray-400" />
                                        <select
                                            className="border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#022d38] focus:border-[#022d38] py-2 px-3"
                                            value={statusFilter}
                                            onChange={(e) => setStatusFilter(e.target.value)}
                                        >
                                            <option value="all">All Leads</option>
                                            <option value="unassigned">Unassigned</option>
                                            <option value="assigned">Assigned</option>
                                            <option value="New">New</option>
                                            <option value="Contacted">Contacted</option>
                                            <option value="Qualified">Qualified</option>
                                        </select>
                                    </div>
                                </div>
                                {!isLoadingLeads && filteredAndSortedLeads.length > 0 && (
                                    <button
                                        onClick={selectAllLeads}
                                        className="text-sm text-indigo-600 hover:text-indigo-800"
                                    >
                                        {selectedLeads.length === filteredAndSortedLeads.length ? 'Deselect All' : 'Select All'}
                                    </button>
                                )}
                            </div>
                        </div>

                        {isLoadingLeads ? (
                            <div className="flex justify-center items-center p-12">
                                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#022d38]"></div>
                                <span className="ml-3 text-lg text-gray-700">Loading leads...</span>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-10">
                                                <input
                                                    type="checkbox"
                                                    checked={selectedLeads.length === filteredAndSortedLeads.length && filteredAndSortedLeads.length > 0}
                                                    onChange={selectAllLeads}
                                                    className="h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                                                />
                                            </th>
                                            <th
                                                scope="col"
                                                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                                                onClick={() => requestSort('name')}
                                            >
                                                <div className="flex items-center">
                                                    Name {getSortIcon('name')}
                                                </div>
                                            </th>
                                            <th
                                                scope="col"
                                                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                                                onClick={() => requestSort('company')}
                                            >
                                                <div className="flex items-center">
                                                    Company {getSortIcon('company')}
                                                </div>
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
                                                onClick={() => requestSort('createdAt')}
                                            >
                                                <div className="flex items-center">
                                                    Created {getSortIcon('createdAt')}
                                                </div>
                                            </th>
                                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Assigned To
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {filteredAndSortedLeads.length === 0 ? (
                                            <tr>
                                                <td colSpan="6" className="px-6 py-4 text-center text-sm text-gray-500">
                                                    No leads found matching your criteria
                                                </td>
                                            </tr>
                                        ) : (
                                            filteredAndSortedLeads.map(lead => (
                                                <tr
                                                    key={lead.id}
                                                    className={`hover:bg-gray-50 ${selectedLeads.includes(lead.id) ? 'bg-indigo-50' : ''}`}
                                                    onClick={() => toggleLeadSelection(lead.id)}
                                                >
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <input
                                                            type="checkbox"
                                                            checked={selectedLeads.includes(lead.id)}
                                                            onChange={() => {}}
                                                            className="h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                                                        />
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <div className="text-sm font-medium text-gray-900">{lead.name}</div>
                                                        <div className="text-sm text-gray-500">{lead.email}</div>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <div className="text-sm text-gray-900">{lead.company}</div>
                                                        <div className="text-sm text-gray-500">{lead.source}</div>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(lead.status)}`}>
                                                            {lead.status}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                        {lead.createdAt}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                                                        {lead.assignedTo ? (
                                                            <span className="text-gray-900">{lead.assignedTo}</span>
                                                        ) : (
                                                            <span className="text-amber-600 flex items-center">
                                                                <AlertCircle size={16} className="mr-1" />
                                                                Unassigned
                                                            </span>
                                                        )}
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Confirmation Modal */}
            {showConfirmModal && selectedEmployee && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg shadow-lg w-full max-w-md">
                        <div className="px-6 py-4 border-b border-gray-200">
                            <h3 className="text-lg font-medium text-gray-900">Confirm Assignment</h3>
                        </div>
                        <div className="p-6">
                            <p className="text-gray-700">
                                Are you sure you want to assign {selectedLeads.length} lead{selectedLeads.length !== 1 ? 's' : ''} to:
                            </p>
                            <div className="mt-4 flex items-center p-3 bg-gray-50 rounded-md">
                                <div className="h-10 w-10 rounded-full bg-gradient-to-tr from-indigo-500 to-[#022d38] flex items-center justify-center text-white font-bold">
                                    {selectedEmployee.avatar}
                                </div>
                                <div className="ml-3">
                                    <div className="text-sm font-medium text-gray-900">{selectedEmployee.name}</div>
                                    <div className="text-xs text-gray-500">{selectedEmployee.email}</div>
                                </div>
                            </div>
                            <div className="mt-6 flex justify-end space-x-3">
                                <button
                                    onClick={() => setShowConfirmModal(false)}
                                    className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleAssignLeads}
                                    disabled={isAssigning}
                                    className={`px-4 py-2 rounded-md ${
                                        isAssigning
                                            ? 'bg-gray-400 text-white cursor-not-allowed'
                                            : 'bg-[#022d38] text-white hover:bg-[#043c4a]'
                                    }`}
                                >
                                    {isAssigning ? (
                                        <>
                                            <Loader size={16} className="inline mr-2 animate-spin" />
                                            Assigning...
                                        </>
                                    ) : (
                                        'Confirm Assignment'
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