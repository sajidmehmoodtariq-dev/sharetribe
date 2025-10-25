import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import clientPromise from '@/lib/mongodb';
import { generateToken, setAuthCookie } from '@/lib/auth';
import { createUserDocument } from '@/models/User';

export async function POST(request) {
  try {
    const body = await request.json();
    const { email, password, fullName, mobileNumber, role } = body;

    // Validate required fields
    if (!email || !password || !fullName || !role) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Connect to MongoDB
    const client = await clientPromise;
    const db = client.db('sharetribe');
    const usersCollection = db.collection('users');

    // Check if user already exists
    const existingUser = await usersCollection.findOne({ email });
    if (existingUser) {
      return NextResponse.json(
        { error: 'User already exists' },
        { status: 400 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user document
    const userData = createUserDocument({
      email,
      password: hashedPassword,
      fullName,
      mobileNumber: mobileNumber || '',
      role,
    });

    // Insert user into database
    const result = await usersCollection.insertOne(userData);

    // Generate JWT token
    const token = generateToken(result.insertedId.toString(), email, role);

    // Create response with cookie
    const response = NextResponse.json(
      {
        success: true,
        user: {
          id: result.insertedId.toString(),
          email,
          fullName,
          role,
        },
      },
      { status: 201 }
    );

    // Set cookie
    const cookieOptions = setAuthCookie(token);
    response.cookies.set(cookieOptions);

    return response;
  } catch (error) {
    console.error('Signup error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
