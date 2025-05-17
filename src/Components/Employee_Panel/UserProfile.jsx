import { useState, useEffect, useRef } from 'react';
import { 
  User, 
  Mail, 
  Phone, 
  Calendar, 
  Lock, 
  Upload, 
  Edit, 
  Save, 
  X, 
  Loader, 
  AlertCircle, 
  CheckCircle 
} from 'lucide-react';
import { enhancedAPI } from '../../services/enhancedAPI';
import { toast } from 'react-toastify';

/**
 * User Profile Page Component
 * Allows users to view and update their profile information
 */
const UserProfile = () => {
  // User data state
  const [userData, setUserData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Edit mode states
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  
  // Form data states
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
  });
  
  // Password change states
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  
  // Profile image states
  const [profileImage, setProfileImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const fileInputRef = useRef(null);
  
  // Fetch user data
  useEffect(() => {
    const fetchUserData = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        const userId = localStorage.getItem('userId');
        if (!userId) {
          setError('User ID not found. Please log in again.');
          setIsLoading(false);
          return;
        }
        
        const response = await enhancedAPI.users.getById(userId);
        if (response && response.data) {
          setUserData(response.data);
          setFormData({
            name: response.data.name || '',
            email: response.data.email || '',
            phone: response.data.phone || '',
          });
          
          // If user has a profile image, set it
          if (response.data.profileImage) {
            setImagePreview(response.data.profileImage);
          }
        }
      } catch (err) {
        console.error('Error fetching user data:', err);
        setError('Failed to load user data. Please try again.');
        
        // Use data from localStorage as fallback
        const fallbackData = {
          name: localStorage.getItem('userName') || 'User',
          email: localStorage.getItem('userEmail') || '',
          role: localStorage.getItem('userRole') || 'employee',
        };
        
        setUserData(fallbackData);
        setFormData({
          name: fallbackData.name,
          email: fallbackData.email,
          phone: '',
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchUserData();
  }, []);
  
  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevData => ({
      ...prevData,
      [name]: value,
    }));
  };
  
  // Handle password input changes
  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData(prevData => ({
      ...prevData,
      [name]: value,
    }));
  };
  
  // Handle profile image selection
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Check file type
      if (!file.type.match('image.*')) {
        toast.error('Please select an image file');
        return;
      }
      
      // Check file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Image size should be less than 5MB');
        return;
      }
      
      setProfileImage(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };
  
  // Handle profile update
  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    
    try {
      const userId = localStorage.getItem('userId');
      if (!userId) {
        toast.error('User ID not found. Please log in again.');
        return;
      }
      
      // Validate form data
      if (!formData.name.trim()) {
        toast.error('Name is required');
        return;
      }
      
      if (!formData.email.trim()) {
        toast.error('Email is required');
        return;
      }
      
      // Update user data
      const response = await enhancedAPI.users.update(userId, formData);
      
      if (response && response.data) {
        // Update local state
        setUserData({
          ...userData,
          ...formData,
        });
        
        // Update localStorage
        localStorage.setItem('userName', formData.name);
        localStorage.setItem('userEmail', formData.email);
        
        toast.success('Profile updated successfully');
        setIsEditingProfile(false);
      }
    } catch (err) {
      console.error('Error updating profile:', err);
      toast.error('Failed to update profile. Please try again.');
    }
  };
  
  // Handle password update
  const handlePasswordUpdate = async (e) => {
    e.preventDefault();
    
    try {
      const userId = localStorage.getItem('userId');
      if (!userId) {
        toast.error('User ID not found. Please log in again.');
        return;
      }
      
      // Validate password data
      if (!passwordData.currentPassword) {
        toast.error('Current password is required');
        return;
      }
      
      if (!passwordData.newPassword) {
        toast.error('New password is required');
        return;
      }
      
      if (passwordData.newPassword !== passwordData.confirmPassword) {
        toast.error('New passwords do not match');
        return;
      }
      
      if (passwordData.newPassword.length < 4) {
        toast.error('Password must be at least 4 characters long');
        return;
      }
      
      // Update password
      const response = await enhancedAPI.users.update(userId, {
        currentPassword: passwordData.currentPassword,
        password: passwordData.newPassword,
      });
      
      if (response && response.success) {
        toast.success('Password updated successfully');
        setIsChangingPassword(false);
        setPasswordData({
          currentPassword: '',
          newPassword: '',
          confirmPassword: '',
        });
      } else {
        toast.error(response?.message || 'Failed to update password');
      }
    } catch (err) {
      console.error('Error updating password:', err);
      toast.error('Failed to update password. Please try again.');
    }
  };
  
  // Handle profile image upload
  const handleImageUpload = async () => {
    if (!profileImage) return;
    
    setIsUploadingImage(true);
    
    try {
      const userId = localStorage.getItem('userId');
      if (!userId) {
        toast.error('User ID not found. Please log in again.');
        setIsUploadingImage(false);
        return;
      }
      
      // Create form data for file upload
      const formData = new FormData();
      formData.append('profileImage', profileImage);
      
      // Upload image
      const response = await enhancedAPI.users.update(userId, formData);
      
      if (response && response.data) {
        toast.success('Profile image updated successfully');
        setUserData({
          ...userData,
          profileImage: response.data.profileImage,
        });
      }
    } catch (err) {
      console.error('Error uploading profile image:', err);
      toast.error('Failed to upload profile image. Please try again.');
    } finally {
      setIsUploadingImage(false);
    }
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
  
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <Loader className="w-8 h-8 text-blue-500 animate-spin mb-2" />
        <p className="text-gray-500">Loading profile...</p>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="bg-red-100 border border-red-200 text-red-800 px-4 py-3 rounded-md flex items-center">
        <AlertCircle size={20} className="mr-2" />
        <span>{error}</span>
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold text-gray-800">Your Profile</h1>
      
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="p-6 sm:p-8">
          <div className="flex flex-col md:flex-row md:items-center">
            {/* Profile Image */}
            <div className="flex flex-col items-center mb-6 md:mb-0 md:mr-8">
              <div className="relative">
                {imagePreview ? (
                  <img 
                    src={imagePreview} 
                    alt="Profile" 
                    className="h-32 w-32 rounded-full object-cover border-4 border-white shadow-md"
                  />
                ) : (
                  <div className="h-32 w-32 rounded-full bg-gradient-to-tr from-indigo-500 to-blue-600 flex items-center justify-center text-white text-3xl font-bold shadow-md">
                    {getInitials(userData?.name)}
                  </div>
                )}
                
                <button 
                  onClick={() => fileInputRef.current.click()}
                  className="absolute bottom-0 right-0 bg-blue-500 text-white p-2 rounded-full shadow-md hover:bg-blue-600 transition-colors"
                  disabled={isUploadingImage}
                >
                  {isUploadingImage ? (
                    <Loader size={16} className="animate-spin" />
                  ) : (
                    <Edit size={16} />
                  )}
                </button>
                
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleImageChange}
                  className="hidden"
                  accept="image/*"
                />
              </div>
              
              {profileImage && (
                <div className="mt-4 flex space-x-2">
                  <button
                    onClick={handleImageUpload}
                    className="px-3 py-1 bg-green-500 text-white text-sm rounded hover:bg-green-600 flex items-center"
                    disabled={isUploadingImage}
                  >
                    {isUploadingImage ? <Loader size={12} className="mr-1 animate-spin" /> : <Save size={12} className="mr-1" />}
                    Save
                  </button>
                  
                  <button
                    onClick={() => {
                      setProfileImage(null);
                      setImagePreview(userData?.profileImage || null);
                    }}
                    className="px-3 py-1 bg-gray-300 text-gray-700 text-sm rounded hover:bg-gray-400 flex items-center"
                    disabled={isUploadingImage}
                  >
                    <X size={12} className="mr-1" />
                    Cancel
                  </button>
                </div>
              )}
            </div>
            
            {/* User Info */}
            <div className="flex-1">
              {isEditingProfile ? (
                <form onSubmit={handleProfileUpdate} className="space-y-4">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                      Full Name
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                      Email Address
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  
                  <div className="flex space-x-3 pt-2">
                    <button
                      type="submit"
                      className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                    >
                      Save Changes
                    </button>
                    
                    <button
                      type="button"
                      onClick={() => {
                        setIsEditingProfile(false);
                        setFormData({
                          name: userData?.name || '',
                          email: userData?.email || '',
                          phone: userData?.phone || '',
                        });
                      }}
                      className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              ) : (
                <div className="space-y-4">
                  <h2 className="text-xl font-semibold text-gray-800 flex items-center">
                    {userData?.name}
                    <span className="ml-2 px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                      {getRoleDisplay(userData?.role)}
                    </span>
                  </h2>
                  
                  <div className="space-y-2">
                    <div className="flex items-center text-gray-600">
                      <Mail size={18} className="mr-2" />
                      <span>{userData?.email}</span>
                    </div>
                    
                    {userData?.phone && (
                      <div className="flex items-center text-gray-600">
                        <Phone size={18} className="mr-2" />
                        <span>{userData?.phone}</span>
                      </div>
                    )}
                    
                    <div className="flex items-center text-gray-600">
                      <Calendar size={18} className="mr-2" />
                      <span>Joined {new Date(userData?.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                  
                  <div className="pt-4 flex space-x-3">
                    <button
                      onClick={() => setIsEditingProfile(true)}
                      className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 flex items-center"
                    >
                      <Edit size={16} className="mr-2" />
                      Edit Profile
                    </button>
                    
                    <button
                      onClick={() => setIsChangingPassword(true)}
                      className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 flex items-center"
                    >
                      <Lock size={16} className="mr-2" />
                      Change Password
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      
      {/* Password Change Form */}
      {isChangingPassword && (
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-800">Change Password</h2>
          </div>
          
          <div className="p-6">
            <form onSubmit={handlePasswordUpdate} className="space-y-4">
              <div>
                <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700 mb-1">
                  Current Password
                </label>
                <input
                  type="password"
                  id="currentPassword"
                  name="currentPassword"
                  value={passwordData.currentPassword}
                  onChange={handlePasswordChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              
              <div>
                <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 mb-1">
                  New Password
                </label>
                <input
                  type="password"
                  id="newPassword"
                  name="newPassword"
                  value={passwordData.newPassword}
                  onChange={handlePasswordChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                  minLength={4}
                />
              </div>
              
              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                  Confirm New Password
                </label>
                <input
                  type="password"
                  id="confirmPassword"
                  name="confirmPassword"
                  value={passwordData.confirmPassword}
                  onChange={handlePasswordChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              
              <div className="flex space-x-3 pt-2">
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                >
                  Update Password
                </button>
                
                <button
                  type="button"
                  onClick={() => {
                    setIsChangingPassword(false);
                    setPasswordData({
                      currentPassword: '',
                      newPassword: '',
                      confirmPassword: '',
                    });
                  }}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserProfile;
