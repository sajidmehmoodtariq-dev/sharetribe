'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';

export default function JobHunterPersonalDetailsPage() {
  const router = useRouter();
  const [step] = useState(1);
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
    // First check if there's existing job hunter data
    const existingData = sessionStorage.getItem('jobHunterData');
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
    // Update both jobHunterData and signupData to keep them in sync
    sessionStorage.setItem('jobHunterData', JSON.stringify(formData));
    
    // Also update signupData with the latest info
    const signupData = JSON.parse(sessionStorage.getItem('signupData') || '{}');
    sessionStorage.setItem('signupData', JSON.stringify({
      ...signupData,
      fullName: formData.fullName,
      email: formData.email,
      mobileNumber: formData.mobileNumber,
    }));
    
    router.push('/job-hunter/personal-summary');
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center">
            <svg width="80" height="80" viewBox="0 0 100 100" className="text-white">
              <text x="50" y="60" fontSize="60" fill="currentColor" textAnchor="middle" fontFamily="monospace" fontWeight="bold">
                HH
              </text>
            </svg>
          </div>
          <h1 className="text-white text-sm mt-2">Head Huntd</h1>
        </div>

        {/* Progress Steps */}
        <div className="flex items-center justify-center mb-8 gap-4">
          {[1, 2, 3, 4].map((num) => (
            <div key={num} className="flex items-center">
              <div className={`
                w-10 h-10 rounded-full flex items-center justify-center border-2 font-semibold
                ${step === num 
                  ? 'bg-emerald-500 text-black border-emerald-500' 
                  : step > num
                  ? 'bg-emerald-500 text-black border-emerald-500'
                  : 'bg-transparent text-zinc-400 border-zinc-700'
                }
              `}>
                {num}
              </div>
              {num < 4 && <div className="w-8 h-0.5 bg-zinc-700 mx-2" />}
            </div>
          ))}
        </div>

        <div className="flex items-center justify-center gap-2 mb-2">
          <span className="text-emerald-500 text-sm">Personal Details</span>
          <span className="text-zinc-400 text-sm">Personal Summary</span>
          <span className="text-zinc-400 text-sm">Skills</span>
          <span className="text-zinc-400 text-sm">Availability</span>
        </div>

        {/* Form Card */}
        <div className="bg-zinc-900 rounded-lg p-8 border border-zinc-800 mt-8">
          <h2 className="text-white text-xl font-semibold mb-6">Personal Details</h2>

          <div className="space-y-4">
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
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
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

            <div>
              <Label htmlFor="fullName" className="text-white text-sm mb-2 block">
                Full Name*
              </Label>
              <Input
                id="fullName"
                type="text"
                placeholder="Sal Monella"
                value={formData.fullName}
                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                className="bg-transparent border-zinc-700 text-white placeholder:text-zinc-500"
              />
            </div>

            <div>
              <Label htmlFor="email" className="text-white text-sm mb-2 block">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="salmonella@gmail.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="bg-transparent border-zinc-700 text-white placeholder:text-zinc-500"
              />
              <div className="flex items-center space-x-2 mt-2">
                <Checkbox
                  id="showEmail"
                  checked={formData.showEmailOnProfile}
                  onCheckedChange={(checked) => setFormData({ ...formData, showEmailOnProfile: checked })}
                  className="border-zinc-700 data-[state=checked]:bg-emerald-500"
                />
                <label htmlFor="showEmail" className="text-sm text-emerald-500">
                  Show on profile card
                </label>
              </div>
            </div>

            <div>
              <Label htmlFor="mobileNumber" className="text-white text-sm mb-2 block">
                Mobile Number
              </Label>
              <Input
                id="mobileNumber"
                type="tel"
                placeholder="Enter your mobile number"
                value={formData.mobileNumber}
                onChange={(e) => setFormData({ ...formData, mobileNumber: e.target.value })}
                className="bg-transparent border-zinc-700 text-white placeholder:text-zinc-500"
              />
              <div className="flex items-center space-x-2 mt-2">
                <Checkbox
                  id="showMobile"
                  checked={formData.showMobileOnProfile}
                  onCheckedChange={(checked) => setFormData({ ...formData, showMobileOnProfile: checked })}
                  className="border-zinc-700 data-[state=checked]:bg-emerald-500"
                />
                <label htmlFor="showMobile" className="text-sm text-emerald-500">
                  Show on profile card
                </label>
              </div>
            </div>

            <div>
              <Label htmlFor="dateOfBirth" className="text-white text-sm mb-2 block">
                Date of Birth
              </Label>
              <Input
                id="dateOfBirth"
                type="date"
                placeholder="08/02/1997"
                value={formData.dateOfBirth}
                onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
                className="bg-transparent border-zinc-700 text-white placeholder:text-zinc-500"
              />
              <p className="text-zinc-500 text-xs mt-1">We use this to show you relevant jobs</p>
            </div>

            <div>
              <Label htmlFor="address" className="text-white text-sm mb-2 block">
                Address
              </Label>
              <Input
                id="address"
                type="text"
                placeholder="9 Halifax Street, Adelaide, SA, 5000"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                className="bg-transparent border-zinc-700 text-white placeholder:text-zinc-500"
              />
              <p className="text-zinc-500 text-xs mt-1">
                Add your address for improved job matches nearby. Only suburb will be displayed on your profile
              </p>
            </div>

            <Button
              onClick={handleContinue}
              className="w-full bg-transparent hover:bg-zinc-800 text-emerald-500 border border-emerald-500 font-semibold h-12 mt-4"
            >
              Continue to Personal Summary →
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
