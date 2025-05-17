import { useState } from 'react';
import { 
    BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, 
    PieChart, Pie, Cell, Legend
} from 'recharts';
import { 
    UserPlus, Users, CheckCircle, X, 
    ArrowUp, ArrowDown, Calendar, Clock,
    BarChart2, Activity, AlertCircle
} from 'lucide-react';
import { Link } from 'react-router-dom';

// Stats Card Component
const StatsCard = ({ title, value, icon, trend, trendType, bgColor, iconColor }) => (
    <div className="bg-white rounded-lg shadow-md border border-gray-100 p-4 hover:shadow-lg transition-shadow duration-300">
        <div className="flex items-center justify-between mb-3">
            <h3 className="text-gray-600 text-sm font-medium">{title}</h3>
            <div className={`p-2 rounded-md ${bgColor}`}>
                {icon}
            </div>
        </div>
        <div className="flex items-end justify-between">
            <div>
                <p className="text-2xl font-bold text-gray-800">{value}</p>
                <p className={`text-xs ${trendType === 'increase' ? 'text-emerald-500' : 'text-red-500'} font-medium`}>
                    {trendType === 'increase' ? <ArrowUp size={12} className="inline" /> : <ArrowDown size={12} className="inline" />}
                    {' '}{trend}
                </p>
            </div>
        </div>
    </div>
);

// Team Performance Table Row Component
const TeamMemberRow = ({ member }) => {
    const getStatusColor = (status) => {
        switch(status) {
            case 'high': return 'bg-emerald-100 text-emerald-800 border border-emerald-200';
            case 'medium': return 'bg-amber-100 text-amber-800 border border-amber-200';
            case 'low': return 'bg-red-100 text-red-800 border border-red-200';
            default: return 'bg-slate-100 text-slate-800 border border-slate-200';
        }
    };

    return (
        <tr className="hover:bg-gray-50">
            <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex items-center">
                    <div className="h-10 w-10 rounded-full bg-gradient-to-tr from-indigo-500 to-[#022d38] flex items-center justify-center text-white font-bold">
                        {member.avatar}
                    </div>
                    <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{member.name}</div>
                        <div className="text-sm text-gray-500">{member.email}</div>
                    </div>
                </div>
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {member.leadsAssigned}
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {member.leadsConverted}
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {member.conversionRate}
            </td>
            <td className="px-6 py-4 whitespace-nowrap">
                <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(member.performance)}`}>
                    {member.performance === 'high' ? 'High' : member.performance === 'medium' ? 'Medium' : 'Low'}
                </span>
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <Link to={`/manager-panel/employees/${member.id}`} className="text-indigo-600 hover:text-indigo-900">
                    View
                </Link>
            </td>
        </tr>
    );
};

export default function DashboardHome() {
    // Mock data for charts and stats
    const leadStatusData = [
        { name: 'New', value: 45 },
        { name: 'Contacted', value: 30 },
        { name: 'Qualified', value: 15 },
        { name: 'Converted', value: 8 },
        { name: 'Lost', value: 12 }
    ];

    const monthlyConversionData = [
        { name: 'Jan', conversions: 12 },
        { name: 'Feb', conversions: 15 },
        { name: 'Mar', conversions: 18 },
        { name: 'Apr', conversions: 14 },
        { name: 'May', conversions: 22 },
        { name: 'Jun', conversions: 26 }
    ];

    const teamMembers = [
        { 
            id: 1, 
            name: 'John Smith', 
            email: 'john@example.com', 
            avatar: 'JS',
            leadsAssigned: 24, 
            leadsConverted: 18, 
            conversionRate: '75%',
            performance: 'high'
        },
        { 
            id: 2, 
            name: 'Sarah Johnson', 
            email: 'sarah@example.com', 
            avatar: 'SJ',
            leadsAssigned: 18, 
            leadsConverted: 10, 
            conversionRate: '55%',
            performance: 'medium'
        },
        { 
            id: 3, 
            name: 'Michael Brown', 
            email: 'michael@example.com', 
            avatar: 'MB',
            leadsAssigned: 15, 
            leadsConverted: 5, 
            conversionRate: '33%',
            performance: 'low'
        },
        { 
            id: 4, 
            name: 'Emily Davis', 
            email: 'emily@example.com', 
            avatar: 'ED',
            leadsAssigned: 20, 
            leadsConverted: 14, 
            conversionRate: '70%',
            performance: 'high'
        }
    ];

    // Colors for pie chart
    const COLORS = ['#6366f1', '#f59e0b', '#10b981', '#3b82f6', '#ef4444'];

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-semibold text-gray-800">Manager Dashboard</h1>
                <div className="text-sm text-gray-500">
                    <Clock size={16} className="inline mr-1" />
                    {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatsCard
                    title="Total Leads"
                    value="110"
                    icon={<UserPlus size={20} className="text-indigo-600" />}
                    trend="12% from last month"
                    trendType="increase"
                    bgColor="bg-indigo-100"
                    iconColor="text-indigo-600"
                />
                <StatsCard
                    title="Converted Leads"
                    value="28"
                    icon={<CheckCircle size={20} className="text-emerald-600" />}
                    trend="8% from last month"
                    trendType="increase"
                    bgColor="bg-emerald-100"
                    iconColor="text-emerald-600"
                />
                <StatsCard
                    title="Lost Leads"
                    value="12"
                    icon={<X size={20} className="text-red-600" />}
                    trend="3% from last month"
                    trendType="decrease"
                    bgColor="bg-red-100"
                    iconColor="text-red-600"
                />
                <StatsCard
                    title="Conversion Rate"
                    value="25.5%"
                    icon={<Activity size={20} className="text-amber-600" />}
                    trend="5% from last month"
                    trendType="increase"
                    bgColor="bg-amber-100"
                    iconColor="text-amber-600"
                />
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Lead Status Distribution */}
                <div className="bg-white rounded-lg shadow p-6">
                    <h2 className="text-lg font-medium text-gray-800 mb-4">Lead Status Distribution</h2>
                    <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={leadStatusData}
                                    cx="50%"
                                    cy="50%"
                                    labelLine={false}
                                    outerRadius={80}
                                    fill="#8884d8"
                                    dataKey="value"
                                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                                >
                                    {leadStatusData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Legend />
                                <Tooltip />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Monthly Conversion Trend */}
                <div className="bg-white rounded-lg shadow p-6">
                    <h2 className="text-lg font-medium text-gray-800 mb-4">Monthly Conversion Trend</h2>
                    <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart
                                data={monthlyConversionData}
                                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                            >
                                <XAxis dataKey="name" />
                                <YAxis />
                                <Tooltip />
                                <Bar dataKey="conversions" fill="#6366f1" />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* Team Performance Table */}
            <div className="bg-white rounded-lg shadow overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
                    <h2 className="text-lg font-medium text-gray-800">Team Performance</h2>
                    <Link to="/manager-panel/employees" className="text-sm text-indigo-600 hover:text-indigo-900">
                        View All
                    </Link>
                </div>
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Employee
                                </th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Leads Assigned
                                </th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Leads Converted
                                </th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Conversion Rate
                                </th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Performance
                                </th>
                                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {teamMembers.map((member) => (
                                <TeamMemberRow key={member.id} member={member} />
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Recent Activities */}
            <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-lg font-medium text-gray-800 mb-4">Recent Activities</h2>
                <div className="flow-root">
                    <ul className="-mb-8">
                        <li>
                            <div className="relative pb-8">
                                <span className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-gray-200" aria-hidden="true"></span>
                                <div className="relative flex space-x-3">
                                    <div>
                                        <span className="h-8 w-8 rounded-full bg-indigo-100 flex items-center justify-center">
                                            <CheckCircle size={16} className="text-indigo-600" />
                                        </span>
                                    </div>
                                    <div className="min-w-0 flex-1 pt-1.5 flex justify-between space-x-4">
                                        <div>
                                            <p className="text-sm text-gray-900">Sarah Johnson converted <span className="font-medium">Acme Corp</span> lead</p>
                                        </div>
                                        <div className="text-right text-sm whitespace-nowrap text-gray-500">
                                            2 hours ago
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </li>
                        <li>
                            <div className="relative pb-8">
                                <span className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-gray-200" aria-hidden="true"></span>
                                <div className="relative flex space-x-3">
                                    <div>
                                        <span className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                                            <UserPlus size={16} className="text-blue-600" />
                                        </span>
                                    </div>
                                    <div className="min-w-0 flex-1 pt-1.5 flex justify-between space-x-4">
                                        <div>
                                            <p className="text-sm text-gray-900">New lead <span className="font-medium">XYZ Inc</span> assigned to John Smith</p>
                                        </div>
                                        <div className="text-right text-sm whitespace-nowrap text-gray-500">
                                            3 hours ago
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </li>
                        <li>
                            <div className="relative pb-8">
                                <div className="relative flex space-x-3">
                                    <div>
                                        <span className="h-8 w-8 rounded-full bg-red-100 flex items-center justify-center">
                                            <AlertCircle size={16} className="text-red-600" />
                                        </span>
                                    </div>
                                    <div className="min-w-0 flex-1 pt-1.5 flex justify-between space-x-4">
                                        <div>
                                            <p className="text-sm text-gray-900">Michael Brown has 3 overdue follow-ups</p>
                                        </div>
                                        <div className="text-right text-sm whitespace-nowrap text-gray-500">
                                            5 hours ago
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </li>
                    </ul>
                </div>
                <div className="mt-6 text-center">
                    <Link to="/manager-panel/performance" className="text-sm font-medium text-indigo-600 hover:text-indigo-900">
                        View all activity
                    </Link>
                </div>
            </div>
        </div>
    );
}
