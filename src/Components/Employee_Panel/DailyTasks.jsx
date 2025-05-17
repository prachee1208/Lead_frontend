import { useState } from 'react';
import { 
    CheckCircle, Circle, Plus, Trash2, Clock, 
    Calendar, ArrowUp, ArrowDown, Filter, Search,
    User, Phone, Mail, MessageSquare
} from 'lucide-react';
import { Link } from 'react-router-dom';

export default function DailyTasks() {
    const [filter, setFilter] = useState('all');
    const [searchTerm, setSearchTerm] = useState('');
    const [isAddingTask, setIsAddingTask] = useState(false);
    const [newTask, setNewTask] = useState({
        description: '',
        priority: 'medium',
        relatedLeadId: '',
        dueDate: new Date().toISOString().split('T')[0]
    });

    // Mock data - in a real app, this would come from your API
    const initialTasks = [
        { 
            id: 1, 
            description: 'Call John Smith to discuss proposal details', 
            completed: false, 
            priority: 'high',
            createdAt: '2023-05-15',
            dueDate: '2023-05-16',
            relatedLeadId: 1,
            relatedLeadName: 'John Smith',
            relatedLeadCompany: 'Acme Corp'
        },
        { 
            id: 2, 
            description: 'Send follow-up email to Sarah Johnson', 
            completed: true, 
            priority: 'medium',
            createdAt: '2023-05-14',
            dueDate: '2023-05-15',
            relatedLeadId: 2,
            relatedLeadName: 'Sarah Johnson',
            relatedLeadCompany: 'XYZ Inc'
        },
        { 
            id: 3, 
            description: 'Prepare presentation for Michael Brown meeting', 
            completed: false, 
            priority: 'high',
            createdAt: '2023-05-15',
            dueDate: '2023-05-17',
            relatedLeadId: 5,
            relatedLeadName: 'Michael Brown',
            relatedLeadCompany: 'Innovate LLC'
        },
        { 
            id: 4, 
            description: 'Update lead status for recent contacts', 
            completed: false, 
            priority: 'low',
            createdAt: '2023-05-13',
            dueDate: '2023-05-15',
            relatedLeadId: null,
            relatedLeadName: null,
            relatedLeadCompany: null
        },
        { 
            id: 5, 
            description: 'Review product documentation for Tech Solutions demo', 
            completed: false, 
            priority: 'medium',
            createdAt: '2023-05-14',
            dueDate: '2023-05-16',
            relatedLeadId: 3,
            relatedLeadName: 'Robert Chen',
            relatedLeadCompany: 'Tech Solutions'
        },
    ];

    // Mock leads data for the dropdown
    const leads = [
        { id: 1, name: 'John Smith', company: 'Acme Corp' },
        { id: 2, name: 'Sarah Johnson', company: 'XYZ Inc' },
        { id: 3, name: 'Robert Chen', company: 'Tech Solutions' },
        { id: 4, name: 'Emily Davis', company: 'Global Services' },
        { id: 5, name: 'Michael Brown', company: 'Innovate LLC' }
    ];

    const [tasks, setTasks] = useState(initialTasks);

    const filteredTasks = tasks.filter(task => {
        // Apply search filter
        const matchesSearch = 
            task.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (task.relatedLeadName && task.relatedLeadName.toLowerCase().includes(searchTerm.toLowerCase())) ||
            (task.relatedLeadCompany && task.relatedLeadCompany.toLowerCase().includes(searchTerm.toLowerCase()));
        
        // Apply status filter
        const matchesFilter = 
            filter === 'all' || 
            (filter === 'completed' && task.completed) || 
            (filter === 'pending' && !task.completed) ||
            (filter === 'high' && task.priority === 'high') ||
            (filter === 'today' && task.dueDate === new Date().toISOString().split('T')[0]);
        
        return matchesSearch && matchesFilter;
    });

    const toggleTaskCompletion = (taskId) => {
        setTasks(tasks.map(task => 
            task.id === taskId ? { ...task, completed: !task.completed } : task
        ));
    };

    const deleteTask = (taskId) => {
        setTasks(tasks.filter(task => task.id !== taskId));
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setNewTask({
            ...newTask,
            [name]: value
        });
    };

    const handleAddTask = () => {
        if (!newTask.description.trim()) {
            alert('Please enter a task description');
            return;
        }

        let relatedLeadName = null;
        let relatedLeadCompany = null;

        if (newTask.relatedLeadId) {
            const selectedLead = leads.find(lead => lead.id === parseInt(newTask.relatedLeadId));
            if (selectedLead) {
                relatedLeadName = selectedLead.name;
                relatedLeadCompany = selectedLead.company;
            }
        }

        const newTaskItem = {
            id: tasks.length + 1,
            description: newTask.description,
            completed: false,
            priority: newTask.priority,
            createdAt: new Date().toISOString().split('T')[0],
            dueDate: newTask.dueDate,
            relatedLeadId: newTask.relatedLeadId ? parseInt(newTask.relatedLeadId) : null,
            relatedLeadName,
            relatedLeadCompany
        };

        setTasks([...tasks, newTaskItem]);
        setNewTask({
            description: '',
            priority: 'medium',
            relatedLeadId: '',
            dueDate: new Date().toISOString().split('T')[0]
        });
        setIsAddingTask(false);
    };

    const getPriorityColor = (priority) => {
        switch(priority) {
            case 'high': return 'text-red-500';
            case 'medium': return 'text-amber-500';
            case 'low': return 'text-blue-500';
            default: return 'text-gray-500';
        }
    };

    const getPriorityBadgeColor = (priority) => {
        switch(priority) {
            case 'high': return 'bg-red-100 text-red-800 border border-red-200';
            case 'medium': return 'bg-amber-100 text-amber-800 border border-amber-200';
            case 'low': return 'bg-blue-100 text-blue-800 border border-blue-200';
            default: return 'bg-gray-100 text-gray-800 border border-gray-200';
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-semibold text-gray-800">Daily Tasks</h1>
                <button 
                    onClick={() => setIsAddingTask(true)}
                    className="px-4 py-2 bg-[#022d38] text-white rounded-md hover:bg-[#043c4a] flex items-center"
                >
                    <Plus size={16} className="mr-2" />
                    Add Task
                </button>
            </div>

            {/* Add New Task Form */}
            {isAddingTask && (
                <div className="bg-white rounded-lg shadow p-6">
                    <h2 className="text-lg font-medium text-gray-900 mb-4">Add New Task</h2>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Task Description</label>
                            <input
                                type="text"
                                name="description"
                                value={newTask.description}
                                onChange={handleInputChange}
                                className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#022d38] focus:border-[#022d38]"
                                placeholder="Enter task description"
                                required
                            />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
                                <select
                                    name="priority"
                                    value={newTask.priority}
                                    onChange={handleInputChange}
                                    className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#022d38] focus:border-[#022d38]"
                                >
                                    <option value="high">High</option>
                                    <option value="medium">Medium</option>
                                    <option value="low">Low</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Due Date</label>
                                <input
                                    type="date"
                                    name="dueDate"
                                    value={newTask.dueDate}
                                    onChange={handleInputChange}
                                    className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#022d38] focus:border-[#022d38]"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Related Lead (Optional)</label>
                                <select
                                    name="relatedLeadId"
                                    value={newTask.relatedLeadId}
                                    onChange={handleInputChange}
                                    className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#022d38] focus:border-[#022d38]"
                                >
                                    <option value="">None</option>
                                    {leads.map(lead => (
                                        <option key={lead.id} value={lead.id}>
                                            {lead.name} - {lead.company}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    </div>
                    <div className="mt-6 flex justify-end space-x-3">
                        <button
                            onClick={() => setIsAddingTask(false)}
                            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleAddTask}
                            className="px-4 py-2 bg-[#022d38] text-white rounded-md hover:bg-[#043c4a]"
                        >
                            Add Task
                        </button>
                    </div>
                </div>
            )}

            {/* Filters and Search */}
            <div className="bg-white rounded-lg shadow p-4">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
                    <div className="flex flex-wrap gap-2">
                        <button
                            onClick={() => setFilter('all')}
                            className={`px-3 py-1.5 text-sm font-medium rounded-md ${
                                filter === 'all'
                                    ? 'bg-[#022d38] text-white'
                                    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                            }`}
                        >
                            All Tasks
                        </button>
                        <button
                            onClick={() => setFilter('pending')}
                            className={`px-3 py-1.5 text-sm font-medium rounded-md ${
                                filter === 'pending'
                                    ? 'bg-[#022d38] text-white'
                                    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                            }`}
                        >
                            Pending
                        </button>
                        <button
                            onClick={() => setFilter('completed')}
                            className={`px-3 py-1.5 text-sm font-medium rounded-md ${
                                filter === 'completed'
                                    ? 'bg-[#022d38] text-white'
                                    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                            }`}
                        >
                            Completed
                        </button>
                        <button
                            onClick={() => setFilter('high')}
                            className={`px-3 py-1.5 text-sm font-medium rounded-md ${
                                filter === 'high'
                                    ? 'bg-[#022d38] text-white'
                                    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                            }`}
                        >
                            High Priority
                        </button>
                        <button
                            onClick={() => setFilter('today')}
                            className={`px-3 py-1.5 text-sm font-medium rounded-md ${
                                filter === 'today'
                                    ? 'bg-[#022d38] text-white'
                                    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                            }`}
                        >
                            Due Today
                        </button>
                    </div>
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Search size={16} className="text-gray-400" />
                        </div>
                        <input
                            type="text"
                            placeholder="Search tasks..."
                            className="pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#022d38] focus:border-[#022d38]"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>
            </div>

            {/* Tasks List */}
            <div className="bg-white rounded-lg shadow overflow-hidden">
                {filteredTasks.length === 0 ? (
                    <div className="text-center py-12">
                        <CheckCircle size={48} className="mx-auto text-gray-300 mb-4" />
                        <h3 className="text-lg font-medium text-gray-900">No tasks found</h3>
                        <p className="mt-1 text-sm text-gray-500">
                            {searchTerm ? "Try adjusting your search or filter" : "You're all caught up!"}
                        </p>
                    </div>
                ) : (
                    <ul className="divide-y divide-gray-200">
                        {filteredTasks.map((task) => (
                            <li key={task.id} className="p-4 hover:bg-gray-50">
                                <div className="flex items-start">
                                    <div className="flex-shrink-0 pt-0.5">
                                        <button
                                            onClick={() => toggleTaskCompletion(task.id)}
                                            className="p-1 rounded-full hover:bg-gray-100"
                                        >
                                            {task.completed ? (
                                                <CheckCircle size={20} className="text-green-500" />
                                            ) : (
                                                <Circle size={20} className="text-gray-300" />
                                            )}
                                        </button>
                                    </div>
                                    <div className="ml-3 flex-1">
                                        <div className="flex items-center justify-between">
                                            <p className={`text-sm font-medium ${task.completed ? 'text-gray-400 line-through' : 'text-gray-900'}`}>
                                                {task.description}
                                            </p>
                                            <div className="flex items-center">
                                                <span className={`text-xs px-2 py-1 rounded-full ${getPriorityBadgeColor(task.priority)}`}>
                                                    {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
                                                </span>
                                                <button
                                                    onClick={() => deleteTask(task.id)}
                                                    className="ml-2 p-1 rounded-full hover:bg-red-100"
                                                >
                                                    <Trash2 size={16} className="text-red-500" />
                                                </button>
                                            </div>
                                        </div>
                                        <div className="mt-1 flex items-center text-xs text-gray-500">
                                            <Calendar size={12} className="mr-1" />
                                            <span>Due: {task.dueDate}</span>
                                            {task.relatedLeadId && (
                                                <div className="ml-4 flex items-center">
                                                    <User size={12} className="mr-1" />
                                                    <Link 
                                                        to={`/employee-panel/leads/${task.relatedLeadId}`}
                                                        className="text-blue-500 hover:underline"
                                                    >
                                                        {task.relatedLeadName} ({task.relatedLeadCompany})
                                                    </Link>
                                                </div>
                                            )}
                                        </div>
                                        {task.relatedLeadId && (
                                            <div className="mt-2 flex space-x-2">
                                                <Link 
                                                    to={`/employee-panel/leads/${task.relatedLeadId}/contact/phone`}
                                                    className="inline-flex items-center px-2 py-1 text-xs font-medium rounded-md bg-blue-50 text-blue-700 hover:bg-blue-100"
                                                >
                                                    <Phone size={12} className="mr-1" />
                                                    Call
                                                </Link>
                                                <Link 
                                                    to={`/employee-panel/leads/${task.relatedLeadId}/contact/email`}
                                                    className="inline-flex items-center px-2 py-1 text-xs font-medium rounded-md bg-green-50 text-green-700 hover:bg-green-100"
                                                >
                                                    <Mail size={12} className="mr-1" />
                                                    Email
                                                </Link>
                                                <Link 
                                                    to={`/employee-panel/leads/${task.relatedLeadId}/contact/message`}
                                                    className="inline-flex items-center px-2 py-1 text-xs font-medium rounded-md bg-orange-50 text-orange-700 hover:bg-orange-100"
                                                >
                                                    <MessageSquare size={12} className="mr-1" />
                                                    Message
                                                </Link>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </div>
    );
}
