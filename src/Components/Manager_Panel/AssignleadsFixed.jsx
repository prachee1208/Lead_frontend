import { useState, useEffect, useMemo } from 'react';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import {
    Search, Filter, Check, ArrowUp, ArrowDown,
    UserPlus, AlertCircle, CheckCircle, RefreshCw, Loader,
    List, ExternalLink
} from 'lucide-react';
import { leadsAPI, usersAPI } from '../../services/api';
import enhancedAPI from '../../services/enhancedAPI';

export default function AssignLeads() {
    const navigate = useNavigate();

    // State for leads and employees
    const [leads, setLeads] = useState([]);
    const [employees, setEmployees] = useState([]);
    const [selectedLeads, setSelectedLeads] = useState([]);
    const [selectedEmployee, setSelectedEmployee] = useState(null);

    // UI state
    const [isLoadingLeads, setIsLoadingLeads] = useState(true);
    const [isLoadingEmployees, setIsLoadingEmployees] = useState(true);
    const [isAssigning, setIsAssigning] = useState(false);
    const [error, setError] = useState(null);
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [showSuccessMessage, setShowSuccessMessage] = useState(false);
    const [showViewAssignedButton, setShowViewAssignedButton] = useState(false);

    // Filtering and sorting state
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [sortConfig, setSortConfig] = useState({ key: 'createdAt', direction: 'desc' });

    // Fetch leads from API
    const fetchLeads = async () => {
        setIsLoadingLeads(true);
        setError(null);

        try {
            const response = await leadsAPI.getAll();
            console.log('Leads response:', response);

            if (response && response.data && response.data.data) {
                // Transform API response to match our component's data structure
                const formattedLeads = response.data.data.map(lead => ({
                    id: lead._id,
                    name: lead.name,
                    company: lead.company,
                    email: lead.email,
                    phone: lead.phone,
                    status: lead.status,
                    source: lead.source,
                    assignedTo: lead.assignedEmployee ? lead.assignedEmployee.name : null,
                    assignedToId: lead.assignedEmployee ? lead.assignedEmployee._id : null,
                    createdAt: new Date(lead.createdAt).toLocaleDateString()
                }));

                setLeads(formattedLeads);
            } else {
                // If API call succeeds but no data is returned
                setLeads([]);
            }
        } catch (err) {
            console.error('Error fetching leads:', err);
            setError('Failed to load leads. Please try again.');
            toast.error('Failed to load leads: ' + (err.message || 'Unknown error'));

            // For testing, use mock data if API fails
            setLeads([
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
                    assignedTo: 'Mike Johnson',
                    createdAt: '2023-05-10'
                }
            ]);
        } finally {
            setIsLoadingLeads(false);
        }
    };

    // Fetch employees from API
    const fetchEmployees = async () => {
        setIsLoadingEmployees(true);

        try {
            const response = await usersAPI.getByRole('employee');
            console.log('Employees response:', response);

            if (response && response.data && response.data.data) {
                // Transform API response to match our component's data structure
                const formattedEmployees = response.data.data.map(employee => ({
                    id: employee._id,
                    name: employee.name,
                    email: employee.email,
                    avatar: employee.name.charAt(0).toUpperCase(),
                    leadsAssigned: employee.performance?.leadsAssigned || 0
                }));

                setEmployees(formattedEmployees);
            } else {
                // If API call succeeds but no data is returned
                setEmployees([]);
            }
        } catch (err) {
            console.error('Error fetching employees:', err);
            toast.error('Failed to load employees: ' + (err.message || 'Unknown error'));

            // For testing, use mock data if API fails
            setEmployees([
                { id: 101, name: 'Mike Johnson', email: 'mike@example.com', avatar: 'M', leadsAssigned: 5 },
                { id: 102, name: 'Emily Davis', email: 'emily@example.com', avatar: 'E', leadsAssigned: 3 },
                { id: 103, name: 'David Wilson', email: 'david@example.com', avatar: 'D', leadsAssigned: 7 }
            ]);
        } finally {
            setIsLoadingEmployees(false);
        }
    };

    // Load data on component mount
    useEffect(() => {
        fetchLeads();
        fetchEmployees();
    }, []);

    // Filter and sort leads
    const filteredAndSortedLeads = useMemo(() => {
        // First, filter the leads
        let filteredLeads = leads.filter(lead => {
            // Text search
            const matchesSearch =
                searchQuery === '' ||
                lead.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                lead.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
                lead.email.toLowerCase().includes(searchQuery.toLowerCase());

            // Status filter
            let matchesStatus = true;
            if (statusFilter === 'unassigned') {
                matchesStatus = !lead.assignedTo;
            } else if (statusFilter === 'assigned') {
                matchesStatus = !!lead.assignedTo;
            } else if (statusFilter !== 'all') {
                matchesStatus = lead.status === statusFilter;
            }

            return matchesSearch && matchesStatus;
        });

        // Then, sort the filtered leads
        if (sortConfig.key) {
            filteredLeads.sort((a, b) => {
                if (a[sortConfig.key] < b[sortConfig.key]) {
                    return sortConfig.direction === 'asc' ? -1 : 1;
                }
                if (a[sortConfig.key] > b[sortConfig.key]) {
                    return sortConfig.direction === 'asc' ? 1 : -1;
                }
                return 0;
            });
        }

        return filteredLeads;
    }, [leads, searchQuery, statusFilter, sortConfig]);

    // Request a sort
    const requestSort = (key) => {
        let direction = 'asc';
        if (sortConfig.key === key && sortConfig.direction === 'asc') {
            direction = 'desc';
        }
        setSortConfig({ key, direction });
    };

    // Get sort icon
    const getSortIcon = (key) => {
        if (sortConfig.key !== key) {
            return null;
        }
        return sortConfig.direction === 'asc'
            ? <ArrowUp size={14} className="ml-1" />
            : <ArrowDown size={14} className="ml-1" />;
    };

    // Get status color
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
                return 'bg-emerald-100 text-emerald-800';
            case 'Lost':
                return 'bg-red-100 text-red-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    // Toggle lead selection
    const toggleLeadSelection = (leadId) => {
        setSelectedLeads(prevSelected =>
            prevSelected.includes(leadId)
                ? prevSelected.filter(id => id !== leadId)
                : [...prevSelected, leadId]
        );
    };

    // Select or deselect all leads
    const selectAllLeads = () => {
        if (selectedLeads.length === filteredAndSortedLeads.length) {
            setSelectedLeads([]);
        } else {
            setSelectedLeads(filteredAndSortedLeads.map(lead => lead.id));
        }
    };

    const handleAssignLeads = async () => {
        if (selectedLeads.length === 0 || !selectedEmployee) {
            return;
        }

        setIsAssigning(true);

        try {
            // Get the current user ID from localStorage
            const userId = localStorage.getItem('userId');

            if (!userId) {
                setError('User ID not found. Please log in again.');
                toast.error('User ID not found. Please log in again.');
                return;
            }

            console.log('Using manager ID from localStorage:', userId);
            console.log('Selected employee:', selectedEmployee);
            console.log('Selected leads:', selectedLeads);

            // Use enhancedAPI to assign leads
            let successCount = 0;
            let failCount = 0;

            for (const leadId of selectedLeads) {
                try {
                    console.log(`Assigning lead ${leadId} to employee ${selectedEmployee.id}`);

                    // Use the assignToEmployee method from enhancedAPI
                    const response = await enhancedAPI.leads.assignToEmployee(
                        leadId,
                        selectedEmployee.id,
                        userId
                    );

                    console.log('Assignment response:', response);

                    if (response && response.data && response.data.success) {
                        successCount++;
                    } else {
                        console.error(`Failed to assign lead ${leadId}: No success in response`);
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

            if (successCount > 0) {
                setShowSuccessMessage(true);
                setShowViewAssignedButton(true);
                toast.success(`Successfully assigned ${successCount} lead(s) to ${selectedEmployee.name}`);

                // Reset selection after assignment
                setTimeout(() => {
                    setSelectedLeads([]);
                    // Keep the success message and view button visible
                }, 3000);
            }

            if (failCount > 0) {
                setError(`Failed to assign ${failCount} lead(s). Please try again.`);
                toast.error(`Failed to assign ${failCount} lead(s).`);
            }

            // Refresh leads to get the updated data
            fetchLeads();
        } catch (err) {
            console.error('Error in assignment process:', err);
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

                    <button
                        onClick={() => navigate('/manager-panel/assigned-leads')}
                        className="px-4 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700 flex items-center"
                        title="View all assigned leads"
                    >
                        <List size={16} className="mr-2" />
                        View Assigned Leads
                    </button>
                </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 text-blue-800 px-4 py-3 rounded-md flex items-center mb-4">
                <AlertCircle size={20} className="mr-2 text-blue-500" />
                <div>
                    <p className="text-sm font-medium">Assign leads to employees from this page.</p>
                    <p className="text-xs mt-1">After assignment, leads will appear in the "Assigned Leads" section and on the employee's dashboard.</p>
                </div>
            </div>

            {/* Success Message */}
            {showSuccessMessage && (
                <div className="bg-emerald-100 border border-emerald-200 text-emerald-800 px-4 py-3 rounded-md">
                    <div className="flex items-center">
                        <CheckCircle size={20} className="mr-2" />
                        <span>Successfully assigned leads to {selectedEmployee?.name}</span>
                    </div>

                    {showViewAssignedButton && (
                        <div className="mt-3 flex justify-end">
                            <button
                                onClick={() => navigate('/manager-panel/assigned-leads')}
                                className="flex items-center text-sm bg-emerald-600 text-white px-3 py-1.5 rounded hover:bg-emerald-700"
                            >
                                <List size={16} className="mr-1" />
                                View Assigned Leads
                                <ExternalLink size={14} className="ml-1" />
                            </button>
                        </div>
                    )}
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

                                {showViewAssignedButton && (
                                    <button
                                        onClick={() => {
                                            setShowConfirmModal(false);
                                            navigate('/manager-panel/assigned-leads');
                                        }}
                                        className="ml-2 px-4 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700 flex items-center"
                                    >
                                        <List size={16} className="mr-1" />
                                        View Assigned Leads
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}