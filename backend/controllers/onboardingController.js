const User = require('../models/User');

// Update personal details
exports.updatePersonalDetails = async (req, res) => {
  try {
    const {
      firstName,
      lastName,
      dateOfBirth,
      gender,
      address,
      city,
      state,
      zipCode,
      country,
      profilePicture, // base64 string
    } = req.body;

    const user = await User.findByIdAndUpdate(
      req.user.id,
      {
        $set: {
          'profile.firstName': firstName,
          'profile.lastName': lastName,
          'profile.dateOfBirth': dateOfBirth,
          'profile.gender': gender,
          'profile.address': address,
          'profile.city': city,
          'profile.state': state,
          'profile.zipCode': zipCode,
          'profile.country': country,
          'profile.profilePicture': profilePicture,
          'onboarding.personalDetailsCompleted': true,
        },
      },
      { new: true, runValidators: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      success: true,
      message: 'Personal details updated successfully',
      user,
    });
  } catch (error) {
    console.error('Update personal details error:', error);
    res.status(500).json({ error: error.message });
  }
};

// Update work experience
exports.updateWorkExperience = async (req, res) => {
  try {
    const { workExperience } = req.body;

    const user = await User.findByIdAndUpdate(
      req.user.id,
      {
        $set: {
          'profile.workExperience': workExperience,
          'onboarding.workExperienceCompleted': true,
        },
      },
      { new: true, runValidators: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

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
    const { availability } = req.body;

    const user = await User.findByIdAndUpdate(
      req.user.id,
      {
        $set: {
          'profile.availability': availability,
          'onboarding.availabilityCompleted': true,
          'onboarding.completed': true,
        },
      },
      { new: true, runValidators: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

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
      companyLogo, // base64 string
    } = req.body;

    const user = await User.findByIdAndUpdate(
      req.user.id,
      {
        $set: {
          'profile.companyName': companyName,
          'profile.companySize': companySize,
          'profile.industry': industry,
          'profile.website': website,
          'profile.description': description,
          'profile.companyLogo': companyLogo,
          'onboarding.businessSummaryCompleted': true,
          'onboarding.completed': true,
        },
      },
      { new: true, runValidators: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

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
    const { summary, skills, certifications, languages } = req.body;

    const user = await User.findByIdAndUpdate(
      req.user.id,
      {
        $set: {
          'profile.summary': summary,
          'profile.skills': skills,
          'profile.certifications': certifications,
          'profile.languages': languages,
          'onboarding.personalSummaryCompleted': true,
        },
      },
      { new: true, runValidators: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

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
