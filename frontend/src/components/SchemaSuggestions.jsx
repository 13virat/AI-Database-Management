import React, { useState, useEffect } from 'react';
import axios from 'axios';

const SchemaSuggestions = () => {
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Fetch schema suggestions when component mounts
  useEffect(() => {
    fetchSuggestions();
  }, []);

  const fetchSuggestions = async () => {
    setLoading(true);
    try {
      const { data } = await axios.get('http://localhost:8000/api/schema-suggestions/');
      setSuggestions(data.suggestions);
      setError('');
    } catch (error) {
      setError('Error fetching schema suggestions');
      console.error('Error fetching schema suggestions:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 mt-8">
      <h2 className="text-2xl font-bold mb-4">Schema Migration Suggestions</h2>

      {error && <p className="text-red-500">{error}</p>} {/* Error display */}
      {loading && <p>Loading...</p>} {/* Loading state */}

      {/* Display schema migration suggestions */}
      <ul className="space-y-4">
        {suggestions.length > 0 ? (
          suggestions.map((suggestion, index) => (
            <li key={index} className="p-4 border rounded-lg shadow-lg">
              {suggestion}
            </li>
          ))
        ) : (
          !loading && <p>No suggestions available.</p>
        )}
      </ul>
    </div>
  );
};

export default SchemaSuggestions;
