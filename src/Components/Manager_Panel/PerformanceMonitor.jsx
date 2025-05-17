import { useState } from 'react';
import { 
    Activity, Search, Filter, Calendar, Clock, 
    AlertCircle, CheckCircle, User, MessageSquare,
    Phone, Mail, ArrowRight, BarChart2, RefreshCw
} from 'lucide-react';
import { Link } from 'react-router-dom';

export default function PerformanceMonitor() {
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [employeeFilter, setEmployeeFilter] = useState('all');
    const [showSendReminderModal, setShowSendReminderModal] = useState(false);
    const [selectedFollowUp, setSelectedFollowUp] = useState(null);

    // Mock data - in a real app, this would come from your API
    const followUps = [
        {
            id: 1,
            employeeId: 1,
            employeeName: 'John Smith',
            employeeAvatar: 'JS',
            leadName: 'Michael Johnson',
            leadCompany: 'ABC Ltd',
            type: 'call',
            dueDate: '2023-05-16',
            dueTime: '10:30 AM',
            status: 'completed',
            completedAt: '2023-05-16 10:45 AM',
            notes: 'Discussed product features, client is interested in a demo next week.'
        },
        {
            id: 2,
            employeeId: 2,
            employeeName: 'Sarah Johnson',
            employeeAvatar: 'SJ',
            leadName: 'Emily Wilson',
            leadCompany: 'Tech Solutions',
            type: 'email',
            dueDate: '2023-05-16',
            dueTime: '2:00 PM',
            status: 'pending',
            completedAt: null,
            notes: 'Send pricing information and schedule a call.'
        },
        {
            id: 3,
            employeeId: 3,
            employeeName: 'Michael Brown',
            employeeAvatar: 'MB',
            leadName: 'Robert Brown',
            leadCompany: 'Global Services',
            type: 'meeting',
            dueDate: '2023-05-15',
            dueTime: '11:00 AM',
            status: 'overdue',
            completedAt: null,
            notes: 'Product demonstration and Q&A session.'
        },
        {
            id: 4,
            employeeId: 4,
            employeeName: 'Emily Davis',
            employeeAvatar: 'ED',
            leadName: 'Jennifer Lee',
            leadCompany: 'Innovate Inc',
            type: 'call',
            dueDate: '2023-05-17',
            dueTime: '3:30 PM',
            status: 'pending',
            completedAt: null,
            notes: 'Follow up on initial interest and discuss requirements.'
        },
        {
            id: 5,
            employeeId: 1,
            employeeName: 'John Smith',
            employeeAvatar: 'JS',
            leadName: 'David Miller',
            leadCompany: 'First Choice',
            type: 'email',
            dueDate: '2023-05-14',
            dueTime: '9:00 AM',
            status: 'overdue',
            completedAt: null,
            notes: 'Send proposal and follow up on questions.'
        },
        {
            id: 6,
            employeeId: 5,
            employeeName: 'Robert Wilson',
            employeeAvatar: 'RW',
            leadName: 'Sarah Smith',
            leadCompany: 'XYZ Inc',
            type: 'call',
            dueDate: '2023-05-16',
            dueTime: '4:00 PM',
            status: 'pending',
            completedAt: null,
            notes: 'Discuss contract terms and next steps.'
        }
    ];

    const employees = [
        { id: 1, name: 'John Smith', avatar: 'JS' },
        { id: 2, name: 'Sarah Johnson', avatar: 'SJ' },
        { id: 3, name: 'Michael Brown', avatar: 'MB' },
        { id: 4, name: 'Emily Davis', avatar: 'ED' },
        { id: 5, name: 'Robert Wilson', avatar: 'RW' }
    ];

    // Performance metrics
    const performanceMetrics = {
        totalFollowUps: followUps.length,
        completed: followUps.filter(f => f.status === 'completed').length,
        pending: followUps.filter(f => f.status === 'pending').length,
        overdue: followUps.filter(f => f.status === 'overdue').length,
        completionRate: Math.round((followUps.filter(f => f.status === 'completed').length / followUps.length) * 100)
    };

    // Filter follow-ups based on search and filters
    const filteredFollowUps = followUps.filter(followUp => {
        // Apply search filter
        const matchesSearch = 
            followUp.employeeName.toLowerCase().includes(searchQuery.toLowerCase()) ||
            followUp.leadName.toLowerCase().includes(searchQuery.toLowerCase()) ||
            followUp.leadCompany.toLowerCase().includes(searchQuery.toLowerCase());
        
        // Apply status filter
        const matchesStatus = statusFilter === 'all' || followUp.status === statusFilter;
        
        // Apply employee filter
        const matchesEmployee = employeeFilter === 'all' || followUp.employeeId === parseInt(employeeFilter);
        
        return matchesSearch && matchesStatus && matchesEmployee;
    });

    const getStatusBadge = (status) => {
        switch(status) {
            case 'completed':
                return <span className="px-2 py-1 text-xs rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">Completed</span>;
            case 'pending':
                return <span className="px-2 py-1 text-xs rounded-full bg-amber-100 text-amber-800 border border-amber-200">Pending</span>;
            case 'overdue':
                return <span className="px-2 py-1 text-xs rounded-full bg-red-100 text-red-800 border border-red-200">Overdue</span>;
            default:
                return <span className="px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-800 border border-gray-200">{status}</span>;
        }
    };

    const getTypeIcon = (type) => {
        switch(type) {
            case 'call':
                return <Phone size={16} className="text-blue-500" />;
            case 'email':
                return <Mail size={16} className="text-green-500" />;
            case 'meeting':
                return <User size={16} className="text-purple-500" />;
            case 'message':
                return <MessageSquare size={16} className="text-orange-500" />;
            default:
                return <Calendar size={16} className="text-gray-500" />;
        }
    };

    const handleSendReminder = (followUp) => {
        setSelectedFollowUp(followUp);
        setShowSendReminderModal(true);
    };

    const confirmSendReminder = () => {
        // In a real app, this would send a notification to the employee
        alert(`Reminder sent to ${selectedFollowUp.employeeName} about the follow-up with ${selectedFollowUp.leadName}`);
        setShowSendReminderModal(false);
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-semibold text-gray-800">Performance Monitoring</h1>
                <button 
                    className="px-4 py-2 bg-[#022d38] text-white rounded-md hover:bg-[#043c4a] flex items-center"
                    onClick={() => window.location.reload()}
                >
                    <RefreshCw size={16} className="mr-2" />
                    Refresh Data
                </button>
            </div>

            {/* Performance Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
                <div className="bg-white rounded-lg shadow-md border border-gray-100 p-4">
                    <div className="flex items-center justify-between mb-3">
                        <h3 className="text-gray-600 text-sm font-medium">Total Follow-ups</h3>
                        <div className="p-2 rounded-md bg-indigo-100">
                            <Calendar size={20} className="text-indigo-600" />
                        </div>
                    </div>
                    <p className="text-2xl font-bold text-gray-800">{performanceMetrics.totalFollowUps}</p>
                </div>
                <div className="bg-white rounded-lg shadow-md border border-gray-100 p-4">
                    <div className="flex items-center justify-between mb-3">
                        <h3 className="text-gray-600 text-sm font-medium">Completed</h3>
                        <div className="p-2 rounded-md bg-emerald-100">
                            <CheckCircle size={20} className="text-emerald-600" />
                        </div>
                    </div>
                    <p className="text-2xl font-bold text-gray-800">{performanceMetrics.completed}</p>
                </div>
                <div className="bg-white rounded-lg shadow-md border border-gray-100 p-4">
                    <div className="flex items-center justify-between mb-3">
                        <h3 className="text-gray-600 text-sm font-medium">Pending</h3>
                        <div className="p-2 rounded-md bg-amber-100">
                            <Clock size={20} className="text-amber-600" />
                        </div>
                    </div>
                    <p className="text-2xl font-bold text-gray-800">{performanceMetrics.pending}</p>
                </div>
                <div className="bg-white rounded-lg shadow-md border border-gray-100 p-4">
                    <div className="flex items-center justify-between mb-3">
                        <h3 className="text-gray-600 text-sm font-medium">Overdue</h3>
                        <div className="p-2 rounded-md bg-red-100">
                            <AlertCircle size={20} className="text-red-600" />
                        </div>
                    </div>
                    <p className="text-2xl font-bold text-gray-800">{performanceMetrics.overdue}</p>
                </div>
                <div className="bg-white rounded-lg shadow-md border border-gray-100 p-4">
                    <div className="flex items-center justify-between mb-3">
                        <h3 className="text-gray-600 text-sm font-medium">Completion Rate</h3>
                        <div className="p-2 rounded-md bg-blue-100">
                            <Activity size={20} className="text-blue-600" />
                        </div>
                    </div>
                    <p className="text-2xl font-bold text-gray-800">{performanceMetrics.completionRate}%</p>
                </div>
            </div>

            {/* Filters and Search */}
            <div className="bg-white rounded-lg shadow p-4">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
                    <div className="flex flex-wrap items-center gap-4">
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Search size={18} className="text-gray-400" />
                            </div>
                            <input
                                type="text"
                                placeholder="Search follow-ups..."
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
                                <option value="all">All Status</option>
                                <option value="completed">Completed</option>
                                <option value="pending">Pending</option>
                                <option value="overdue">Overdue</option>
                            </select>
                        </div>
                        <div className="flex items-center space-x-2">
                            <User size={18} className="text-gray-400" />
                            <select
                                className="border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#022d38] focus:border-[#022d38] py-2 px-3"
                                value={employeeFilter}
                                onChange={(e) => setEmployeeFilter(e.target.value)}
                            >
                                <option value="all">All Employees</option>
                                {employees.map(employee => (
                                    <option key={employee.id} value={employee.id}>
                                        {employee.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>
                </div>
            </div>

            {/* Follow-ups Table */}
            <div className="bg-white rounded-lg shadow overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Employee
                                </th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Lead
                                </th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Type
                                </th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Due Date
                                </th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Status
                                </th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Notes
                                </th>
                                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {filteredFollowUps.length === 0 ? (
                                <tr>
                                    <td colSpan="7" className="px-6 py-4 text-center text-sm text-gray-500">
                                        No follow-ups found matching your criteria
                                    </td>
                                </tr>
                            ) : (
                                filteredFollowUps.map(followUp => (
                                    <tr key={followUp.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                <div className="h-8 w-8 rounded-full bg-gradient-to-tr from-indigo-500 to-[#022d38] flex items-center justify-center text-white font-bold">
                                                    {followUp.employeeAvatar}
                                                </div>
                                                <div className="ml-3">
                                                    <div className="text-sm font-medium text-gray-900">{followUp.employeeName}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm font-medium text-gray-900">{followUp.leadName}</div>
                                            <div className="text-sm text-gray-500">{followUp.leadCompany}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                {getTypeIcon(followUp.type)}
                                                <span className="ml-1 text-sm text-gray-900 capitalize">{followUp.type}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-gray-900">{followUp.dueDate}</div>
                                            <div className="text-sm text-gray-500">{followUp.dueTime}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            {getStatusBadge(followUp.status)}
                                            {followUp.completedAt && (
                                                <div className="text-xs text-gray-500 mt-1">
                                                    Completed: {followUp.completedAt}
                                                </div>
                                            )}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="text-sm text-gray-900 max-w-xs truncate">{followUp.notes}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            {followUp.status === 'overdue' && (
                                                <button
                                                    onClick={() => handleSendReminder(followUp)}
                                                    className="text-indigo-600 hover:text-indigo-900 mr-3"
                                                >
                                                    Send Reminder
                                                </button>
                                            )}
                                            <Link
                                                to={`/manager-panel/messages?employee=${followUp.employeeId}`}
                                                className="text-gray-600 hover:text-gray-900"
                                            >
                                                Message
                                            </Link>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Send Reminder Modal */}
            {showSendReminderModal && selectedFollowUp && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg shadow-lg w-full max-w-md">
                        <div className="px-6 py-4 border-b border-gray-200">
                            <h3 className="text-lg font-medium text-gray-900">Send Reminder</h3>
                        </div>
                        <div className="p-6">
                            <p className="text-gray-700 mb-4">
                                Send a reminder to <span className="font-medium">{selectedFollowUp.employeeName}</span> about the overdue follow-up with <span className="font-medium">{selectedFollowUp.leadName}</span> from <span className="font-medium">{selectedFollowUp.leadCompany}</span>.
                            </p>
                            <div className="bg-amber-50 border border-amber-200 rounded-md p-4 mb-4">
                                <div className="flex">
                                    <AlertCircle size={20} className="text-amber-500 mr-2 flex-shrink-0" />
                                    <div>
                                        <p className="text-sm text-amber-800">
                                            This follow-up was due on <span className="font-medium">{selectedFollowUp.dueDate}</span> at <span className="font-medium">{selectedFollowUp.dueTime}</span> and is now overdue.
                                        </p>
                                    </div>
                                </div>
                            </div>
                            <div className="mt-6 flex justify-end space-x-3">
                                <button
                                    onClick={() => setShowSendReminderModal(false)}
                                    className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={confirmSendReminder}
                                    className="px-4 py-2 bg-[#022d38] text-white rounded-md hover:bg-[#043c4a]"
                                >
                                    Send Reminder
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
