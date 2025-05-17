import { getConnectionStatus } from '../../services/enhancedAPI';

function Test() {
  const isConnected = getConnectionStatus();
  
  return (
    <div>
      <h1>Connection Status: {isConnected ? 'Connected' : 'Disconnected'}</h1>
    </div>
  );
}

export default Test;
