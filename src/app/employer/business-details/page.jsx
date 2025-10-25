'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export default function BusinessDetailsPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    businessName: '',
    country: '',
    businessAddress: '',
    industry: '',
    businessSize: '',
    yourRole: '',
    website: '',
    abn: '',
  });

  // Load existing data on mount
  useEffect(() => {
    const existingData = sessionStorage.getItem('employerData');
    if (existingData) {
      const parsedData = JSON.parse(existingData);
      if (parsedData.businessName) {
        setFormData(prev => ({ ...prev, ...parsedData }));
      }
    }
  }, []);

  const handleContinue = () => {
    // Save business details
    const existingData = JSON.parse(sessionStorage.getItem('employerData') || '{}');
    sessionStorage.setItem('employerData', JSON.stringify({
      ...existingData,
      ...formData,
    }));
    
    // Go to business summary
    router.push('/employer/business-summary');
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
          <div className="w-8 h-0.5 bg-green-500 mb-6"></div>
          <div className="flex flex-col items-center">
            <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center text-black font-bold text-sm mb-1">
              2
            </div>
            <span className="text-green-500 text-xs text-center">Business<br/>Details</span>
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

        {/* Business Details Form */}
        <div className="mb-6">
          <h2 className="text-white text-2xl font-bold mb-6">Business Details</h2>

          <div className="space-y-4">
            <div>
              <Label htmlFor="businessName" className="text-white text-sm mb-2 block">
                Business Name
              </Label>
              <Input
                id="businessName"
                type="text"
                placeholder="Apex Plumbing & Infrastructure"
                value={formData.businessName}
                onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
                className="bg-transparent border border-gray-700 text-white rounded-full px-4 py-6"
              />
            </div>

            <div>
              <Label htmlFor="country" className="text-white text-sm mb-2 block">
                Country
              </Label>
              <Input
                id="country"
                type="text"
                placeholder="Australia"
                value={formData.country}
                onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                className="bg-transparent border border-gray-700 text-white rounded-full px-4 py-6"
              />
            </div>

            <div>
              <Label htmlFor="businessAddress" className="text-white text-sm mb-2 block">
                Business Address
              </Label>
              <p className="text-gray-500 text-xs mb-2">
                We only display the suburb and state of your business address
              </p>
              <Input
                id="businessAddress"
                type="text"
                placeholder="08/02/1997"
                value={formData.businessAddress}
                onChange={(e) => setFormData({ ...formData, businessAddress: e.target.value })}
                className="bg-transparent border border-gray-700 text-white rounded-full px-4 py-6"
              />
              <p className="text-gray-500 text-xs mt-1">9, Adelaide, Australia</p>
            </div>

            <div>
              <Label htmlFor="industry" className="text-white text-sm mb-2 block">
                Industry
              </Label>
              <Select value={formData.industry} onValueChange={(value) => setFormData({ ...formData, industry: value })}>
                <SelectTrigger className="bg-transparent border border-gray-700 text-white rounded-full px-4 py-6">
                  <SelectValue placeholder="Select your industry" />
                </SelectTrigger>
                <SelectContent className="bg-zinc-900 border-zinc-700 text-white">
                  <SelectItem value="construction">Construction</SelectItem>
                  <SelectItem value="technology">Technology</SelectItem>
                  <SelectItem value="healthcare">Healthcare</SelectItem>
                  <SelectItem value="retail">Retail</SelectItem>
                  <SelectItem value="hospitality">Hospitality</SelectItem>
                  <SelectItem value="manufacturing">Manufacturing</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="businessSize" className="text-white text-sm mb-2 block">
                Business Size
              </Label>
              <Select value={formData.businessSize} onValueChange={(value) => setFormData({ ...formData, businessSize: value })}>
                <SelectTrigger className="bg-transparent border border-gray-700 text-white rounded-full px-4 py-6">
                  <SelectValue placeholder="Select your business size" />
                </SelectTrigger>
                <SelectContent className="bg-zinc-900 border-zinc-700 text-white">
                  <SelectItem value="1-10">1-10 employees</SelectItem>
                  <SelectItem value="11-50">11-50 employees</SelectItem>
                  <SelectItem value="51-200">51-200 employees</SelectItem>
                  <SelectItem value="201-500">201-500 employees</SelectItem>
                  <SelectItem value="500+">500+ employees</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="yourRole" className="text-white text-sm mb-2 block">
                Your role at your business
              </Label>
              <Select value={formData.yourRole} onValueChange={(value) => setFormData({ ...formData, yourRole: value })}>
                <SelectTrigger className="bg-transparent border border-gray-700 text-white rounded-full px-4 py-6">
                  <SelectValue placeholder="Select your business size" />
                </SelectTrigger>
                <SelectContent className="bg-zinc-900 border-zinc-700 text-white">
                  <SelectItem value="owner">Owner</SelectItem>
                  <SelectItem value="manager">Manager</SelectItem>
                  <SelectItem value="hr">HR Manager</SelectItem>
                  <SelectItem value="recruiter">Recruiter</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="website" className="text-white text-sm mb-2 block">
                Business Website / Social Media Link
              </Label>
              <Input
                id="website"
                type="url"
                placeholder="Enter your business website / Social Media link"
                value={formData.website}
                onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                className="bg-transparent border border-gray-700 text-white rounded-full px-4 py-6"
              />
              <p className="text-gray-500 text-xs mt-1">www.headhuntd.com.au</p>
            </div>

            <div>
              <Label htmlFor="abn" className="text-white text-sm mb-2 block">
                Australian Business Number (ABN)
              </Label>
              <Input
                id="abn"
                type="text"
                placeholder="Enter your Australian Business Number (ABN)"
                value={formData.abn}
                onChange={(e) => setFormData({ ...formData, abn: e.target.value })}
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
          Continue to <span className="ml-1 text-green-700">Business Summary →</span>
        </Button>
      </div>
    </div>
  );
}
