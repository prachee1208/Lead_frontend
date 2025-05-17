import { useState, useEffect } from 'react';
import { onConnectionChange, getConnectionStatus } from '../../services/enhancedAPI';
import { Wifi, WifiOff } from 'lucide-react';

/**
 * ConnectionMonitor component
 * Displays the current connection status and provides a visual indicator
 */
const ConnectionMonitor = () => {
  const [isConnected, setIsConnected] = useState(getConnectionStatus());
  const [showBanner, setShowBanner] = useState(false);
  
  useEffect(() => {
    // Subscribe to connection status changes
    const unsubscribe = onConnectionChange((status) => {
      setIsConnected(status);
      
      // Show banner when connection status changes
      if (status !== isConnected) {
        setShowBanner(true);
        
        // Auto-hide banner after 5 seconds if connected
        if (status) {
          setTimeout(() => {
            setShowBanner(false);
          }, 5000);
        }
      }
    });
    
    // Cleanup subscription on unmount
    return () => {
      unsubscribe();
    };
  }, [isConnected]);
  
  // Don't render anything if connected and banner is hidden
  if (isConnected && !showBanner) {
    return null;
  }
  
  return (
    <div 
      className={`fixed bottom-4 right-4 z-50 px-4 py-2 rounded-lg shadow-lg flex items-center ${
        isConnected ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
      }`}
    >
      {isConnected ? (
        <>
          <Wifi size={20} className="mr-2" />
          <span>Connected to server</span>
          <button 
            className="ml-3 text-gray-500 hover:text-gray-700"
            onClick={() => setShowBanner(false)}
            aria-label="Close"
          >
            &times;
          </button>
        </>
      ) : (
        <>
          <WifiOff size={20} className="mr-2" />
          <span>Connection lost. Retrying...</span>
        </>
      )}
    </div>
  );
};

export default ConnectionMonitor;
