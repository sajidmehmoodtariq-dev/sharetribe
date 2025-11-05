const User = require('../models/User');
const Subscription = require('../models/Subscription');
const jwt = require('jsonwebtoken');

// Generate JWT Token
const generateToken = (userId) => {
  return jwt.sign(
    { id: userId },
    process.env.JWT_SECRET || 'your-secret-key-change-in-production',
    { expiresIn: '30d' }
  );
};

// @desc    Check if email exists
// @route   POST /api/auth/check-email
// @access  Public
exports.checkEmail = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    const existingUser = await User.findOne({ email: email.toLowerCase() });

    res.json({ exists: !!existingUser });
  } catch (error) {
    console.error('Check email error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// @desc    Register a new user (complete signup)
// @route   POST /api/auth/signup
// @access  Public
exports.signup = async (req, res) => {
  try {
    const {
      email,
      password,
      fullName,
      mobileNumber,
      role,
      selectedGoal,
      subscriptionPackage,
      // Personal details
      dateOfBirth,
      address,
      profileImage,
      showEmailOnProfile,
      showMobileOnProfile,
      personalSummary,
      // Work experience
      workStatus,
      employmentTypes,
      selectedIndustry,
      selectedRole,
      jobTitle,
      companyName,
      employmentDurationFrom,
      employmentDurationTo,
      workExperienceSummary,
      highestEducation,
      skills,
      licenses,
      // Availability
      availability,
      dateRange,
      noticePreference,
      // Business details (for employers)
      businessName,
      country,
      businessAddress,
      industry,
      businessSize,
      yourRole,
      website,
      abn,
      businessSummary
    } = req.body;

    // Validate required fields
    if (!email || !password || !fullName) {
      return res.status(400).json({
        error: 'Please provide email, password, and full name'
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({ error: 'User already exists' });
    }

    // Prepare user data
    const userData = {
      email: email.toLowerCase(),
      password,
      fullName,
      mobileNumber,
      role: role || 'employee',
      selectedGoal,
      dateOfBirth,
      address,
      profileImage,
      showEmailOnProfile,
      showMobileOnProfile,
      personalSummary
    };

    // Add work experience for employees
    if (role === 'employee' && workStatus) {
      userData.workExperience = {
        workStatus,
        employmentTypes,
        selectedIndustry,
        selectedRole,
        jobTitle,
        companyName,
        employmentDurationFrom,
        employmentDurationTo,
        workExperienceSummary,
        highestEducation,
        skills,
        licenses
      };
    }

    // Add availability for employees
    if (role === 'employee' && availability) {
      userData.availability = {
        ...availability,
        dateFrom: dateRange?.from,
        dateTo: dateRange?.to,
        noticePreference
      };
    }

    // Add business details for employers
    if (role === 'employer') {
      userData.businessDetails = {
        businessName,
        country,
        businessAddress,
        industry,
        businessSize,
        yourRole,
        website,
        abn,
        businessSummary
      };
    }

    // Determine if profile is completed
    const hasBasicInfo = fullName && email && mobileNumber;
    const hasOnboardingData = role === 'employee' 
      ? (personalSummary && workStatus && selectedIndustry)
      : (businessName && industry);
    
    userData.profileCompleted = hasBasicInfo && hasOnboardingData;
    userData.onboardingStep = userData.profileCompleted ? 4 : 1;

    // Create user
    const user = await User.create(userData);

    // Generate token
    const token = generateToken(user._id);

    // Remove password from response
    const userResponse = user.toObject();
    delete userResponse.password;

    res.status(201).json({
      success: true,
      message: 'Account created successfully',
      token,
      user: userResponse
    });
  } catch (error) {
    console.error('Signup error:', error);
    
    // Handle validation errors
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({ error: messages.join(', ') });
    }
    
    res.status(500).json({ error: 'Internal server error' });
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({
        error: 'Please provide email and password'
      });
    }

    // Find user
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Check if account is locked
    if (user.isLocked()) {
      return res.status(423).json({
        error: 'Account is locked due to too many failed login attempts. Please try again later.'
      });
    }

    // Verify password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      await user.incLoginAttempts();
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Reset login attempts on successful login
    if (user.loginAttempts > 0 || user.lockUntil) {
      await user.updateOne({
        $set: { loginAttempts: 0 },
        $unset: { lockUntil: 1 }
      });
    }

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    // Generate token
    const token = generateToken(user._id);

    // Remove password from response
    const userResponse = user.toObject();
    delete userResponse.password;

    res.json({
      success: true,
      message: 'Logged in successfully',
      token,
      user: userResponse
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// @desc    Logout user
// @route   POST /api/auth/logout
// @access  Private
exports.logout = async (req, res) => {
  try {
    // With JWT, logout is handled on the client side by removing the token
    // But we can add token to a blacklist if needed
    res.json({
      success: true,
      message: 'Logged out successfully'
    });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// @desc    Get current user
// @route   GET /api/auth/me
// @access  Private
exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id)
      .select('-password')
      .populate('subscription');
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      success: true,
      user
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private
exports.updateProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const updateData = req.body;

    // Remove sensitive fields that shouldn't be updated here
    delete updateData.password;
    delete updateData.email;
    delete updateData.role;

    const user = await User.findByIdAndUpdate(
      userId,
      { $set: updateData },
      { new: true, runValidators: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      success: true,
      message: 'Profile updated successfully',
      user
    });
  } catch (error) {
    console.error('Update profile error:', error);
    
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({ error: messages.join(', ') });
    }
    
    res.status(500).json({ error: 'Internal server error' });
  }
};

// @desc    Update onboarding step
// @route   PUT /api/auth/onboarding/:step
// @access  Private
exports.updateOnboardingStep = async (req, res) => {
  try {
    const userId = req.user.id;
    const { step } = req.params;
    const stepData = req.body;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Update based on step
    switch (parseInt(step)) {
      case 1: // Personal Details
        user.fullName = stepData.fullName || user.fullName;
        user.email = stepData.email || user.email;
        user.mobileNumber = stepData.mobileNumber || user.mobileNumber;
        user.dateOfBirth = stepData.dateOfBirth || user.dateOfBirth;
        user.address = stepData.address || user.address;
        user.profileImage = stepData.profileImage || user.profileImage;
        user.showEmailOnProfile = stepData.showEmailOnProfile ?? user.showEmailOnProfile;
        user.showMobileOnProfile = stepData.showMobileOnProfile ?? user.showMobileOnProfile;
        break;
      
      case 2: // Personal Summary
        user.personalSummary = stepData.personalSummary || user.personalSummary;
        break;
      
      case 3: // Work Experience
        user.workExperience = {
          ...user.workExperience,
          ...stepData
        };
        break;
      
      case 4: // Availability
        user.availability = {
          ...user.availability,
          ...stepData
        };
        user.profileCompleted = true;
        break;
    }

    user.onboardingStep = Math.max(user.onboardingStep, parseInt(step));
    await user.save();

    const userResponse = user.toObject();
    delete userResponse.password;

    res.json({
      success: true,
      message: 'Onboarding step updated successfully',
      user: userResponse
    });
  } catch (error) {
    console.error('Update onboarding error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
