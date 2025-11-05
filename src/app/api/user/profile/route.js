import { NextResponse } from 'next/server';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000';

export async function PUT(request) {
  try {
    // Get token from cookies
    const token = request.cookies.get('token')?.value;

    if (!token) {
      console.error('No token found in cookies');
      return NextResponse.json(
        { message: 'Unauthorized - No token found' },
        { status: 401 }
      );
    }

    // Get update data from request
    const updateData = await request.json();
    console.log('Update data received:', updateData);

    // Forward request to Express backend
    console.log('Forwarding to backend:', `${BACKEND_URL}/api/users/profile`);
    const backendResponse = await fetch(`${BACKEND_URL}/api/users/profile`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(updateData)
    });

    console.log('Backend response status:', backendResponse.status);
    
    const data = await backendResponse.json();
    console.log('Backend response data:', data);

    if (!backendResponse.ok) {
      return NextResponse.json(
        { message: data.message || data.error || 'Failed to update profile' },
        { status: backendResponse.status }
      );
    }

    return NextResponse.json(data);

  } catch (error) {
    console.error('Error updating profile:', error);

    return NextResponse.json(
      { message: 'Internal server error', error: error.message },
      { status: 500 }
    );
  }
}
