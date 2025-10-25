import { NextResponse } from 'next/server';
import { getUserFromToken } from '@/lib/auth';
import clientPromise from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

export async function PATCH(request) {
  try {
    const user = await getUserFromToken();
    
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    
    // Remove fields that shouldn't be updated directly
    const { _id, password, email, ...updateData } = body;

    // Connect to MongoDB
    const client = await clientPromise;
    const db = client.db('sharetribe');
    const usersCollection = db.collection('users');

    // Update user
    const result = await usersCollection.findOneAndUpdate(
      { _id: new ObjectId(user.userId) },
      { 
        $set: { 
          ...updateData,
          updatedAt: new Date(),
        } 
      },
      { 
        returnDocument: 'after',
        projection: { password: 0 }
      }
    );

    if (!result) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        user: {
          id: result._id.toString(),
          ...result,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Update user error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
