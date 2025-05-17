import { useState, useEffect } from 'react';
import {
    BarChart3, Users, UserPlus, PhoneCall,
    Calendar, Clock, List, Home, PieChart,
    Bell, User, LogOut, ChevronDown, Search,
    Filter, Menu, X, Mail, CheckCircle, MessageSquare,
    Settings
} from 'lucide-react';
import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom';
import UserProfileDropdown from '../common/UserProfileDropdown';

export default function EmployeeDashboard() {
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
    const navigate = useNavigate();

    const toggleSidebar = () => {
        setIsSidebarOpen(!isSidebarOpen);
    };

    const toggleNotifications = () => {
        setIsNotificationsOpen(!isNotificationsOpen);
    };

    // Handle logout
    const handleLogout = () => {
        // Clear localStorage
        localStorage.removeItem('token');
        localStorage.removeItem('userId');
        localStorage.removeItem('userName');
        localStorage.removeItem('userEmail');
        localStorage.removeItem('userRole');

        // Redirect to login page
        navigate('/login');
    };

    return (
        <div className="flex h-screen bg-gray-100">
            {/* Sidebar */}
            <div className={`fixed inset-y-0 left-0 transform ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 transition duration-200 ease-in-out z-30 w-64 bg-[#022d38] text-white overflow-y-auto lg:static lg:inset-0`}>
                {/* Sidebar Header */}
                <div className="flex items-center justify-between p-4 border-b border-[#043c4a]">
                    <div className="flex items-center space-x-2">
                        <BarChart3 size={24} className="text-indigo-300" />
                        <span className="text-xl font-bold text-white">LeadTracker</span>
                    </div>
                    <button onClick={toggleSidebar} className="lg:hidden text-indigo-300 hover:text-white">
                        <X size={20} />
                    </button>
                </div>

                {/* Sidebar Navigation */}
                <div className="p-4">
                    <p className="text-xs uppercase tracking-wider text-indigo-400 mb-2">Main</p>
                    <ul>
                        <li className="mb-2">
                            <NavLink
                                to="/employee-panel"
                                end
                                className={({isActive}) =>
                                    `flex items-center space-x-2 py-2 px-2 rounded-md ${
                                        isActive
                                            ? 'bg-white text-[#022d38]'
                                            : 'text-indigo-200 hover:bg-white hover:text-[#022d38]'
                                    }`
                                }
                            >
                                <Home size={18} />
                                <span>Dashboard</span>
                            </NavLink>
                        </li>
                        <li className="mb-2">
                            <NavLink
                                to="/employee-panel/leads"
                                className={({isActive}) =>
                                    `flex items-center space-x-2 py-2 px-2 rounded-md ${
                                        isActive
                                            ? 'bg-white text-[#022d38]'
                                            : 'text-indigo-200 hover:bg-white hover:text-[#022d38]'
                                    }`
                                }
                            >
                                <UserPlus size={18} />
                                <span>My Leads</span>
                            </NavLink>
                        </li>
                        <li className="mb-2">
                            <NavLink
                                to="/employee-panel/follow-ups"
                                className={({isActive}) =>
                                    `flex items-center space-x-2 py-2 px-2 rounded-md ${
                                        isActive
                                            ? 'bg-white text-[#022d38]'
                                            : 'text-indigo-200 hover:bg-white hover:text-[#022d38]'
                                    }`
                                }
                            >
                                <Calendar size={18} />
                                <span>Follow-ups</span>
                            </NavLink>
                        </li>
                        <li className="mb-2">
                            <NavLink
                                to="/employee-panel/daily-tasks"
                                className={({isActive}) =>
                                    `flex items-center space-x-2 py-2 px-2 rounded-md ${
                                        isActive
                                            ? 'bg-white text-[#022d38]'
                                            : 'text-indigo-200 hover:bg-white hover:text-[#022d38]'
                                    }`
                                }
                            >
                                <CheckCircle size={18} />
                                <span>Daily Tasks</span>
                            </NavLink>
                        </li>
                    </ul>

                    <p className="text-xs uppercase tracking-wider text-indigo-400 mt-6 mb-2">Account</p>
                    <ul>
                        <li className="mb-2">
                            <NavLink
                                to="/employee-panel/profile"
                                className={({isActive}) =>
                                    `flex items-center space-x-2 py-2 px-2 rounded-md ${
                                        isActive
                                            ? 'bg-white text-[#022d38]'
                                            : 'text-indigo-200 hover:bg-white hover:text-[#022d38]'
                                    }`
                                }
                            >
                                <User size={18} />
                                <span>Profile</span>
                            </NavLink>
                        </li>
                        <li className="mb-2">
                            <NavLink
                                to="/employee-panel/settings"
                                className={({isActive}) =>
                                    `flex items-center space-x-2 py-2 px-2 rounded-md ${
                                        isActive
                                            ? 'bg-white text-[#022d38]'
                                            : 'text-indigo-200 hover:bg-white hover:text-[#022d38]'
                                    }`
                                }
                            >
                                <Settings size={18} />
                                <span>Settings</span>
                            </NavLink>
                        </li>
                    </ul>
                </div>

                <div className="p-4 border-t border-[#043c4a] mt-auto">
                    <button
                        onClick={handleLogout}
                        className="w-full flex items-center space-x-2 py-2 px-2 rounded-md text-indigo-200 hover:bg-white hover:text-[#022d38]"
                    >
                        <LogOut size={18} />
                        <span>Logout</span>
                    </button>
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 flex flex-col overflow-hidden">
                {/* Top Navigation */}
                <header className="bg-white shadow-sm">
                    <div className="flex items-center justify-between p-4">
                        <div className="flex items-center space-x-4">
                            <button className="text-gray-500 focus:outline-none md:hidden" onClick={toggleSidebar}>
                                <Menu size={24} />
                            </button>
                            <h2 className="text-xl font-semibold text-gray-800">Employee Portal</h2>
                        </div>

                        <div className="flex items-center space-x-4">
                            {/* Notifications */}
                            <div className="relative">
                                <button
                                    className="text-gray-500 focus:outline-none"
                                    onClick={toggleNotifications}
                                >
                                    <Bell size={20} />
                                    <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full"></span>
                                </button>

                                {isNotificationsOpen && (
                                    <div className="absolute right-0 mt-2 w-80 bg-white rounded-md shadow-lg py-1 z-10">
                                        <div className="px-4 py-2 border-b border-gray-200">
                                            <h3 className="text-sm font-semibold text-gray-700">Notifications</h3>
                                        </div>
                                        <div className="max-h-64 overflow-y-auto">
                                            <a href="#" className="block px-4 py-2 hover:bg-gray-100">
                                                <div className="flex items-start">
                                                    <div className="flex-shrink-0 bg-blue-100 rounded-full p-1">
                                                        <Calendar size={16} className="text-blue-500" />
                                                    </div>
                                                    <div className="ml-3">
                                                        <p className="text-sm font-medium text-gray-900">Follow-up reminder</p>
                                                        <p className="text-xs text-gray-500">Call John Doe from Acme Corp</p>
                                                        <p className="text-xs text-gray-400 mt-1">10 minutes ago</p>
                                                    </div>
                                                </div>
                                            </a>
                                            <a href="#" className="block px-4 py-2 hover:bg-gray-100">
                                                <div className="flex items-start">
                                                    <div className="flex-shrink-0 bg-green-100 rounded-full p-1">
                                                        <UserPlus size={16} className="text-green-500" />
                                                    </div>
                                                    <div className="ml-3">
                                                        <p className="text-sm font-medium text-gray-900">New lead assigned</p>
                                                        <p className="text-xs text-gray-500">Sarah Johnson from XYZ Inc</p>
                                                        <p className="text-xs text-gray-400 mt-1">1 hour ago</p>
                                                    </div>
                                                </div>
                                            </a>
                                        </div>
                                        <div className="px-4 py-2 border-t border-gray-200 text-center">
                                            <a href="#" className="text-sm text-blue-500 hover:text-blue-700">View all notifications</a>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* User Profile Dropdown */}
                            <UserProfileDropdown />
                        </div>
                    </div>
                </header>

                {/* Main Content Area */}
                <main className="flex-1 overflow-y-auto p-6 bg-gray-50">
                    <Outlet />
                </main>
            </div>
        </div>
    );
}
