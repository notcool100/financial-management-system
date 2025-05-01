import { NextRequest, NextResponse } from 'next/server';
import { withAuth, handleApiResponse } from '@/lib/api-middleware';

export async function GET(request: NextRequest) {
  try {
    // Forward the request to the backend with authentication
    const response = await withAuth(
      request,
      `${process.env.NEXT_PUBLIC_API_URL}/api/clients`,
      { method: 'GET' }
    );
    
    // Handle the response
    const result = await handleApiResponse(
      response,
      'Clients fetched successfully',
      'Failed to fetch clients'
    );
    
    if (result.success) {
      // Make sure we're handling the response correctly
      return NextResponse.json({
        success: true,
        clients: result.data.clients || result.data.data || []
      });
    } else {
      return NextResponse.json(
        { success: false, message: result.message },
        { status: result.status }
      );
    }
  } catch (error: any) {
    console.error('Error in clients API route:', error);
    
    return NextResponse.json(
      { success: false, message: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}