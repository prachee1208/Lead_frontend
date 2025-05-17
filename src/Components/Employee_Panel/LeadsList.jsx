import { useState, useEffect } from 'react';
import {
    Search, Filter, Phone, Mail, MessageSquare,
    MoreHorizontal, Eye, History, Calendar, AlertCircle,
    RefreshCw, Loader, Database
} from 'lucide-react';
import { Link } from 'react-router-dom';
import dataFetcher from '../../services/dataFetcher';
import { getConnectionStatus } from '../../services/enhancedAPI';
import { toast } from 'react-toastify';
import ConnectionMonitor from '../common/ConnectionMonitor';

export default function LeadsList() {
    const [leads, setLeads] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    // Fetch leads assigned to the current employee using enhanced data fetcher
    const fetchLeads = async () => {
        setIsLoading(true);
        setError(null);

        try {
            // Get the current user ID from localStorage
            const userId = localStorage.getItem('userId');

            if (!userId) {
                console.warn('User ID not found in localStorage');
                setIsLoading(false);
                setError('User ID not found. Please log in again.');
                return;
            }

            console.log('Fetching leads for employee ID:', userId);

            // Use the enhanced data fetcher with caching and offline support
            const response = await dataFetcher.fetchEmployeeLeads(userId, {}, {
                // Force refresh data from server when explicitly refreshing
                forceRefresh: true,
                // Provide offline fallback data
                offlineData: { data: { data: [] } },
                // Handle errors
                onError: (err) => {
                    console.error('Error in data fetcher:', err);
                    setError('Failed to load leads. Please try again.');
                    toast.error('Failed to load leads: ' + (err.message || 'Unknown error'));
                }
            });

            console.log('Employee leads response:', response);

            // Log the user ID for debugging
            console.log('Current employee ID from localStorage:', userId);

            if (!response) {
                console.error('No response received from API');
                setError('No response received from API. Please try again.');
                return;
            }

            // Log the response structure for debugging
            if (response && response.data) {
                console.log('Response data structure:', {
                    hasData: !!response.data,
                    hasDataArray: !!(response.data && response.data.data),
                    dataLength: response.data && response.data.data ? response.data.data.length : 0
                });
            }

            console.log('Full response object:', response);

            // Check for data in the response
            let responseData = [];

            if (response && response.data) {
                if (Array.isArray(response.data)) {
                    // Direct array response
                    responseData = response.data;
                    console.log('Response data is an array with', responseData.length, 'items');
                } else if (response.data.data && Array.isArray(response.data.data)) {
                    // Nested data object response
                    responseData = response.data.data;
                    console.log('Response data.data is an array with', responseData.length, 'items');
                } else {
                    console.log('Response data structure is unexpected:', response.data);
                }
            }

            if (responseData.length > 0) {
                // Transform the API response to match our component's data structure
                const formattedLeads = responseData.map(lead => ({
                    id: lead._id,
                    name: lead.name,
                    company: lead.company || 'N/A',
                    email: lead.email || 'N/A',
                    phone: lead.phone || 'N/A',
                    status: lead.status || 'New',
                    source: lead.source || 'N/A',
                    assignedDate: new Date(lead.updatedAt).toLocaleDateString(),
                    lastContact: lead.lastContact ? new Date(lead.lastContact).toLocaleDateString() : null
                }));

                console.log('Formatted leads:', formattedLeads);
                setLeads(formattedLeads);

                // If we're offline but have cached data, show a toast
                if (!getConnectionStatus() && formattedLeads.length > 0) {
                    toast.info('Showing cached leads data. You are currently offline.');
                }
            } else {
                // If no data is returned, use empty array
                setLeads([]);
                console.log('No leads data returned from API');
            }
        } catch (err) {
            console.error('Error fetching leads:', err);
            setError('Failed to load leads. Please try again.');
            toast.error('Failed to load leads: ' + (err.message || 'Unknown error'));
        } finally {
            setIsLoading(false);
        }
    };

    // Load data on component mount
    useEffect(() => {
        fetchLeads();
    }, []);
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('All');
    const [showActionMenu, setShowActionMenu] = useState(null);
    const [showContactOptions, setShowContactOptions] = useState(null);

    const filteredLeads = leads.filter(lead => {
        // Apply search filter
        const matchesSearch =
            lead.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            lead.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
            lead.email.toLowerCase().includes(searchQuery.toLowerCase());

        // Apply status filter
        const matchesStatus = statusFilter === 'All' || lead.status === statusFilter;

        return matchesSearch && matchesStatus;
    });

    const handleStatusChange = (leadId, newStatus) => {
        setLeads(leads.map(lead =>
            lead.id === leadId ? { ...lead, status: newStatus } : lead
        ));
        setShowActionMenu(null);
    };

    // Debug function to test lead assignment
    const testLeadAssignment = async () => {
        try {
            const userId = localStorage.getItem('userId');
            if (!userId) {
                console.error('No user ID found in localStorage');
                return;
            }

            console.log('Testing lead assignment for employee ID:', userId);

            // Force refresh data from server
            const response = await dataFetcher.fetchEmployeeLeads(userId, {}, {
                forceRefresh: true,
                offlineData: { data: { data: [] } }
            });

            console.log('Test lead assignment response:', response);

            if (response && response.data && response.data.data) {
                console.log('Leads assigned to employee:', response.data.data.length);
                response.data.data.forEach(lead => {
                    console.log('Lead:', lead._id, lead.name, 'assigned to employee:', lead.assignedEmployee);
                });
            } else {
                console.log('No leads found for employee');
            }
        } catch (error) {
            console.error('Error testing lead assignment:', error);
        }
    };

    const getStatusColor = (status) => {
        switch(status) {
            case 'New': return 'bg-indigo-100 text-indigo-800 border border-indigo-200';
            case 'Contacted': return 'bg-amber-100 text-amber-800 border border-amber-200';
            case 'Converted': return 'bg-emerald-100 text-emerald-800 border border-emerald-200';
            case 'Lost': return 'bg-red-100 text-red-800 border border-red-200';
            default: return 'bg-slate-100 text-slate-800 border border-slate-200';
        }
    };

    return (
        <div className="space-y-6">
            {/* Connection status monitor */}
            <ConnectionMonitor />

            <div className="flex flex-col space-y-2">
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-semibold text-gray-800">My Leads</h1>
                    <div className="flex items-center space-x-2">
                        {!getConnectionStatus() && (
                            <span className="text-xs text-amber-600 flex items-center">
                                <Database size={14} className="mr-1" />
                                Using cached data
                            </span>
                        )}
                        {!isLoading && (
                            <>
                                <button
                                    onClick={fetchLeads}
                                    className="p-2 rounded-md hover:bg-gray-100"
                                    title="Refresh leads"
                                >
                                    <RefreshCw size={20} className="text-gray-500" />
                                </button>
                                <button
                                    onClick={testLeadAssignment}
                                    className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded"
                                    title="Test lead assignment"
                                >
                                    Test Assignment
                                </button>
                            </>
                        )}
                    </div>
                </div>
                <div className="bg-blue-50 border border-blue-200 text-blue-800 px-4 py-3 rounded-md flex items-center mb-4">
                    <AlertCircle size={20} className="mr-2 text-blue-500" />
                    <div>
                        <p className="text-sm font-medium">This page shows only leads that have been assigned to you by managers.</p>
                        <p className="text-xs mt-1">If you don't see any leads, please contact your manager to assign leads to you.</p>
                    </div>
                </div>
            </div>

            {/* Error Message */}
            {error && (
                <div className="bg-red-100 border border-red-200 text-red-800 px-4 py-3 rounded-md flex items-center">
                    <AlertCircle size={20} className="mr-2" />
                    <span>{error}</span>
                    <button
                        onClick={fetchLeads}
                        className="ml-auto text-red-800 hover:text-red-900"
                    >
                        <RefreshCw size={16} />
                    </button>
                </div>
            )}

            {/* Loading State */}
            {isLoading ? (
                <div className="flex flex-col items-center justify-center min-h-[60vh] p-6">
                    <Loader className="w-12 h-12 text-blue-500 animate-spin mb-4" />
                    <h2 className="text-xl font-semibold text-gray-700">Loading Leads...</h2>
                    <p className="text-gray-500 mt-2">Please wait while we fetch your assigned leads</p>
                </div>
            ) : (
                <>
                    {/* Filters and Search */}
                    <div className="bg-white rounded-lg shadow p-4">
                        <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
                            <div className="flex items-center space-x-4">
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
                                        <option value="All">All Statuses</option>
                                        <option value="New">New</option>
                                        <option value="Contacted">Contacted</option>
                                        <option value="Converted">Converted</option>
                                        <option value="Lost">Lost</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Leads Table */}
                    <div className="bg-white rounded-lg shadow overflow-hidden">
                        {filteredLeads.length === 0 ? (
                            <div className="text-center py-12">
                                <AlertCircle size={48} className="mx-auto text-gray-300 mb-4" />
                                <h3 className="text-lg font-medium text-gray-900">No leads found</h3>
                                <p className="mt-1 text-sm text-gray-500">
                                    {searchQuery || statusFilter !== 'All'
                                        ? "Try adjusting your search or filter"
                                        : "You don't have any leads assigned to you yet"}
                                </p>
                                {!searchQuery && statusFilter === 'All' && (
                                    <div className="mt-4 text-center">
                                        <p className="text-xs text-gray-500">Only leads assigned to you by managers will appear here</p>
                                        <p className="text-xs text-gray-500 mt-1">Check back later or contact your manager for lead assignments</p>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Lead
                                            </th>
                                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Contact Info
                                            </th>
                                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Status
                                            </th>
                                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Assigned
                                            </th>
                                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Last Contact
                                            </th>
                                            <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Actions
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {filteredLeads.map((lead) => (
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
                                                    {lead.assignedDate}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                    {lead.lastContact || 'Not contacted yet'}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                    <div className="flex items-center justify-end space-x-2">
                                                        {/* Contact Options Button */}
                                                        <div className="relative">
                                                            <button
                                                                onClick={() => {
                                                                    setShowContactOptions(showContactOptions === lead.id ? null : lead.id);
                                                                    setShowActionMenu(null);
                                                                }}
                                                                className="p-1 rounded-full hover:bg-gray-100"
                                                            >
                                                                <Phone size={18} className="text-blue-500" />
                                                            </button>

                                                            {showContactOptions === lead.id && (
                                                                <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-10">
                                                                    <Link to={`/employee-panel/leads/${lead.id}/contact/phone`} className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                                                                        <Phone size={16} className="mr-2 text-blue-500" />
                                                                        Call
                                                                    </Link>
                                                                    <Link to={`/employee-panel/leads/${lead.id}/contact/email`} className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                                                                        <Mail size={16} className="mr-2 text-green-500" />
                                                                        Email
                                                                    </Link>
                                                                    <Link to={`/employee-panel/leads/${lead.id}/contact/message`} className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                                                                        <MessageSquare size={16} className="mr-2 text-orange-500" />
                                                                        Message
                                                                    </Link>
                                                                </div>
                                                            )}
                                                        </div>

                                                        {/* More Actions Button */}
                                                        <div className="relative">
                                                            <button
                                                                onClick={() => {
                                                                    setShowActionMenu(showActionMenu === lead.id ? null : lead.id);
                                                                    setShowContactOptions(null);
                                                                }}
                                                                className="p-1 rounded-full hover:bg-gray-100"
                                                            >
                                                                <MoreHorizontal size={18} className="text-gray-500" />
                                                            </button>

                                                            {showActionMenu === lead.id && (
                                                                <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-10">
                                                                    <Link to={`/employee-panel/leads/${lead.id}`} className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                                                                        <Eye size={16} className="mr-2 text-blue-500" />
                                                                        View Details
                                                                    </Link>
                                                                    <Link to={`/employee-panel/leads/${lead.id}/history`} className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                                                                        <History size={16} className="mr-2 text-purple-500" />
                                                                        View History
                                                                    </Link>
                                                                    <Link to={`/employee-panel/leads/${lead.id}/follow-up`} className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                                                                        <Calendar size={16} className="mr-2 text-green-500" />
                                                                        Add Follow-up
                                                                    </Link>
                                                                    <div className="border-t border-gray-100 my-1"></div>
                                                                    <div className="px-4 py-1 text-xs font-medium text-gray-500">Update Status</div>
                                                                    <button
                                                                        onClick={() => handleStatusChange(lead.id, 'New')}
                                                                        className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                                                    >
                                                                        New
                                                                    </button>
                                                                    <button
                                                                        onClick={() => handleStatusChange(lead.id, 'Contacted')}
                                                                        className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                                                    >
                                                                        Contacted
                                                                    </button>
                                                                    <button
                                                                        onClick={() => handleStatusChange(lead.id, 'Converted')}
                                                                        className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                                                    >
                                                                        Converted
                                                                    </button>
                                                                    <button
                                                                        onClick={() => handleStatusChange(lead.id, 'Lost')}
                                                                        className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                                                    >
                                                                        Lost
                                                                    </button>
                                                                </div>
                                                            )}
                                                        </div>
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
        </div>
    );
}
