import { NextRequest, NextResponse } from 'next/server';
import { withAuth, handleApiResponse } from '@/lib/api-middleware';

export async function GET(request: NextRequest) {
  try {
    // Get query parameters
    const searchParams = request.nextUrl.searchParams;
    const sortBy = searchParams.get('sort_by') || 'disburse_date';
    const sortOrder = searchParams.get('sort_order') || 'desc';
    const calculationType = searchParams.get('calculation_type');
    const status = searchParams.get('status');
    const page = searchParams.get('page') || '1';
    const limit = searchParams.get('limit') || '10';
    
    // Build the API URL with query parameters
    let apiUrl = `${process.env.NEXT_PUBLIC_API_URL}/api/loans?sort_by=${sortBy}&sort_order=${sortOrder}`;
    
    if (calculationType) {
      apiUrl += `&calculation_type=${calculationType}`;
    }
    
    if (status) {
      apiUrl += `&status=${status}`;
    }
    
    apiUrl += `&page=${page}&limit=${limit}`;
    
    // Forward the request to the backend with authentication
    const response = await withAuth(request, apiUrl, { method: 'GET' });
    
    // Handle the response
    const result = await handleApiResponse(
      response,
      'Loans fetched successfully',
      'Failed to fetch loans'
    );
    
    if (result.success) {
      // Make sure we're handling the response correctly
      return NextResponse.json({
        success: true,
        data: {
          loans: result.data.loans || result.data.data?.loans || [],
          pagination: result.data.pagination || result.data.data?.pagination || {
            total: 0,
            page: 1,
            limit: 10,
            pages: 0
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
    console.error('Error in loans API route:', error);
    
    return NextResponse.json(
      { success: false, message: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate required fields
    if (!body.client_id || !body.loan_type_id || !body.amount || !body.interest_rate || 
        !body.tenure_months || !body.calculation_type || !body.disburse_date) {
      return NextResponse.json(
        { success: false, message: 'Missing required fields' },
        { status: 400 }
      );
    }
    
    // Forward the request to the backend with authentication
    const response = await withAuth(
      request,
      `${process.env.NEXT_PUBLIC_API_URL}/api/loans`,
      {
        method: 'POST',
        body: JSON.stringify(body)
      }
    );
    
    // Handle the response
    const result = await handleApiResponse(
      response,
      'Loan created successfully',
      'Failed to create loan'
    );
    
    if (result.success) {
      return NextResponse.json({
        success: true,
        loan: result.data.data
      });
    } else {
      return NextResponse.json(
        { success: false, message: result.message },
        { status: result.status }
      );
    }
  } catch (error: any) {
    console.error('Error in create loan API route:', error);
    
    return NextResponse.json(
      { success: false, message: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}