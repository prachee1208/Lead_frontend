import { useState, useEffect } from 'react';
import { Loader, AlertCircle, RefreshCw, PieChart } from 'lucide-react';
import { dataFetcher } from '../../services/dataFetcher';

/**
 * Lead Status Distribution Chart Component
 * Displays a visual representation of lead statuses
 */
const LeadStatusChart = ({ userId }) => {
    // State for chart data
    const [statusData, setStatusData] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [lastUpdated, setLastUpdated] = useState(new Date());
    const [isUpdating, setIsUpdating] = useState(false);

    // Status colors for consistent styling
    const statusColors = {
        'New': '#818cf8', // indigo-400
        'Contacted': '#60a5fa', // blue-400
        'Qualified': '#34d399', // emerald-400
        'Proposal': '#fbbf24', // amber-400
        'Negotiation': '#f97316', // orange-500
        'Converted': '#10b981', // emerald-500
        'Lost': '#ef4444', // red-500
        'Other': '#94a3b8', // slate-400
    };

    // Fetch lead status data
    const fetchStatusData = async (options = {}) => {
        const { silent = false, forceRefresh = true } = options;

        if (!silent) {
            setIsLoading(true);
        } else {
            setIsUpdating(true);
        }
        setError(null);

        try {
            if (!userId) {
                console.warn('User ID not provided');
                setIsLoading(false);
                setIsUpdating(false);
                return;
            }

            console.log(`Fetching lead status data for user: ${userId} (silent: ${silent}, forceRefresh: ${forceRefresh})`);

            // Use the enhanced data fetcher to get leads with forced refresh for real-time data
            const response = await dataFetcher.fetch(
                `leads:status:${userId}`,
                () => dataFetcher.fetchEmployeeLeads(userId, {
                    sort: '-updatedAt',
                    limit: 100
                }),
                {
                    // Force refresh to ensure real-time data
                    forceRefresh: forceRefresh,
                    // Provide offline fallback data
                    offlineData: { data: { data: [] } },
                    // Handle errors
                    onError: (err) => {
                        console.error('Error fetching lead status data:', err);
                        if (!silent) {
                            setError('Failed to load lead data. Please try again.');
                        }
                    }
                }
            );

            if (response && response.data && response.data.data) {
                // Count leads by status
                const statusCounts = {};

                response.data.data.forEach(lead => {
                    const status = lead.status || 'Other';
                    statusCounts[status] = (statusCounts[status] || 0) + 1;
                });

                // Transform into chart data format
                const chartData = Object.entries(statusCounts).map(([status, count]) => ({
                    status,
                    count,
                    color: statusColors[status] || statusColors.Other
                }));

                setStatusData(chartData);
            } else {
                setStatusData([]);
            }
        } catch (err) {
            console.error('Error fetching lead status data:', err);
            setError('Failed to load lead data. Please try again.');
        } finally {
            setIsLoading(false);
            setIsUpdating(false);

            // Update last updated timestamp
            if (forceRefresh) {
                setLastUpdated(new Date());
            }
        }
    };

    // Load data on component mount or when userId changes
    useEffect(() => {
        if (userId) {
            // Initial data fetch
            fetchStatusData();

            // Clear cache to ensure fresh data
            dataFetcher.invalidateCache(`leads:status:${userId}`);

            // Set up interval for real-time updates (every 15 seconds)
            const updateInterval = setInterval(() => {
                console.log('Refreshing lead status chart data (scheduled)');
                fetchStatusData({ silent: true });
            }, 15000); // 15 seconds for more frequent updates

            // Set up a more frequent check for status changes (every 5 seconds)
            const statusCheckInterval = setInterval(() => {
                console.log('Quick check for lead status changes');
                // Use silent mode to avoid showing loading indicators for these frequent checks
                fetchStatusData({ silent: true });
            }, 5000); // 5 seconds for quick status checks

            // Clean up intervals on component unmount
            return () => {
                clearInterval(updateInterval);
                clearInterval(statusCheckInterval);
                console.log('Cleared chart update intervals');
            };
        }
    }, [userId]);

    // Listen for lead assignment and status change events
    useEffect(() => {
        // Function to handle storage events (used for cross-tab communication)
        const handleStorageChange = (event) => {
            // Get the current user ID to check if updates are relevant
            const currentUserId = userId || localStorage.getItem('userId');

            if (event.key === 'lead_assigned') {
                try {
                    const data = JSON.parse(event.newValue);
                    console.log('Lead assignment detected:', data);

                    // Check if this lead was assigned to the current user
                    if (data.employeeId === currentUserId) {
                        console.log('New lead assigned to current user, refreshing chart data');
                        fetchStatusData();
                    }
                } catch (err) {
                    console.error('Error processing lead assignment notification:', err);
                }
            } else if (event.key === 'lead_updated' || event.key === 'lead_status_changed') {
                try {
                    const data = JSON.parse(event.newValue);
                    console.log('Lead update/status change detected:', data);

                    // Check if this lead belongs to the current user
                    if (data.employeeId === currentUserId) {
                        console.log('Lead update for current user, refreshing chart data');
                        fetchStatusData();
                    }
                } catch (err) {
                    console.error('Error processing lead update notification:', err);
                }
            }
        };

        // Listen for storage events
        window.addEventListener('storage', handleStorageChange);

        // Also check for direct localStorage changes (for same-tab updates)
        const checkLocalStorage = () => {
            const leadStatusChanged = localStorage.getItem('lead_status_changed');
            if (leadStatusChanged) {
                try {
                    const data = JSON.parse(leadStatusChanged);
                    console.log('Lead status change detected in same tab', data);
                    fetchStatusData({ silent: true });
                } catch (err) {
                    console.error('Error processing lead status change notification:', err);
                }
            }
        };

        // Check for direct changes every 3 seconds
        const directCheckInterval = setInterval(checkLocalStorage, 3000);

        // Clean up event listener and interval
        return () => {
            window.removeEventListener('storage', handleStorageChange);
            clearInterval(directCheckInterval);
        };
    }, [userId]);

    // Calculate total leads
    const totalLeads = statusData.reduce((sum, item) => sum + item.count, 0);

    // Calculate percentages and prepare segments for the chart
    const calculateChartSegments = () => {
        if (statusData.length === 0) return [];

        let currentAngle = 0;
        return statusData.map(item => {
            const percentage = (item.count / totalLeads) * 100;
            const startAngle = currentAngle;
            const angle = (percentage / 100) * 360;
            currentAngle += angle;

            return {
                ...item,
                percentage,
                startAngle,
                angle
            };
        });
    };

    const chartSegments = calculateChartSegments();

    // SVG path for pie chart segment
    const getSegmentPath = (segment) => {
        const radius = 50;
        const centerX = 60;
        const centerY = 60;

        // Convert angles to radians
        const startAngleRad = (segment.startAngle - 90) * (Math.PI / 180);
        const endAngleRad = (segment.startAngle + segment.angle - 90) * (Math.PI / 180);

        // Calculate start and end points
        const startX = centerX + radius * Math.cos(startAngleRad);
        const startY = centerY + radius * Math.sin(startAngleRad);
        const endX = centerX + radius * Math.cos(endAngleRad);
        const endY = centerY + radius * Math.sin(endAngleRad);

        // Determine if the arc should be drawn the long way around
        const largeArcFlag = segment.angle > 180 ? 1 : 0;

        // Create SVG path
        return `M ${centerX} ${centerY} L ${startX} ${startY} A ${radius} ${radius} 0 ${largeArcFlag} 1 ${endX} ${endY} Z`;
    };

    return (
        <div className="bg-white rounded-lg shadow p-4">
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-800">Lead Status Distribution</h3>
                <div className="flex items-center">
                    {/* Real-time update indicator */}
                    <div className="flex items-center text-xs text-gray-500 mr-2">
                        {isUpdating && (
                            <span className="mr-2 flex items-center">
                                <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-primary mr-1"></div>
                                Updating...
                            </span>
                        )}
                        <span>
                            Updated: {lastUpdated.toLocaleTimeString()}
                        </span>
                    </div>
                    {!isLoading && (
                        <button
                            onClick={() => fetchStatusData({ forceRefresh: true })}
                            className="p-1 rounded-md hover:bg-gray-100"
                            title="Refresh chart"
                            disabled={isUpdating}
                        >
                            <RefreshCw size={16} className={`${isUpdating ? 'text-gray-300' : 'text-gray-500'}`} />
                        </button>
                    )}
                </div>
            </div>

            {/* Error Message */}
            {error && (
                <div className="bg-red-100 border border-red-200 text-red-800 px-4 py-3 rounded-md flex items-center mb-4">
                    <AlertCircle size={20} className="mr-2" />
                    <span>{error}</span>
                    <button
                        onClick={fetchStatusData}
                        className="ml-auto text-red-800 hover:text-red-900"
                    >
                        <RefreshCw size={16} />
                    </button>
                </div>
            )}

            {/* Loading State */}
            {isLoading ? (
                <div className="flex flex-col items-center justify-center h-40">
                    <Loader className="w-8 h-8 text-blue-500 animate-spin mb-2" />
                    <p className="text-sm text-gray-500">Loading chart data...</p>
                </div>
            ) : statusData.length === 0 ? (
                <div className="text-center py-8">
                    <PieChart size={32} className="mx-auto text-gray-300 mb-2" />
                    <p className="text-sm text-gray-500">No lead data available</p>
                </div>
            ) : (
                <div className="flex flex-col md:flex-row items-center justify-center gap-4">
                    {/* SVG Pie Chart */}
                    <div className="relative w-32 h-32">
                        <svg viewBox="0 0 120 120" className="w-full h-full">
                            {chartSegments.map((segment, index) => (
                                <path
                                    key={index}
                                    d={getSegmentPath(segment)}
                                    fill={segment.color}
                                    stroke="#fff"
                                    strokeWidth="1"
                                >
                                    <title>{`${segment.status}: ${segment.count} (${segment.percentage.toFixed(1)}%)`}</title>
                                </path>
                            ))}
                        </svg>
                        <div className="absolute inset-0 flex items-center justify-center">
                            <span className="text-sm font-semibold">{totalLeads}</span>
                        </div>
                    </div>

                    {/* Legend */}
                    <div className="grid grid-cols-2 gap-2 text-sm">
                        {chartSegments.map((segment, index) => (
                            <div key={index} className="flex items-center">
                                <div
                                    className="w-3 h-3 rounded-full mr-2"
                                    style={{ backgroundColor: segment.color }}
                                ></div>
                                <span className="mr-1">{segment.status}:</span>
                                <span className="font-semibold">{segment.count}</span>
                                <span className="text-gray-500 text-xs ml-1">
                                    ({segment.percentage.toFixed(1)}%)
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default LeadStatusChart;
