import { NextRequest, NextResponse } from 'next/server';
import { withAuth, handleApiResponse } from '@/lib/api-middleware';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate required fields
    if (!body.amount || !body.interest_rate || !body.tenure_months || !body.calculation_type) {
      return NextResponse.json(
        { success: false, message: 'Missing required fields' },
        { status: 400 }
      );
    }
    
    // Forward the request to the backend with authentication
    const response = await withAuth(
      request,
      `${process.env.NEXT_PUBLIC_API_URL}/api/loans/calculate`,
      {
        method: 'POST',
        body: JSON.stringify(body)
      }
    );
    
    // Handle the response
    const result = await handleApiResponse(
      response,
      'Loan calculated successfully',
      'Failed to calculate loan'
    );
    
    if (result.success) {
      return NextResponse.json({
        success: true,
        calculation: result.data.calculation
      });
    } else {
      return NextResponse.json(
        { success: false, message: result.message },
        { status: result.status }
      );
    }
  } catch (error: any) {
    console.error('Error in loan calculation API route:', error);
    
    return NextResponse.json(
      { success: false, message: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}