import { useState, useEffect } from 'react';
import { Calendar, Plus, RefreshCw, Search, Loader, AlertCircle } from 'lucide-react';
import { enhancedAPI } from '../../services/enhancedAPI';
import { toast } from 'react-toastify';
import FollowUpForm from './FollowUpForm';

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
        try {
            // Get the current user ID from localStorage
            const userId = localStorage.getItem('userId');

            if (!userId) {
                console.warn('User ID not found in localStorage');
                return;
            }

            // Fetch follow-ups for the current employee
            const response = await enhancedAPI.followUps.getByEmployee(userId);
            console.log('Follow-ups response:', response);

            if (response && response.data) {
                // Transform the API response to match our component's data structure
                const formattedFollowUps = response.data.map(followUp => ({
                    id: followUp._id,
                    type: followUp.type || 'call',
                    leadName: followUp.leadName || (followUp.lead ? followUp.lead.name : 'Unknown Lead'),
                    company: followUp.company || (followUp.lead ? followUp.lead.company : 'N/A'),
                    leadId: followUp.leadId || (followUp.lead ? followUp.lead._id : null),
                    dueDate: new Date(followUp.dueDate).toLocaleDateString(),
                    dueTime: new Date(followUp.dueDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                    notes: followUp.notes || '',
                    completed: followUp.completed || false
                }));

                setFollowUps(formattedFollowUps);
            } else {
                // If no data is returned, use empty array
                setFollowUps([]);
            }
        } catch (err) {
            console.error('Error fetching follow-ups:', err);
            toast.error('Failed to load follow-ups: ' + (err.message || 'Unknown error'));
        }
    };

    // Fetch leads from the API
    const fetchLeads = async () => {
        setIsLoadingLeads(true);

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

            if (response && response.data && response.data.data) {
                // Transform the API response to match our component's data structure
                const formattedLeads = response.data.data.map(lead => ({
                    id: lead._id,
                    name: lead.name,
                    company: lead.company || 'N/A'
                }));

                // Sort leads alphabetically by name
                formattedLeads.sort((a, b) => a.name.localeCompare(b.name));

                setLeads(formattedLeads);
            } else {
                // If no data is returned, use empty array
                setLeads([]);
            }
        } catch (err) {
            console.error('Error fetching leads:', err);
            toast.error('Failed to load leads: ' + (err.message || 'Unknown error'));
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

    // Handle lead selection
    const handleLeadSelect = (e) => {
        const leadId = e.target.value;

        if (leadId === '') {
            // No lead selected
            setSelectedLead(null);
            return;
        }

        if (leadId === 'all') {
            // All leads selected
            setSelectedLead({ id: 'all', name: 'All Leads', company: '' });
            return;
        }

        // Find the selected lead
        const lead = leads.find(lead => lead.id === leadId);
        if (lead) {
            setSelectedLead(lead);
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
                    <h2 className="text-lg font-medium text-gray-900 mb-4">Select a Lead</h2>

                    {/* Search input for leads */}
                    {leads.length > 10 && (
                        <div className="relative mb-4">
                            <input
                                type="text"
                                placeholder="Search leads..."
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
                    )}

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
                        <div className="text-center py-4">
                            <p className="text-gray-500">No leads assigned to you yet</p>
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
                                    <h3 className="font-medium">{lead.name}</h3>
                                    <p className="text-sm text-gray-500">{lead.company}</p>
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
            {!isAddingNew && (
                <div className="bg-white rounded-lg shadow p-6">
                    <div className="text-center py-8">
                        <Calendar size={48} className="mx-auto text-gray-300 mb-4" />
                        <h3 className="text-lg font-medium text-gray-900">Follow-ups</h3>
                        <p className="mt-1 text-sm text-gray-500">
                            Your follow-ups will appear here
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
}
