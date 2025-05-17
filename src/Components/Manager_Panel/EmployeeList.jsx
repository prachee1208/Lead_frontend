import { useState, useEffect } from 'react';
import {
    Users, Search, Plus, Edit, Trash2, MoreHorizontal,
    BarChart2, Phone, Mail, Award, CheckCircle, AlertCircle,
    Filter, UserPlus, X, Eye
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { usersAPI } from '../../services/api';
import { toast } from 'react-toastify';

export default function EmployeeList() {
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [showAddEmployeeModal, setShowAddEmployeeModal] = useState(false);
    const [showEmployeeDetailsModal, setShowEmployeeDetailsModal] = useState(false);
    const [selectedEmployee, setSelectedEmployee] = useState(null);
    const [showActionMenu, setShowActionMenu] = useState(null);
    const [employees, setEmployees] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    // Fetch employees from the API when component mounts
    useEffect(() => {
        fetchEmployees();
    }, []);

    // Function to fetch employees from the API
    const fetchEmployees = async () => {
        setIsLoading(true);
        setError(null);
        try {
            // Get all users from the API
            const response = await usersAPI.getAllWithRoles();

            if (response && response.data && response.data.data) {
                // Transform the API response to match our component's data structure
                const formattedEmployees = response.data.data
                    .filter(user => user.role === 'employee') // Only include employees
                    .map(user => ({
                        id: user._id,
                        name: user.name,
                        email: user.email,
                        phone: user.phone || 'N/A',
                        role: 'Sales Representative', // Default role for employees
                        status: user.status || 'active',
                        avatar: user.name.split(' ').map(name => name[0]).join(''),
                        currentTask: user.currentTask || 'No current task assigned',
                        performance: {
                            leadsAssigned: user.performance?.leadsAssigned || 0,
                            leadsConverted: user.performance?.leadsConverted || 0,
                            conversionRate: user.performance?.conversionRate ||
                                (user.performance?.leadsAssigned > 0 ?
                                    `${Math.round((user.performance.leadsConverted / user.performance.leadsAssigned) * 100)}%` :
                                    '0%'),
                            lastActivity: user.performance?.lastActivity || 'No recent activity'
                        }
                    }));

                setEmployees(formattedEmployees);
            } else {
                throw new Error('Invalid response format from API');
            }
        } catch (err) {
            console.error('Error fetching employees:', err);
            setError('Failed to load employees. Please try again later.');
            toast.error('Failed to load employees: ' + (err.message || 'Unknown error'));
        } finally {
            setIsLoading(false);
        }
    };

    const filteredEmployees = employees.filter(employee => {
        // Apply search filter
        const matchesSearch =
            employee.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            employee.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
            employee.role.toLowerCase().includes(searchQuery.toLowerCase());

        // Apply status filter
        const matchesStatus = statusFilter === 'all' || employee.status === statusFilter;

        return matchesSearch && matchesStatus;
    });

    const handleAddEmployee = (e) => {
        e.preventDefault();
        const newEmployee = {
            id: employees.length + 1,
            name: e.target.name.value,
            email: e.target.email.value,
            phone: e.target.phone.value,
            role: e.target.role.value,
            status: 'active',
            avatar: e.target.name.value.split(' ').map(name => name[0]).join(''),
            currentTask: 'New employee onboarding',
            performance: {
                leadsAssigned: 0,
                leadsConverted: 0,
                conversionRate: '0%',
                lastActivity: 'Just now'
            }
        };
        setEmployees([...employees, newEmployee]);
        setShowAddEmployeeModal(false);
    };

    const handleDeleteEmployee = (id) => {
        setEmployees(employees.filter(employee => employee.id !== id));
        setShowActionMenu(null);
    };

    const handleViewDetails = (employee) => {
        setSelectedEmployee(employee);
        setShowEmployeeDetailsModal(true);
        setShowActionMenu(null);
    };

    const getStatusBadge = (status) => {
        switch(status) {
            case 'active':
                return <span className="px-2 py-1 text-xs rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">Active</span>;
            case 'inactive':
                return <span className="px-2 py-1 text-xs rounded-full bg-red-100 text-red-800 border border-red-200">Inactive</span>;
            default:
                return <span className="px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-800 border border-gray-200">{status}</span>;
        }
    };

    const getPerformanceIndicator = (rate) => {
        const percentage = parseInt(rate);
        if (percentage >= 60) {
            return <span className="flex items-center text-emerald-600"><CheckCircle size={16} className="mr-1" /> Good</span>;
        } else if (percentage >= 40) {
            return <span className="flex items-center text-amber-600"><Award size={16} className="mr-1" /> Average</span>;
        } else {
            return <span className="flex items-center text-red-600"><AlertCircle size={16} className="mr-1" /> Needs Improvement</span>;
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-semibold text-gray-800">Employee Management</h1>
                <button
                    onClick={() => setShowAddEmployeeModal(true)}
                    className="px-4 py-2 bg-[#022d38] text-white rounded-md hover:bg-[#043c4a] flex items-center"
                >
                    <UserPlus size={16} className="mr-2" />
                    Add Employee
                </button>
            </div>

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
                                placeholder="Search employees..."
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
                                <option value="active">Active</option>
                                <option value="inactive">Inactive</option>
                            </select>
                        </div>
                    </div>
                </div>
            </div>

            {/* Employees Table */}
            <div className="bg-white rounded-lg shadow overflow-hidden">
                {isLoading ? (
                    <div className="flex justify-center items-center p-8">
                        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#022d38]"></div>
                        <span className="ml-3 text-lg text-gray-700">Loading employees...</span>
                    </div>
                ) : error ? (
                    <div className="p-8 text-center">
                        <AlertCircle size={48} className="mx-auto text-red-500 mb-4" />
                        <p className="text-red-500 font-medium">{error}</p>
                        <button
                            onClick={fetchEmployees}
                            className="mt-4 px-4 py-2 bg-[#022d38] text-white rounded-md hover:bg-[#043c4a]"
                        >
                            Try Again
                        </button>
                    </div>
                ) : filteredEmployees.length === 0 ? (
                    <div className="p-8 text-center">
                        <Users size={48} className="mx-auto text-gray-400 mb-4" />
                        <p className="text-gray-500">No employees found matching your criteria</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Employee
                                    </th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Status
                                    </th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Current Task
                                    </th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Performance
                                    </th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Last Activity
                                    </th>
                                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {filteredEmployees.map((employee) => (
                                    <tr key={employee.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                <div className="h-10 w-10 rounded-full bg-gradient-to-tr from-indigo-500 to-[#022d38] flex items-center justify-center text-white font-bold">
                                                    {employee.avatar}
                                                </div>
                                                <div className="ml-4">
                                                    <div className="text-sm font-medium text-gray-900">{employee.name}</div>
                                                    <div className="text-sm text-gray-500">{employee.email}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            {getStatusBadge(employee.status)}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {employee.currentTask}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            {getPerformanceIndicator(employee.performance.conversionRate)}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {employee.performance.lastActivity}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            <div className="flex items-center justify-end space-x-2">
                                                <button
                                                    onClick={() => handleViewDetails(employee)}
                                                    className="p-1 rounded-full hover:bg-blue-100"
                                                    title="View Details"
                                                >
                                                    <Eye size={18} className="text-blue-600" />
                                                </button>
                                                <Link
                                                    to={`/manager-panel/assign-leads?employee=${employee.id}`}
                                                    className="p-1 rounded-full hover:bg-green-100"
                                                    title="Assign Leads"
                                                >
                                                    <UserPlus size={18} className="text-green-600" />
                                                </Link>
                                                <div className="relative">
                                                    <button
                                                        onClick={() => setShowActionMenu(showActionMenu === employee.id ? null : employee.id)}
                                                        className="p-1 rounded-full hover:bg-gray-100"
                                                    >
                                                        <MoreHorizontal size={18} className="text-gray-500" />
                                                    </button>

                                                    {showActionMenu === employee.id && (
                                                        <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-10">
                                                            <button
                                                                onClick={() => handleViewDetails(employee)}
                                                                className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                                            >
                                                                View Details
                                                            </button>
                                                            <Link
                                                                to={`/manager-panel/assign-leads?employee=${employee.id}`}
                                                                className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                                            >
                                                                Assign Leads
                                                            </Link>
                                                            <button
                                                                onClick={() => handleDeleteEmployee(employee.id)}
                                                                className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                                                            >
                                                                Delete
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

            {/* Add Employee Modal */}
            {showAddEmployeeModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg shadow-lg w-full max-w-md">
                        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
                            <h3 className="text-lg font-medium text-gray-900">Add New Employee</h3>
                            <button
                                onClick={() => setShowAddEmployeeModal(false)}
                                className="text-gray-400 hover:text-gray-500"
                            >
                                <X size={20} />
                            </button>
                        </div>
                        <form onSubmit={handleAddEmployee}>
                            <div className="p-6 space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                                    <input
                                        type="text"
                                        name="name"
                                        required
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#022d38] focus:border-[#022d38]"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                                    <input
                                        type="email"
                                        name="email"
                                        required
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#022d38] focus:border-[#022d38]"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                                    <input
                                        type="text"
                                        name="phone"
                                        required
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#022d38] focus:border-[#022d38]"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                                    <select
                                        name="role"
                                        required
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#022d38] focus:border-[#022d38]"
                                        defaultValue="employee"
                                    >
                                        <option value="employee">Employee</option>
                                    </select>
                                    <p className="mt-1 text-xs text-gray-500">All new users will be added as employees</p>
                                </div>
                            </div>
                            <div className="px-6 py-4 border-t border-gray-200 flex justify-end space-x-3">
                                <button
                                    type="button"
                                    onClick={() => setShowAddEmployeeModal(false)}
                                    className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 bg-[#022d38] text-white rounded-md hover:bg-[#043c4a]"
                                >
                                    Add Employee
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Employee Details Modal */}
            {showEmployeeDetailsModal && selectedEmployee && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg shadow-lg w-full max-w-2xl">
                        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
                            <h3 className="text-lg font-medium text-gray-900">Employee Details</h3>
                            <button
                                onClick={() => setShowEmployeeDetailsModal(false)}
                                className="text-gray-400 hover:text-gray-500"
                            >
                                <X size={20} />
                            </button>
                        </div>
                        <div className="p-6">
                            <div className="flex items-center mb-6">
                                <div className="h-16 w-16 rounded-full bg-gradient-to-tr from-indigo-500 to-[#022d38] flex items-center justify-center text-white text-xl font-bold">
                                    {selectedEmployee.avatar}
                                </div>
                                <div className="ml-4">
                                    <h2 className="text-xl font-semibold text-gray-900">{selectedEmployee.name}</h2>
                                    <p className="text-sm text-gray-500">{selectedEmployee.role}</p>
                                </div>
                                <div className="ml-auto">
                                    {getStatusBadge(selectedEmployee.status)}
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                                <div>
                                    <h4 className="text-sm font-medium text-gray-500 mb-2">Contact Information</h4>
                                    <div className="space-y-2">
                                        <div className="flex items-center">
                                            <Mail size={16} className="text-gray-400 mr-2" />
                                            <span className="text-gray-900">{selectedEmployee.email}</span>
                                        </div>
                                        <div className="flex items-center">
                                            <Phone size={16} className="text-gray-400 mr-2" />
                                            <span className="text-gray-900">{selectedEmployee.phone}</span>
                                        </div>
                                    </div>
                                </div>
                                <div>
                                    <h4 className="text-sm font-medium text-gray-500 mb-2">Current Task</h4>
                                    <p className="text-gray-900">{selectedEmployee.currentTask}</p>
                                </div>
                            </div>

                            <div className="mb-6">
                                <h4 className="text-sm font-medium text-gray-500 mb-2">Performance Metrics</h4>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div className="bg-gray-50 p-4 rounded-lg">
                                        <div className="text-sm text-gray-500">Leads Assigned</div>
                                        <div className="text-xl font-semibold text-gray-900">{selectedEmployee.performance.leadsAssigned}</div>
                                    </div>
                                    <div className="bg-gray-50 p-4 rounded-lg">
                                        <div className="text-sm text-gray-500">Leads Converted</div>
                                        <div className="text-xl font-semibold text-gray-900">{selectedEmployee.performance.leadsConverted}</div>
                                    </div>
                                    <div className="bg-gray-50 p-4 rounded-lg">
                                        <div className="text-sm text-gray-500">Conversion Rate</div>
                                        <div className="text-xl font-semibold text-gray-900">{selectedEmployee.performance.conversionRate}</div>
                                    </div>
                                </div>
                            </div>

                            <div className="flex justify-end space-x-3">
                                <Link
                                    to={`/manager-panel/assign-leads?employee=${selectedEmployee.id}`}
                                    className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 flex items-center"
                                >
                                    <UserPlus size={16} className="mr-2" />
                                    Assign Leads
                                </Link>
                                <button
                                    onClick={() => setShowEmployeeDetailsModal(false)}
                                    className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                                >
                                    Close
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
