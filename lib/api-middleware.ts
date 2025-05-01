import { NextRequest, NextResponse } from 'next/server';

/**
 * Middleware to handle API requests to the backend
 * This adds the authorization header from localStorage if available
 */
export async function withAuth(
  req: NextRequest,
  url: string,
  options: RequestInit = {}
): Promise<Response> {
  // For server-side requests, we need to forward the authorization header
  const authHeader = req.headers.get('authorization');
  
  const headers = {
    'Content-Type': 'application/json',
    ...(authHeader ? { 'Authorization': authHeader } : {}),
    ...options.headers,
  };
  
  return fetch(url, {
    ...options,
    headers,
  });
}

/**
 * Helper function to handle API responses
 */
export async function handleApiResponse(
  response: Response, 
  successMessage: string = 'Success', 
  errorMessage: string = 'An error occurred'
): Promise<{ success: boolean; data?: any; message?: string; status: number }> {
  try {
    // Try to parse the response as JSON
    const data = await response.json().catch(() => null);
    
    // If the response is OK, return success
    if (response.ok) {
      return { 
        success: true, 
        data: data || {}, 
        message: successMessage,
        status: response.status 
      };
    }
    
    // If we have data with a message, use that
    if (data && data.message) {
      return { 
        success: false, 
        message: data.message,
        status: response.status 
      };
    }
    
    // Otherwise, use the generic error message
    return { 
      success: false, 
      message: errorMessage,
      status: response.status 
    };
  } catch (error) {
    // If there's an error parsing the response, return a generic error
    console.error('Error handling API response:', error);
    return {
      success: false,
      message: errorMessage,
      status: response.status || 500
    };
  }
}