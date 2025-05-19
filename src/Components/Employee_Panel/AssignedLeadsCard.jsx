import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
    Users, AlertCircle, Loader, RefreshCw, 
    Phone, Mail, Calendar, CheckCircle, XCircle, Clock
} from 'lucide-react';
import { dataFetcher } from '../../services/dataFetcher';
import { toast } from 'react-toastify';

const AssignedLeadsCard = ({ onLeadsLoaded }) => {
    // State for leads data
    const [leads, setLeads] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [lastUpdated, setLastUpdated] = useState(new Date());
    const [isUpdating, setIsUpdating] = useState(false);
    const [leadsByStatus, setLeadsByStatus] = useState({});

    // Fetch leads assigned to the current employee
    const fetchLeads = async (options = {}) => {
        const { silent = false, forceRefresh = false } = options;
        
        if (!silent) {
            setIsLoading(true);
        } else {
            setIsUpdating(true);
        }
        
        setError(null);

        try {
            // Get the current user ID from localStorage
            const userId = localStorage.getItem('userId');

            if (!userId) {
                console.warn('User ID not found in localStorage');
                setIsLoading(false);
                setIsUpdating(false);
                return;
            }

            console.log(`Fetching leads for employee ID: ${userId} (silent: ${silent}, forceRefresh: ${forceRefresh})`);

            // Use the enhanced data fetcher with caching and offline support
            const response = await dataFetcher.fetchEmployeeLeads(userId, {}, {
                forceRefresh: forceRefresh,
                offlineData: { data: { data: [] } },
                onError: (err) => {
                    console.error('Error in data fetcher:', err);
                    if (!silent) {
                        setError('Failed to load leads. Please try again.');
                        toast.error('Failed to load leads: ' + (err.message || 'Unknown error'));
                    }
                }
            });

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
                    assignedDate: new Date(lead.updatedAt).toLocaleDateString(),
                    updatedAt: lead.updatedAt || lead.createdAt,
                    createdAt: lead.createdAt
                }));

                // Group leads by status
                const groupedLeads = formattedLeads.reduce((acc, lead) => {
                    if (!acc[lead.status]) {
                        acc[lead.status] = [];
                    }
                    acc[lead.status].push(lead);
                    return acc;
                }, {});

                setLeadsByStatus(groupedLeads);
                setLeads(formattedLeads);
                
                // Call the callback with the leads data
                if (onLeadsLoaded) {
                    onLeadsLoaded(formattedLeads);
                }

                // Update last updated timestamp
                if (forceRefresh) {
                    setLastUpdated(new Date());
                }
            } else {
                setLeads([]);
                setLeadsByStatus({});
                
                if (onLeadsLoaded) {
                    onLeadsLoaded([]);
                }
            }
        } catch (err) {
            console.error('Error fetching leads:', err);
            if (!silent) {
                setError('Failed to load leads. Please try again.');
                toast.error('Failed to load leads: ' + (err.message || 'Unknown error'));
            }
        } finally {
            setIsLoading(false);
            setIsUpdating(false);
        }
    };

    // Load data on component mount and set up real-time updates
    useEffect(() => {
        // Initial data fetch
        fetchLeads({ forceRefresh: true });

        // Set up interval for real-time updates (every 30 seconds)
        const updateInterval = setInterval(() => {
            console.log('Refreshing assigned leads data');
            fetchLeads({ silent: true, forceRefresh: true });
        }, 30000);

        // Clean up interval on component unmount
        return () => {
            clearInterval(updateInterval);
        };
    }, []);

    // Helper function to get status color
    const getStatusColor = (status) => {
        switch(status) {
            case 'New': return 'bg-indigo-100 text-indigo-800 border border-indigo-200';
            case 'Contacted': return 'bg-amber-100 text-amber-800 border border-amber-200';
            case 'Qualified': return 'bg-blue-100 text-blue-800 border border-blue-200';
            case 'Proposal': return 'bg-purple-100 text-purple-800 border border-purple-200';
            case 'Negotiation': return 'bg-orange-100 text-orange-800 border border-orange-200';
            case 'Converted': return 'bg-emerald-100 text-emerald-800 border border-emerald-200';
            case 'Lost': return 'bg-red-100 text-red-800 border border-red-200';
            default: return 'bg-slate-100 text-slate-800 border border-slate-200';
        }
    };

    return (
        <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
                <div className="flex items-center">
                    <Users className="text-blue-500 mr-2" />
                    <h2 className="text-lg font-semibold text-gray-800">My Assigned Leads</h2>
                </div>
                <div className="flex items-center space-x-2">
                    <div className="text-xs text-gray-500">
                        {isUpdating ? (
                            <span className="flex items-center">
                                <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-primary mr-1"></div>
                                Updating...
                            </span>
                        ) : (
                            <span>Updated: {lastUpdated.toLocaleTimeString()}</span>
                        )}
                    </div>
                    <Link to="/employee-panel/leads" className="text-sm text-blue-500 hover:text-blue-700">View all</Link>
                    <button
                        onClick={() => fetchLeads({ forceRefresh: true })}
                        className={`p-1 rounded-md hover:bg-gray-100 ${isUpdating || isLoading ? 'opacity-50' : ''}`}
                        title="Refresh leads"
                        disabled={isUpdating || isLoading}
                    >
                        <RefreshCw size={16} className={`text-gray-500 ${isUpdating && 'animate-spin'}`} />
                    </button>
                </div>
            </div>

            {/* Error Message */}
            {error && (
                <div className="mx-6 mt-4 bg-red-100 border border-red-200 text-red-800 px-4 py-3 rounded-md flex items-center">
                    <AlertCircle size={20} className="mr-2" />
                    <span>{error}</span>
                    <button
                        onClick={() => fetchLeads({ forceRefresh: true })}
                        className={`ml-auto text-red-800 hover:text-red-900 ${isUpdating ? 'opacity-50' : ''}`}
                        disabled={isUpdating}
                    >
                        <RefreshCw size={16} className={isUpdating ? 'animate-spin' : ''} />
                    </button>
                </div>
            )}

            {/* Loading State */}
            {isLoading ? (
                <div className="flex flex-col items-center justify-center p-6 h-40">
                    <Loader className="w-8 h-8 text-blue-500 animate-spin mb-2" />
                    <p className="text-sm text-gray-500">Loading your leads...</p>
                </div>
            ) : (
                <div className="p-6">
                    {leads.length === 0 ? (
                        <div className="text-center py-8">
                            <AlertCircle size={32} className="mx-auto text-gray-300 mb-2" />
                            <p className="text-sm text-gray-500">You don't have any leads assigned to you yet</p>
                            <p className="text-xs text-gray-500 mt-2">Only leads assigned to you by managers will appear here</p>
                        </div>
                    ) : (
                        <div>
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-sm font-medium text-gray-700">Total Leads: {leads.length}</h3>
                                <div className="flex space-x-2">
                                    {Object.entries(leadsByStatus).map(([status, statusLeads]) => (
                                        <span key={status} className={`px-2 py-1 text-xs rounded-full ${getStatusColor(status)}`}>
                                            {status}: {statusLeads.length}
                                        </span>
                                    ))}
                                </div>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {leads.slice(0, 6).map((lead) => (
                                    <div key={lead.id} className="border border-gray-200 rounded-md p-3 hover:shadow-md transition-shadow">
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <h4 className="font-medium text-gray-800">{lead.name}</h4>
                                                <p className="text-xs text-gray-500">{lead.company}</p>
                                            </div>
                                            <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(lead.status)}`}>
                                                {lead.status}
                                            </span>
                                        </div>
                                        <div className="mt-2 flex items-center text-xs text-gray-500">
                                            <Calendar size={12} className="mr-1" />
                                            <span>Assigned: {lead.assignedDate}</span>
                                        </div>
                                        <div className="mt-3 flex justify-between">
                                            <div className="flex space-x-2">
                                                {lead.phone && (
                                                    <a href={`tel:${lead.phone}`} className="text-blue-500 hover:text-blue-700">
                                                        <Phone size={16} />
                                                    </a>
                                                )}
                                                {lead.email && (
                                                    <a href={`mailto:${lead.email}`} className="text-green-500 hover:text-green-700">
                                                        <Mail size={16} />
                                                    </a>
                                                )}
                                            </div>
                                            <Link to={`/employee-panel/leads/${lead.id}`} className="text-sm text-blue-500 hover:text-blue-700">
                                                View Details
                                            </Link>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            {leads.length > 6 && (
                                <div className="mt-4 text-center">
                                    <Link to="/employee-panel/leads" className="text-sm text-blue-500 hover:text-blue-700">
                                        View all {leads.length} leads
                                    </Link>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default AssignedLeadsCard;
