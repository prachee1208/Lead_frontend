import { useState, useEffect } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
// import './App.css'
import Login from './Components/Login'
import SignUp from './Components/SignUp'
import HeroSection1 from './Components/HeroSection'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import { getConnectionStatus, onConnectionChange } from './services/enhancedAPI'


import Contact from './Components/Contact'
import Footer from './Components/Footer'
import About from './Components/About'

import ServiceCard from './Components/ServiceCard'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import Navbar from './Components/Navbar'

// Admin Panel Components
import Dashboard from './Components/Admin_Panel/Dashboard'
import Leads from './Components/Admin_Panel/Leads'
import Team from './Components/Admin_Panel/Team'
import Report from './Components/Admin_Panel/Report'
import Calls from './Components/Admin_Panel/Calls'
import Reminder from './Components/Admin_Panel/Reminder'
import DashboardHome from './Components/Admin_Panel/DashboardHome'

// Manager Panel Components
import ManagerDashboard from './Components/Manager_Panel/Dashboard'
import ManagerDashboardHome from './Components/Manager_Panel/DashboardHome'
import EmployeeList from './Components/Manager_Panel/EmployeeList'
import AssignLeads from './Components/Manager_Panel/AssignleadsFixed'
import AssignedLeads from './Components/Manager_Panel/AssignedLeads'
import Reports from './Components/Manager_Panel/ReportsFixed'
import PerformanceAnalytics from './Components/Manager_Panel/PerformanceAnalytics'
import MessageSystem from './Components/Manager_Panel/MessageSystem'
import TestEmployees from './Components/Manager_Panel/TestEmployees'
import TestAssignedLeads from './Components/Manager_Panel/TestAssignedLeads'

// Employee Panel Components
import EmployeeDashboard from './Components/Employee_Panel/Dashboard'
import EmployeeDashboardHome from './Components/Employee_Panel/DashboardHome' // Updated to show only assigned leads
import LeadsList from './Components/Employee_Panel/LeadsList'
import LeadDetail from './Components/Employee_Panel/LeadDetail'
import FollowUps from './Components/Employee_Panel/FollowUps'
import DailyTasks from './Components/Employee_Panel/DailyTasks'
import UserProfile from './Components/Employee_Panel/UserProfile'
import TestEmployeeLeads from './Components/Employee_Panel/TestEmployeeLeads'

// Auth Components
import ProtectedRoute from './Components/ProtectedRoute'
function App() {
  const [isConnected, setIsConnected] = useState(getConnectionStatus());

  // Monitor connection status
  useEffect(() => {
    // Subscribe to connection status changes
    const unsubscribe = onConnectionChange((status) => {
      setIsConnected(status);

      // Show toast notification when connection status changes
      if (!status) {
        console.log('Connection to server lost');
      } else if (status && !isConnected) {
        console.log('Connection to server restored');
      }
    });

    // Cleanup subscription on unmount
    return () => {
      unsubscribe();
    };
  }, [isConnected]);

  return (

<>
    {/* Toast Container for notifications */}
    <ToastContainer
      position="top-right"
      autoClose={3000}
      hideProgressBar={false}
      newestOnTop
      closeOnClick
      rtl={false}
      pauseOnFocusLoss
      draggable
      pauseOnHover
    />

    <BrowserRouter>
      <Routes>

          {/* Public Routes */}
          <Route path='/' element={<Navbar/>}>
            <Route index element={<HeroSection1/>}/>
            <Route path='about' element={<About/>}/>
            <Route path='services' element={<ServiceCard/>}/>
            <Route path='contact' element={<Contact/>}/>
          </Route>

          {/* Login Route - Separate from Navbar layout */}
          <Route path='/login' element={<Login/>}/>
          {/* Admin Panel Routes - Protected for admin role */}
          <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
            <Route path='/dashboard-panel' element={<Dashboard/>}>
              <Route index element={<DashboardHome/>}/>
              <Route path='lead' element={<Leads/>}/>
              <Route path='reminder' element={<Reminder/>}/>
              <Route path='team' element={<Team/>}/>
              <Route path='report' element={<Report/>}/>
              <Route path='calls' element={<Calls/>}/>

              <Route path='messages' element={<MessageSystem/>}/>
            </Route>
          </Route>

          {/* Manager Panel Routes - Protected for manager role */}
          <Route element={<ProtectedRoute allowedRoles={['manager', 'admin']} />}>
            <Route path='/manager-panel' element={<ManagerDashboard/>}>
              <Route index element={<ManagerDashboardHome/>}/>
              <Route path='/manager-panel/employees' element={<EmployeeList/>}/>
              <Route path='/manager-panel/assign-leads' element={<AssignLeads/>}/>
              <Route path='/manager-panel/assigned-leads' element={<AssignedLeads/>}/>
              <Route path='/manager-panel/performance' element={<PerformanceAnalytics/>}/>
              <Route path='/manager-panel/reports' element={<Reports/>}/>

              <Route path='/manager-panel/test-employees' element={<TestEmployees/>}/>
              <Route path='/manager-panel/test-assigned-leads' element={<TestAssignedLeads/>}/>
            </Route>
          </Route>

          {/* Employee Panel Routes - Protected for employee role */}
          <Route element={<ProtectedRoute allowedRoles={['employee', 'manager', 'admin']} />}>
            <Route path='/employee-panel' element={<EmployeeDashboard/>}>
              <Route index element={<EmployeeDashboardHome/>}/>
              <Route path='/employee-panel/leads' element={<LeadsList/>}/>
              <Route path='/employee-panel/leads/:leadId' element={<LeadDetail/>}/>
              <Route path='/employee-panel/follow-ups' element={<FollowUps/>}/>
              <Route path='/employee-panel/daily-tasks' element={<DailyTasks/>}/>
              <Route path='/employee-panel/profile' element={<UserProfile/>}/>
              <Route path='/employee-panel/settings' element={<UserProfile/>}/>
              <Route path='/employee-panel/test-leads' element={<TestEmployeeLeads/>}/>
            </Route>
          </Route>

          <Route/>


    </Routes>
    </BrowserRouter>


   {/* <HeroSection/>
    <Login/>
      <HeroSection1/>
      <About/>
      <ServiceCard/>
      <Contact/> */}
      {/* <Footer/> */}
        {/* <Dashboard/> */}
       {/* <Leads/> */}
       {/* <Team/> */}
      {/* <Report/> */}
      {/* <Calls/> */}
      {/* <Reminder/>   */}





    </>



    )
}









export default App
