import { NextRequest, NextResponse } from 'next/server';
import { withAuth, handleApiResponse } from '@/lib/api-middleware';

export async function GET(request: NextRequest) {
  try {
    // Forward the request to the backend with authentication
    const response = await withAuth(
      request,
      `${process.env.NEXT_PUBLIC_API_URL}/api/loans/summary`,
      { method: 'GET' }
    );
    
    // Handle the response
    const result = await handleApiResponse(
      response,
      'Loan summary fetched successfully',
      'Failed to fetch loan summary'
    );
    
    if (result.success) {
      // Make sure we're handling the response correctly
      return NextResponse.json({
        success: true,
        summary: result.data.summary || {
          flat: {
            active_count: 0,
            total_amount: 0,
            avg_interest_rate: 0
          },
          diminishing: {
            active_count: 0,
            total_amount: 0,
            avg_interest_rate: 0
          }
        }
      });
    } else {
      return NextResponse.json(
        { success: false, message: result.message },
        { status: result.status }
      );
    }
  } catch (error: any) {
    console.error('Error in loan summary API route:', error);
    
    return NextResponse.json(
      { success: false, message: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}