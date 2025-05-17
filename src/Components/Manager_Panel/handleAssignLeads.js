// This file contains the updated handleAssignLeads function
// to be used in the Assignleads.jsx component

const handleAssignLeads = async (
  selectedLeads,
  selectedEmployee,
  setIsAssigning,
  leadsAPI,
  leads,
  setLeads,
  setShowConfirmModal,
  setShowSuccessMessage,
  toast,
  setSelectedLeads,
  setError,
  fetchLeads
) => {
  if (selectedLeads.length === 0 || !selectedEmployee) {
    return;
  }

  setIsAssigning(true);

  try {
    // Get the current user (manager) from localStorage
    const userString = localStorage.getItem('user');
    let currentUser = null;
    
    if (userString) {
      try {
        currentUser = JSON.parse(userString);
      } catch (e) {
        console.error('Error parsing user from localStorage:', e);
      }
    }
    
    if (!currentUser || !currentUser._id) {
      throw new Error('You must be logged in to assign leads');
    }
    
    console.log('Current user:', currentUser);
    console.log('Selected employee:', selectedEmployee);
    console.log('Selected leads:', selectedLeads);
    
    // Create an array of promises for each lead assignment
    const assignmentPromises = selectedLeads.map(leadId => {
      console.log(`Assigning lead ${leadId} to employee ${selectedEmployee.id}`);
      return leadsAPI.assign(leadId, currentUser._id, selectedEmployee.id);
    });

    // Wait for all assignments to complete
    const results = await Promise.all(assignmentPromises);
    console.log('Assignment results:', results);

    // Update leads with new assignment
    const updatedLeads = leads.map(lead => {
      if (selectedLeads.includes(lead.id)) {
        return {
          ...lead,
          assignedTo: selectedEmployee.name,
          assignedToId: selectedEmployee.id
        };
      }
      return lead;
    });

    setLeads(updatedLeads);
    setShowConfirmModal(false);
    setShowSuccessMessage(true);
    toast.success(`Successfully assigned ${selectedLeads.length} lead(s) to ${selectedEmployee.name}`);

    // Reset selection after assignment
    setTimeout(() => {
      setSelectedLeads([]);
      setShowSuccessMessage(false);
    }, 3000);
    
    // Refresh leads to get the updated data
    fetchLeads();
  } catch (err) {
    console.error('Error assigning leads:', err);
    setError('Failed to assign leads. Please try again.');
    toast.error('Failed to assign leads: ' + (err.message || 'Unknown error'));
  } finally {
    setIsAssigning(false);
  }
};

export default handleAssignLeads;
