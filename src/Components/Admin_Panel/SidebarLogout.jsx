import React from 'react';
import { LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
// port { BarChart3, X, Home, UserPlus, Users, PieChart, PhoneCall, Calendar, LogOut } from 'lucide-react';
// import { Link, useNavigate } from 'react-router-dom';
// import SidebarLogout from './SidebarLogout'; 

const SidebarLogout = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    // Show confirmation dialog
    if (window.confirm('Are you sure you want to logout?')) {
      // Clear all authentication data
      localStorage.removeItem('token');
      localStorage.removeItem('userRole');
      localStorage.removeItem('userName');
      localStorage.removeItem('userEmail');
      localStorage.removeItem('userId');
      
      // Redirect to login page
      navigate('/login');
    }
  };

  return (
    <div className="px-4 mb-2">
      <button 
        onClick={handleLogout}
        className="w-full flex items-center space-x-2 py-2 px-2 rounded-md text-indigo-200 hover:bg-white hover:text-black transition-colors duration-200"
      >
        <LogOut size={18} />
        <span>Logout</span>
      </button>
    </div>
  );
};

export default SidebarLogout;