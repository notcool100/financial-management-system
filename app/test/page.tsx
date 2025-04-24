'use client';

import { useState, useEffect } from 'react';

export default function TestPage() {
  const [testResult, setTestResult] = useState<string>('Testing...');
  const [userData, setUserData] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Test the API endpoint
  useEffect(() => {
    fetch('/api/test')
      .then(response => response.json())
      .then(data => {
        setTestResult(JSON.stringify(data, null, 2));
      })
      .catch(err => {
        setTestResult(`Error: ${err.message}`);
      });
  }, []);

  // Function to create a test user
  const createTestUser = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const testUser = {
        name: 'Test User',
        email: `test${Date.now()}@example.com`,
        phone: `98${Math.floor(10000000 + Math.random() * 90000000)}`,
        password: 'password123',
        role: 'client'
      };
      
      console.log('Creating test user:', testUser);
      
      const response = await fetch('/api/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(testUser)
      });
      
      console.log('Response status:', response.status);
      
      const responseText = await response.text();
      console.log('Raw response:', responseText);
      
      let data;
      try {
        data = JSON.parse(responseText);
      } catch (e) {
        throw new Error(`Invalid JSON response: ${responseText}`);
      }
      
      if (response.ok) {
        setUserData(data);
      } else {
        setError(data.message || 'Failed to create user');
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">API Test Page</h1>
      
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-2">Test API Response:</h2>
        <pre className="bg-gray-100 p-4 rounded overflow-auto max-h-40">
          {testResult}
        </pre>
      </div>
      
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-2">Create Test User:</h2>
        <button
          onClick={createTestUser}
          disabled={loading}
          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded disabled:opacity-50"
        >
          {loading ? 'Creating...' : 'Create Test User'}
        </button>
        
        {error && (
          <div className="mt-4 p-4 bg-red-100 text-red-700 rounded">
            Error: {error}
          </div>
        )}
        
        {userData && (
          <div className="mt-4">
            <h3 className="font-semibold">User Created:</h3>
            <pre className="bg-gray-100 p-4 rounded overflow-auto max-h-60">
              {JSON.stringify(userData, null, 2)}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
}