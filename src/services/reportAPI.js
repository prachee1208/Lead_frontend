import api from './api';

// Report API endpoints
export const reportAPI = {
  // Get employee performance data
  getEmployeePerformance: async (dateRange = 'last-30-days') => {
    try {
      // First try to get data from existing endpoints
      const employeesResponse = await api.get('/users/role/employee');
      const leadsResponse = await api.get('/leads');
      
      if (employeesResponse.data?.data && leadsResponse.data?.data) {
        const employees = employeesResponse.data.data;
        const leads = leadsResponse.data.data;
        
        // Process the data to calculate performance metrics
        const performanceData = employees.map(employee => {
          // Filter leads assigned to this employee
          const employeeLeads = leads.filter(lead => 
            lead.assignedEmployee && lead.assignedEmployee._id === employee._id
          );
          
          // Count leads by status
          const leadsAssigned = employeeLeads.length;
          const leadsConverted = employeeLeads.filter(lead => 
            lead.status === 'Closed' || lead.status === 'Converted'
          ).length;
          
          // Calculate conversion rate
          const conversionRate = leadsAssigned > 0 
            ? Math.round((leadsConverted / leadsAssigned) * 100) 
            : 0;
          
          return {
            id: employee._id,
            name: employee.name,
            email: employee.email,
            leadsAssigned,
            leadsConverted,
            conversionRate
          };
        });
        
        return {
          success: true,
          data: performanceData
        };
      }
      
      throw new Error('Failed to process employee performance data');
    } catch (error) {
      console.error('Error fetching employee performance:', error);
      throw error.response?.data || error.message;
    }
  },
  
  // Get lead status distribution
  getLeadStatusDistribution: async (dateRange = 'last-30-days') => {
    try {
      const response = await api.get('/leads');
      
      if (response.data?.data) {
        const leads = response.data.data;
        
        // Count leads by status
        const statusCounts = {};
        leads.forEach(lead => {
          const status = lead.status || 'Unknown';
          statusCounts[status] = (statusCounts[status] || 0) + 1;
        });
        
        // Convert to array format for charts
        const statusData = Object.entries(statusCounts).map(([name, value]) => ({
          name,
          value
        }));
        
        return {
          success: true,
          data: statusData
        };
      }
      
      throw new Error('Failed to process lead status data');
    } catch (error) {
      console.error('Error fetching lead status distribution:', error);
      throw error.response?.data || error.message;
    }
  },
  
  // Get lead source distribution
  getLeadSourceDistribution: async (dateRange = 'last-30-days') => {
    try {
      const response = await api.get('/leads');
      
      if (response.data?.data) {
        const leads = response.data.data;
        
        // Count leads by source
        const sourceCounts = {};
        leads.forEach(lead => {
          const source = lead.source || 'Unknown';
          sourceCounts[source] = (sourceCounts[source] || 0) + 1;
        });
        
        // Convert to array format for charts
        const sourceData = Object.entries(sourceCounts).map(([name, value]) => ({
          name,
          value
        }));
        
        return {
          success: true,
          data: sourceData
        };
      }
      
      throw new Error('Failed to process lead source data');
    } catch (error) {
      console.error('Error fetching lead source distribution:', error);
      throw error.response?.data || error.message;
    }
  },
  
  // Get conversion trend data (weekly)
  getConversionTrend: async (dateRange = 'last-30-days') => {
    try {
      const response = await api.get('/leads');
      
      if (response.data?.data) {
        const leads = response.data.data;
        
        // Group leads by week
        const weeklyData = {};
        const now = new Date();
        
        // Create weeks (last 4 weeks)
        for (let i = 0; i < 4; i++) {
          const weekStart = new Date(now);
          weekStart.setDate(now.getDate() - (7 * i) - now.getDay());
          const weekLabel = `Week ${4-i}`;
          weeklyData[weekLabel] = { conversions: 0, leads: 0 };
        }
        
        // Count leads and conversions by week
        leads.forEach(lead => {
          const leadDate = new Date(lead.createdAt);
          const weeksDiff = Math.floor((now - leadDate) / (7 * 24 * 60 * 60 * 1000));
          
          if (weeksDiff < 4) {
            const weekLabel = `Week ${4-weeksDiff}`;
            weeklyData[weekLabel].leads += 1;
            
            if (lead.status === 'Closed' || lead.status === 'Converted') {
              weeklyData[weekLabel].conversions += 1;
            }
          }
        });
        
        // Convert to array format for charts
        const trendData = Object.entries(weeklyData).map(([name, data]) => ({
          name,
          ...data
        }));
        
        return {
          success: true,
          data: trendData
        };
      }
      
      throw new Error('Failed to process conversion trend data');
    } catch (error) {
      console.error('Error fetching conversion trend:', error);
      throw error.response?.data || error.message;
    }
  }
};

export default reportAPI;
