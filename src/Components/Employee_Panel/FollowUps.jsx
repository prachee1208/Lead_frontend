import { useState } from 'react';
import { 
    Calendar, Clock, Bell, User, Building, PhoneCall, 
    Mail, FileText, MoreHorizontal, Check, Filter, 
    ChevronLeft, ChevronRight, Search, Plus, Users,
    MessageSquare, CheckCircle, X, Trash2
} from 'lucide-react';
import { Link } from 'react-router-dom';

export default function FollowUps() {
    const [activeTab, setActiveTab] = useState('upcoming');
    const [searchTerm, setSearchTerm] = useState('');
    const [showActionMenu, setShowActionMenu] = useState(null);
    const [isAddingNew, setIsAddingNew] = useState(false);
    const [newFollowUp, setNewFollowUp] = useState({
        type: 'call',
        leadId: '',
        leadName: '',
        date: '',
        time: '',
        notes: ''
    });
    
    // Mock data - in a real app, this would come from your API
    const [followUps, setFollowUps] = useState([
        {
            id: 1,
            type: 'call',
            leadName: 'John Smith',
            company: 'Acme Corp',
            leadId: 1,
            dueDate: '2023-05-16',
            dueTime: '10:30 AM',
            notes: 'Discuss proposal details and pricing options',
            completed: false
        },
        {
            id: 2,
            type: 'email',
            leadName: 'Sarah Johnson',
            company: 'XYZ Inc',
            leadId: 2,
            dueDate: '2023-05-16',
            dueTime: '2:00 PM',
            notes: 'Send updated product specifications',
            completed: false
        },
        {
            id: 3,
            type: 'meeting',
            leadName: 'Michael Brown',
            company: 'Global Services',
            leadId: 4,
            dueDate: '2023-05-17',
            dueTime: '11:00 AM',
            notes: 'Product demo and Q&A session',
            completed: false
        },
        {
            id: 4,
            type: 'call',
            leadName: 'Robert Chen',
            company: 'Tech Solutions',
            leadId: 3,
            dueDate: '2023-05-15',
            dueTime: '3:30 PM',
            notes: 'Follow up on initial interest',
            completed: true
        },
        {
            id: 5,
            type: 'message',
            leadName: 'Emily Davis',
            company: 'Global Services',
            leadId: 4,
            dueDate: '2023-05-14',
            dueTime: '9:00 AM',
            notes: 'Check if they received the proposal',
            completed: true
        }
    ]);

    // Mock leads data for the dropdown
    const leads = [
        { id: 1, name: 'John Smith', company: 'Acme Corp' },
        { id: 2, name: 'Sarah Johnson', company: 'XYZ Inc' },
        { id: 3, name: 'Robert Chen', company: 'Tech Solutions' },
        { id: 4, name: 'Emily Davis', company: 'Global Services' },
        { id: 5, name: 'Michael Brown', company: 'Innovate LLC' }
    ];

    const filteredFollowUps = followUps.filter(followUp => {
        // Filter by search term
        const matchesSearch = 
            followUp.leadName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            followUp.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
            followUp.notes.toLowerCase().includes(searchTerm.toLowerCase());
        
        // Filter by tab
        const matchesTab = 
            (activeTab === 'upcoming' && !followUp.completed) ||
            (activeTab === 'completed' && followUp.completed) ||
            (activeTab === 'all');
        
        return matchesSearch && matchesTab;
    });

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setNewFollowUp({
            ...newFollowUp,
            [name]: value
        });

        // If lead selection changes, update the lead name
        if (name === 'leadId') {
            const selectedLead = leads.find(lead => lead.id === parseInt(value));
            if (selectedLead) {
                setNewFollowUp(prev => ({
                    ...prev,
                    leadId: value,
                    leadName: selectedLead.name
                }));
            }
        }
    };

    const handleAddNew = () => {
        setIsAddingNew(true);
    };

    const handleCancelAdd = () => {
        setIsAddingNew(false);
        setNewFollowUp({
            type: 'call',
            leadId: '',
            leadName: '',
            date: '',
            time: '',
            notes: ''
        });
    };

    const handleSaveNew = () => {
        // Validate form
        if (!newFollowUp.leadId || !newFollowUp.date || !newFollowUp.time) {
            alert('Please fill in all required fields');
            return;
        }

        const selectedLead = leads.find(lead => lead.id === parseInt(newFollowUp.leadId));
        
        // Add new follow-up
        const newFollowUpEntry = {
            id: followUps.length + 1,
            type: newFollowUp.type,
            leadName: selectedLead.name,
            company: selectedLead.company,
            leadId: parseInt(newFollowUp.leadId),
            dueDate: newFollowUp.date,
            dueTime: newFollowUp.time,
            notes: newFollowUp.notes,
            completed: false
        };
        
        setFollowUps([...followUps, newFollowUpEntry]);
        handleCancelAdd();
    };

    const handleMarkComplete = (id) => {
        setFollowUps(followUps.map(followUp => 
            followUp.id === id ? { ...followUp, completed: true } : followUp
        ));
        setShowActionMenu(null);
    };

    const handleDelete = (id) => {
        setFollowUps(followUps.filter(followUp => followUp.id !== id));
        setShowActionMenu(null);
    };

    const getTypeIcon = (type) => {
        switch(type) {
            case 'call': return <PhoneCall size={16} className="text-blue-500" />;
            case 'email': return <Mail size={16} className="text-green-500" />;
            case 'meeting': return <Users size={16} className="text-purple-500" />;
            case 'message': return <MessageSquare size={16} className="text-orange-500" />;
            default: return <Calendar size={16} className="text-gray-500" />;
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-semibold text-gray-800">Follow-ups</h1>
                <button 
                    onClick={handleAddNew}
                    className="px-4 py-2 bg-[#022d38] text-white rounded-md hover:bg-[#043c4a] flex items-center"
                >
                    <Plus size={16} className="mr-2" />
                    New Follow-up
                </button>
            </div>

            {/* Add New Follow-up Form */}
            {isAddingNew && (
                <div className="bg-white rounded-lg shadow p-6">
                    <h2 className="text-lg font-medium text-gray-900 mb-4">Schedule New Follow-up</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Lead</label>
                            <select
                                name="leadId"
                                value={newFollowUp.leadId}
                                onChange={handleInputChange}
                                className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#022d38] focus:border-[#022d38]"
                                required
                            >
                                <option value="">Select a lead</option>
                                {leads.map(lead => (
                                    <option key={lead.id} value={lead.id}>
                                        {lead.name} - {lead.company}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                            <select
                                name="type"
                                value={newFollowUp.type}
                                onChange={handleInputChange}
                                className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#022d38] focus:border-[#022d38]"
                            >
                                <option value="call">Call</option>
                                <option value="email">Email</option>
                                <option value="meeting">Meeting</option>
                                <option value="message">Message</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                            <input
                                type="date"
                                name="date"
                                value={newFollowUp.date}
                                onChange={handleInputChange}
                                className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#022d38] focus:border-[#022d38]"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Time</label>
                            <input
                                type="time"
                                name="time"
                                value={newFollowUp.time}
                                onChange={handleInputChange}
                                className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#022d38] focus:border-[#022d38]"
                                required
                            />
                        </div>
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                            <textarea
                                name="notes"
                                value={newFollowUp.notes}
                                onChange={handleInputChange}
                                rows={3}
                                className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#022d38] focus:border-[#022d38]"
                            ></textarea>
                        </div>
                    </div>
                    <div className="mt-6 flex justify-end space-x-3">
                        <button
                            onClick={handleCancelAdd}
                            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleSaveNew}
                            className="px-4 py-2 bg-[#022d38] text-white rounded-md hover:bg-[#043c4a]"
                        >
                            Save Follow-up
                        </button>
                    </div>
                </div>
            )}

            {/* Tabs and Search */}
            <div className="bg-white rounded-lg shadow">
                <div className="border-b border-gray-200">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-4">
                        <div className="flex space-x-4">
                            <button
                                onClick={() => setActiveTab('upcoming')}
                                className={`px-3 py-2 text-sm font-medium rounded-md ${
                                    activeTab === 'upcoming'
                                        ? 'bg-[#022d38] text-white'
                                        : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                                }`}
                            >
                                Upcoming
                            </button>
                            <button
                                onClick={() => setActiveTab('completed')}
                                className={`px-3 py-2 text-sm font-medium rounded-md ${
                                    activeTab === 'completed'
                                        ? 'bg-[#022d38] text-white'
                                        : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                                }`}
                            >
                                Completed
                            </button>
                            <button
                                onClick={() => setActiveTab('all')}
                                className={`px-3 py-2 text-sm font-medium rounded-md ${
                                    activeTab === 'all'
                                        ? 'bg-[#022d38] text-white'
                                        : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                                }`}
                            >
                                All
                            </button>
                        </div>
                        <div className="mt-3 sm:mt-0 relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Search size={16} className="text-gray-400" />
                            </div>
                            <input
                                type="text"
                                placeholder="Search follow-ups..."
                                className="pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#022d38] focus:border-[#022d38] w-full sm:w-auto"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>
                </div>

                {/* Follow-ups List */}
                <div className="p-4">
                    {filteredFollowUps.length === 0 ? (
                        <div className="text-center py-8">
                            <Calendar size={48} className="mx-auto text-gray-300 mb-4" />
                            <h3 className="text-lg font-medium text-gray-900">No follow-ups found</h3>
                            <p className="mt-1 text-sm text-gray-500">
                                {searchTerm ? "Try adjusting your search" : activeTab === 'upcoming' ? "You're all caught up!" : "No follow-ups to display"}
                            </p>
                        </div>
                    ) : (
                        <ul className="divide-y divide-gray-200">
                            {filteredFollowUps.map((followUp) => (
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
                                                {getTypeIcon(followUp.type)}
                                            </div>
                                            <div className="ml-4">
                                                <div className="flex items-center">
                                                    <h4 className="text-sm font-medium text-gray-900">{followUp.leadName}</h4>
                                                    <span className="ml-2 text-xs text-gray-500">({followUp.company})</span>
                                                </div>
                                                <div className="mt-1 flex items-center text-xs text-gray-500">
                                                    <Calendar size={12} className="mr-1" />
                                                    {followUp.dueDate} at {followUp.dueTime}
                                                </div>
                                                {followUp.notes && (
                                                    <p className="mt-1 text-sm text-gray-600 line-clamp-1">{followUp.notes}</p>
                                                )}
                                            </div>
                                        </div>
                                        <div className="flex items-center">
                                            {!followUp.completed && (
                                                <button
                                                    onClick={() => handleMarkComplete(followUp.id)}
                                                    className="p-1 rounded-full hover:bg-green-100 mr-2"
                                                    title="Mark as completed"
                                                >
                                                    <CheckCircle size={18} className="text-green-500" />
                                                </button>
                                            )}
                                            <Link
                                                to={`/employee-panel/leads/${followUp.leadId}`}
                                                className="p-1 rounded-full hover:bg-blue-100 mr-2"
                                                title="View lead details"
                                            >
                                                <User size={18} className="text-blue-500" />
                                            </Link>
                                            <button
                                                onClick={() => handleDelete(followUp.id)}
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
            </div>
        </div>
    );
}
