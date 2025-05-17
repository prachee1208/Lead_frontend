import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import enhancedAPI from '../../services/enhancedAPI';
import { Loader, AlertCircle, RefreshCw } from 'lucide-react';

export default function TestAssignedLeads() {
    const [leads, setLeads] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [debugInfo, setDebugInfo] = useState({});

    const fetchAssignedLeads = async () => {
        setLoading(true);
        setError(null);
        setDebugInfo({});

        try {
            // Get the current user ID from localStorage
            const userId = localStorage.getItem('userId');
            if (!userId) {
                setError('User ID not found. Please log in again.');
                setLoading(false);
                return;
            }

            // Debug info
            setDebugInfo(prev => ({ ...prev, userId }));
            console.log('Fetching assigned leads for manager ID:', userId);

            // First try the direct API call without the data fetcher
            const response = await enhancedAPI.leads.getAssignedByManager(userId);
            console.log('Direct API response:', response);
            setDebugInfo(prev => ({ ...prev, directApiResponse: response }));

            if (response && response.data) {
                setLeads(response.data);
                setDebugInfo(prev => ({ 
                    ...prev, 
                    leadsCount: response.data.length,
                    firstLead: response.data[0] || null
                }));
            } else {
                setLeads([]);
                setDebugInfo(prev => ({ ...prev, noData: true }));
            }
        } catch (err) {
            console.error('Error fetching assigned leads:', err);
            setError('Failed to load assigned leads: ' + (err.message || 'Unknown error'));
            setDebugInfo(prev => ({ ...prev, error: err.message || 'Unknown error' }));
            toast.error('Failed to load assigned leads: ' + (err.message || 'Unknown error'));
        } finally {
            setLoading(false);
        }
    };

    // Load data on component mount
    useEffect(() => {
        fetchAssignedLeads();
    }, []);

    return (
        <div className="p-6 space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-semibold text-gray-800">Test Assigned Leads</h1>
                {!loading && (
                    <button
                        onClick={fetchAssignedLeads}
                        className="p-2 rounded-md hover:bg-gray-100"
                        title="Refresh leads"
                    >
                        <RefreshCw size={20} className="text-gray-500" />
                    </button>
                )}
            </div>

            <div className="bg-blue-50 border border-blue-200 text-blue-800 px-4 py-3 rounded-md">
                <h2 className="font-semibold">Debug Information</h2>
                <pre className="mt-2 text-xs overflow-auto max-h-40">
                    {JSON.stringify(debugInfo, null, 2)}
                </pre>
            </div>

            {error && (
                <div className="bg-red-100 border border-red-200 text-red-800 px-4 py-3 rounded-md flex items-center">
                    <AlertCircle size={20} className="mr-2" />
                    <span>{error}</span>
                </div>
            )}

            {loading ? (
                <div className="flex flex-col items-center justify-center min-h-[40vh] p-6">
                    <Loader className="w-12 h-12 text-blue-500 animate-spin mb-4" />
                    <h2 className="text-xl font-semibold text-gray-700">Loading Assigned Leads...</h2>
                    <p className="text-gray-500 mt-2">Please wait while we fetch the assigned leads</p>
                </div>
            ) : (
                <>
                    <div className="bg-white rounded-lg shadow p-4">
                        <h2 className="text-lg font-semibold mb-4">API Response</h2>
                        {leads.length === 0 ? (
                            <div className="text-center py-6">
                                <AlertCircle size={48} className="mx-auto text-gray-300 mb-4" />
                                <h3 className="text-lg font-medium text-gray-900">No assigned leads found</h3>
                                <p className="mt-1 text-sm text-gray-500">
                                    Try assigning some leads to employees first
                                </p>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Lead
                                            </th>
                                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Contact Info
                                            </th>
                                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Status
                                            </th>
                                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Assigned To
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {leads.map((lead) => (
                                            <tr key={lead._id} className="hover:bg-gray-50">
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
                                                    <span className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800 border border-blue-200">
                                                        {lead.status}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                    {lead.assignedEmployee ? 
                                                        (typeof lead.assignedEmployee === 'object' ? 
                                                            lead.assignedEmployee.name : 
                                                            lead.assignedEmployee) 
                                                        : 'Unassigned'}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>

                    <div className="bg-white rounded-lg shadow p-4">
                        <h2 className="text-lg font-semibold mb-4">Raw API Response</h2>
                        <pre className="text-xs overflow-auto max-h-60 bg-gray-50 p-4 rounded">
                            {JSON.stringify(leads, null, 2)}
                        </pre>
                    </div>
                </>
            )}
        </div>
    );
}
