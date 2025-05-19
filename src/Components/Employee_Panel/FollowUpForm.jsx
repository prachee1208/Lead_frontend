import { useState, useEffect } from 'react';
import { Calendar, Clock, PhoneCall, Mail, Users, MessageSquare, Loader } from 'lucide-react';
import { enhancedAPI } from '../../services/enhancedAPI';
import { toast } from 'react-toastify';

export default function FollowUpForm({ lead, onSuccess, onCancel }) {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [leads, setLeads] = useState([]);
    // Set default date to today and time to current time + 1 hour
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);

    // Format date as YYYY-MM-DD
    const formattedDate = tomorrow.toISOString().split('T')[0];

    // Format time as HH:MM
    today.setHours(today.getHours() + 1);
    const formattedTime = today.toTimeString().slice(0, 5);

    const [followUp, setFollowUp] = useState({
        type: 'call',
        leadId: lead ? lead.id : 'all', // Default to "all" if no lead is provided
        date: formattedDate,
        time: formattedTime,
        notes: ''
    });

    // Fetch all leads assigned to the employee if needed for "All Leads" option
    useEffect(() => {
        // Check if token exists
        const token = localStorage.getItem('token');
        console.log('Token in localStorage:', token ? 'Yes (length: ' + token.length + ')' : 'No');

        // Only fetch leads if we're creating follow-ups for all leads
        if (lead && lead.id === 'all') {
            const fetchLeads = async () => {
                try {
                    // Get the current user ID from localStorage
                    const userId = localStorage.getItem('userId');

                    if (!userId) {
                        console.warn('User ID not found in localStorage');
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
                    }
                } catch (err) {
                    console.error('Error fetching leads:', err);
                    toast.error('Failed to load leads: ' + (err.message || 'Unknown error'));
                }
            };

            fetchLeads();
        } else if (lead) {
            // If a specific lead is provided, set it as the selected lead
            setFollowUp(prev => ({
                ...prev,
                leadId: lead.id
            }));
        }
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
        if (!followUp.date || !followUp.time) {
            toast.error('Please fill in all required fields');
            return;
        }

        // Validate lead
        if (!lead) {
            toast.error('No lead selected for follow-up');
            return;
        }

        setIsSubmitting(true);

        try {
            // Combine date and time into a single Date object
            const dueDate = new Date(`${followUp.date}T${followUp.time}`);

            // Handle "All Leads" option
            if (lead.id === 'all') {
                // Create a follow-up for all leads
                const allLeadsFollowUps = [];

                // Show a confirmation toast
                toast.info(`Creating follow-ups for ${leads.length} leads...`);

                // Create follow-ups for each lead
                for (const leadItem of leads) {
                    try {
                        // Prepare data for API - match the expected fields in the backend controller
                        const followUpData = {
                            leadId: leadItem.id, // Include the leadId for the API endpoint
                            notes: `${followUp.notes} (Type: ${followUp.type})`,
                            nextFollowUpDate: dueDate.toISOString(),
                            status: 'Scheduled',
                            type: followUp.type // Include the type field
                        };

                        // Save to API
                        console.log('Creating follow-up for lead:', leadItem.name, 'with data:', followUpData);
                        const response = await enhancedAPI.followUps.create(followUpData);

                        if (response && response.data) {
                            allLeadsFollowUps.push({
                                id: response.data._id || Date.now().toString(),
                                type: followUpData.type,
                                leadName: leadItem.name,
                                company: leadItem.company || 'N/A',
                                leadId: leadItem.id,
                                dueDate: dueDate,
                                notes: followUpData.notes,
                                completed: false
                            });
                        }
                    } catch (err) {
                        console.error(`Error creating follow-up for lead ${leadItem.name}:`, err);
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
            // Prepare data for API - match the expected fields in the backend controller
            const followUpData = {
                leadId: lead.id, // Include the leadId for the API endpoint
                notes: followUp.notes ? `${followUp.notes} (Type: ${followUp.type})` : `Follow-up type: ${followUp.type}`,
                nextFollowUpDate: dueDate.toISOString(),
                status: 'Scheduled',
                type: followUp.type // Include the type field
            };

            console.log('Saving follow-up:', followUpData);

            // Check authentication token before API call
            const token = localStorage.getItem('token');
            console.log('Using token for API call:', token ? 'Yes (length: ' + token.length + ')' : 'No');

            // Save to API
            let response;
            try {
                response = await enhancedAPI.followUps.create(followUpData);
                console.log('Follow-up created response:', response);
            } catch (apiError) {
                console.error('API call error details:', apiError);
                throw apiError;
            }

            // If successful, call the success callback
            if (response && response.data) {
                const newFollowUp = {
                    id: response.data._id || Date.now().toString(),
                    type: followUpData.type,
                    leadName: lead.name,
                    company: lead.company || 'N/A',
                    leadId: lead.id,
                    dueDate: dueDate,
                    notes: followUpData.notes,
                    completed: false
                };

                toast.success('Follow-up scheduled successfully');

                if (onSuccess) {
                    onSuccess(newFollowUp);
                }
            }
        } catch (err) {
            console.error('Error creating follow-up:', err);
            toast.error('Failed to create follow-up: ' + (err.message || 'Unknown error'));
        } finally {
            setIsSubmitting(false);
        }
    };

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
                    {/* Lead Information (read-only) */}
                    <div className="md:col-span-2">
                        {lead && (
                            <div className="bg-blue-50 border border-blue-200 rounded-md p-3 mb-4">
                                <div className="flex items-center">
                                    <div className="flex-shrink-0">
                                        <Users size={20} className="text-blue-500" />
                                    </div>
                                    <div className="ml-3">
                                        <h3 className="text-sm font-medium text-blue-800">
                                            {lead.id === 'all' ? 'Creating follow-ups for all your leads' : `Follow-up for: ${lead.name}`}
                                        </h3>
                                        {lead.id !== 'all' && lead.company && (
                                            <p className="text-xs text-blue-600 mt-1">
                                                Company: {lead.company}
                                            </p>
                                        )}
                                        {lead.id === 'all' && leads.length > 0 && (
                                            <p className="text-xs text-blue-600 mt-1">
                                                {`This will create follow-ups for all ${leads.length} of your assigned leads`}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

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
