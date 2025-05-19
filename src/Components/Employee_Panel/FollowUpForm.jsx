import { useState, useEffect } from 'react';
import { Calendar, Clock, PhoneCall, Mail, Users, MessageSquare, Loader } from 'lucide-react';
import { enhancedAPI } from '../../services/enhancedAPI';
import { toast } from 'react-toastify';

export default function FollowUpForm({ lead, onSuccess, onCancel }) {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isLoadingLeads, setIsLoadingLeads] = useState(false);
    const [leads, setLeads] = useState([]);
    const [leadSearchTerm, setLeadSearchTerm] = useState('');
    const [showAllLeadsOption, setShowAllLeadsOption] = useState(false);
    const [followUp, setFollowUp] = useState({
        type: 'call',
        leadId: lead ? lead.id : '',
        date: '',
        time: '',
        notes: ''
    });

    // Fetch all leads assigned to the employee
    useEffect(() => {
        // If a specific lead is provided, we still need to fetch all leads for the "All Leads" option
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
                    setShowAllLeadsOption(formattedLeads.length > 0);

                    // If a specific lead was provided, make sure it's in the list
                    if (lead && !formattedLeads.some(l => l.id === lead.id)) {
                        setLeads([
                            ...formattedLeads,
                            {
                                id: lead.id,
                                name: lead.name,
                                company: lead.company || 'N/A'
                            }
                        ]);
                    }
                }
            } catch (err) {
                console.error('Error fetching leads:', err);
                toast.error('Failed to load leads: ' + (err.message || 'Unknown error'));
            } finally {
                setIsLoadingLeads(false);
            }
        };

        fetchLeads();
    }, [lead]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;

        // Handle regular follow-up form inputs
        setFollowUp({
            ...followUp,
            [name]: value
        });
    };



    const handleSubmit = async (e) => {
        e.preventDefault();

        // Validate form
        if ((!followUp.leadId && !lead) || !followUp.date || !followUp.time) {
            toast.error('Please fill in all required fields');
            return;
        }

        setIsSubmitting(true);

        try {
            // Combine date and time into a single Date object
            const dueDate = new Date(`${followUp.date}T${followUp.time}`);
            const userId = localStorage.getItem('userId');

            // Handle "All Leads" option
            if (followUp.leadId === 'all') {
                // Create a follow-up for all leads (or filtered leads if search is active)
                const leadsToProcess = leadSearchTerm ? filteredLeads : leads;
                const allLeadsFollowUps = [];

                // Show a confirmation toast
                toast.info(`Creating follow-ups for ${leadsToProcess.length} leads...`);

                // Create follow-ups for each lead
                for (const lead of leadsToProcess) {
                    try {
                        // Prepare data for API
                        const followUpData = {
                            type: followUp.type,
                            leadId: lead.id,
                            leadName: lead.name,
                            company: lead.company || 'N/A',
                            dueDate: dueDate.toISOString(),
                            notes: followUp.notes,
                            completed: false,
                            employeeId: userId
                        };

                        // Save to API
                        const response = await enhancedAPI.followUps.create(followUpData);

                        if (response && response.data) {
                            allLeadsFollowUps.push({
                                id: response.data._id || Date.now().toString(),
                                type: followUpData.type,
                                leadName: lead.name,
                                company: lead.company || 'N/A',
                                leadId: lead.id,
                                dueDate: dueDate,
                                notes: followUpData.notes,
                                completed: false
                            });
                        }
                    } catch (err) {
                        console.error(`Error creating follow-up for lead ${lead.name}:`, err);
                    }
                }

                // Show success message
                toast.success(`Created follow-ups for ${allLeadsFollowUps.length} leads`);

                if (onSuccess) {
                    // Pass the first follow-up as an example
                    onSuccess(allLeadsFollowUps.length > 0 ? allLeadsFollowUps[0] : {
                        id: Date.now().toString(),
                        type: followUp.type,
                        leadName: 'All Leads',
                        dueDate: dueDate,
                        notes: followUp.notes,
                        completed: false
                    });
                }

                return;
            }

            // Handle single lead follow-up
            const targetLead = lead || leads.find(l => l.id === followUp.leadId);

            if (!targetLead) {
                toast.error('Selected lead not found');
                setIsSubmitting(false);
                return;
            }

            // Prepare data for API
            const followUpData = {
                type: followUp.type,
                leadId: targetLead.id,
                leadName: targetLead.name,
                company: targetLead.company || 'N/A',
                dueDate: dueDate.toISOString(),
                notes: followUp.notes,
                completed: false,
                employeeId: userId
            };

            console.log('Saving follow-up:', followUpData);

            // Save to API
            const response = await enhancedAPI.followUps.create(followUpData);
            console.log('Follow-up created response:', response);

            // If successful, call the success callback
            if (response && response.data) {
                const newFollowUp = {
                    id: response.data._id || Date.now().toString(),
                    type: followUpData.type,
                    dueDate: dueDate,
                    notes: followUpData.notes,
                    completed: false
                };

                toast.success('Follow-up scheduled successfully');

                if (onSuccess) {
                    onSuccess(newFollowUp);
                }
            } else {
                // Try fallback method if the main endpoint doesn't return expected data
                const fallbackResponse = await enhancedAPI.followUps.addToLead(
                    followUpData.leadId,
                    {
                        type: followUpData.type,
                        dueDate: followUpData.dueDate,
                        notes: followUpData.notes
                    }
                );

                console.log('Fallback response:', fallbackResponse);

                if (fallbackResponse && fallbackResponse.success) {
                    const newFollowUp = {
                        id: fallbackResponse.data.id || Date.now().toString(),
                        type: followUpData.type,
                        dueDate: dueDate,
                        notes: followUpData.notes,
                        completed: false
                    };

                    toast.success('Follow-up scheduled successfully (fallback method)');

                    if (onSuccess) {
                        onSuccess(newFollowUp);
                    }
                } else {
                    throw new Error('Failed to create follow-up');
                }
            }
        } catch (err) {
            console.error('Error creating follow-up:', err);
            toast.error('Failed to schedule follow-up: ' + (err.message || 'Unknown error'));
        } finally {
            setIsSubmitting(false);
        }
    };

    // Filter leads based on search term
    const filteredLeads = leads.filter(lead => {
        if (!leadSearchTerm) return true;

        const searchTermLower = leadSearchTerm.toLowerCase();
        return (
            lead.name.toLowerCase().includes(searchTermLower) ||
            lead.company.toLowerCase().includes(searchTermLower)
        );
    });

    const getTypeIcon = (type) => {
        switch(type) {
            case 'call': return <PhoneCall size={20} className="text-blue-500" />;
            case 'email': return <Mail size={20} className="text-green-500" />;
            case 'meeting': return <Users size={20} className="text-purple-500" />;
            case 'message': return <MessageSquare size={20} className="text-orange-500" />;
            default: return <Calendar size={20} className="text-gray-500" />;
        }
    };

    return (
        <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">
                Schedule Follow-up {lead ? `for ${lead.name}` : ''}
            </h2>
            <form onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Lead Selection - Only show if no lead is provided */}
                    {!lead && (
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Lead</label>

                            {/* Search input for leads */}
                            {leads.length > 10 && (
                                <div className="relative mb-2">
                                    <input
                                        type="text"
                                        placeholder="Search leads..."
                                        value={leadSearchTerm}
                                        onChange={(e) => setLeadSearchTerm(e.target.value)}
                                        className="w-full p-2 pl-8 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    />
                                    <div className="absolute left-2 top-1/2 transform -translate-y-1/2">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                        </svg>
                                    </div>
                                    {leadSearchTerm && (
                                        <button
                                            type="button"
                                            onClick={() => setLeadSearchTerm('')}
                                            className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                            </svg>
                                        </button>
                                    )}
                                </div>
                            )}

                            <div className="relative">
                                <select
                                    name="leadId"
                                    value={followUp.leadId}
                                    onChange={handleInputChange}
                                    className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    required
                                    disabled={isLoadingLeads}
                                >
                                    <option value="">Select a lead</option>

                                    {/* Special options */}
                                    {showAllLeadsOption && (
                                        <optgroup label="Actions">
                                            <option value="all">
                                                {leadSearchTerm
                                                    ? `All Filtered Leads (${filteredLeads.length})`
                                                    : `All Leads (${leads.length})`}
                                            </option>
                                        </optgroup>
                                    )}

                                    {/* Assigned leads */}
                                    {filteredLeads.length > 0 && (
                                        <optgroup label={leadSearchTerm ? `Search Results (${filteredLeads.length})` : `My Assigned Leads (${filteredLeads.length})`}>
                                            {filteredLeads.map(lead => (
                                                <option key={lead.id} value={lead.id}>
                                                    {lead.name} - {lead.company}
                                                </option>
                                            ))}
                                        </optgroup>
                                    )}

                                    {/* No results message */}
                                    {leadSearchTerm && filteredLeads.length === 0 && leads.length > 0 && (
                                        <optgroup label="No matches found">
                                            <option disabled>No leads match your search</option>
                                        </optgroup>
                                    )}
                                </select>
                                {isLoadingLeads && (
                                    <div className="absolute right-2 top-1/2 transform -translate-y-1/2">
                                        <Loader size={16} className="text-gray-400 animate-spin" />
                                    </div>
                                )}
                            </div>

                            {/* Lead count and info */}
                            {leads.length > 0 && (
                                <p className="text-xs text-gray-500 mt-1">
                                    {leadSearchTerm
                                        ? `Showing ${filteredLeads.length} of ${leads.length} leads`
                                        : `You have ${leads.length} assigned leads`}
                                </p>
                            )}
                        </div>
                    )}

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                        <div className="flex space-x-2">
                            {['call', 'email', 'meeting', 'message'].map(type => (
                                <button
                                    key={type}
                                    type="button"
                                    onClick={() => setFollowUp({ ...followUp, type })}
                                    className={`flex items-center px-3 py-2 rounded-md ${
                                        followUp.type === type
                                            ? 'bg-blue-50 text-blue-700 border border-blue-200'
                                            : 'bg-gray-50 text-gray-700 border border-gray-200 hover:bg-gray-100'
                                    }`}
                                >
                                    {getTypeIcon(type)}
                                    <span className="ml-2 capitalize">{type}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                            <input
                                type="date"
                                name="date"
                                value={followUp.date}
                                onChange={handleInputChange}
                                className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Time</label>
                            <input
                                type="time"
                                name="time"
                                value={followUp.time}
                                onChange={handleInputChange}
                                className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                required
                            />
                        </div>
                    </div>
                    <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                        <textarea
                            name="notes"
                            value={followUp.notes}
                            onChange={handleInputChange}
                            rows={3}
                            className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            placeholder="Add any notes or details about this follow-up"
                        ></textarea>
                    </div>
                </div>
                <div className="mt-6 flex justify-end space-x-3">
                    <button
                        type="button"
                        onClick={onCancel}
                        className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
                        disabled={isSubmitting}
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center"
                        disabled={isSubmitting}
                    >
                        {isSubmitting ? (
                            <>
                                <Loader size={16} className="animate-spin mr-2" />
                                Saving...
                            </>
                        ) : (
                            'Schedule Follow-up'
                        )}
                    </button>
                </div>
            </form>
        </div>
    );
}
