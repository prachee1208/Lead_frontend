import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  User, 
  Settings, 
  LogOut, 
  ChevronDown, 
  Bell, 
  Mail 
} from 'lucide-react';
import { enhancedAPI } from '../../services/enhancedAPI';
import { toast } from 'react-toastify';

/**
 * User Profile Dropdown Component
 * Displays user information and dropdown menu in the top-right corner
 */
const UserProfileDropdown = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [userData, setUserData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();
  
  // Fetch user data
  useEffect(() => {
    const fetchUserData = async () => {
      setIsLoading(true);
      try {
        const userId = localStorage.getItem('userId');
        if (!userId) {
          console.warn('User ID not found in localStorage');
          setIsLoading(false);
          return;
        }
        
        const response = await enhancedAPI.users.getById(userId);
        if (response && response.data) {
          setUserData(response.data);
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
        // Use data from localStorage as fallback
        setUserData({
          name: localStorage.getItem('userName') || 'User',
          email: localStorage.getItem('userEmail') || '',
          role: localStorage.getItem('userRole') || 'employee'
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchUserData();
  }, []);
  
  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);
  
  // Handle logout
  const handleLogout = () => {
    // Clear localStorage
    localStorage.removeItem('token');
    localStorage.removeItem('userId');
    localStorage.removeItem('userName');
    localStorage.removeItem('userEmail');
    localStorage.removeItem('userRole');
    
    // Show success message
    toast.success('Logged out successfully');
    
    // Redirect to login page
    navigate('/login');
  };
  
  // Generate initials from name
  const getInitials = (name) => {
    if (!name) return 'U';
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };
  
  // Get role display name
  const getRoleDisplay = (role) => {
    switch (role) {
      case 'admin':
        return 'Administrator';
      case 'manager':
        return 'Manager';
      case 'employee':
        return 'Employee';
      default:
        return role;
    }
  };
  
  return (
    <div className="relative" ref={dropdownRef}>
      <div className="flex items-center space-x-4">
        {/* Notification Bell */}
        <button className="text-gray-500 hover:text-gray-700 relative">
          <Bell size={20} />
          <span className="absolute top-0 right-0 h-2 w-2 rounded-full bg-red-500"></span>
        </button>
        
        {/* Messages */}
        <button className="text-gray-500 hover:text-gray-700 relative">
          <Mail size={20} />
          <span className="absolute top-0 right-0 h-2 w-2 rounded-full bg-blue-500"></span>
        </button>
        
        {/* Profile Button */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center space-x-2 focus:outline-none"
        >
          <div className="h-8 w-8 rounded-full bg-gradient-to-tr from-indigo-500 to-blue-600 flex items-center justify-center text-white text-sm font-medium">
            {isLoading ? '...' : getInitials(userData?.name)}
          </div>
          <div className="hidden md:block text-left">
            <p className="text-sm font-medium text-gray-700">
              {isLoading ? 'Loading...' : userData?.name}
            </p>
            <p className="text-xs text-gray-500">
              {isLoading ? '' : getRoleDisplay(userData?.role)}
            </p>
          </div>
          <ChevronDown size={16} className="text-gray-500" />
        </button>
      </div>
      
      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-10 border border-gray-200">
          <div className="px-4 py-2 border-b border-gray-100">
            <p className="text-sm font-medium text-gray-700">{userData?.name}</p>
            <p className="text-xs text-gray-500 truncate">{userData?.email}</p>
          </div>
          
          <a 
            href="#" 
            onClick={(e) => {
              e.preventDefault();
              navigate('/employee-panel/profile');
              setIsOpen(false);
            }}
            className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
          >
            <User size={16} className="mr-2" />
            Your Profile
          </a>
          
          <a 
            href="#" 
            onClick={(e) => {
              e.preventDefault();
              navigate('/employee-panel/settings');
              setIsOpen(false);
            }}
            className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
          >
            <Settings size={16} className="mr-2" />
            Settings
          </a>
          
          <div className="border-t border-gray-100 my-1"></div>
          
          <a
            href="#"
            onClick={(e) => {
              e.preventDefault();
              handleLogout();
            }}
            className="block px-4 py-2 text-sm text-red-600 hover:bg-gray-100 flex items-center"
          >
            <LogOut size={16} className="mr-2" />
            Sign out
          </a>
        </div>
      )}
    </div>
  );
};

export default UserProfileDropdown;
