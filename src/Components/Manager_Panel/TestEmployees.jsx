import { useState, useEffect } from 'react';
import dataFetcher from '../../services/dataFetcher';

function TestEmployees() {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        setLoading(true);
        const response = await dataFetcher.fetchEmployees({}, {
          forceRefresh: true,
          offlineData: { data: { data: [] } }
        });
        
        console.log('Employees response:', response);
        
        if (response && response.data && response.data.data) {
          setEmployees(response.data.data);
        } else {
          setEmployees([]);
        }
      } catch (error) {
        console.error('Error fetching employees:', error);
        setError('Failed to load employees: ' + (error.message || 'Unknown error'));
      } finally {
        setLoading(false);
      }
    };
    
    fetchEmployees();
  }, []);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold mb-4">Test Employees</h1>
      
      {loading && <p>Loading employees...</p>}
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}
      
      {!loading && !error && (
        <div>
          <p>Found {employees.length} employees</p>
          <ul className="mt-4 space-y-2">
            {employees.map(employee => (
              <li key={employee._id} className="border p-3 rounded">
                <p><strong>Name:</strong> {employee.name}</p>
                <p><strong>Email:</strong> {employee.email}</p>
                <p><strong>Role:</strong> {employee.role}</p>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

export default TestEmployees;
