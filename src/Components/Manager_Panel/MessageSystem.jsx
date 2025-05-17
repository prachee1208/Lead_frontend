import { useState, useEffect, useRef } from 'react';
import { 
    MessageSquare, Search, Send, Paperclip, 
    Image, File, X, User, Phone, Mail, 
    MoreVertical, ChevronLeft, Info
} from 'lucide-react';
import { useLocation } from 'react-router-dom';

export default function MessageSystem() {
    const location = useLocation();
    const queryParams = new URLSearchParams(location.search);
    const preSelectedEmployeeId = queryParams.get('employee');
    
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedEmployee, setSelectedEmployee] = useState(null);
    const [newMessage, setNewMessage] = useState('');
    const [showAttachmentOptions, setShowAttachmentOptions] = useState(false);
    const [showEmployeeInfo, setShowEmployeeInfo] = useState(false);
    const [isMobileView, setIsMobileView] = useState(false);
    const [showConversationOnMobile, setShowConversationOnMobile] = useState(false);
    
    const messagesEndRef = useRef(null);
    
    // Mock data - in a real app, this would come from your API
    const employees = [
        { 
            id: 1, 
            name: 'John Smith', 
            avatar: 'JS',
            role: 'Sales Representative',
            email: 'john@example.com',
            phone: '(555) 123-4567',
            lastActive: 'Online',
            unreadCount: 0
        },
        { 
            id: 2, 
            name: 'Sarah Johnson', 
            avatar: 'SJ',
            role: 'Sales Representative',
            email: 'sarah@example.com',
            phone: '(555) 234-5678',
            lastActive: '5 minutes ago',
            unreadCount: 2
        },
        { 
            id: 3, 
            name: 'Michael Brown', 
            avatar: 'MB',
            role: 'Sales Representative',
            email: 'michael@example.com',
            phone: '(555) 345-6789',
            lastActive: '30 minutes ago',
            unreadCount: 0
        },
        { 
            id: 4, 
            name: 'Emily Davis', 
            avatar: 'ED',
            role: 'Senior Sales Representative',
            email: 'emily@example.com',
            phone: '(555) 456-7890',
            lastActive: '2 hours ago',
            unreadCount: 1
        },
        { 
            id: 5, 
            name: 'Robert Wilson', 
            avatar: 'RW',
            role: 'Sales Representative',
            email: 'robert@example.com',
            phone: '(555) 567-8901',
            lastActive: 'Yesterday',
            unreadCount: 0
        }
    ];
    
    const [conversations, setConversations] = useState({
        1: [
            { id: 1, sender: 'manager', text: 'Hi John, how are things going with the Acme Corp lead?', timestamp: '2023-05-16 09:30 AM' },
            { id: 2, sender: 'employee', text: 'Good morning! I just had a call with them yesterday. They\'re interested in our premium package.', timestamp: '2023-05-16 09:35 AM' },
            { id: 3, sender: 'manager', text: 'That\'s great news! What\'s your next step with them?', timestamp: '2023-05-16 09:37 AM' },
            { id: 4, sender: 'employee', text: 'I\'m preparing a detailed proposal with pricing options. Should have it ready by tomorrow.', timestamp: '2023-05-16 09:40 AM' },
            { id: 5, sender: 'manager', text: 'Perfect. Make sure to highlight the ROI section, that\'s what they were most interested in during the initial meeting.', timestamp: '2023-05-16 09:42 AM' },
            { id: 6, sender: 'employee', text: 'Will do! I\'ll also include case studies from similar clients.', timestamp: '2023-05-16 09:45 AM' }
        ],
        2: [
            { id: 1, sender: 'manager', text: 'Hi Sarah, just checking in on the XYZ Inc lead. Any updates?', timestamp: '2023-05-15 02:15 PM' },
            { id: 2, sender: 'employee', text: 'I\'ve sent them the initial proposal but haven\'t heard back yet.', timestamp: '2023-05-15 02:20 PM' },
            { id: 3, sender: 'manager', text: 'It\'s been a week since your last contact. I suggest following up with a phone call.', timestamp: '2023-05-15 02:25 PM' },
            { id: 4, sender: 'manager', text: 'Also, they mentioned budget concerns in the initial meeting. Maybe we can offer the quarterly payment option?', timestamp: '2023-05-15 02:27 PM' }
        ],
        3: [
            { id: 1, sender: 'employee', text: 'Quick question about the Tech Solutions lead - they\'re asking for a custom integration. How should I proceed?', timestamp: '2023-05-14 11:05 AM' },
            { id: 2, sender: 'manager', text: 'Let\'s involve the technical team. I\'ll set up a meeting for tomorrow.', timestamp: '2023-05-14 11:10 AM' },
            { id: 3, sender: 'employee', text: 'Thanks! That would be helpful.', timestamp: '2023-05-14 11:12 AM' }
        ],
        4: [
            { id: 1, sender: 'manager', text: 'Emily, congratulations on closing the Global Services deal!', timestamp: '2023-05-13 04:30 PM' },
            { id: 2, sender: 'employee', text: 'Thank you! It was a team effort.', timestamp: '2023-05-13 04:35 PM' },
            { id: 3, sender: 'manager', text: 'Your presentation was excellent. Would you be willing to share your approach with the team in our next meeting?', timestamp: '2023-05-13 04:40 PM' },
            { id: 4, sender: 'manager', text: 'Also, I\'ve assigned you a new lead - Innovate Inc. They\'re looking for a solution similar to what Global Services implemented.', timestamp: '2023-05-16 09:15 AM' }
        ],
        5: [
            { id: 1, sender: 'employee', text: 'I\'m having trouble reaching the First Choice contact. Their phone goes to voicemail and no response to emails.', timestamp: '2023-05-12 10:20 AM' },
            { id: 2, sender: 'manager', text: 'Try reaching out to their office manager. I\'ll send you the contact details.', timestamp: '2023-05-12 10:25 AM' },
            { id: 3, sender: 'manager', text: 'Here\'s the info: Jane Doe, Office Manager, (555) 789-0123, jane@firstchoice.com', timestamp: '2023-05-12 10:30 AM' },
            { id: 4, sender: 'employee', text: 'Got it, thanks! I\'ll try contacting her today.', timestamp: '2023-05-12 10:35 AM' }
        ]
    });
    
    // Set pre-selected employee if provided in URL
    useEffect(() => {
        if (preSelectedEmployeeId) {
            const employee = employees.find(emp => emp.id === parseInt(preSelectedEmployeeId));
            if (employee) {
                setSelectedEmployee(employee);
                setShowConversationOnMobile(true);
                // Mark messages as read
                if (employee.unreadCount > 0) {
                    const updatedEmployees = employees.map(emp => 
                        emp.id === employee.id ? { ...emp, unreadCount: 0 } : emp
                    );
                    // In a real app, you would update this in your state management system
                }
            }
        }
    }, [preSelectedEmployeeId]);
    
    // Check for mobile view
    useEffect(() => {
        const handleResize = () => {
            setIsMobileView(window.innerWidth < 768);
        };
        
        handleResize();
        window.addEventListener('resize', handleResize);
        
        return () => {
            window.removeEventListener('resize', handleResize);
        };
    }, []);
    
    // Scroll to bottom of messages when conversation changes
    useEffect(() => {
        if (messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [selectedEmployee, conversations]);
    
    const filteredEmployees = employees.filter(employee => 
        employee.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
    
    const handleSendMessage = () => {
        if (!newMessage.trim() || !selectedEmployee) return;
        
        const updatedConversations = { ...conversations };
        const employeeId = selectedEmployee.id;
        
        if (!updatedConversations[employeeId]) {
            updatedConversations[employeeId] = [];
        }
        
        updatedConversations[employeeId].push({
            id: updatedConversations[employeeId].length + 1,
            sender: 'manager',
            text: newMessage,
            timestamp: new Date().toLocaleString('en-US', { 
                year: 'numeric', 
                month: '2-digit', 
                day: '2-digit',
                hour: '2-digit',
                minute: '2-digit',
                hour12: true
            })
        });
        
        setConversations(updatedConversations);
        setNewMessage('');
    };
    
    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
        }
    };
    
    const selectEmployee = (employee) => {
        setSelectedEmployee(employee);
        setShowConversationOnMobile(true);
        
        // Mark messages as read
        if (employee.unreadCount > 0) {
            const updatedEmployees = employees.map(emp => 
                emp.id === employee.id ? { ...emp, unreadCount: 0 } : emp
            );
            // In a real app, you would update this in your state management system
        }
    };
    
    const handleAttachment = (type) => {
        // In a real app, this would open a file picker or handle the attachment
        alert(`Attaching ${type}...`);
        setShowAttachmentOptions(false);
    };
    
    return (
        <div className="h-[calc(100vh-12rem)] bg-white rounded-lg shadow overflow-hidden">
            <div className="flex h-full">
                {/* Employees List - Hidden on mobile when conversation is shown */}
                <div className={`w-full md:w-1/3 border-r border-gray-200 ${isMobileView && showConversationOnMobile ? 'hidden' : 'block'}`}>
                    <div className="p-4 border-b border-gray-200">
                        <h2 className="text-lg font-medium text-gray-800 mb-4">Messages</h2>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Search size={16} className="text-gray-400" />
                            </div>
                            <input
                                type="text"
                                placeholder="Search employees..."
                                className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#022d38] focus:border-[#022d38]"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                    </div>
                    <div className="overflow-y-auto h-[calc(100%-5rem)]">
                        <ul className="divide-y divide-gray-200">
                            {filteredEmployees.map(employee => (
                                <li 
                                    key={employee.id}
                                    className={`hover:bg-gray-50 cursor-pointer ${selectedEmployee?.id === employee.id ? 'bg-gray-50' : ''}`}
                                    onClick={() => selectEmployee(employee)}
                                >
                                    <div className="flex items-center px-4 py-3 relative">
                                        <div className="relative">
                                            <div className="h-10 w-10 rounded-full bg-gradient-to-tr from-indigo-500 to-[#022d38] flex items-center justify-center text-white font-bold">
                                                {employee.avatar}
                                            </div>
                                            {employee.lastActive === 'Online' && (
                                                <div className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-green-500 border-2 border-white"></div>
                                            )}
                                        </div>
                                        <div className="ml-3 flex-1">
                                            <div className="flex items-center justify-between">
                                                <div className="text-sm font-medium text-gray-900">{employee.name}</div>
                                                <div className="text-xs text-gray-500">{
                                                    conversations[employee.id] && conversations[employee.id].length > 0 
                                                        ? conversations[employee.id][conversations[employee.id].length - 1].timestamp.split(' ')[0]
                                                        : ''
                                                }</div>
                                            </div>
                                            <div className="text-sm text-gray-500 truncate">
                                                {conversations[employee.id] && conversations[employee.id].length > 0 
                                                    ? `${conversations[employee.id][conversations[employee.id].length - 1].sender === 'manager' ? 'You: ' : ''}${conversations[employee.id][conversations[employee.id].length - 1].text}`
                                                    : 'No messages yet'
                                                }
                                            </div>
                                        </div>
                                        {employee.unreadCount > 0 && (
                                            <div className="absolute top-3 right-3 bg-indigo-600 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                                                {employee.unreadCount}
                                            </div>
                                        )}
                                    </div>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
                
                {/* Conversation Area */}
                <div className={`w-full md:w-2/3 flex flex-col ${isMobileView && !showConversationOnMobile ? 'hidden' : 'block'}`}>
                    {selectedEmployee ? (
                        <>
                            {/* Conversation Header */}
                            <div className="p-4 border-b border-gray-200 flex items-center justify-between">
                                <div className="flex items-center">
                                    {isMobileView && (
                                        <button 
                                            className="mr-2 text-gray-500"
                                            onClick={() => setShowConversationOnMobile(false)}
                                        >
                                            <ChevronLeft size={20} />
                                        </button>
                                    )}
                                    <div className="h-10 w-10 rounded-full bg-gradient-to-tr from-indigo-500 to-[#022d38] flex items-center justify-center text-white font-bold">
                                        {selectedEmployee.avatar}
                                    </div>
                                    <div className="ml-3">
                                        <div className="text-sm font-medium text-gray-900">{selectedEmployee.name}</div>
                                        <div className="text-xs text-gray-500">{selectedEmployee.lastActive}</div>
                                    </div>
                                </div>
                                <button 
                                    className="text-gray-500 hover:text-gray-700"
                                    onClick={() => setShowEmployeeInfo(!showEmployeeInfo)}
                                >
                                    <Info size={20} />
                                </button>
                            </div>
                            
                            {/* Conversation Body */}
                            <div className="flex-1 overflow-y-auto p-4 bg-gray-50">
                                <div className="space-y-4">
                                    {conversations[selectedEmployee.id] && conversations[selectedEmployee.id].map(message => (
                                        <div 
                                            key={message.id} 
                                            className={`flex ${message.sender === 'manager' ? 'justify-end' : 'justify-start'}`}
                                        >
                                            <div 
                                                className={`max-w-xs md:max-w-md rounded-lg px-4 py-2 ${
                                                    message.sender === 'manager' 
                                                        ? 'bg-[#022d38] text-white' 
                                                        : 'bg-white border border-gray-200 text-gray-800'
                                                }`}
                                            >
                                                <div className="text-sm">{message.text}</div>
                                                <div className={`text-xs mt-1 ${message.sender === 'manager' ? 'text-gray-300' : 'text-gray-500'}`}>
                                                    {message.timestamp.split(' ')[3]} {message.timestamp.split(' ')[4]}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                    <div ref={messagesEndRef} />
                                </div>
                            </div>
                            
                            {/* Message Input */}
                            <div className="p-4 border-t border-gray-200">
                                <div className="flex items-end">
                                    <div className="relative flex-1">
                                        <textarea
                                            placeholder="Type a message..."
                                            className="w-full border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#022d38] focus:border-[#022d38] py-2 px-3 resize-none"
                                            rows="3"
                                            value={newMessage}
                                            onChange={(e) => setNewMessage(e.target.value)}
                                            onKeyPress={handleKeyPress}
                                        ></textarea>
                                        <div className="absolute bottom-2 right-2 flex items-center space-x-2">
                                            <div className="relative">
                                                <button 
                                                    className="text-gray-500 hover:text-gray-700"
                                                    onClick={() => setShowAttachmentOptions(!showAttachmentOptions)}
                                                >
                                                    <Paperclip size={18} />
                                                </button>
                                                
                                                {showAttachmentOptions && (
                                                    <div className="absolute bottom-8 right-0 bg-white rounded-md shadow-lg py-1 z-10">
                                                        <button
                                                            onClick={() => handleAttachment('image')}
                                                            className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                                        >
                                                            <Image size={16} className="mr-2 text-indigo-500" />
                                                            Image
                                                        </button>
                                                        <button
                                                            onClick={() => handleAttachment('file')}
                                                            className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                                        >
                                                            <File size={16} className="mr-2 text-blue-500" />
                                                            Document
                                                        </button>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                    <button
                                        className="ml-3 px-4 py-2 bg-[#022d38] text-white rounded-md hover:bg-[#043c4a] flex items-center"
                                        onClick={handleSendMessage}
                                        disabled={!newMessage.trim()}
                                    >
                                        <Send size={16} className="mr-2" />
                                        Send
                                    </button>
                                </div>
                            </div>
                        </>
                    ) : (
                        <div className="flex-1 flex items-center justify-center bg-gray-50">
                            <div className="text-center">
                                <MessageSquare size={48} className="mx-auto text-gray-300 mb-4" />
                                <h3 className="text-lg font-medium text-gray-800">Your Messages</h3>
                                <p className="mt-1 text-sm text-gray-500">Select an employee to start messaging</p>
                            </div>
                        </div>
                    )}
                </div>
                
                {/* Employee Info Sidebar */}
                {showEmployeeInfo && selectedEmployee && (
                    <div className="w-full md:w-1/4 border-l border-gray-200 bg-white overflow-y-auto">
                        <div className="p-4 border-b border-gray-200 flex justify-between items-center">
                            <h3 className="text-lg font-medium text-gray-800">Employee Info</h3>
                            <button 
                                className="text-gray-500 hover:text-gray-700"
                                onClick={() => setShowEmployeeInfo(false)}
                            >
                                <X size={20} />
                            </button>
                        </div>
                        <div className="p-4">
                            <div className="flex flex-col items-center mb-6">
                                <div className="h-20 w-20 rounded-full bg-gradient-to-tr from-indigo-500 to-[#022d38] flex items-center justify-center text-white text-2xl font-bold mb-3">
                                    {selectedEmployee.avatar}
                                </div>
                                <h4 className="text-xl font-semibold text-gray-900">{selectedEmployee.name}</h4>
                                <p className="text-sm text-gray-500">{selectedEmployee.role}</p>
                            </div>
                            
                            <div className="space-y-4">
                                <div>
                                    <h5 className="text-sm font-medium text-gray-500 mb-2">Contact Information</h5>
                                    <div className="space-y-2">
                                        <div className="flex items-center">
                                            <Mail size={16} className="text-gray-400 mr-2" />
                                            <a href={`mailto:${selectedEmployee.email}`} className="text-sm text-blue-600 hover:underline">
                                                {selectedEmployee.email}
                                            </a>
                                        </div>
                                        <div className="flex items-center">
                                            <Phone size={16} className="text-gray-400 mr-2" />
                                            <a href={`tel:${selectedEmployee.phone}`} className="text-sm text-blue-600 hover:underline">
                                                {selectedEmployee.phone}
                                            </a>
                                        </div>
                                    </div>
                                </div>
                                
                                <div>
                                    <h5 className="text-sm font-medium text-gray-500 mb-2">Quick Actions</h5>
                                    <div className="space-y-2">
                                        <button className="w-full flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50">
                                            View Performance
                                        </button>
                                        <button className="w-full flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50">
                                            Assign Leads
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
