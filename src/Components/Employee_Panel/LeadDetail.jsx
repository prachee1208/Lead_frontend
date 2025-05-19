import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
    ArrowLeft, Phone, Mail, MessageSquare, Calendar,
    Clock, FileText, Edit, CheckCircle, X, User,
    Building, MapPin, Globe, Briefcase, DollarSign,
    AlertCircle, RefreshCw, Loader, Trash2, Users
} from 'lucide-react';
import { leadsAPI } from '../../services/api';
import { enhancedAPI } from '../../services/enhancedAPI';
import { toast } from 'react-toastify';
import FollowUpForm from './FollowUpForm';
import { notifyLeadStatusChanged } from '../../utils/dashboardUpdater';

export default function LeadDetail() {
    const { leadId } = useParams();
    const navigate = useNavigate();
    const [lead, setLead] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [activeTab, setActiveTab] = useState('overview');
    const [showStatusDropdown, setShowStatusDropdown] = useState(false);
    const [showFollowUpForm, setShowFollowUpForm] = useState(false);
    const [isLoadingFollowUps, setIsLoadingFollowUps] = useState(false);

    // Fetch lead data from API
    const fetchLeadData = async () => {
        setLoading(true);
        setError(null);

        try {
            const response = await leadsAPI.getById(leadId);
            console.log('Lead detail response:', response);

            if (response && response.data && response.data.data) {
                const leadData = response.data.data;

                // Transform API data to match component structure
                const formattedLead = {
                    id: leadData._id,
                    name: leadData.name,
                    company: leadData.company || 'N/A',
                    email: leadData.email || 'N/A',
                    phone: leadData.phone || 'N/A',
                    status: leadData.status || 'New',
                    assignedDate: new Date(leadData.updatedAt).toLocaleDateString(),
                    lastContact: leadData.lastContact ? new Date(leadData.lastContact).toLocaleDateString() : null,
                    address: leadData.address || 'N/A',
                    website: leadData.website || 'N/A',
                    industry: leadData.industry || 'N/A',
                    source: leadData.source || 'N/A',
                    potentialValue: leadData.potentialValue || 'N/A',
                    notes: leadData.notes || 'No notes available',
                    history: leadData.history || [
                        { id: 1, date: new Date(leadData.createdAt).toLocaleDateString(), type: 'system', description: 'Lead created' }
                    ],
                    followUps: leadData.followUps || []
                };

                setLead(formattedLead);
            } else {
                // If API call succeeds but no data is returned
                setError('Lead not found or you do not have access to this lead');
            }
        } catch (err) {
            console.error('Error fetching lead details:', err);
            setError('Failed to load lead details. Please try again.');
            toast.error('Failed to load lead: ' + (err.message || 'Unknown error'));

            // For testing, use mock data if API fails
            setLead({
                id: leadId,
                name: 'John Smith (Mock)',
                company: 'Acme Corp',
                email: 'john@acmecorp.com',
                phone: '(555) 123-4567',
                status: 'New',
                assignedDate: '2023-05-10',
                lastContact: null,
                address: '123 Business Ave, Suite 100, San Francisco, CA 94107',
                website: 'www.acmecorp.com',
                industry: 'Technology',
                source: 'Website Form',
                potentialValue: '$15,000',
                notes: 'Initial contact made through website inquiry about enterprise software solutions.',
                history: [
                    { id: 1, date: '2023-05-10', type: 'system', description: 'Lead assigned to John Employee' },
                ],
                followUps: []
            });
        } finally {
            setLoading(false);
        }
    };

    // Fetch follow-ups for this lead
    const fetchFollowUps = async () => {
        if (!lead) return;

        setIsLoadingFollowUps(true);

        try {
            const response = await enhancedAPI.followUps.getByLead(leadId);
            console.log('Follow-ups response:', response);

            if (response && response.data) {
                // Check if response.data is an array or if it has a data property that is an array
                const followUpsArray = Array.isArray(response.data)
                    ? response.data
                    : (response.data.data && Array.isArray(response.data.data) ? response.data.data : []);

                console.log('Follow-ups array:', followUpsArray);

                // Transform the API response to match our component's data structure
                const formattedFollowUps = followUpsArray.map(followUp => ({
                    id: followUp._id,
                    type: followUp.type || 'call',
                    title: followUp.title || `${followUp.type || 'General'} follow-up`,
                    dueDate: new Date(followUp.nextFollowUpDate || followUp.dueDate),
                    notes: followUp.notes || '',
                    completed: followUp.completed || false
                }));

                // Update the lead with the follow-ups
                setLead(prevLead => ({
                    ...prevLead,
                    followUps: formattedFollowUps
                }));
            }
        } catch (err) {
            console.error('Error fetching follow-ups:', err);
            toast.error('Failed to load follow-ups: ' + (err.message || 'Unknown error'));
        } finally {
            setIsLoadingFollowUps(false);
        }
    };

    // Handle adding a new follow-up
    const handleFollowUpSuccess = (newFollowUp) => {
        setShowFollowUpForm(false);

        // Add the new follow-up to the lead
        setLead(prevLead => ({
            ...prevLead,
            followUps: [...prevLead.followUps, newFollowUp]
        }));

        // Switch to the follow-ups tab
        setActiveTab('followUps');
    };

    // Handle deleting a follow-up
    const handleDeleteFollowUp = async (id) => {
        try {
            // Optimistically update UI
            const updatedFollowUps = lead.followUps.filter(followUp => followUp.id !== id);
            setLead(prevLead => ({
                ...prevLead,
                followUps: updatedFollowUps
            }));

            // Delete from the database
            const response = await enhancedAPI.followUps.delete(id);
            console.log('Delete follow-up response:', response);

            toast.success('Follow-up deleted successfully');
        } catch (err) {
            console.error('Error deleting follow-up:', err);
            toast.error('Failed to delete follow-up: ' + (err.message || 'Unknown error'));

            // Revert the optimistic update by fetching fresh data
            fetchFollowUps();
        }
    };

    // Handle marking a follow-up as complete
    const handleMarkFollowUpComplete = async (id) => {
        try {
            // Optimistically update UI
            const updatedFollowUps = lead.followUps.map(followUp =>
                followUp.id === id ? { ...followUp, completed: true } : followUp
            );
            setLead(prevLead => ({
                ...prevLead,
                followUps: updatedFollowUps
            }));

            // Update in the database
            const response = await enhancedAPI.followUps.markComplete(id);
            console.log('Mark follow-up complete response:', response);

            toast.success('Follow-up marked as completed');
        } catch (err) {
            console.error('Error marking follow-up as complete:', err);
            toast.error('Failed to update follow-up: ' + (err.message || 'Unknown error'));

            // Revert the optimistic update
            fetchFollowUps();
        }
    };

    // Load data on component mount
    useEffect(() => {
        fetchLeadData();
    }, [leadId]);

    // Fetch follow-ups when lead data is loaded
    useEffect(() => {
        if (lead && lead.id) {
            fetchFollowUps();
        }
    }, [lead?.id]);

    const handleStatusChange = async (newStatus) => {
        setShowStatusDropdown(false);

        try {
            // Create a new history entry
            const newHistoryEntry = {
                id: lead.history.length + 1,
                date: new Date().toISOString().split('T')[0],
                type: 'status',
                description: `Status changed to ${newStatus}`
            };

            // Optimistically update the UI
            setLead(prevLead => ({
                ...prevLead,
                status: newStatus,
                history: [...prevLead.history, newHistoryEntry]
            }));

            // Prepare data for the update
            const updateData = {
                status: newStatus,
                // Include the new history entry
                history: [...lead.history, newHistoryEntry]
            };

            // If status is being changed to Closed, add additional data
            if (newStatus === 'Closed') {
                // Add conversion date
                updateData.conversionDate = new Date().toISOString();

                // Add last contact date if not already set
                if (!lead.lastContact) {
                    updateData.lastContact = new Date().toISOString();
                }
            }

            console.log('Updating lead with data:', updateData);

            // Try using enhancedAPI first for better error handling
            try {
                const response = await enhancedAPI.leads.update(leadId, updateData);
                console.log('Status update response (enhancedAPI):', response);
            } catch (enhancedApiError) {
                console.warn('enhancedAPI update failed, falling back to leadsAPI:', enhancedApiError);
                // Fall back to leadsAPI if enhancedAPI fails
                const response = await leadsAPI.update(leadId, updateData);
                console.log('Status update response (leadsAPI fallback):', response);
            }

            // Show success message
            toast.success(`Lead status updated to ${newStatus}`);

            // Notify dashboard updater about the status change
            try {
                // Create notification data
                const notificationData = {
                    id: leadId,
                    name: lead.name,
                    status: newStatus
                };

                // Use the dashboardUpdater utility
                notifyLeadStatusChanged(notificationData);

                console.log('Lead status change notification sent');
            } catch (notifyError) {
                console.warn('Failed to send status change notification:', notifyError);
            }

        } catch (err) {
            console.error('Error updating lead status:', err);

            // Extract the most useful error message
            let errorMessage = 'Failed to update status';

            if (err.data && err.data.error) {
                // Backend validation error
                errorMessage += ': ' + err.data.error;
            } else if (err.message) {
                // Standard error message
                errorMessage += ': ' + err.message;
            } else if (typeof err === 'string') {
                // String error
                errorMessage += ': ' + err;
            }

            // Log detailed error information for debugging
            console.log('Detailed error information:', {
                message: err.message,
                data: err.data,
                status: err.status,
                originalError: err.originalError
            });

            toast.error(errorMessage);

            // Revert the optimistic update if the API call fails
            fetchLeadData();
        }
    };

    const getStatusColor = (status) => {
        switch(status) {
            case 'New': return 'bg-blue-100 text-blue-800';
            case 'Contacted': return 'bg-yellow-100 text-yellow-800';
            case 'Qualified': return 'bg-indigo-100 text-indigo-800';
            case 'Proposal': return 'bg-purple-100 text-purple-800';
            case 'Negotiation': return 'bg-orange-100 text-orange-800';
            case 'Closed': return 'bg-green-100 text-green-800';
            case 'Lost': return 'bg-red-100 text-red-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] p-6">
                <Loader className="w-12 h-12 text-blue-500 animate-spin mb-4" />
                <h2 className="text-xl font-semibold text-gray-700">Loading Lead Details...</h2>
                <p className="text-gray-500 mt-2">Please wait while we fetch the lead information</p>
            </div>
        );
    }

    if (error && !lead) {
        return (
            <div className="text-center py-12">
                <AlertCircle size={48} className="mx-auto text-red-500 mb-4" />
                <h2 className="text-2xl font-semibold text-gray-800">Error Loading Lead</h2>
                <p className="mt-2 text-gray-600">{error}</p>
                <div className="mt-6 flex justify-center space-x-4">
                    <button
                        onClick={fetchLeadData}
                        className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 flex items-center"
                    >
                        <RefreshCw size={16} className="mr-2" />
                        Try Again
                    </button>
                    <button
                        onClick={() => navigate('/employee-panel/leads')}
                        className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
                    >
                        Back to Leads
                    </button>
                </div>
            </div>
        );
    }

    if (!lead) {
        return (
            <div className="text-center py-12">
                <AlertCircle size={48} className="mx-auto text-gray-300 mb-4" />
                <h2 className="text-2xl font-semibold text-gray-800">Lead not found</h2>
                <p className="mt-2 text-gray-600">The lead you're looking for doesn't exist or you don't have access to it.</p>
                <button
                    onClick={() => navigate('/employee-panel/leads')}
                    className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
                >
                    Back to Leads
                </button>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                    <button
                        onClick={() => navigate('/employee-panel/leads')}
                        className="p-2 rounded-full hover:bg-gray-100"
                    >
                        <ArrowLeft size={20} className="text-gray-500" />
                    </button>
                    <h1 className="text-2xl font-semibold text-gray-800">{lead.name}</h1>
                    <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(lead.status)}`}>
                        {lead.status}
                    </span>
                </div>
                <div className="flex items-center space-x-2">
                    <button
                        onClick={fetchLeadData}
                        className="p-2 rounded-md hover:bg-gray-100"
                        title="Refresh lead data"
                    >
                        <RefreshCw size={18} className="text-gray-500" />
                    </button>
                    <div className="relative">
                        <button
                            onClick={() => setShowStatusDropdown(!showStatusDropdown)}
                            className="px-4 py-2 bg-white border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none"
                        >
                            Update Status
                        </button>

                        {showStatusDropdown && (
                            <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-10">
                                <button
                                    onClick={() => handleStatusChange('New')}
                                    className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                >
                                    New
                                </button>
                                <button
                                    onClick={() => handleStatusChange('Contacted')}
                                    className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                >
                                    Contacted
                                </button>
                                <button
                                    onClick={() => handleStatusChange('Qualified')}
                                    className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                >
                                    Qualified
                                </button>
                                <button
                                    onClick={() => handleStatusChange('Proposal')}
                                    className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                >
                                    Proposal
                                </button>
                                <button
                                    onClick={() => handleStatusChange('Negotiation')}
                                    className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                >
                                    Negotiation
                                </button>
                                <button
                                    onClick={() => handleStatusChange('Closed')}
                                    className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                >
                                    Closed
                                </button>
                                <button
                                    onClick={() => handleStatusChange('Lost')}
                                    className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                >
                                    Lost
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Error Message */}
            {error && (
                <div className="bg-red-100 border border-red-200 text-red-800 px-4 py-3 rounded-md flex items-center">
                    <AlertCircle size={20} className="mr-2" />
                    <span>{error}</span>
                    <button
                        onClick={fetchLeadData}
                        className="ml-auto text-red-800 hover:text-red-900"
                    >
                        <RefreshCw size={16} />
                    </button>
                </div>
            )}

            {/* Contact Actions */}
            <div className="bg-white rounded-lg shadow p-4">
                <div className="flex flex-wrap gap-4">
                    <Link
                        to={`/employee-panel/leads/${lead.id}/contact/phone`}
                        className="flex items-center px-4 py-2 bg-blue-50 text-blue-700 rounded-md hover:bg-blue-100"
                    >
                        <Phone size={18} className="mr-2" />
                        Call
                    </Link>
                    <Link
                        to={`/employee-panel/leads/${lead.id}/contact/email`}
                        className="flex items-center px-4 py-2 bg-green-50 text-green-700 rounded-md hover:bg-green-100"
                    >
                        <Mail size={18} className="mr-2" />
                        Email
                    </Link>
                    <Link
                        to={`/employee-panel/leads/${lead.id}/contact/message`}
                        className="flex items-center px-4 py-2 bg-orange-50 text-orange-700 rounded-md hover:bg-orange-100"
                    >
                        <MessageSquare size={18} className="mr-2" />
                        Message
                    </Link>
                    <button
                        onClick={() => setShowFollowUpForm(true)}
                        className="flex items-center px-4 py-2 bg-purple-50 text-purple-700 rounded-md hover:bg-purple-100"
                    >
                        <Calendar size={18} className="mr-2" />
                        Schedule Follow-up
                    </button>
                </div>
            </div>

            {/* Follow-up Form */}
            {showFollowUpForm && (
                <div className="mt-6">
                    <FollowUpForm
                        lead={lead}
                        onSuccess={handleFollowUpSuccess}
                        onCancel={() => setShowFollowUpForm(false)}
                    />
                </div>
            )}

            {/* Tabs */}
            <div className="bg-white rounded-lg shadow">
                <div className="border-b border-gray-200">
                    <nav className="flex -mb-px">
                        <button
                            onClick={() => setActiveTab('overview')}
                            className={`py-4 px-6 text-sm font-medium ${
                                activeTab === 'overview'
                                    ? 'border-b-2 border-blue-500 text-blue-600'
                                    : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'
                            }`}
                        >
                            Overview
                        </button>
                        <button
                            onClick={() => setActiveTab('history')}
                            className={`py-4 px-6 text-sm font-medium ${
                                activeTab === 'history'
                                    ? 'border-b-2 border-blue-500 text-blue-600'
                                    : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'
                            }`}
                        >
                            History
                        </button>
                        <button
                            onClick={() => setActiveTab('followUps')}
                            className={`py-4 px-6 text-sm font-medium ${
                                activeTab === 'followUps'
                                    ? 'border-b-2 border-blue-500 text-blue-600'
                                    : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'
                            }`}
                        >
                            Follow-ups
                        </button>
                    </nav>
                </div>

                <div className="p-6">
                    {activeTab === 'overview' && (
                        <div className="space-y-6">
                            {/* Contact Information */}
                            <div>
                                <h3 className="text-lg font-medium text-gray-900 mb-4">Contact Information</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="flex items-start">
                                        <User size={18} className="mt-0.5 mr-2 text-gray-400" />
                                        <div>
                                            <p className="text-sm font-medium text-gray-500">Full Name</p>
                                            <p className="text-sm text-gray-900">{lead.name}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-start">
                                        <Building size={18} className="mt-0.5 mr-2 text-gray-400" />
                                        <div>
                                            <p className="text-sm font-medium text-gray-500">Company</p>
                                            <p className="text-sm text-gray-900">{lead.company}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-start">
                                        <Mail size={18} className="mt-0.5 mr-2 text-gray-400" />
                                        <div>
                                            <p className="text-sm font-medium text-gray-500">Email</p>
                                            <p className="text-sm text-gray-900">{lead.email}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-start">
                                        <Phone size={18} className="mt-0.5 mr-2 text-gray-400" />
                                        <div>
                                            <p className="text-sm font-medium text-gray-500">Phone</p>
                                            <p className="text-sm text-gray-900">{lead.phone}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-start">
                                        <MapPin size={18} className="mt-0.5 mr-2 text-gray-400" />
                                        <div>
                                            <p className="text-sm font-medium text-gray-500">Address</p>
                                            <p className="text-sm text-gray-900">{lead.address}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-start">
                                        <Globe size={18} className="mt-0.5 mr-2 text-gray-400" />
                                        <div>
                                            <p className="text-sm font-medium text-gray-500">Website</p>
                                            <p className="text-sm text-gray-900">{lead.website}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Lead Information */}
                            <div>
                                <h3 className="text-lg font-medium text-gray-900 mb-4">Lead Information</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="flex items-start">
                                        <Briefcase size={18} className="mt-0.5 mr-2 text-gray-400" />
                                        <div>
                                            <p className="text-sm font-medium text-gray-500">Industry</p>
                                            <p className="text-sm text-gray-900">{lead.industry}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-start">
                                        <DollarSign size={18} className="mt-0.5 mr-2 text-gray-400" />
                                        <div>
                                            <p className="text-sm font-medium text-gray-500">Potential Value</p>
                                            <p className="text-sm text-gray-900">{lead.potentialValue}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Notes */}
                            <div>
                                <h3 className="text-lg font-medium text-gray-900 mb-4">Notes</h3>
                                <div className="bg-gray-50 p-4 rounded-md">
                                    <p className="text-sm text-gray-700">{lead.notes}</p>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'history' && (
                        <div>
                            <h3 className="text-lg font-medium text-gray-900 mb-4">Lead History</h3>
                            {lead.history.length === 0 ? (
                                <p className="text-sm text-gray-500">No history available for this lead.</p>
                            ) : (
                                <div className="flow-root">
                                    <ul className="-mb-8">
                                        {lead.history.map((event, eventIdx) => (
                                            <li key={event.id}>
                                                <div className="relative pb-8">
                                                    {eventIdx !== lead.history.length - 1 ? (
                                                        <span className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-gray-200" aria-hidden="true"></span>
                                                    ) : null}
                                                    <div className="relative flex space-x-3">
                                                        <div>
                                                            <span className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center">
                                                                {event.type === 'system' && <User size={16} className="text-gray-500" />}
                                                                {event.type === 'status' && <CheckCircle size={16} className="text-blue-500" />}
                                                                {event.type === 'note' && <FileText size={16} className="text-green-500" />}
                                                                {event.type === 'contact' && <Phone size={16} className="text-purple-500" />}
                                                            </span>
                                                        </div>
                                                        <div className="min-w-0 flex-1 pt-1.5 flex justify-between space-x-4">
                                                            <div>
                                                                <p className="text-sm text-gray-900">{event.description}</p>
                                                            </div>
                                                            <div className="text-right text-sm whitespace-nowrap text-gray-500">
                                                                {event.date}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                        </div>
                    )}

                    {activeTab === 'followUps' && (
                        <div>
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-lg font-medium text-gray-900">Follow-ups</h3>
                                <div className="flex items-center space-x-2">
                                    <button
                                        onClick={fetchFollowUps}
                                        className={`p-2 rounded-md hover:bg-gray-100 ${isLoadingFollowUps ? 'opacity-50' : ''}`}
                                        title="Refresh follow-ups"
                                        disabled={isLoadingFollowUps}
                                    >
                                        <RefreshCw size={16} className={`text-gray-500 ${isLoadingFollowUps ? 'animate-spin' : ''}`} />
                                    </button>
                                    <button
                                        onClick={() => setShowFollowUpForm(true)}
                                        className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 text-sm"
                                    >
                                        Add Follow-up
                                    </button>
                                </div>
                            </div>

                            {isLoadingFollowUps ? (
                                <div className="text-center py-8 bg-gray-50 rounded-md">
                                    <Loader size={24} className="mx-auto text-blue-500 animate-spin mb-2" />
                                    <p className="text-sm text-gray-500">Loading follow-ups...</p>
                                </div>
                            ) : lead.followUps.length === 0 ? (
                                <div className="text-center py-8 bg-gray-50 rounded-md">
                                    <Calendar size={24} className="mx-auto text-gray-400 mb-2" />
                                    <p className="text-sm text-gray-500">No follow-ups scheduled for this lead.</p>
                                    <p className="text-sm text-gray-500 mt-1">Schedule a follow-up to stay on top of this lead.</p>
                                </div>
                            ) : (
                                <ul className="divide-y divide-gray-200">
                                    {lead.followUps.map((followUp) => (
                                        <li key={followUp.id} className="py-4">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center">
                                                    <div className={`
                                                        w-10 h-10 rounded-full flex items-center justify-center
                                                        ${followUp.type === 'call' ? 'bg-blue-100' :
                                                        followUp.type === 'email' ? 'bg-green-100' :
                                                        followUp.type === 'meeting' ? 'bg-purple-100' :
                                                        'bg-orange-100'}
                                                    `}>
                                                        {followUp.type === 'call' && <Phone size={20} className="text-blue-500" />}
                                                        {followUp.type === 'email' && <Mail size={20} className="text-green-500" />}
                                                        {followUp.type === 'meeting' && <Users size={20} className="text-purple-500" />}
                                                        {followUp.type === 'message' && <MessageSquare size={20} className="text-orange-500" />}
                                                    </div>
                                                    <div className="ml-4">
                                                        <p className="text-sm font-medium text-gray-900">
                                                            {followUp.title || `${followUp.type.charAt(0).toUpperCase() + followUp.type.slice(1)} follow-up`}
                                                        </p>
                                                        <p className="text-xs text-gray-500">
                                                            {followUp.dueDate.toLocaleDateString()} at {followUp.dueDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                        </p>
                                                        {followUp.notes && (
                                                            <p className="mt-1 text-sm text-gray-600">{followUp.notes}</p>
                                                        )}
                                                    </div>
                                                </div>
                                                <div className="flex space-x-2">
                                                    {!followUp.completed && (
                                                        <button
                                                            onClick={() => handleMarkFollowUpComplete(followUp.id)}
                                                            className="p-1 rounded-full hover:bg-green-100"
                                                            title="Mark as completed"
                                                        >
                                                            <CheckCircle size={18} className="text-green-500" />
                                                        </button>
                                                    )}
                                                    <button
                                                        onClick={() => handleDeleteFollowUp(followUp.id)}
                                                        className="p-1 rounded-full hover:bg-red-100"
                                                        title="Delete follow-up"
                                                    >
                                                        <Trash2 size={18} className="text-red-500" />
                                                    </button>
                                                </div>
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
