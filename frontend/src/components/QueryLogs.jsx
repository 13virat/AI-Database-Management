import React, { useState, useEffect } from 'react';
import axios from 'axios';

const QueryLogs = () => {
  const [logs, setLogs] = useState([]);
  const [queryText, setQueryText] = useState('');
  const [executionTime, setExecutionTime] = useState('');
  const [recordsProcessed, setRecordsProcessed] = useState('');
  const [indexesUsed, setIndexesUsed] = useState('');
  const [columnsAccessed, setColumnsAccessed] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Fetch logs on component mount
  useEffect(() => {
    fetchLogs();
  }, []);

  // Fetch query logs from backend API
  const fetchLogs = async () => {
    setLoading(true);
    try {
      const { data } = await axios.get('http://localhost:8000/api/query-log/');
      setLogs(data);
      setError('');
    } catch (error) {
      setError('Error fetching query logs');
      console.error('Error fetching query logs:', error);
    } finally {
      setLoading(false);
    }
  };

  // Submit a new query to the backend API
  const submitQuery = async () => {
    // Basic form validation
    if (!queryText || !executionTime) {
      setError('Query text and execution time are required!');
      return;
    }

    const payload = {
      query_text: queryText,
      execution_time: parseFloat(executionTime),
      records_processed: parseInt(recordsProcessed, 10),
      indexes_used: indexesUsed,
      columns_accessed: columnsAccessed,
    };

    try {
      setLoading(true);
      await axios.post('http://localhost:8000/api/query-log/', payload);
      fetchLogs(); // Refresh logs after submission
      clearForm(); // Reset the form
      setError('');
    } catch (error) {
      setError('Error submitting query');
      console.error('Error submitting query:', error);
    } finally {
      setLoading(false);
    }
  };

  // Clear the form after submission
  const clearForm = () => {
    setQueryText('');
    setExecutionTime('');
    setRecordsProcessed('');
    setIndexesUsed('');
    setColumnsAccessed('');
  };

  return (
    <div className="container mx-auto px-4">
      <h2 className="text-2xl font-bold mb-4">Query Logs</h2>

      {error && <p className="text-red-500">{error}</p>} {/* Error display */}
      {loading && <p>Loading...</p>} {/* Loading state */}

      {/* Query log list */}
      <ul className="space-y-4">
        {logs.map((log, index) => (
          <li key={index} className="p-4 border rounded-lg shadow-lg">
            <p><strong>Query:</strong> {log.query_text}</p>
            <p><strong>Execution Time:</strong> {log.execution_time}s</p>
            <p><strong>Records Processed:</strong> {log.records_processed}</p>
            <p><strong>Indexes Used:</strong> {log.indexes_used || 'None'}</p>
            <p><strong>Optimization Suggestion:</strong> {log.optimization_suggestion || 'None'}</p>
          </li>
        ))}
      </ul>

      {/* Form to submit a new query */}
      <div className="mt-8">
        <h3 className="text-xl font-semibold mb-2">Add a new query</h3>
        <div className="flex flex-col space-y-2">
          <input
            className="border p-2 rounded w-full"
            type="text"
            placeholder="SQL Query"
            value={queryText}
            onChange={(e) => setQueryText(e.target.value)}
          />
          <input
            className="border p-2 rounded w-40"
            type="number"
            placeholder="Execution Time (seconds)"
            value={executionTime}
            onChange={(e) => setExecutionTime(e.target.value)}
          />
          <input
            className="border p-2 rounded w-full"
            type="number"
            placeholder="Records Processed"
            value={recordsProcessed}
            onChange={(e) => setRecordsProcessed(e.target.value)}
          />
          <input
            className="border p-2 rounded w-full"
            type="text"
            placeholder="Indexes Used (if any)"
            value={indexesUsed}
            onChange={(e) => setIndexesUsed(e.target.value)}
          />
          <input
            className="border p-2 rounded w-full"
            type="text"
            placeholder="Columns Accessed"
            value={columnsAccessed}
            onChange={(e) => setColumnsAccessed(e.target.value)}
          />
          <button
            className="bg-blue-500 text-white p-2 rounded hover:bg-blue-700"
            onClick={submitQuery}
            disabled={loading} // Disable button during loading
          >
            Submit Query
          </button>
        </div>
      </div>
    </div>
  );
};

export default QueryLogs;
