import React from 'react'
import { useState } from 'react';
import {
    BarChart3, Users, UserPlus, PhoneCall,
    Calendar, Clock, List, Home, PieChart,
    Bell, User, LogOut, ChevronDown, Search,
    Filter, Menu, X, Mail, CheckCircle
} from 'lucide-react';
import { Link, Outlet, useNavigate } from 'react-router-dom';
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

// SidebarLogout component
const SidebarLogout = () => {
    const navigate = useNavigate();

    const handleLogout = () => {
        // Show confirmation dialog
        if (window.confirm('Are you sure you want to logout?')) {
            // Clear user data
            localStorage.removeItem('userRole');
            localStorage.removeItem('userName');
            localStorage.removeItem('userEmail');
            localStorage.removeItem('userId');
            localStorage.removeItem('token');

            // Redirect to login page
            navigate('/login');
        }
    };

    return (
        <div className="px-4 mb-2">
            <button
                onClick={handleLogout}
                className="w-full flex items-center space-x-2 py-2 px-2 rounded-md text-indigo-200 hover:bg-indigo-800 hover:text-white transition-colors duration-200"
            >
                <LogOut size={18} />
                <span>Logout</span>
            </button>
        </div>
    );
};

// Sidebar component
const Sidebar = ({ isOpen, toggleSidebar }) => {
    return (
        <div className={`fixed inset-y-0 left-0 transform ${isOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 transition duration-200 ease-in-out z-30 w-64 bg-indigo-900 text-white overflow-y-auto lg:static lg:inset-0`}>
            <div className="flex items-center justify-between p-4 border-b border-indigo-800">
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
                    <ul>
                        <li className="mb-2">
                            <a href="/dashboard-panel" className="flex items-center space-x-2 py-2 px-2 rounded-md bg-indigo-800 text-white">
                                <Home size={18} />
                                <span>Dashboard</span>
                            </a>
                        </li>
                        <li className="mb-2">
                            <a href="/dashboard-panel/leads" className="flex items-center space-x-2 py-2 px-2 rounded-md text-indigo-200 hover:bg-indigo-800 hover:text-white">
                                <UserPlus size={18} />
                                <span>Leads</span>
                            </a>
                        </li>
                        <li className="mb-2">
                            <a a href="/dashboard-panel/team" className="flex items-center space-x-2 py-2 px-2 rounded-md text-indigo-200 hover:bg-indigo-800 hover:text-white">
                                <Users size={18} />
                                <span>Team</span>
                            </a>
                        </li>
                        <li className="mb-2">
                            <a href="/dashboard-panel/reports" className="flex items-center space-x-2 py-2 px-2 rounded-md text-indigo-200 hover:bg-indigo-800 hover:text-white">
                                <PieChart size={18} />
                                <span>Reports</span>
                            </a>
                        </li>
                    </ul>

                    <p className="text-xs uppercase tracking-wider text-indigo-400 mt-6 mb-2">Activities</p>
                    <ul>
                        <li className="mb-2">
                            <a href="/dashboard-panel/reminder" className="flex items-center space-x-2 py-2 px-2 rounded-md text-indigo-200 hover:bg-indigo-800 hover:text-white">
                                <Clock size={18} />
                                <span>Reminders</span>
                            </a>
                        </li>
                    </ul>

                </ul>
            </div>

            <div className="flex-grow"></div>
      <SidebarLogout />

      {/* User info at bottom */}
      <div className="px-4 py-4 flex items-center">
        <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center">
          <span>A</span>
        </div>
        <div className="ml-3">
          <p className="text-sm font-medium">Admin User</p>
          <p className="text-xs text-indigo-300"></p>
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
function Dashhome() {
    return (
        <>
            <main className="flex-1 min-h-screen overflow-auto scroll-auto p-6">
                <div className="flex items-center justify-between mb-6">
                    <h1 className="text-2xl font-semibold text-gray-800">Dashboard</h1>
                    {/* <button className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white py-2 px-4 rounded-md text-sm flex items-center shadow-md">
                        <UserPlus size={16} className="mr-2" />
                        Add New Lead
                    </button> */}
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                    <StatsCard
                        icon={UserPlus}
                        title="Total Leads"
                        value="128"
                        trend="+12% from last month"
                        bgColor="bg-indigo-100"
                        iconColor="text-indigo-600"
                    />
                    <StatsCard
                        icon={Users}
                        title="Contacted"
                        value="64"
                        trend="+8% from last month"
                        bgColor="bg-amber-100"
                        iconColor="text-amber-600"
                    />
                    <StatsCard
                        icon={PhoneCall}
                        title="In Progress"
                        value="42"
                        trend="+5% from last month"
                        bgColor="bg-emerald-100"
                        iconColor="text-emerald-600"
                    />
                    <StatsCard
                        icon={CheckCircle}
                        title="Closed Deals"
                        value="24"
                        trend="+15% from last month"
                        bgColor="bg-purple-100"
                        iconColor="text-purple-600"
                    />
                </div>

                {/* Lead Pipeline */}
                <div className="bg-white shadow-md rounded-lg mb-6 border border-gray-200">
                    <div className="p-4 border-b border-gray-200 bg-gray-50">
                        <div className="flex items-center justify-between">
                            <h2 className="text-lg font-semibold text-gray-800">Lead Pipeline</h2>
                            <div className="flex items-center space-x-2">
                                <button className="p-2 text-gray-500 hover:text-indigo-600">
                                    <Filter size={16} />
                                </button>
                                <select className="text-sm border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500">
                                    <option>All Leads</option>
                                    <option>Hot Leads</option>
                                    <option>Warm Leads</option>
                                    <option>Cold Leads</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Priority</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Source</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Assigned</th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {leadsData.map(lead => (
                                    <tr key={lead.id} className="hover:bg-gray-50 transition-colors duration-150">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="font-medium text-gray-900">{lead.name}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-gray-900">{lead.email}</div>
                                            <div className="text-sm text-gray-500">{lead.phone}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <StatusBadge status={lead.status} />
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <PriorityBadge priority={lead.priority} />
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {lead.source}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {lead.assignedTo}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            <button className="text-indigo-600 hover:text-indigo-900 mr-3">Edit</button>
                                            <button className="text-red-600 hover:text-red-900">Delete</button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    <div className="px-6 py-3 flex items-center justify-between border-t border-gray-200 bg-gray-50">
                        <div className="text-sm text-gray-500">
                            Showing 1 to 5 of 128 leads
                        </div>
                        <div className="flex items-center space-x-2">
                            <button className="px-3 py-1 border border-gray-300 rounded-md text-sm text-gray-600 hover:bg-gray-100">Previous</button>
                            <button className="px-3 py-1 bg-indigo-600 text-white rounded-md text-sm shadow-sm">1</button>
                            <button className="px-3 py-1 border border-gray-300 rounded-md text-sm text-gray-600 hover:bg-gray-100">2</button>
                            <button className="px-3 py-1 border border-gray-300 rounded-md text-sm text-gray-600 hover:bg-gray-100">3</button>
                            <button className="px-3 py-1 border border-gray-300 rounded-md text-sm text-gray-600 hover:bg-gray-100">Next</button>
                        </div>
                    </div>
                </div>

                {/* Bottom Section - Activity & Reminders */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Recent Activity */}
                    <div className="bg-white shadow-md rounded-lg border border-gray-200">
                        <div className="px-4 py-3 border-b border-gray-200 bg-gray-50">
                            <h2 className="text-lg font-semibold text-gray-800">Recent Activities</h2>
                        </div>
                        <div className="p-4">
                            <ul className="divide-y divide-gray-200">
                                <li className="py-3">
                                    <div className="flex items-start">
                                        <div className="flex-shrink-0 w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600">
                                            <PhoneCall size={16} />
                                        </div>
                                        <div className="ml-4">
                                            <p className="text-sm font-medium text-gray-800">Call with John Smith</p>
                                            <p className="text-xs text-gray-500">30 mins ago by Sarah</p>
                                            <p className="text-sm text-gray-600 mt-1">Discussed product pricing. Will follow up next week.</p>
                                        </div>
                                    </div>
                                </li>
                                <li className="py-3">
                                    <div className="flex items-start">
                                        <div className="flex-shrink-0 w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600">
                                            <UserPlus size={16} />
                                        </div>
                                        <div className="ml-4">
                                            <p className="text-sm font-medium text-gray-800">New lead added</p>
                                            <p className="text-xs text-gray-500">2 hours ago by Mike</p>
                                            <p className="text-sm text-gray-600 mt-1">Added Tom Wilson from Email campaign.</p>
                                        </div>
                                    </div>
                                </li>
                                <li className="py-3">
                                    <div className="flex items-start">
                                        <div className="flex-shrink-0 w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center text-purple-600">
                                            <Calendar size={16} />
                                        </div>
                                        <div className="ml-4">
                                            <p className="text-sm font-medium text-gray-800">Meeting scheduled</p>
                                            <p className="text-xs text-gray-500">Yesterday by Sarah</p>
                                            <p className="text-sm text-gray-600 mt-1">Demo meeting with Jane Doe on Friday at 2 PM.</p>
                                        </div>
                                    </div>
                                </li>
                            </ul>
                            <button className="mt-2 text-sm text-indigo-600 hover:text-indigo-800 font-medium">View all activities</button>
                        </div>
                    </div>

                    {/* Upcoming Reminders */}
                    <div className="bg-white shadow-md rounded-lg border border-gray-200">
                        <div className="px-4 py-3 border-b border-gray-200 bg-gray-50">
                            <h2 className="text-lg font-semibold text-gray-800">Upcoming Reminders</h2>
                        </div>
                        <div className="p-4">
                            <ul className="divide-y divide-gray-200">
                                <li className="py-3">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center">
                                            <div className="flex-shrink-0 w-10 h-10 rounded-full bg-red-100 flex items-center justify-center text-red-600">
                                                <Clock size={16} />
                                            </div>
                                            <div className="ml-4">
                                                <p className="text-sm font-medium text-gray-800">Follow-up call with Bob Johnson</p>
                                                <p className="text-xs text-gray-500">Today, 4:00 PM</p>
                                            </div>
                                        </div>
                                        <button className="text-gray-400 hover:text-indigo-600">
                                            <List size={16} />
                                        </button>
                                    </div>
                                </li>
                                <li className="py-3">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center">
                                            <div className="flex-shrink-0 w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center text-amber-600">
                                                <Calendar size={16} />
                                            </div>
                                            <div className="ml-4">
                                                <p className="text-sm font-medium text-gray-800">Demo with Jane Doe</p>
                                                <p className="text-xs text-gray-500">Tomorrow, 2:00 PM</p>
                                            </div>
                                        </div>
                                        <button className="text-gray-400 hover:text-indigo-600">
                                            <List size={16} />
                                        </button>
                                    </div>
                                </li>
                                <li className="py-3">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center">
                                            <div className="flex-shrink-0 w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600">
                                                <PhoneCall size={16} />
                                            </div>
                                            <div className="ml-4">
                                                <p className="text-sm font-medium text-gray-800">Call with John Smith</p>
                                                <p className="text-xs text-gray-500">April 15, 11:00 AM</p>
                                            </div>
                                        </div>
                                        <button className="text-gray-400 hover:text-indigo-600">
                                            <List size={16} />
                                        </button>
                                    </div>
                                </li>
                            </ul>
                            <div className="mt-2 flex space-x-4">
                                <button className="text-sm text-indigo-600 hover:text-indigo-800 font-medium">View all reminders</button>
                                <button className="text-sm text-emerald-600 hover:text-emerald-800 font-medium flex items-center">
                                    {/* <span className="mr-1">+</span> Add reminder */}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </>
    )
}

export default Dashhome