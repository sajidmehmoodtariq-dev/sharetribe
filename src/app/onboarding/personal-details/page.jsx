'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useTheme } from '@/components/ThemeProvider';
import Image from 'next/image';
import { compressImage, validateImage } from '@/lib/imageUtils';

export default function PersonalDetailsPage() {
  const { getBackgroundStyle, getCardClassName, getTextClassName, getSubTextClassName } = useTheme();
  const router = useRouter();
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    mobileNumber: '',
    dateOfBirth: '',
    address: '',
    showEmailOnProfile: true,
    showMobileOnProfile: true,
  });
  const [profileImage, setProfileImage] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Get signup data from sessionStorage
  useEffect(() => {
    const signupDataStr = sessionStorage.getItem('signupData');
    if (signupDataStr) {
      try {
        const signupData = JSON.parse(signupDataStr);
        setFormData(prev => ({
          ...prev,
          fullName: signupData.fullName || '',
          email: signupData.email || '',
          mobileNumber: signupData.mobileNumber || '',
        }));
      } catch (error) {
        console.error('Error parsing signup data:', error);
      }
    }
    setIsLoading(false);
  }, []);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate image
    const validation = validateImage(file, { maxSizeInMB: 5 });
    if (!validation.valid) {
      alert(validation.error);
      return;
    }

    setIsUploading(true);
    
    try {
      // Compress image to base64
      const compressedBase64 = await compressImage(file, {
        maxWidth: 400,
        maxHeight: 400,
        quality: 0.8,
        outputFormat: 'image/jpeg'
      });
      
      setProfileImage(compressedBase64);
    } catch (error) {
      console.error('Image compression error:', error);
      alert('Failed to process image. Please try another image.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleContinue = async () => {
    try {
      // Get signup data from sessionStorage
      const signupDataStr = sessionStorage.getItem('signupData');
      const selectedGoal = sessionStorage.getItem('selectedGoal');
      const userRole = sessionStorage.getItem('userRole');
      
      let requestBody = {
        ...formData,
        profileImage,
      };

      // If this is first save (coming from signup), include signup data
      if (signupDataStr) {
        const signupData = JSON.parse(signupDataStr);
        requestBody = {
          ...requestBody,
          email: signupData.email,
          password: signupData.password,
          fullName: formData.fullName || signupData.fullName,
          mobileNumber: formData.mobileNumber || signupData.mobileNumber,
          role: userRole || 'employee',
          selectedGoal,
        };
      }

      // Save personal details (and create user if first time)
      const response = await fetch('http://localhost:5000/api/onboarding/personal-details', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to save personal details');
      }

      // If we got a token, store it (first save)
      if (data.token) {
        localStorage.setItem('token', data.token);
        // Clear signup data since account is created
        sessionStorage.removeItem('signupData');
        sessionStorage.removeItem('selectedGoal');
        sessionStorage.removeItem('userRole');
      }

      // Navigate to personal summary
      router.push('/onboarding/personal-summary');
    } catch (error) {
      console.error('Error:', error);
      alert(error.message || 'Something went wrong. Please try again.');
    }
  };

  return (
    <>
      {/* Fixed Background */}
      <div 
        className="fixed inset-0 w-full h-full z-0"
        style={getBackgroundStyle()}
      />
      
      {/* Loading State */}
      {isLoading ? (
        <div className="relative z-10 min-h-screen flex items-center justify-center">
          <div className={`text-center ${getTextClassName()}`}>
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#00EA72] mx-auto mb-4"></div>
            <p>Loading your profile...</p>
          </div>
        </div>
      ) : (
      <>
      {/* Content Container */}
      <div className="relative z-10 min-h-screen flex items-center justify-center">
      <div className="w-full max-w-[375px] mx-auto h-screen flex flex-col">
        {/* Logo at top */}
        <div className="flex justify-center pt-8 pb-6">
          <Image
            src="/logo.png"
            alt="Head Huntd Logo"
            width={60}
            height={60}
            className="object-contain"
            priority
          />
        </div>

        {/* Progress Steps */}
        <div className="px-6 mb-6">
          <div className="flex items-center justify-center mb-4">
            {[1, 2, 3, 4].map((step, index) => (
              <div key={step} className="flex items-center">
                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-medium ${
                  step === 1 
                    ? 'bg-[#00EA72] text-white' 
                    : 'bg-gray-200 text-gray-500'
                }`}>
                  {step}
                </div>
                {index < 3 && (
                  <div className={`w-8 h-0.5 mx-1 ${
                    step === 1 ? 'bg-gray-300' : 'bg-gray-200'
                  }`} />
                )}
              </div>
            ))}
          </div>
          <div className="flex justify-between text-xs px-2">
            <span className={`${getTextClassName()} font-medium text-center`}>Personal<br />Details</span>
            <span className={`${getSubTextClassName()} text-center`}>Personal<br />Summary</span>
            <span className={`${getSubTextClassName()} text-center`}>Skills</span>
            <span className={`${getSubTextClassName()} text-center`}>Availability</span>
          </div>
        </div>

        {/* Form Card */}
        <div className="flex-1 mx-4 mb-4">
          <div className={`${getCardClassName()} rounded-3xl px-8 py-8 h-full shadow-sm overflow-y-auto`}>
            <h2 className={`text-[22px] font-bold ${getTextClassName()} mb-8`}>
              Personal Details
            </h2>

            {/* Profile Image Upload */}
            <div className="flex flex-col items-center mb-8">
              <div className="w-24 h-24 rounded-full border-2 border-gray-300 flex items-center justify-center mb-4 overflow-hidden">
                {profileImage ? (
                  <img 
                    src={profileImage} 
                    alt="Profile" 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                )}
              </div>
              <input
                type="file"
                id="profileImage"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
                disabled={isUploading}
              />
              <Button
                onClick={() => document.getElementById('profileImage').click()}
                variant="outline"
                className={`text-[13px] px-6 py-2 rounded-full border-gray-300 ${getTextClassName()}`}
                disabled={isUploading}
              >
                {isUploading ? 'Processing...' : 'Upload Image'}
              </Button>
              {isUploading && (
                <p className="text-xs text-gray-500 mt-2">Compressing image...</p>
              )}
            </div>

            {/* Form Fields */}
            <div className="space-y-6">
              {/* Full Name */}
              <div>
                <Label htmlFor="fullName" className={`text-[13px] font-medium ${getTextClassName()} mb-2 block`}>
                  Full Name*
                </Label>
                <Input
                  id="fullName"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleInputChange}
                  placeholder="Sal Monella"
                  className="h-12 rounded-xl border-gray-300 text-[15px]"
                />
              </div>

              {/* Email */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <Label htmlFor="email" className={`text-[13px] font-medium ${getTextClassName()}`}>
                    Email
                  </Label>
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="showEmailOnProfile"
                      name="showEmailOnProfile"
                      checked={formData.showEmailOnProfile}
                      onChange={handleInputChange}
                      className="w-4 h-4 text-[#00EA72] border-gray-300 rounded focus:ring-[#00EA72]"
                    />
                    <Label htmlFor="showEmailOnProfile" className={`text-[12px] ${getSubTextClassName()}`}>
                      Show on profile card
                    </Label>
                  </div>
                </div>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="salmonella@gmail.com"
                  className="h-12 rounded-xl border-gray-300 text-[15px]"
                />
              </div>

              {/* Mobile Number */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <Label htmlFor="mobileNumber" className={`text-[13px] font-medium ${getTextClassName()}`}>
                    Mobile Number
                  </Label>
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="showMobileOnProfile"
                      name="showMobileOnProfile"
                      checked={formData.showMobileOnProfile}
                      onChange={handleInputChange}
                      className="w-4 h-4 text-[#00EA72] border-gray-300 rounded focus:ring-[#00EA72]"
                    />
                    <Label htmlFor="showMobileOnProfile" className={`text-[12px] ${getSubTextClassName()}`}>
                      Show on profile card
                    </Label>
                  </div>
                </div>
                <Input
                  id="mobileNumber"
                  name="mobileNumber"
                  type="tel"
                  value={formData.mobileNumber}
                  onChange={handleInputChange}
                  placeholder="Enter your mobile number"
                  className="h-12 rounded-xl border-gray-300 text-[15px]"
                />
              </div>

              {/* Date of Birth */}
              <div>
                <Label htmlFor="dateOfBirth" className={`text-[13px] font-medium ${getTextClassName()} mb-2 block`}>
                  Date of Birth
                </Label>
                <p className={`text-[12px] ${getSubTextClassName()} mb-2`}>
                  We use this to show you relevant jobs
                </p>
                <Input
                  id="dateOfBirth"
                  name="dateOfBirth"
                  type="date"
                  value={formData.dateOfBirth}
                  onChange={handleInputChange}
                  className="h-12 rounded-xl border-gray-300 text-[15px]"
                />
              </div>

              {/* Address */}
              <div>
                <Label htmlFor="address" className={`text-[13px] font-medium ${getTextClassName()} mb-2 block`}>
                  Address
                </Label>
                <p className={`text-[12px] ${getSubTextClassName()} mb-2`}>
                  Add your address for improved job matches nearby. Only suburb will be displayed on your profile
                </p>
                <Input
                  id="address"
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  placeholder="9 Halifax Street, Adelaide, SA, 5000"
                  className="h-12 rounded-xl border-gray-300 text-[15px]"
                />
              </div>
            </div>

            {/* Continue Button */}
            <div className="mt-8">
              <Button
                onClick={handleContinue}
                className="w-full h-12 bg-[#00EA72] hover:bg-[#00D66C] text-black font-medium text-[15px] rounded-full"
              >
                Continue to Personal Summary →
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
    </>
    )}
    </>
  );
}