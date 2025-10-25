import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import clientPromise from '@/lib/mongodb';
import { generateToken, setAuthCookie } from '@/lib/auth';
import { sanitizeUser } from '@/models/User';

export async function POST(request) {
  try {
    const body = await request.json();
    const { email, password } = body;
    
    console.log('=== Login Attempt ===');
    console.log('Email:', email);
    console.log('Password provided:', password ? 'Yes' : 'No');
    console.log('Password length:', password?.length);

    // Validate required fields
    if (!email || !password) {
      console.error('Missing email or password');
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    // Connect to MongoDB
    const client = await clientPromise;
    const db = client.db('sharetribe');
    const usersCollection = db.collection('users');

    // Find user by email
    const user = await usersCollection.findOne({ email });
    console.log('User found:', user ? 'Yes' : 'No');
    
    if (!user) {
      console.error('User not found for email:', email);
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      );
    }

    console.log('User role:', user.role);
    console.log('Stored password hash:', user.password?.substring(0, 20) + '...');
    console.log('Hash starts with $2:', user.password?.startsWith('$2'));

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password);
    console.log('Password valid:', isValidPassword);
    
    if (!isValidPassword) {
      console.error('Password comparison failed');
      // Check if password was stored in plain text by mistake
      if (password === user.password) {
        console.error('WARNING: Password stored in plain text!');
      }
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      );
    }

    // Generate JWT token
    const token = generateToken(user._id.toString(), user.email, user.role);

    // Create response with cookie
    const response = NextResponse.json(
      {
        success: true,
        user: sanitizeUser({
          id: user._id.toString(),
          email: user.email,
          fullName: user.fullName,
          role: user.role,
        }),
      },
      { status: 200 }
    );

    // Set cookie
    const cookieOptions = setAuthCookie(token);
    response.cookies.set(cookieOptions);

    return response;
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
