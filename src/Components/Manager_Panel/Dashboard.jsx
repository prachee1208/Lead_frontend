import { useState, useEffect } from 'react';
import {
    BarChart3, Users, UserPlus, PhoneCall,
    Calendar, Clock, List, Home, PieChart,
    Bell, User, LogOut, ChevronDown, Search,
    Filter, Menu, X, Mail, CheckCircle, FileText,
    BarChart2, Activity
} from 'lucide-react';
import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom';

// Sidebar component
const Sidebar = ({ isOpen, toggleSidebar }) => {
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
                            to="/manager-panel"
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
                            to="/manager-panel/employees"
                            className={({isActive}) =>
                                `flex items-center space-x-2 py-2 px-2 rounded-md ${
                                    isActive
                                        ? 'bg-white text-[#022d38]'
                                        : 'text-indigo-200 hover:bg-white hover:text-[#022d38]'
                                }`
                            }
                        >
                            <Users size={18} />
                            <span>Employees</span>
                        </NavLink>
                    </li>
                    <li className="mb-2">
                        <NavLink
                            to="/manager-panel/assign-leads"
                            className={({isActive}) =>
                                `flex items-center space-x-2 py-2 px-2 rounded-md ${
                                    isActive
                                        ? 'bg-white text-[#022d38]'
                                        : 'text-indigo-200 hover:bg-white hover:text-[#022d38]'
                                }`
                            }
                        >
                            <UserPlus size={18} />
                            <span>Assign Leads</span>
                        </NavLink>
                    </li>
                    <li className="mb-2">
                        <NavLink
                            to="/manager-panel/assigned-leads"
                            className={({isActive}) =>
                                `flex items-center space-x-2 py-2 px-2 rounded-md ${
                                    isActive
                                        ? 'bg-white text-[#022d38]'
                                        : 'text-indigo-200 hover:bg-white hover:text-[#022d38]'
                                }`
                            }
                        >
                            <List size={18} />
                            <span>Assigned Leads</span>
                        </NavLink>
                    </li>
                    <li className="mb-2">
                        <NavLink
                            to="/manager-panel/performance"
                            className={({isActive}) =>
                                `flex items-center space-x-2 py-2 px-2 rounded-md ${
                                    isActive
                                        ? 'bg-white text-[#022d38]'
                                        : 'text-indigo-200 hover:bg-white hover:text-[#022d38]'
                                }`
                            }
                        >
                            <Activity size={18} />
                            <span>Performance</span>
                        </NavLink>
                    </li>
                    <li className="mb-2">
                        <NavLink
                            to="/manager-panel/reports"
                            className={({isActive}) =>
                                `flex items-center space-x-2 py-2 px-2 rounded-md ${
                                    isActive
                                        ? 'bg-white text-[#022d38]'
                                        : 'text-indigo-200 hover:bg-white hover:text-[#022d38]'
                                }`
                            }
                        >
                            <FileText size={18} />
                            <span>Reports</span>
                        </NavLink>
                    </li>

                </ul>
            </div>

            <div className="p-4 border-t border-[#043c4a] mt-auto">
                <Link
                    to="/"
                    onClick={() => {
                        // Clear all user-related data from localStorage
                        localStorage.removeItem('userRole');
                        localStorage.removeItem('token');
                        localStorage.removeItem('userName');
                        localStorage.removeItem('userEmail');
                        localStorage.removeItem('userId');
                        localStorage.removeItem('userData');
                        console.log('User logged out, localStorage cleared');
                    }}
                    className="flex items-center space-x-2 py-2 px-2 rounded-md text-indigo-200 hover:bg-white hover:text-[#022d38]"
                >
                    <LogOut size={18} />
                    <span>Logout</span>
                </Link>
            </div>
        </div>
    );
};

export default function ManagerDashboard() {
    const navigate = useNavigate();
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
    const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
    const [userName, setUserName] = useState('Manager');
    const [userInitials, setUserInitials] = useState('M');

    // Get user data from localStorage on component mount
    useEffect(() => {
        const storedName = localStorage.getItem('userName');
        if (storedName) {
            setUserName(storedName);

            // Generate initials from name
            const nameParts = storedName.split(' ');
            const initials = nameParts.length > 1
                ? `${nameParts[0][0]}${nameParts[1][0]}`
                : storedName.substring(0, 2);

            setUserInitials(initials.toUpperCase());
        }
    }, []);

    const toggleSidebar = () => {
        setIsSidebarOpen(!isSidebarOpen);
    };

    const toggleProfileMenu = () => {
        setIsProfileMenuOpen(!isProfileMenuOpen);
        if (isNotificationsOpen) setIsNotificationsOpen(false);
    };

    const toggleNotifications = () => {
        setIsNotificationsOpen(!isNotificationsOpen);
        if (isProfileMenuOpen) setIsProfileMenuOpen(false);
    };

    return (
        <div className="flex h-screen bg-gray-100">
            {/* Sidebar */}
            <Sidebar isOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />

            {/* Main Content */}
            <div className="flex-1 flex flex-col overflow-hidden">
                {/* Top Navigation */}
                <header className="bg-white shadow-sm">
                    <div className="flex items-center justify-between p-4">
                        <div className="flex items-center space-x-4">
                            <button className="text-gray-500 focus:outline-none md:hidden" onClick={toggleSidebar}>
                                <Menu size={24} />
                            </button>
                            <h2 className="text-xl font-semibold text-gray-800">Manager Portal</h2>
                        </div>

                        <div className="flex items-center space-x-4">
                            {/* Notifications */}
                            <div className="relative">
                                <button
                                    className="relative text-gray-500 hover:text-[#022d38]"
                                    onClick={toggleNotifications}
                                >
                                    <Bell size={20} />
                                    <span className="absolute top-0 right-0 block w-2 h-2 bg-red-500 rounded-full"></span>
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
                                                        <Users size={16} className="text-blue-500" />
                                                    </div>
                                                    <div className="ml-3">
                                                        <p className="text-sm font-medium text-gray-900">New employee added</p>
                                                        <p className="text-xs text-gray-500">John Smith joined the team</p>
                                                        <p className="text-xs text-gray-400 mt-1">10 minutes ago</p>
                                                    </div>
                                                </div>
                                            </a>
                                            <a href="#" className="block px-4 py-2 hover:bg-gray-100">
                                                <div className="flex items-start">
                                                    <div className="flex-shrink-0 bg-green-100 rounded-full p-1">
                                                        <CheckCircle size={16} className="text-green-500" />
                                                    </div>
                                                    <div className="ml-3">
                                                        <p className="text-sm font-medium text-gray-900">Lead converted</p>
                                                        <p className="text-xs text-gray-500">Sarah Johnson converted Acme Corp</p>
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

                            {/* Profile Menu */}
                            <div className="relative">
                                <button
                                    className="flex items-center space-x-2 focus:outline-none"
                                    onClick={toggleProfileMenu}
                                >
                                    <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-500 to-[#022d38] flex items-center justify-center text-white font-bold">
                                        {userInitials}
                                    </div>
                                    <span className="text-sm font-medium text-gray-700 hidden md:block">{userName}</span>
                                    <ChevronDown size={16} className="text-gray-500 hidden md:block" />
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
                                            onClick={() => {
                                                // Clear all user-related data from localStorage
                                                localStorage.removeItem('userRole');
                                                localStorage.removeItem('token');
                                                localStorage.removeItem('userName');
                                                localStorage.removeItem('userEmail');
                                                localStorage.removeItem('userId');
                                                localStorage.removeItem('userData');
                                                console.log('User logged out, localStorage cleared');
                                            }}
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

                {/* Main Content Area */}
                <main className="flex-1 overflow-y-auto p-6 bg-gray-50">
                    <Outlet />
                </main>
            </div>
        </div>
    );
}
