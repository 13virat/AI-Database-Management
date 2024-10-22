import React, { useState, useEffect } from 'react';
import axios from 'axios';

const QueryLogs = () => {
  const [logs, setLogs] = useState([]);
  const [queryText, setQueryText] = useState('');
  const [executionTime, setExecutionTime] = useState('');
  const [recordsProcessed, setRecordsProcessed] = useState('');  // New field for records processed
  const [indexesUsed, setIndexesUsed] = useState('');  // New field for indexes used

  // Fetch logs when component loads
  useEffect(() => {
    fetchLogs();
  }, []);

  // Function to fetch query logs from the backend API
  const fetchLogs = async () => {
    try {
      const response = await axios.get('http://localhost:8000/api/query-log/');
      console.log(response.data);  // Debug: Log the response to check if optimization_suggestion is present
      setLogs(response.data);  // Store the response in logs state
    } catch (error) {
      console.error('Error fetching query logs:', error);
    }
  };

  // Function to submit a new query to the backend
  const submitQuery = async () => {
    try {
      const response = await axios.post('http://localhost:8000/api/query-log/', {
        query_text: queryText,
        execution_time: parseFloat(executionTime),  // Ensure it's parsed as a float
        records_processed: parseInt(recordsProcessed, 10),  // Parse as an integer
        indexes_used: indexesUsed,  // Pass indexes used
      });
      console.log('Query added:', response.data);  // Debug: Log the added query
      fetchLogs();  // Refresh the logs after adding a new query
      // Reset input fields after submission
      setQueryText('');
      setExecutionTime('');
      setRecordsProcessed(''); 
      setIndexesUsed('');
    } catch (error) {
      console.error('Error submitting query:', error);
    }
  };

  return (
    <div className="container mx-auto px-4">
      <h2 className="text-2xl font-bold mb-4">Query Logs</h2>
      
      {/* Display each query log */}
      <ul className="space-y-4">
        {logs.map((log, index) => (
          <li key={index} className="p-4 border rounded-lg shadow-lg">
            <p><strong>Query:</strong> {log.query_text}</p>
            <p><strong>Execution Time:</strong> {log.execution_time}s</p>
            <p><strong>Records Processed:</strong> {log.records_processed}</p>
            <p><strong>Indexes Used:</strong> {log.indexes_used || "None"}</p>
            <p><strong>Optimization Suggestion:</strong> {log.optimization_suggestion || "None"}</p>
          </li>
        ))}
      </ul>
      
      {/* Form to add a new query */}
      <div className="mt-8">
        <h3 className="text-xl font-semibold mb-2">Add a new query</h3>
        <div className="flex flex-col space-y-2">
          <input
            className="border p-2 rounded w-full"
            type="text"
            placeholder="SQL Query"
            value={queryText}
            onChange={(e) => setQueryText(e.target.value)}  // Handle input change
          />
          <input
            className="border p-2 rounded w-40"
            type="number"
            placeholder="Execution Time (seconds)"
            value={executionTime}
            onChange={(e) => setExecutionTime(e.target.value)}  // Handle input change
          />
          <input
            className="border p-2 rounded w-full"
            type="number"
            placeholder="Records Processed"
            value={recordsProcessed}
            onChange={(e) => setRecordsProcessed(e.target.value)}  // Handle input change
          />
          <input
            className="border p-2 rounded w-full"
            type="text"
            placeholder="Indexes Used (if any)"
            value={indexesUsed}
            onChange={(e) => setIndexesUsed(e.target.value)}  // Handle input change
          />
          <button
            className="bg-blue-500 text-white p-2 rounded hover:bg-blue-700"
            onClick={submitQuery}  // Submit query on button click
          >
            Submit Query
          </button>
        </div>
      </div>
    </div>
  );
};

export default QueryLogs;
