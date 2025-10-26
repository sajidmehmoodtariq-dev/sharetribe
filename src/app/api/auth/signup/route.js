import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const body = await request.json();
    console.log('Signup request body (DEMO MODE):', JSON.stringify(body, null, 2));
    
    const { 
      email, 
      password, 
      fullName, 
      mobileNumber, 
      role,
      selectedGoal,
      subscriptionPackage,
      // Additional fields from onboarding
      personalSummary,
      workExperience,
      availability,
      dateRange,
      noticePreference,
      // Personal details
      dateOfBirth,
      address,
      showEmailOnProfile,
      showMobileOnProfile,
      profileImage,
    } = body;

    // DEMO MODE: No validation required

    // DEMO MODE: Just simulate successful signup without database
    console.log('=== DEMO SIGNUP SUCCESS ===');
    console.log('User would be created with data:', {
      email,
      fullName,
      role: role || 'employee',
      selectedGoal,
      subscriptionPackage,
      personalSummary,
      workExperience,
      availability,
      hasCompleteProfile: !!(personalSummary && workExperience && availability)
    });

    // Simulate a delay like a real API call
    await new Promise(resolve => setTimeout(resolve, 500));

    // Return success response
    return NextResponse.json(
      {
        success: true,
        message: 'Account created successfully (Demo Mode)',
        user: {
          id: 'demo-user-' + Date.now(),
          email,
          fullName,
          role: role || 'employee',
          selectedGoal,
          subscriptionPackage,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Signup error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
