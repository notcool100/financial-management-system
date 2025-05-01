import { NextRequest, NextResponse } from 'next/server';
import { withAuth, handleApiResponse } from '@/lib/api-middleware';

export async function GET(request: NextRequest) {
  try {
    // Forward the request to the backend with authentication
    const response = await withAuth(
      request,
      `${process.env.NEXT_PUBLIC_API_URL}/api/loans/types`,
      { method: 'GET' }
    );
    
    // Handle the response
    const result = await handleApiResponse(
      response,
      'Loan types fetched successfully',
      'Failed to fetch loan types'
    );
    
    if (result.success) {
      return NextResponse.json({
        success: true,
        loanTypes: result.data.data
      });
    } else {
      return NextResponse.json(
        { success: false, message: result.message },
        { status: result.status }
      );
    }
  } catch (error: any) {
    console.error('Error in loan types API route:', error);
    
    return NextResponse.json(
      { success: false, message: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}