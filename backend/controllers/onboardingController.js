const User = require('../models/User');
const jwt = require('jsonwebtoken');

// Generate JWT Token
const generateToken = (userId) => {
  return jwt.sign(
    { id: userId },
    process.env.JWT_SECRET || 'your-secret-key-change-in-production',
    { expiresIn: '30d' }
  );
};

// Update personal details - Also creates user if doesn't exist
exports.updatePersonalDetails = async (req, res) => {
  try {
    const {
      // From signup
      fullName,
      email,
      password,
      mobileNumber,
      role,
      selectedGoal,
      // Personal details
      dateOfBirth,
      address,
      profileImage,
      showEmailOnProfile,
      showMobileOnProfile,
    } = req.body;

    let user;
    let token;
    let isNewUser = false;

    // If we have email and password, this is the first save - create user
    if (email && password) {
      // Check if user exists
      const existingUser = await User.findOne({ email: email.toLowerCase() });
      
      if (existingUser) {
        // User exists, just update
        user = existingUser;
      } else {
        // Create new user
        user = await User.create({
          email: email.toLowerCase(),
          password,
          fullName,
          mobileNumber,
          role: role || 'employee',
          selectedGoal,
          personalDetails: {
            dateOfBirth,
            address,
            profileImage,
            showEmailOnProfile: showEmailOnProfile ?? true,
            showMobileOnProfile: showMobileOnProfile ?? true,
          },
          'onboarding.personalDetailsCompleted': true,
          'onboarding.currentStep': 2,
        });
        isNewUser = true;
      }

      // Generate token
      token = generateToken(user._id);
    } else {
      // User already exists and is authenticated, just update
      user = await User.findByIdAndUpdate(
        req.user.id,
        {
          $set: {
            fullName,
            mobileNumber,
            'personalDetails.dateOfBirth': dateOfBirth,
            'personalDetails.address': address,
            'personalDetails.profileImage': profileImage,
            'personalDetails.showEmailOnProfile': showEmailOnProfile,
            'personalDetails.showMobileOnProfile': showMobileOnProfile,
            'onboarding.personalDetailsCompleted': true,
            'onboarding.currentStep': 2,
          },
        },
        { new: true, runValidators: true }
      ).select('-password');

      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }
    }

    // Remove password from response
    const userResponse = user.toObject();
    delete userResponse.password;

    res.json({
      success: true,
      message: isNewUser ? 'Account created successfully' : 'Personal details updated successfully',
      user: userResponse,
      token,
    });
  } catch (error) {
    console.error('Update personal details error:', error);
    res.status(500).json({ error: error.message });
  }
};

// Update work experience
exports.updateWorkExperience = async (req, res) => {
  try {
    const { 
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
      yearsOfExperience,
      currentJobTitle,
      currentCompany 
    } = req.body;

    console.log('Updating work experience for user:', req.user.id);
    console.log('Work experience data received:', req.body);

    // Convert employmentTypes from object to array of strings
    let employmentTypesArray = [];
    if (employmentTypes) {
      if (typeof employmentTypes === 'object' && !Array.isArray(employmentTypes)) {
        // Convert object like {fullTime: true, partTime: false} to array ['full-time']
        if (employmentTypes.fullTime) employmentTypesArray.push('full-time');
        if (employmentTypes.partTime) employmentTypesArray.push('part-time');
        if (employmentTypes.casual) employmentTypesArray.push('casual');
      } else if (Array.isArray(employmentTypes)) {
        employmentTypesArray = employmentTypes;
      }
    }

    const user = await User.findByIdAndUpdate(
      req.user.id,
      {
        $set: {
          'workExperience.workStatus': workStatus || '',
          'workExperience.employmentTypes': employmentTypesArray,
          'workExperience.industry': selectedIndustry || '',
          'workExperience.role': selectedRole || '',
          'workExperience.yearsOfExperience': yearsOfExperience || '',
          'workExperience.highestEducation': highestEducation || '',
          'workExperience.currentJobTitle': currentJobTitle || jobTitle || '',
          'workExperience.currentCompany': currentCompany || companyName || '',
          'workExperience.employmentDurationFrom': employmentDurationFrom || '',
          'workExperience.employmentDurationTo': employmentDurationTo || '',
          'workExperience.workExperienceSummary': workExperienceSummary || '',
          'onboarding.workExperienceCompleted': true,
          'onboarding.currentStep': 4,
        },
      },
      { new: true, runValidators: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    console.log('Work experience updated successfully');

    res.json({
      success: true,
      message: 'Work experience updated successfully',
      user,
    });
  } catch (error) {
    console.error('Update work experience error:', error);
    res.status(500).json({ error: error.message });
  }
};

// Update availability
exports.updateAvailability = async (req, res) => {
  try {
    const { availability, dateRange, noticePreference } = req.body;

    console.log('Updating availability for user:', req.user.id);
    console.log('Availability data:', { availability, dateRange, noticePreference });

    // Convert availability times to array
    let preferredWorkTimes = [];
    if (availability && typeof availability === 'object') {
      if (availability.morning) preferredWorkTimes.push('morning');
      if (availability.afternoon) preferredWorkTimes.push('afternoon');
      if (availability.evening) preferredWorkTimes.push('evening');
    }

    const user = await User.findByIdAndUpdate(
      req.user.id,
      {
        $set: {
          'availability.preferredWorkTimes': preferredWorkTimes,
          'availability.dateRange': dateRange || {},
          'availability.noticePreference': noticePreference,
          'onboarding.availabilityCompleted': true,
          'onboarding.completed': true,
        },
      },
      { new: true, runValidators: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    console.log('Availability updated successfully, onboarding complete');

    res.json({
      success: true,
      message: 'Availability updated successfully',
      user,
    });
  } catch (error) {
    console.error('Update availability error:', error);
    res.status(500).json({ error: error.message });
  }
};

// Update business summary (for employers)
exports.updateBusinessSummary = async (req, res) => {
  try {
    const {
      companyName,
      companySize,
      industry,
      website,
      description,
      companyLogo,
      country,
      address,
      abn,
      yourRole
    } = req.body;

    console.log('Updating business summary for user:', req.user.id);

    const user = await User.findByIdAndUpdate(
      req.user.id,
      {
        $set: {
          'businessSummary.companyName': companyName,
          'businessSummary.companySize': companySize,
          'businessSummary.industry': industry,
          'businessSummary.website': website,
          'businessSummary.description': description,
          'businessSummary.companyLogo': companyLogo,
          'businessSummary.country': country,
          'businessSummary.address': address,
          'businessSummary.abn': abn,
          'businessSummary.yourRole': yourRole,
          'onboarding.businessSummaryCompleted': true,
          'onboarding.completed': true,
        },
      },
      { new: true, runValidators: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    console.log('Business summary updated successfully');

    res.json({
      success: true,
      message: 'Business summary updated successfully',
      user,
    });
  } catch (error) {
    console.error('Update business summary error:', error);
    res.status(500).json({ error: error.message });
  }
};

// Update personal summary
exports.updatePersonalSummary = async (req, res) => {
  try {
    const { personalSummary } = req.body;

    console.log('Updating personal summary for user:', req.user.id, 'Data:', personalSummary);

    const user = await User.findByIdAndUpdate(
      req.user.id,
      {
        $set: {
          'personalSummary.summary': personalSummary,
          'onboarding.personalSummaryCompleted': true,
          'onboarding.currentStep': 3,
        },
      },
      { new: true, runValidators: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    console.log('Personal summary updated successfully');

    res.json({
      success: true,
      message: 'Personal summary updated successfully',
      user,
    });
  } catch (error) {
    console.error('Update personal summary error:', error);
    res.status(500).json({ error: error.message });
  }
};

// Get current user profile
exports.getCurrentProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ success: true, user });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ error: error.message });
  }
};
