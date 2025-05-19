import { useState } from 'react';
import {
    BarChart3, Users, UserPlus, PhoneCall,
    Calendar, Clock, List, Home, PieChart,
    Bell, User, LogOut, ChevronDown, Search,
    Filter, Menu, X, Mail, CheckCircle,
    MessageSquare, FileText
} from 'lucide-react';
import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom';

// import { Link,useLocation } from 'react-router-dom';

// Mock data for dashboard
const leadsData = [
    { id: 1, name: "John Smith", email: "john@example.com", phone: "555-1234", status: "New", priority: "Hot", source: "Website", assignedTo: "Sarah" },
    { id: 2, name: "Jane Doe", email: "jane@example.com", phone: "555-5678", status: "Contacted", priority: "Warm", source: "Referral", assignedTo: "Mike" },
    { id: 3, name: "Bob Johnson", email: "bob@example.com", phone: "555-9012", status: "In Progress", priority: "Cold", source: "LinkedIn", assignedTo: "Sarah" },
    { id: 4, name: "Alice Brown", email: "alice@example.com", phone: "555-3456", status: "Closed", priority: "Hot", source: "Website", assignedTo: "Mike" },
    { id: 5, name: "Tom Wilson", email: "tom@example.com", phone: "555-7890", status: "New", priority: "Warm", source: "Email", assignedTo: "Sarah" },
];

// Priority badge component
const PriorityBadge = ({ priority }) => {
    const colors = {
        Hot: "bg-red-100 text-red-800 border border-red-200",
        Warm: "bg-orange-100 text-orange-800 border border-orange-200",
        Cold: "bg-blue-100 text-blue-800 border border-blue-200"
    };

    return (
        <span className={`text-xs font-medium px-2 py-1 rounded-full ${colors[priority]}`}>
            {priority}
        </span>
    );
};

// Status badge component
const StatusBadge = ({ status }) => {
    const colors = {
        New: "bg-indigo-100 text-indigo-800 border border-indigo-200",
        Contacted: "bg-amber-100 text-amber-800 border border-amber-200",
        "In Progress": "bg-emerald-100 text-emerald-800 border border-emerald-200",
        Closed: "bg-slate-100 text-slate-800 border border-slate-200"
    };

    return (
        <span className={`text-xs font-medium px-2 py-1 rounded-full ${colors[status]}`}>
            {status}
        </span>
    );
};

// Sidebar component
const Sidebar = ({ isOpen, toggleSidebar }) => {
    const navigate = useNavigate();

    const handleLogout = () => {
        // Show confirmation dialog
        if (window.confirm('Are you sure you want to logout?')) {
            // Clear user data
            localStorage.removeItem('userRole');
            localStorage.removeItem('userName');
            localStorage.removeItem('userEmail');
            localStorage.removeItem('userId');

            // Redirect to login page
            navigate('/login');
        }
    };

    return (
        <div className={`fixed inset-y-0 left-0 transform ${isOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 transition duration-200 ease-in-out z-30 w-64 bg-[#022d38] text-white overflow-y-auto lg:static lg:inset-0`}>
            <div className="flex items-center justify-between p-4 border-b border-[#043c4a]">
                <div className="flex items-center space-x-2">
                    <BarChart3 size={24} className="text-indigo-300" />
                    <span className="text-xl font-bold text-white">LeadTracker</span>
                </div>
                <button onClick={toggleSidebar} className="lg:hidden text-indigo-300 hover:text-white">
                    <X size={20} />
                </button>
            </div>

            <div className="p-4">
                <p className="text-xs uppercase tracking-wider text-indigo-400 mb-2">Main</p>
                <ul>
                    <li className="mb-2">
                        <NavLink
                            to="/dashboard-panel"
                            end
                            className={({isActive}) =>
                                `flex items-center space-x-2 py-2 px-2 rounded-md ${
                                    isActive ? 'bg-white text-[#022d38]' : 'text-indigo-200 hover:bg-white hover:text-[#022d38]'
                                }`
                            }
                        >
                            <Home size={18} />
                            <span>Dashboard</span>
                        </NavLink>
                    </li>
                    <li className="mb-2">
                        <NavLink
                            to="lead"
                            className={({isActive}) =>
                                `flex items-center space-x-2 py-2 px-2 rounded-md ${
                                    isActive ? 'bg-white text-[#022d38]' : 'text-indigo-200 hover:bg-white hover:text-[#022d38]'
                                }`
                            }
                        >
                            <UserPlus size={18} />
                            <span>Leads</span>
                        </NavLink>
                    </li>
                    <li className="mb-2">
                        <NavLink
                            to="team"
                            className={({isActive}) =>
                                `flex items-center space-x-2 py-2 px-2 rounded-md ${
                                    isActive ? 'bg-white text-[#022d38]' : 'text-indigo-200 hover:bg-white hover:text-[#022d38]'
                                }`
                            }
                        >
                            <Users size={18} />
                            <span>Team</span>
                        </NavLink>
                    </li>
                    <li className="mb-2">
                        <NavLink
                            to="report"
                            className={({isActive}) =>
                                `flex items-center space-x-2 py-2 px-2 rounded-md ${
                                    isActive ? 'bg-white text-[#022d38]' : 'text-indigo-200 hover:bg-white hover:text-[#022d38]'
                                }`
                            }
                        >
                            <FileText size={18} />
                            <span>Reports</span>
                        </NavLink>
                    </li>

                </ul>

                <p className="text-xs uppercase tracking-wider text-indigo-400 mt-6 mb-2">Communication</p>
                <ul>
                    <li className="mb-2">
                        <NavLink
                            to="reminder"
                            className={({isActive}) =>
                                `flex items-center space-x-2 py-2 px-2 rounded-md ${
                                    isActive ? 'bg-white text-[#022d38]' : 'text-indigo-200 hover:bg-white hover:text-[#022d38]'
                                }`
                            }
                        >
                            <Calendar size={18} />
                            <span>Reminders</span>
                        </NavLink>
                    </li>
                </ul>
            </div>

            <div className="flex-grow"></div>

            {/* Logout button */}
            <div className="px-4 mb-2">
                <button
                    onClick={handleLogout}
                    className="w-full flex items-center space-x-2 py-2 px-2 rounded-md text-indigo-200 hover:bg-white hover:text-[#022d38] transition-colors duration-200"
                >
                    <LogOut size={18} />
                    <span>Logout</span>
                </button>
            </div>

            {/* User info at bottom */}
            <div className="px-4 py-4 flex items-center border-t border-[#043c4a]">
                <div className="h-8 w-8 rounded-full bg-gradient-to-tr from-indigo-500 to-[#022d38] flex items-center justify-center text-white font-bold">
                    <span>A</span>
                </div>
                <div className="ml-3">
                    <p className="text-sm font-medium">Admin User</p>
                    <p className="text-xs text-indigo-300">System Administrator</p>
                </div>
            </div>
        </div>
    );
};

// Stats card component
const StatsCard = ({ icon, title, value, trend, bgColor, iconColor }) => {
    const Icon = icon;
    return (
        <div className="bg-white rounded-lg shadow-md border border-gray-100 p-4 hover:shadow-lg transition-shadow duration-300">
            <div className="flex items-center justify-between mb-3">
                <h3 className="text-gray-600 text-sm font-medium">{title}</h3>
                <div className={`p-2 rounded-md ${bgColor}`}>
                    <Icon size={16} className={`${iconColor}`} />
                </div>
            </div>
            <div className="flex items-end justify-between">
                <div>
                    <p className="text-2xl font-bold text-gray-800">{value}</p>
                    <p className={`text-xs ${trend.includes('+') ? 'text-emerald-500' : 'text-red-500'} font-medium`}>
                        {trend}
                    </p>
                </div>
            </div>
        </div>
    );
};

// Main dashboard
export default function Dashboard() {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
    const navigate = useNavigate();

    const toggleSidebar = () => setSidebarOpen(!sidebarOpen);
    const toggleProfileMenu = () => setIsProfileMenuOpen(!isProfileMenuOpen);

    const handleLogout = () => {
        localStorage.removeItem('userRole');
        localStorage.removeItem('userName');
        localStorage.removeItem('userEmail');
        localStorage.removeItem('userId');
        navigate('/login');
    };

    return (
        <div className="flex h-screen bg-gray-50">
            {/* Sidebar */}
            <Sidebar isOpen={sidebarOpen} toggleSidebar={toggleSidebar} />

            {/* Main content */}
            <div className="flex-1 flex flex-col overflow-hidden">
                {/* Top header */}
                <header className="bg-white shadow-sm z-10">
                    <div className="px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
                        <div className="flex items-center">
                            <button onClick={toggleSidebar} className="lg:hidden text-gray-500 hover:text-gray-700 mr-3">
                                <Menu size={24} />
                            </button>
                            <h1 className="text-xl font-semibold text-gray-800">Admin Dashboard</h1>
                        </div>
                        <div className="flex items-center space-x-4">
                            <div className="relative">
                                <button className="text-gray-500 hover:text-gray-700 relative">
                                    <Bell size={20} />
                                    <span className="absolute top-0 right-0 h-2 w-2 rounded-full bg-red-500"></span>
                                </button>
                            </div>
                            <div className="relative">
                                <button className="text-gray-500 hover:text-gray-700 relative">
                                    <Mail size={20} />
                                    <span className="absolute top-0 right-0 h-2 w-2 rounded-full bg-red-500"></span>
                                </button>
                            </div>
                            <div className="border-l pl-4 border-gray-200 relative">
                                <button
                                    onClick={toggleProfileMenu}
                                    className="flex items-center text-gray-700 hover:text-gray-900"
                                >
                                    <div className="h-8 w-8 rounded-full bg-gradient-to-tr from-indigo-500 to-[#022d38] flex items-center justify-center text-white font-bold">
                                        <span>A</span>
                                    </div>
                                    <span className="ml-2 text-sm font-medium hidden md:block">Admin User</span>
                                    <ChevronDown size={16} className="ml-1 hidden md:block" />
                                </button>

                                {isProfileMenuOpen && (
                                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-10">
                                        <a href="#" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                                            Your Profile
                                        </a>
                                        <a href="#" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                                            Settings
                                        </a>
                                        <a
                                            href="/"
                                            onClick={() => localStorage.removeItem('userRole')}
                                            className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                        >
                                            Sign out
                                        </a>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </header>

                {/* Main content area */}
                <main className="flex-1 overflow-y-auto p-6 bg-gray-50">
                    <Outlet />
                </main>
            </div>
        </div>
    );
}

// dashboard