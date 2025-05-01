/**
 * Helper function to make API requests with authentication
 */
export async function fetchWithAuth(url: string, options: RequestInit = {}) {
  // Get the token from localStorage
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  
  // Set up headers with authentication
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
    ...options.headers,
  };
  
  // Make the request
  const response = await fetch(url, {
    ...options,
    headers,
  });
  
  // Parse the response
  const data = await response.json();
  
  // If the response is not ok, throw an error
  if (!response.ok) {
    const error = new Error(data.message || 'An error occurred');
    throw error;
  }
  
  // Return the data
  return data;
}