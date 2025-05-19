import { useState, useEffect } from 'react';
import {
    Calendar, Plus, RefreshCw, Search, Loader, AlertCircle,
    Phone, Mail, Users, MessageSquare, Video
} from 'lucide-react';
import { enhancedAPI } from '../../services/enhancedAPI';
import { toast } from 'react-toastify';
import FollowUpForm from './FollowUpForm';

// Helper function to get the appropriate icon for follow-up type
const getTypeIcon = (type) => {
    switch (type.toLowerCase()) {
        case 'call':
            return <Phone size={16} className="text-blue-500" />;
        case 'email':
            return <Mail size={16} className="text-green-500" />;
        case 'meeting':
            return <Users size={16} className="text-purple-500" />;
        case 'message':
            return <MessageSquare size={16} className="text-yellow-500" />;
        case 'video':
            return <Video size={16} className="text-red-500" />;
        default:
            return <Calendar size={16} className="text-gray-500" />;
    }
};

export default function FollowUps() {
    const [isAddingNew, setIsAddingNew] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    // State for follow-ups
    const [followUps, setFollowUps] = useState([]);

    // State for leads
    const [leads, setLeads] = useState([]);
    const [isLoadingLeads, setIsLoadingLeads] = useState(true);
    const [selectedLead, setSelectedLead] = useState(null);

    // Fetch follow-ups from the API
    const fetchFollowUps = async () => {
        setIsLoading(true);
        try {
            // Get the current user ID from localStorage
            const userId = localStorage.getItem('userId');

            if (!userId) {
                console.warn('User ID not found in localStorage');
                setIsLoading(false);
                return;
            }

            // Fetch follow-ups for the current employee
            const response = await enhancedAPI.followUps.getByEmployee(userId);
            console.log('Follow-ups response:', response);

            if (response && response.success && response.data) {
                // Transform the API response to match our component's data structure
                const followUpsData = Array.isArray(response.data) ? response.data : [];

                const formattedFollowUps = followUpsData.map(followUp => {
                    // Ensure we have a valid date
                    let dueDate = new Date();
                    let dueTime = '';

                    try {
                        if (followUp.followUp && followUp.followUp.nextFollowUpDate) {
                            dueDate = new Date(followUp.followUp.nextFollowUpDate);
                            dueTime = dueDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                        }
                    } catch (e) {
                        console.error('Error parsing date:', e);
                    }

                    return {
                        id: followUp._id,
                        type: followUp.followUp?.type || 'call',
                        leadName: followUp.leadName || 'Unknown Lead',
                        company: followUp.leadCompany || 'N/A',
                        leadId: followUp._id,
                        dueDate: dueDate.toLocaleDateString(),
                        dueTime: dueTime,
                        notes: followUp.followUp?.notes || '',
                        completed: followUp.followUp?.status === 'Completed',
                        status: followUp.followUp?.status || 'Scheduled',
                        priority: followUp.priority || 'Medium',
                        createdAt: followUp.createdAt,
                        updatedAt: followUp.updatedAt,
                        assignedManager: followUp.assignedManager,
                        assignedEmployee: followUp.assignedEmployee
                    };
                });

                // Sort by due date (ascending)
                const sortedFollowUps = formattedFollowUps.sort((a, b) => {
                    const dateA = new Date(`${a.dueDate} ${a.dueTime}`);
                    const dateB = new Date(`${b.dueDate} ${b.dueTime}`);
                    return dateA - dateB;
                });

                setFollowUps(sortedFollowUps);
                setError(null);
            } else {
                // If no data is returned, use empty array
                setFollowUps([]);
            }
        } catch (err) {
            console.error('Error fetching follow-ups:', err);
            setError('Failed to load follow-ups. Please try again.');
            toast.error('Failed to load follow-ups: ' + (err.message || 'Unknown error'));
        } finally {
            setIsLoading(false);
        }
    };

    // Fetch leads from the API
    const fetchLeads = async () => {
        setIsLoadingLeads(true);
        setError(null);

        try {
            // Get the current user ID from localStorage
            const userId = localStorage.getItem('userId');

            if (!userId) {
                console.warn('User ID not found in localStorage');
                setIsLoadingLeads(false);
                return;
            }

            // Fetch leads assigned to the current employee
            const response = await enhancedAPI.leads.getByEmployee(userId);
            console.log('Leads response:', response);

            if (response && response.success && response.data) {
                // Transform the API response to match our component's data structure
                const leadsData = Array.isArray(response.data) ? response.data : [];

                const formattedLeads = leadsData.map(lead => ({
                    id: lead._id,
                    name: lead.name || 'Unnamed Lead',
                    company: lead.company || 'N/A',
                    status: lead.status || 'New',
                    priority: lead.priority || 'Medium',
                    assignedManager: lead.assignedManager,
                    assignedEmployee: lead.assignedEmployee
                }));

                // Sort leads alphabetically by name
                formattedLeads.sort((a, b) => a.name.localeCompare(b.name));

                setLeads(formattedLeads);
                console.log('Formatted leads:', formattedLeads);
            } else {
                console.warn('No leads data in response:', response);
                setLeads([]);
            }
        } catch (err) {
            console.error('Error fetching leads:', err);
            setError('Failed to load leads. Please try again.');
            toast.error('Failed to load leads: ' + (err.message || 'Unknown error'));
            setLeads([]);
        } finally {
            setIsLoadingLeads(false);
        }
    };

    // Load data on component mount
    useEffect(() => {
        setIsLoading(true);
        fetchFollowUps();
        fetchLeads();
        setIsLoading(false);
    }, []);

    // Handle adding a new follow-up
    const handleAddNew = () => {
        setSelectedLead(null); // Clear any previously selected lead
        setIsAddingNew(true);
    };

    // Handle canceling add
    const handleCancelAdd = () => {
        setIsAddingNew(false);
    };

    // Handle follow-up creation success
    const handleFollowUpSuccess = () => {
        // Refresh the follow-ups list
        fetchFollowUps();

        // Close the form
        handleCancelAdd();
    };

    // Handle marking a follow-up as complete/incomplete
    const handleFollowUpStatusChange = async (_, leadId, completed) => {
        try {
            const status = completed ? 'Completed' : 'Scheduled';
            await enhancedAPI.followUps.update(leadId, {
                status,
                nextFollowUpDate: new Date().toISOString()
            });

            // Refresh the follow-ups list
            await fetchFollowUps();
            toast.success(`Follow-up marked as ${status.toLowerCase()}`);
        } catch (err) {
            console.error('Error updating follow-up status:', err);
            toast.error('Failed to update follow-up status: ' + (err.message || 'Unknown error'));
        }
    };

    // Handle deleting a follow-up
    const handleDeleteFollowUp = async (_, leadId) => {
        if (!window.confirm('Are you sure you want to delete this follow-up?')) {
            return;
        }

        try {
            // Update the lead to remove the follow-up
            await enhancedAPI.followUps.update(leadId, {
                followUp: null
            });
            await fetchFollowUps();
            toast.success('Follow-up deleted successfully');
        } catch (err) {
            console.error('Error deleting follow-up:', err);
            toast.error('Failed to delete follow-up: ' + (err.message || 'Unknown error'));
        }
    };

    // Filter leads based on search term
    const filteredLeads = leads.filter(lead => {
        if (!searchTerm) return true;

        const searchTermLower = searchTerm.toLowerCase();
        return (
            lead.name.toLowerCase().includes(searchTermLower) ||
            lead.company.toLowerCase().includes(searchTermLower)
        );
    });

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-semibold text-gray-800">Follow-ups</h1>
                <div className="flex items-center space-x-3">
                    <button
                        onClick={() => {
                            fetchFollowUps();
                            fetchLeads();
                        }}
                        className="p-2 rounded-md hover:bg-gray-100"
                        title="Refresh data"
                    >
                        <RefreshCw size={18} className="text-gray-500" />
                    </button>
                    <button
                        onClick={handleAddNew}
                        className="px-4 py-2 bg-[#022d38] text-white rounded-md hover:bg-[#043c4a] flex items-center"
                    >
                        <Plus size={16} className="mr-2" />
                        New Follow-up
                    </button>
                </div>
            </div>

            {/* Lead Selection */}
            {!isAddingNew && (
                <div className="bg-white rounded-lg shadow p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-lg font-medium text-gray-900">Your Assigned Leads</h2>
                        <button
                            onClick={fetchLeads}
                            className="p-2 text-gray-500 hover:text-gray-700"
                            title="Refresh leads"
                        >
                            <RefreshCw size={18} />
                        </button>
                    </div>

                    {/* Search input for leads */}
                    <div className="relative mb-4">
                        <input
                            type="text"
                            placeholder="Search leads by name or company..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full p-2 pl-8 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                        <div className="absolute left-2 top-1/2 transform -translate-y-1/2">
                            <Search size={16} className="text-gray-400" />
                        </div>
                        {searchTerm && (
                            <button
                                type="button"
                                onClick={() => setSearchTerm('')}
                                className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        )}
                    </div>

                    {isLoadingLeads ? (
                        <div className="flex items-center justify-center py-4">
                            <Loader size={24} className="text-blue-500 animate-spin mr-2" />
                            <span>Loading leads...</span>
                        </div>
                    ) : error ? (
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
                    ) : leads.length === 0 ? (
                        <div className="text-center py-8 bg-gray-50 rounded-lg">
                            <div className="text-gray-400 mb-4">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                </svg>
                            </div>
                            <h3 className="text-lg font-medium text-gray-900 mb-2">No Leads Assigned</h3>
                            <p className="text-gray-500">You don't have any leads assigned to you yet.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {/* All Leads option */}
                            <div
                                className="border border-gray-200 rounded-md p-4 hover:bg-blue-50 hover:border-blue-200 cursor-pointer transition-colors"
                                onClick={() => {
                                    setSelectedLead({ id: 'all', name: 'All Leads', company: '' });
                                    setIsAddingNew(true);
                                }}
                            >
                                <div className="flex items-center justify-between">
                                    <h3 className="font-medium text-blue-600">All Leads</h3>
                                    <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                                        {filteredLeads.length} leads
                                    </span>
                                </div>
                                <p className="text-sm text-gray-500 mt-2">
                                    Schedule a follow-up for all your assigned leads
                                </p>
                            </div>

                            {/* Individual leads */}
                            {filteredLeads.map(lead => (
                                <div
                                    key={lead.id}
                                    className="border border-gray-200 rounded-md p-4 hover:bg-blue-50 hover:border-blue-200 cursor-pointer transition-colors"
                                    onClick={() => {
                                        setSelectedLead(lead);
                                        setIsAddingNew(true);
                                    }}
                                >
                                    <div className="flex items-center justify-between mb-2">
                                        <h3 className="font-medium text-gray-900">{lead.name}</h3>
                                        <span className={`px-2 py-1 text-xs rounded-full ${
                                            lead.priority === 'High'
                                                ? 'bg-red-100 text-red-800'
                                                : lead.priority === 'Medium'
                                                ? 'bg-yellow-100 text-yellow-800'
                                                : 'bg-green-100 text-green-800'
                                        }`}>
                                            {lead.priority}
                                        </span>
                                    </div>
                                    <p className="text-sm text-gray-500">{lead.company}</p>
                                    <div className="mt-2 flex items-center text-xs text-gray-500">
                                        <span className={`px-2 py-1 rounded-full ${
                                            lead.status === 'New'
                                                ? 'bg-blue-100 text-blue-800'
                                                : lead.status === 'In Progress'
                                                ? 'bg-yellow-100 text-yellow-800'
                                                : lead.status === 'Converted'
                                                ? 'bg-green-100 text-green-800'
                                                : 'bg-gray-100 text-gray-800'
                                        }`}>
                                            {lead.status}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* Add New Follow-up Form */}
            {isAddingNew && (
                <FollowUpForm
                    lead={selectedLead}
                    onSuccess={handleFollowUpSuccess}
                    onCancel={() => {
                        setIsAddingNew(false);
                        setSelectedLead(null);
                    }}
                />
            )}

            {/* Follow-ups List */}
            {isLoading ? (
                <div className="flex items-center justify-center py-8">
                    <Loader size={24} className="text-blue-500 animate-spin mr-2" />
                    <span>Loading follow-ups...</span>
                </div>
            ) : error ? (
                <div className="bg-red-100 border border-red-200 text-red-800 px-4 py-3 rounded-md flex items-center">
                    <AlertCircle size={20} className="mr-2" />
                    <span>{error}</span>
                    <button
                        onClick={fetchFollowUps}
                        className="ml-auto text-red-800 hover:text-red-900"
                    >
                        <RefreshCw size={16} />
                    </button>
                </div>
            ) : followUps.length === 0 ? (
                <div className="text-center py-8 bg-white rounded-lg shadow">
                    <Calendar size={48} className="mx-auto text-gray-400 mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No Follow-ups</h3>
                    <p className="text-gray-500 mb-4">You don't have any follow-ups scheduled yet.</p>
                    <button
                        onClick={handleAddNew}
                        className="px-4 py-2 bg-[#022d38] text-white rounded-md hover:bg-[#043c4a] flex items-center mx-auto"
                    >
                        <Plus size={16} className="mr-2" />
                        Schedule Follow-up
                    </button>
                </div>
            ) : (
                <div className="bg-white rounded-lg shadow overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Lead</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Due Date</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Priority</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Notes</th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {followUps.map((followUp) => (
                                    <tr key={followUp.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm font-medium text-gray-900">{followUp.leadName}</div>
                                            <div className="text-sm text-gray-500">{followUp.company}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                {getTypeIcon(followUp.type)}
                                                <span className="ml-2 text-sm text-gray-900 capitalize">{followUp.type}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-gray-900">{followUp.dueDate}</div>
                                            <div className="text-sm text-gray-500">{followUp.dueTime}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                                followUp.status === 'Completed'
                                                    ? 'bg-green-100 text-green-800'
                                                    : followUp.status === 'Missed'
                                                    ? 'bg-red-100 text-red-800'
                                                    : followUp.status === 'Rescheduled'
                                                    ? 'bg-yellow-100 text-yellow-800'
                                                    : 'bg-blue-100 text-blue-800'
                                            }`}>
                                                {followUp.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                                followUp.priority === 'High'
                                                    ? 'bg-red-100 text-red-800'
                                                    : followUp.priority === 'Medium'
                                                    ? 'bg-yellow-100 text-yellow-800'
                                                    : 'bg-green-100 text-green-800'
                                            }`}>
                                                {followUp.priority}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="text-sm text-gray-900 max-w-xs truncate">{followUp.notes}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            <div className="flex items-center justify-end space-x-2">
                                                <button
                                                    onClick={() => handleFollowUpStatusChange(followUp.id, followUp.leadId, !followUp.completed)}
                                                    className={`text-sm ${
                                                        followUp.completed
                                                            ? 'text-yellow-600 hover:text-yellow-900'
                                                            : 'text-green-600 hover:text-green-900'
                                                    }`}
                                                >
                                                    {followUp.completed ? 'Mark Incomplete' : 'Mark Complete'}
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteFollowUp(followUp.id, followUp.leadId)}
                                                    className="text-red-600 hover:text-red-900"
                                                >
                                                    Delete
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
}
