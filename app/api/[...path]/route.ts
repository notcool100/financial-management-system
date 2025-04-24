import { NextRequest, NextResponse } from 'next/server';

// Backend API URL
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

// GET handler
export async function GET(
  request: NextRequest,
  { params }: { params: { path: string[] } }
) {
  try {
    // Get the path from the URL directly
    const url = new URL(request.url);
    const pathParts = url.pathname.split('/api/')[1];
    
    // Get search params
    const searchParams = url.searchParams.toString();
    const backendUrl = `${API_URL}/api/${pathParts}${searchParams ? `?${searchParams}` : ''}`;
    
    console.log(`Proxying GET request to: ${backendUrl}`);
    
    // Get authorization header
    const authHeader = request.headers.get('Authorization');
    console.log('Authorization header:', authHeader ? 'Present' : 'Missing');
    
    // Set up headers
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    
    if (authHeader) {
      headers['Authorization'] = authHeader;
    }
    
    // Make the request to the backend
    const response = await fetch(backendUrl, {
      method: 'GET',
      headers,
    });
    
    // For debugging, log the response status
    console.log(`Backend response status: ${response.status}`);
    
    // Get the response as text first
    const responseText = await response.text();
    console.log('Response text:', responseText);
    
    // Try to parse as JSON
    let data;
    try {
      data = responseText ? JSON.parse(responseText) : {};
    } catch (error) {
      console.error('Error parsing response as JSON:', error);
      return NextResponse.json(
        { 
          success: false, 
          message: 'Invalid JSON response from backend',
          rawResponse: responseText
        },
        { status: 502 }
      );
    }
    
    // Return the response
    return NextResponse.json(data, {
      status: response.status,
    });
  } catch (error) {
    console.error(`Error in GET request:`, error);
    return NextResponse.json(
      { success: false, message: 'Backend API error', error: String(error) },
      { status: 500 }
    );
  }
}

// POST handler
export async function POST(
  request: NextRequest,
  { params }: { params: { path: string[] } }
) {
  try {
    // Get the path from the URL directly
    const url = new URL(request.url);
    const pathParts = url.pathname.split('/api/')[1];
    const backendUrl = `${API_URL}/api/${pathParts}`;
    
    console.log(`Proxying POST request to: ${backendUrl}`);
    
    // Get the request body
    let body;
    try {
      body = await request.json();
      console.log('Request body:', body);
    } catch (error) {
      console.error('Error parsing request body:', error);
      return NextResponse.json(
        { success: false, message: 'Invalid request body' },
        { status: 400 }
      );
    }
    
    // Get authorization header
    const authHeader = request.headers.get('Authorization');
    console.log('Authorization header:', authHeader ? 'Present' : 'Missing');
    
    // Set up headers
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    
    if (authHeader) {
      headers['Authorization'] = authHeader;
    }
    
    // Make the request to the backend
    const response = await fetch(backendUrl, {
      method: 'POST',
      headers,
      body: JSON.stringify(body),
    });
    
    // For debugging, log the response status
    console.log(`Backend response status: ${response.status}`);
    
    // Get the response as text first
    const responseText = await response.text();
    console.log('Response text:', responseText);
    
    // Try to parse as JSON
    let data;
    try {
      data = responseText ? JSON.parse(responseText) : {};
    } catch (error) {
      console.error('Error parsing response as JSON:', error);
      return NextResponse.json(
        { 
          success: false, 
          message: 'Invalid JSON response from backend',
          rawResponse: responseText
        },
        { status: 502 }
      );
    }
    
    // Return the response
    return NextResponse.json(data, {
      status: response.status,
    });
  } catch (error) {
    console.error(`Error in POST request:`, error);
    return NextResponse.json(
      { success: false, message: 'Backend API error', error: String(error) },
      { status: 500 }
    );
  }
}

// PUT handler
export async function PUT(
  request: NextRequest,
  { params }: { params: { path: string[] } }
) {
  try {
    // Get the path from the URL directly
    const url = new URL(request.url);
    const pathParts = url.pathname.split('/api/')[1];
    const backendUrl = `${API_URL}/api/${pathParts}`;
    
    console.log(`Proxying PUT request to: ${backendUrl}`);
    
    // Get the request body
    let body;
    try {
      body = await request.json();
      console.log('Request body:', body);
    } catch (error) {
      console.error('Error parsing request body:', error);
      return NextResponse.json(
        { success: false, message: 'Invalid request body' },
        { status: 400 }
      );
    }
    
    // Get authorization header
    const authHeader = request.headers.get('Authorization');
    console.log('Authorization header:', authHeader ? 'Present' : 'Missing');
    
    // Set up headers
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    
    if (authHeader) {
      headers['Authorization'] = authHeader;
    }
    
    // Make the request to the backend
    const response = await fetch(backendUrl, {
      method: 'PUT',
      headers,
      body: JSON.stringify(body),
    });
    
    // For debugging, log the response status
    console.log(`Backend response status: ${response.status}`);
    
    // Get the response as text first
    const responseText = await response.text();
    console.log('Response text:', responseText);
    
    // Try to parse as JSON
    let data;
    try {
      data = responseText ? JSON.parse(responseText) : {};
    } catch (error) {
      console.error('Error parsing response as JSON:', error);
      return NextResponse.json(
        { 
          success: false, 
          message: 'Invalid JSON response from backend',
          rawResponse: responseText
        },
        { status: 502 }
      );
    }
    
    // Return the response
    return NextResponse.json(data, {
      status: response.status,
    });
  } catch (error) {
    console.error(`Error in PUT request:`, error);
    return NextResponse.json(
      { success: false, message: 'Backend API error', error: String(error) },
      { status: 500 }
    );
  }
}

// PATCH handler
export async function PATCH(
  request: NextRequest,
  { params }: { params: { path: string[] } }
) {
  try {
    // Get the path from the URL directly
    const url = new URL(request.url);
    const pathParts = url.pathname.split('/api/')[1];
    const backendUrl = `${API_URL}/api/${pathParts}`;
    
    console.log(`Proxying PATCH request to: ${backendUrl}`);
    
    // Get the request body
    let body;
    try {
      body = await request.json();
      console.log('Request body:', body);
    } catch (error) {
      console.error('Error parsing request body:', error);
      return NextResponse.json(
        { success: false, message: 'Invalid request body' },
        { status: 400 }
      );
    }
    
    // Get authorization header
    const authHeader = request.headers.get('Authorization');
    console.log('Authorization header:', authHeader ? 'Present' : 'Missing');
    
    // Set up headers
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    
    if (authHeader) {
      headers['Authorization'] = authHeader;
    }
    
    // Make the request to the backend
    const response = await fetch(backendUrl, {
      method: 'PATCH',
      headers,
      body: JSON.stringify(body),
    });
    
    // For debugging, log the response status
    console.log(`Backend response status: ${response.status}`);
    
    // Get the response as text first
    const responseText = await response.text();
    console.log('Response text:', responseText);
    
    // Try to parse as JSON
    let data;
    try {
      data = responseText ? JSON.parse(responseText) : {};
    } catch (error) {
      console.error('Error parsing response as JSON:', error);
      return NextResponse.json(
        { 
          success: false, 
          message: 'Invalid JSON response from backend',
          rawResponse: responseText
        },
        { status: 502 }
      );
    }
    
    // Return the response
    return NextResponse.json(data, {
      status: response.status,
    });
  } catch (error) {
    console.error(`Error in PATCH request:`, error);
    return NextResponse.json(
      { success: false, message: 'Backend API error', error: String(error) },
      { status: 500 }
    );
  }
}

// DELETE handler
export async function DELETE(
  request: NextRequest,
  { params }: { params: { path: string[] } }
) {
  try {
    // Get the path from the URL directly
    const url = new URL(request.url);
    const pathParts = url.pathname.split('/api/')[1];
    const backendUrl = `${API_URL}/api/${pathParts}`;
    
    console.log(`Proxying DELETE request to: ${backendUrl}`);
    
    // Get authorization header
    const authHeader = request.headers.get('Authorization');
    console.log('Authorization header:', authHeader ? 'Present' : 'Missing');
    
    // Set up headers
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    
    if (authHeader) {
      headers['Authorization'] = authHeader;
    }
    
    // Make the request to the backend
    const response = await fetch(backendUrl, {
      method: 'DELETE',
      headers,
    });
    
    // For debugging, log the response status
    console.log(`Backend response status: ${response.status}`);
    
    // Get the response as text first
    const responseText = await response.text();
    console.log('Response text:', responseText);
    
    // Try to parse as JSON
    let data;
    try {
      data = responseText ? JSON.parse(responseText) : {};
    } catch (error) {
      console.error('Error parsing response as JSON:', error);
      return NextResponse.json(
        { 
          success: false, 
          message: 'Invalid JSON response from backend',
          rawResponse: responseText
        },
        { status: 502 }
      );
    }
    
    // Return the response
    return NextResponse.json(data, {
      status: response.status,
    });
  } catch (error) {
    console.error(`Error in DELETE request:`, error);
    return NextResponse.json(
      { success: false, message: 'Backend API error', error: String(error) },
      { status: 500 }
    );
  }
}