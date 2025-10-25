'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';

export default function EmployerPersonalDetailsPage() {
  const router = useRouter();
  const fileInputRef = useRef(null);
  const [profileImagePreview, setProfileImagePreview] = useState(null);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    showEmailOnProfile: false,
    mobileNumber: '',
    showMobileOnProfile: false,
    dateOfBirth: '',
    address: '',
    profileImage: '',
  });

  // Load existing data on mount
  useEffect(() => {
    // First check if there's existing employer data
    const existingData = sessionStorage.getItem('employerData');
    if (existingData) {
      const parsedData = JSON.parse(existingData);
      setFormData(parsedData);
      if (parsedData.profileImage) {
        setProfileImagePreview(parsedData.profileImage);
      }
    } else {
      // If not, load from signup data
      const signupData = sessionStorage.getItem('signupData');
      if (signupData) {
        const parsedSignupData = JSON.parse(signupData);
        setFormData(prev => ({
          ...prev,
          fullName: parsedSignupData.fullName || '',
          email: parsedSignupData.email || '',
          mobileNumber: parsedSignupData.mobileNumber || '',
        }));
      }
    }
  }, []);

  const handleImageUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result;
        setProfileImagePreview(base64String);
        setFormData(prev => ({ ...prev, profileImage: base64String }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleContinue = () => {
    // Save employer personal details
    sessionStorage.setItem('employerData', JSON.stringify(formData));
    
    // Also update signupData with the latest info
    const signupData = JSON.parse(sessionStorage.getItem('signupData') || '{}');
    sessionStorage.setItem('signupData', JSON.stringify({
      ...signupData,
      fullName: formData.fullName,
      email: formData.email,
      mobileNumber: formData.mobileNumber,
    }));
    
    // Go to business details
    router.push('/employer/business-details');
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center mb-4">
            <svg className="w-16 h-16 text-white" viewBox="0 0 100 100" fill="currentColor">
              <text x="10" y="70" fontSize="80" fontFamily="Arial" fontWeight="bold">|||</text>
            </svg>
          </div>
          <div className="text-white text-sm font-light tracking-wider">HEAD HUNTD</div>
        </div>

        {/* Progress Indicator */}
        <div className="flex items-center justify-center mb-8 space-x-3">
          <div className="flex flex-col items-center">
            <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center text-black font-bold text-sm mb-1">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            </div>
            <span className="text-green-500 text-xs text-center">Personal<br/>Details</span>
          </div>
          <div className="w-8 h-0.5 bg-gray-700 mb-6"></div>
          <div className="flex flex-col items-center">
            <div className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center text-gray-400 font-bold text-sm mb-1">
              2
            </div>
            <span className="text-gray-400 text-xs text-center">Business<br/>Details</span>
          </div>
          <div className="w-8 h-0.5 bg-gray-700 mb-6"></div>
          <div className="flex flex-col items-center">
            <div className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center text-gray-400 font-bold text-sm mb-1">
              3
            </div>
            <span className="text-gray-400 text-xs text-center">Business<br/>Summary</span>
          </div>
          <div className="w-8 h-0.5 bg-gray-700 mb-6"></div>
          <div className="flex flex-col items-center">
            <div className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center text-gray-400 font-bold text-sm mb-1">
              4
            </div>
            <span className="text-gray-400 text-xs text-center">Availability</span>
          </div>
        </div>

        {/* Personal Details Form */}
        <div className="mb-6">
          <h2 className="text-white text-2xl font-bold mb-6">Personal Details</h2>

          {/* Profile Image Upload */}
          <div className="flex flex-col items-center mb-6">
            <div className="w-32 h-32 rounded-full border-2 border-zinc-700 flex items-center justify-center mb-3 bg-zinc-800 overflow-hidden">
              {profileImagePreview ? (
                <img 
                  src={profileImagePreview} 
                  alt="Profile" 
                  className="w-full h-full object-cover"
                />
              ) : (
                <svg className="w-12 h-12 text-zinc-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              )}
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
            />
            <Button 
              type="button"
              variant="outline" 
              className="border-zinc-700 text-white hover:bg-zinc-800"
              onClick={() => fileInputRef.current?.click()}
            >
              Upload Image
            </Button>
          </div>

          {/* Form Fields */}
          <div className="space-y-4">
            <div>
              <Label htmlFor="fullName" className="text-white text-sm mb-2 block">
                Full Name<span className="text-red-500">*</span>
              </Label>
              <Input
                id="fullName"
                type="text"
                value={formData.fullName}
                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                required
                className="bg-transparent border border-gray-700 text-white rounded-full px-4 py-6"
              />
            </div>

            <div>
              <Label htmlFor="email" className="text-white text-sm mb-2 block">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
                className="bg-transparent border border-gray-700 text-white rounded-full px-4 py-6"
              />
              <div className="flex items-center mt-2 space-x-2">
                <Checkbox
                  id="showEmail"
                  checked={formData.showEmailOnProfile}
                  onCheckedChange={(checked) => setFormData({ ...formData, showEmailOnProfile: checked })}
                  className="border-gray-700 data-[state=checked]:bg-green-500"
                />
                <Label htmlFor="showEmail" className="text-green-500 text-xs cursor-pointer">
                  Show on profile card
                </Label>
              </div>
            </div>

            <div>
              <Label htmlFor="mobileNumber" className="text-white text-sm mb-2 block">
                Mobile Number
              </Label>
              <Input
                id="mobileNumber"
                type="tel"
                value={formData.mobileNumber}
                onChange={(e) => setFormData({ ...formData, mobileNumber: e.target.value })}
                className="bg-transparent border border-gray-700 text-white rounded-full px-4 py-6"
              />
              <div className="flex items-center mt-2 space-x-2">
                <Checkbox
                  id="showMobile"
                  checked={formData.showMobileOnProfile}
                  onCheckedChange={(checked) => setFormData({ ...formData, showMobileOnProfile: checked })}
                  className="border-gray-700 data-[state=checked]:bg-green-500"
                />
                <Label htmlFor="showMobile" className="text-green-500 text-xs cursor-pointer">
                  Show on profile card
                </Label>
              </div>
            </div>

            <div>
              <Label htmlFor="dateOfBirth" className="text-white text-sm mb-2 block">
                Date of Birth
              </Label>
              <p className="text-gray-500 text-xs mb-2">We use this to verify your account</p>
              <Input
                id="dateOfBirth"
                type="date"
                value={formData.dateOfBirth}
                onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
                className="bg-transparent border border-gray-700 text-white rounded-full px-4 py-6"
              />
            </div>

            <div>
              <Label htmlFor="address" className="text-white text-sm mb-2 block">
                Address
              </Label>
              <p className="text-gray-500 text-xs mb-2">
                Add your address for improved matches. Only suburb will be displayed on your profile
              </p>
              <Input
                id="address"
                type="text"
                placeholder="9 Halifax Street, Adelaide, SA, 5000"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                className="bg-transparent border border-gray-700 text-white rounded-full px-4 py-6"
              />
            </div>
          </div>
        </div>

        {/* Continue Button */}
        <Button
          onClick={handleContinue}
          className="w-full bg-green-500 hover:bg-green-600 text-black font-semibold rounded-full py-6"
        >
          Continue to <span className="ml-1">Business Details →</span>
        </Button>
      </div>
    </div>
  );
}
