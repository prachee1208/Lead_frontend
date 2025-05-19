import { useState, useEffect } from 'react';
import {
  Plus, Users, Filter, Search, MoreHorizontal, Edit,
  Trash2, UserCheck, AlertCircle, CheckCircle, X,
  RefreshCw, ChevronDown, ArrowUpDown, Loader, Eye
} from 'lucide-react';
import { toast } from 'react-toastify';
import { leadsAPI, usersAPI } from '../../services/api';

export default function SalesLeadDashboard() {
  // State for leads data
  const [leads, setLeads] = useState([]);
  const [totalLeads, setTotalLeads] = useState(0);

  // Modal states
  const [showAddLeadModal, setShowAddLeadModal] = useState(false);
  const [showEditLeadModal, setShowEditLeadModal] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showViewLeadModal, setShowViewLeadModal] = useState(false);

  // Selected lead and form data
  const [selectedLead, setSelectedLead] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    company: '',
    email: '',
    phone: '',
    value: '',
    source: '',
    notes: '',
    status: 'New'
  });

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All Statuses');
  const [assigneeFilter, setAssigneeFilter] = useState('All Team Members');
  const [sortField, setSortField] = useState('createdAt');
  const [sortDirection, setSortDirection] = useState('desc');

  // Pagination
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [pagination, setPagination] = useState({});

  // Loading states
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingLeads, setIsLoadingLeads] = useState(true);

  // Team members
  const [team, setTeam] = useState([]);
  const [isLoadingTeam, setIsLoadingTeam] = useState(true);

  // Fetch leads from API
  useEffect(() => {
    fetchLeads();
    fetchTeamMembers();
  }, [page, limit, sortField, sortDirection]);

  // Fetch leads
  const fetchLeads = async () => {
    setIsLoadingLeads(true);
    try {
      const params = {
        page,
        limit: 100, // Set a high limit to get all leads
        sort: `${sortDirection === 'desc' ? '-' : ''}${sortField}`,
        status: statusFilter !== 'All Statuses' ? statusFilter : undefined,
        search: searchQuery || undefined,
        assignedTo: assigneeFilter === 'Unassigned' ? 'unassigned' :
                  assigneeFilter !== 'All Team Members' ? assigneeFilter : undefined
      };

      const response = await leadsAPI.getAll(params);
      if (response && response.data) {
        setLeads(response.data.data || []);
        setTotalLeads(response.data.count || 0);
        setPagination(response.data.pagination || {});
      }
    } catch (error) {
      console.error('Error fetching leads:', error);
      toast.error('Failed to fetch leads: ' + (error.message || 'Unknown error'));
      setLeads([]);
      setTotalLeads(0);
      setPagination({});
    } finally {
      setIsLoadingLeads(false);
    }
  };

  // Fetch team members (managers only for admin)
  const fetchTeamMembers = async () => {
    setIsLoadingTeam(true);
    try {
      const response = await usersAPI.getAllWithRoles();
      if (response && response.data && response.data.data) {
        // Filter only managers for admin panel
        const managers = response.data.data
          .filter(user => user.role === 'manager')
          .map(user => ({
            id: user._id,
            name: user.name,
            email: user.email,
            role: user.role
          }));
        setTeam(managers);
      }
    } catch (error) {
      console.error('Error fetching team members:', error);
      toast.error('Failed to fetch team members');
      setTeam([]);
    } finally {
      setIsLoadingTeam(false);
    }
  };

  const leadSources = [
    'Website',
    'Referral',
    'Cold Call',
    'LinkedIn',
    'Trade Show',
    'Email Campaign',
    'Other'
  ];

  const leadStatuses = [
    'New',
    'Contacted',
    'Qualified',
    'Proposal',
    'Negotiation',
    'Closed Won',
    'Closed Lost'
  ];

  // Initialize form data when editing a lead
  useEffect(() => {
    if (selectedLead && showEditLeadModal) {
      setFormData({
        name: selectedLead.name || '',
        company: selectedLead.company || '',
        email: selectedLead.email || '',
        phone: selectedLead.phone || '',
        value: selectedLead.value || '',
        source: selectedLead.source || '',
        notes: selectedLead.notes || '',
        status: selectedLead.status || 'New'
      });
    }
  }, [selectedLead, showEditLeadModal]);

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  // Handle lead assignment to manager
  const handleAssignToManager = async (leadId, managerId) => {
    setIsLoading(true);
    try {
      const response = await leadsAPI.assignToManager(leadId, managerId);
      if (response && response.data) {
        // Update the leads list with the new assignment
        setLeads(leads.map(lead =>
          lead._id === leadId ? response.data.data : lead
        ));
        setShowAssignModal(false);
        toast.success('Lead assigned to manager successfully');
      }
    } catch (error) {
      console.error('Error assigning lead to manager:', error);
      toast.error('Failed to assign lead: ' + (error.message || 'Unknown error'));
    } finally {
      setIsLoading(false);
    }
  };

  // Handle adding a new lead
  const handleAddLead = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const newLeadData = {
        name: formData.name,
        company: formData.company,
        email: formData.email,
        phone: formData.phone,
        value: formData.value,
        source: formData.source,
        notes: formData.notes,
        status: 'New'
      };

      const response = await leadsAPI.create(newLeadData);
      if (response && response.data) {
        setLeads([...leads, response.data.data]);
        setShowAddLeadModal(false);
        setFormData({
          name: '',
          company: '',
          email: '',
          phone: '',
          value: '',
          source: '',
          notes: '',
          status: 'New'
        });
        toast.success('Lead added successfully');
      }
    } catch (error) {
      console.error('Error adding lead:', error);
      toast.error('Failed to add lead: ' + (error.message || 'Unknown error'));
    } finally {
      setIsLoading(false);
    }
  };

  // Handle updating a lead
  const handleUpdateLead = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const updatedLeadData = {
        name: formData.name,
        company: formData.company,
        email: formData.email,
        phone: formData.phone,
        value: formData.value,
        source: formData.source,
        notes: formData.notes,
        status: formData.status
      };

      const response = await leadsAPI.update(selectedLead._id, updatedLeadData);
      if (response && response.data) {
        setLeads(leads.map(lead =>
          lead._id === selectedLead._id ? response.data.data : lead
        ));
        setShowEditLeadModal(false);
        setSelectedLead(null);
        toast.success('Lead updated successfully');
      }
    } catch (error) {
      console.error('Error updating lead:', error);
      toast.error('Failed to update lead: ' + (error.message || 'Unknown error'));
    } finally {
      setIsLoading(false);
    }
  };

  // Handle deleting a lead
  const handleDeleteLead = async () => {
    setIsLoading(true);

    try {
      await leadsAPI.delete(selectedLead._id);
      setLeads(leads.filter(lead => lead._id !== selectedLead._id));
      setShowDeleteModal(false);
      setSelectedLead(null);
      toast.success('Lead deleted successfully');
    } catch (error) {
      console.error('Error deleting lead:', error);
      toast.error('Failed to delete lead: ' + (error.message || 'Unknown error'));
    } finally {
      setIsLoading(false);
    }
  };

  // Handle sorting
  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  // Filter and sort leads
  const getFilteredAndSortedLeads = () => {
    // First, filter the leads
    let result = leads.filter(lead => {
      // Apply search filter
      const matchesSearch =
        lead.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        lead.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
        lead.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (lead.notes && lead.notes.toLowerCase().includes(searchQuery.toLowerCase()));

      // Apply status filter
      const matchesStatus =
        statusFilter === 'All Statuses' ||
        lead.status === statusFilter;

      // Apply assignee filter
      const matchesAssignee =
        assigneeFilter === 'All Team Members' ||
        (assigneeFilter === 'Unassigned' && !lead.assignedTo) ||
        (lead.assignedTo && typeof lead.assignedTo === 'object' && lead.assignedTo.name === assigneeFilter) ||
        (lead.assignedTo && typeof lead.assignedTo === 'string' && lead.assignedTo === assigneeFilter);

      return matchesSearch && matchesStatus && matchesAssignee;
    });

    // Then, sort the filtered leads
    result.sort((a, b) => {
      let comparison = 0;

      // Handle different field types
      switch (sortField) {
        case 'name':
          comparison = a.name.localeCompare(b.name);
          break;
        case 'company':
          comparison = a.company.localeCompare(b.company);
          break;
        case 'status':
          comparison = a.status.localeCompare(b.status);
          break;
        case 'value':
          // Extract numeric value from string (e.g., "$5,000" -> 5000)
          const valueA = parseFloat(a.value.replace(/[^0-9.-]+/g, '')) || 0;
          const valueB = parseFloat(b.value.replace(/[^0-9.-]+/g, '')) || 0;
          comparison = valueA - valueB;
          break;
        case 'createdAt':
          comparison = new Date(a.createdAt) - new Date(b.createdAt);
          break;
        default:
          comparison = 0;
      }

      // Apply sort direction
      return sortDirection === 'asc' ? comparison : -comparison;
    });

    return result;
  };

  const filteredAndSortedLeads = getFilteredAndSortedLeads();

  const statusColors = {
    'New': 'bg-blue-100 text-blue-800',
    'Contacted': 'bg-yellow-100 text-yellow-800',
    'Qualified': 'bg-green-100 text-green-800',
    'Proposal': 'bg-purple-100 text-purple-800',
    'Negotiation': 'bg-orange-100 text-orange-800',
    'Closed Won': 'bg-emerald-100 text-emerald-800',
    'Closed Lost': 'bg-red-100 text-red-800'
  };

  return (
    <div className="bg-gray-50 min-h-screen  overflow-auto">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8 flex justify-between items-center">
          <h1 className="text-2xl font-semibold text-gray-900">Sales Lead Management</h1>
          <button
            onClick={() => setShowAddLeadModal(true)}
            className="bg-[#043c4a] text-white px-4 py-2 rounded-md flex items-center space-x-2 hover:bg-[#022d38]"
          >
            <Plus size={18} />
            <span>Add Lead</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
        {/* Filters and Search */}
        <div className="bg-white p-4 rounded-lg shadow mb-6">
          <div className="flex flex-col md:flex-row justify-between items-center mb-4 space-y-3 md:space-y-0">
            <div className="flex flex-wrap items-center gap-4">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search size={18} className="text-gray-400" />
                </div>
                <input
                  type="text"
                  placeholder="Search leads..."
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-md w-full md:w-64 focus:outline-none focus:ring-2 focus:ring-[#022d38] focus:border-[#022d38]"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <div className="flex items-center space-x-2">
                <Filter size={18} className="text-gray-500" />
                <select
                  className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#022d38] focus:border-[#022d38]"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <option value="All Statuses">All Statuses</option>
                  {leadStatuses.map((status, index) => (
                    <option key={index} value={status}>{status}</option>
                  ))}
                </select>
              </div>
              <div className="flex items-center space-x-2">
                <Users size={18} className="text-gray-500" />
                <select
                  className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#022d38] focus:border-[#022d38]"
                  value={assigneeFilter}
                  onChange={(e) => setAssigneeFilter(e.target.value)}
                >
                  <option value="All Team Members">All Team Members</option>
                  {team.map((member, index) => (
                    <option key={index} value={member.name}>{member.name}</option>
                  ))}
                  <option value="Unassigned">Unassigned</option>
                </select>
              </div>
            </div>
            <div className="flex items-center">
              <button
                onClick={() => {
                  setSearchQuery('');
                  setStatusFilter('All Statuses');
                  setAssigneeFilter('All Team Members');
                  setSortField('createdAt');
                  setSortDirection('desc');
                }}
                className="px-3 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 flex items-center space-x-1"
              >
                <RefreshCw size={16} />
                <span>Reset Filters</span>
              </button>
            </div>
          </div>
          <div className="flex justify-between items-center">
            <div className="text-sm text-gray-500">
              Showing {filteredAndSortedLeads.length} of {leads.length} leads
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-500">Sort by:</span>
              <select
                className="border border-gray-300 rounded-md px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-[#022d38] focus:border-[#022d38]"
                value={sortField}
                onChange={(e) => {
                  setSortField(e.target.value);
                  setSortDirection('asc');
                }}
              >
                <option value="createdAt">Date Created</option>
                <option value="name">Name</option>
                <option value="company">Company</option>
                <option value="status">Status</option>
                <option value="value">Value</option>
              </select>
              <button
                onClick={() => setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')}
                className="p-1 rounded-md hover:bg-gray-100"
              >
                {sortDirection === 'asc' ? (
                  <ChevronDown size={18} className="text-gray-500" />
                ) : (
                  <ChevronDown size={18} className="text-gray-500 transform rotate-180" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Leads Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Lead</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Assigned To</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Value</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredAndSortedLeads.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-8 text-center text-gray-500">
                    <div className="flex flex-col items-center">
                      <AlertCircle size={24} className="text-gray-400 mb-2" />
                      <p>No leads found matching your criteria</p>
                      <button
                        onClick={() => {
                          setSearchQuery('');
                          setStatusFilter('All Statuses');
                          setAssigneeFilter('All Team Members');
                        }}
                        className="mt-2 text-sm text-indigo-600 hover:text-indigo-800"
                      >
                        Clear filters
                      </button>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredAndSortedLeads.map((lead) => (
                  <tr key={lead._id} className="border-b border-gray-200 hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div>
                          <div className="text-sm font-medium text-gray-900">{lead.name}</div>
                          <div className="text-sm text-gray-500">{lead.company}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{lead.email}</div>
                      <div className="text-sm text-gray-500">{lead.phone}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{lead.value}</div>
                      <div className="text-sm text-gray-500">{lead.source}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        lead.status === 'New' ? 'bg-green-100 text-green-800' :
                        lead.status === 'Contacted' ? 'bg-blue-100 text-blue-800' :
                        lead.status === 'Qualified' ? 'bg-yellow-100 text-yellow-800' :
                        lead.status === 'Proposal' ? 'bg-purple-100 text-purple-800' :
                        lead.status === 'Negotiation' ? 'bg-orange-100 text-orange-800' :
                        lead.status === 'Closed Won' ? 'bg-green-100 text-green-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {lead.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {lead.assignedManager ? (
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-8 w-8">
                            <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center">
                              <span className="text-sm font-medium text-gray-600">
                                {lead.assignedManager.name.charAt(0).toUpperCase()}
                              </span>
                            </div>
                          </div>
                          <div className="ml-3">
                            <div className="text-sm font-medium text-gray-900">
                              {lead.assignedManager.name}
                            </div>
                            <div className="text-sm text-gray-500">
                              {lead.assignedManager.email}
                            </div>
                          </div>
                        </div>
                      ) : (
                        <span className="text-sm text-gray-500">Unassigned</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end space-x-3">
                        <button
                          onClick={() => {
                            setSelectedLead(lead);
                            setShowViewLeadModal(true);
                          }}
                          className="text-indigo-600 hover:text-indigo-900 p-1 rounded-full hover:bg-indigo-50"
                          title="View Lead"
                        >
                          <Eye size={18} />
                        </button>
                        <button
                          onClick={() => {
                            setSelectedLead(lead);
                            setShowEditLeadModal(true);
                          }}
                          className="text-blue-600 hover:text-blue-900 p-1 rounded-full hover:bg-blue-50"
                          title="Edit Lead"
                        >
                          <Edit size={18} />
                        </button>
                        <button
                          onClick={() => {
                            setSelectedLead(lead);
                            setShowAssignModal(true);
                          }}
                          className="text-green-600 hover:text-green-900 p-1 rounded-full hover:bg-green-50"
                          title="Assign Lead"
                        >
                          <UserCheck size={18} />
                        </button>
                        <button
                          onClick={() => {
                            setSelectedLead(lead);
                            setShowDeleteModal(true);
                          }}
                          className="text-red-600 hover:text-red-900 p-1 rounded-full hover:bg-red-50"
                          title="Delete Lead"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Lead Modal */}
      {showAddLeadModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Add New Lead</h2>
              <button
                onClick={() => setShowAddLeadModal(false)}
                className="text-gray-500 hover:text-gray-700 text-xl font-bold"
              >
                &times;
              </button>
            </div>
            <form onSubmit={handleAddLead}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Name *</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-2 focus:ring-[#022d38] focus:border-[#022d38]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Company *</label>
                  <input
                    type="text"
                    name="company"
                    value={formData.company}
                    onChange={handleInputChange}
                    required
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-2 focus:ring-[#022d38] focus:border-[#022d38]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Email *</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-2 focus:ring-[#022d38] focus:border-[#022d38]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Phone</label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-2 focus:ring-[#022d38] focus:border-[#022d38]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Value</label>
                  <input
                    type="text"
                    name="value"
                    value={formData.value}
                    onChange={handleInputChange}
                    placeholder="$0.00"
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-2 focus:ring-[#022d38] focus:border-[#022d38]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Source</label>
                  <select
                    name="source"
                    value={formData.source}
                    onChange={handleInputChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-2 focus:ring-[#022d38] focus:border-[#022d38]"
                  >
                    <option value="">Select a source</option>
                    {leadSources.map((source, index) => (
                      <option key={index} value={source}>{source}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Notes</label>
                  <textarea
                    name="notes"
                    value={formData.notes}
                    onChange={handleInputChange}
                    rows="3"
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-2 focus:ring-[#022d38] focus:border-[#022d38]"
                  ></textarea>
                </div>
              </div>
              <div className="mt-6 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowAddLeadModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                  disabled={isLoading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#022d38] text-white rounded-md hover:bg-[#043c4a] disabled:opacity-50"
                  disabled={isLoading}
                >
                  {isLoading ? 'Adding...' : 'Add Lead'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Assign Lead Modal */}
      {showAssignModal && selectedLead && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Assign Lead to Manager</h2>
              <button
                onClick={() => setShowAssignModal(false)}
                className="text-gray-500 hover:text-gray-700 text-xl font-bold"
              >
                &times;
              </button>
            </div>
            <div className="mb-4">
              <p className="text-gray-600">Lead Details:</p>
              <div className="mt-2 p-3 bg-gray-50 rounded-md">
                <p className="font-medium">{selectedLead.name}</p>
                <p className="text-sm text-gray-600">{selectedLead.company}</p>
                <p className="text-sm text-gray-600">{selectedLead.email}</p>
              </div>
            </div>
            <p className="mb-4">Select a manager to assign this lead:</p>
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {team.map((manager) => (
                <button
                  key={manager.id}
                  onClick={() => handleAssignToManager(selectedLead._id, manager.id)}
                  className="w-full text-left px-4 py-3 hover:bg-gray-100 rounded-md flex items-center justify-between"
                  disabled={isLoading}
                >
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-gradient-to-tr from-indigo-500 to-[#022d38] text-white rounded-full flex items-center justify-center mr-3">
                      {manager.name.split(' ').map(name => name[0]).join('')}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{manager.name}</p>
                      <p className="text-sm text-gray-500">{manager.email}</p>
                    </div>
                  </div>
                  {selectedLead.assignedManager === manager.id && (
                    <span className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full">
                      Currently Assigned
                    </span>
                  )}
                </button>
              ))}
            </div>
            {team.length === 0 && (
              <p className="text-center text-gray-500 py-4">
                No managers available to assign
              </p>
            )}
            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setShowAssignModal(false)}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                disabled={isLoading}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Lead Modal */}
      {showEditLeadModal && selectedLead && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Edit Lead</h2>
              <button
                onClick={() => setShowEditLeadModal(false)}
                className="text-gray-500 hover:text-gray-700 text-xl font-bold"
              >
                &times;
              </button>
            </div>
            <form onSubmit={handleUpdateLead}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Name *</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-2 focus:ring-[#022d38] focus:border-[#022d38]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Company *</label>
                  <input
                    type="text"
                    name="company"
                    value={formData.company}
                    onChange={handleInputChange}
                    required
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-2 focus:ring-[#022d38] focus:border-[#022d38]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Email *</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-2 focus:ring-[#022d38] focus:border-[#022d38]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Phone</label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-2 focus:ring-[#022d38] focus:border-[#022d38]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Status</label>
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleInputChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-2 focus:ring-[#022d38] focus:border-[#022d38]"
                  >
                    {leadStatuses.map((status, index) => (
                      <option key={index} value={status}>{status}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Value</label>
                  <input
                    type="text"
                    name="value"
                    value={formData.value}
                    onChange={handleInputChange}
                    placeholder="$0.00"
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-2 focus:ring-[#022d38] focus:border-[#022d38]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Source</label>
                  <select
                    name="source"
                    value={formData.source}
                    onChange={handleInputChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-2 focus:ring-[#022d38] focus:border-[#022d38]"
                  >
                    <option value="">Select a source</option>
                    {leadSources.map((source, index) => (
                      <option key={index} value={source}>{source}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Notes</label>
                  <textarea
                    name="notes"
                    value={formData.notes}
                    onChange={handleInputChange}
                    rows="3"
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-2 focus:ring-[#022d38] focus:border-[#022d38]"
                  ></textarea>
                </div>
              </div>
              <div className="mt-6 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowEditLeadModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                  disabled={isLoading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#022d38] text-white rounded-md hover:bg-[#043c4a] disabled:opacity-50"
                  disabled={isLoading}
                >
                  {isLoading ? 'Updating...' : 'Update Lead'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Lead Modal */}
      {showViewLeadModal && selectedLead && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Lead Details</h2>
              <button
                onClick={() => setShowViewLeadModal(false)}
                className="text-gray-500 hover:text-gray-700 text-xl font-bold"
              >
                &times;
              </button>
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-center mb-4">
                <div className="h-20 w-20 rounded-full bg-gradient-to-tr from-indigo-500 to-[#022d38] flex items-center justify-center text-white text-2xl font-bold">
                  {selectedLead.name.split(' ').map(name => name[0]).join('')}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Name</p>
                  <p className="font-medium">{selectedLead.name}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Company</p>
                  <p className="font-medium">{selectedLead.company}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Email</p>
                  <p className="font-medium">{selectedLead.email}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Phone</p>
                  <p className="font-medium">{selectedLead.phone || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Status</p>
                  <p>
                    <span className={`px-2 py-1 text-xs rounded-full ${statusColors[selectedLead.status] || 'bg-gray-100 text-gray-800'}`}>
                      {selectedLead.status}
                    </span>
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Value</p>
                  <p className="font-medium">{selectedLead.value || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Source</p>
                  <p className="font-medium">{selectedLead.source || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Assigned To</p>
                  <p className="font-medium">
                    {selectedLead.assignedTo
                      ? (typeof selectedLead.assignedTo === 'object' && selectedLead.assignedTo.name
                          ? selectedLead.assignedTo.name
                          : (typeof selectedLead.assignedTo === 'string' ? selectedLead.assignedTo : 'Assigned'))
                      : 'Unassigned'}
                  </p>
                </div>
                <div className="col-span-2">
                  <p className="text-sm text-gray-500">Created At</p>
                  <p className="font-medium">{selectedLead.createdAt || 'N/A'}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-sm text-gray-500">Notes</p>
                  <p className="font-medium">{selectedLead.notes || 'No notes available'}</p>
                </div>
              </div>
              <div className="mt-6 flex justify-end space-x-3">
                <button
                  onClick={() => {
                    setShowViewLeadModal(false);
                    setSelectedLead(selectedLead);
                    setShowEditLeadModal(true);
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 flex items-center"
                >
                  <Edit size={16} className="mr-1" />
                  Edit
                </button>
                <button
                  onClick={() => {
                    setShowViewLeadModal(false);
                    setSelectedLead(selectedLead);
                    setShowAssignModal(true);
                  }}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center"
                >
                  <UserCheck size={16} className="mr-1" />
                  Assign
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Lead Confirmation Modal */}
      {showDeleteModal && selectedLead && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-red-600">Delete Lead</h2>
              <button
                onClick={() => setShowDeleteModal(false)}
                className="text-gray-500 hover:text-gray-700 text-xl font-bold"
              >
                &times;
              </button>
            </div>
            <div className="mb-6">
              <div className="flex items-center justify-center mb-4 text-red-500">
                <AlertCircle size={48} />
              </div>
              <p className="text-center text-gray-700">
                Are you sure you want to delete the lead <span className="font-bold">{selectedLead.name}</span> from <span className="font-bold">{selectedLead.company}</span>?
              </p>
              <p className="text-center text-gray-500 mt-2">
                This action cannot be undone.
              </p>
            </div>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                disabled={isLoading}
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteLead}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50"
                disabled={isLoading}
              >
                {isLoading ? 'Deleting...' : 'Delete Lead'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}