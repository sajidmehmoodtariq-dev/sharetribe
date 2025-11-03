'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useTheme } from '@/components/ThemeProvider';
import Image from 'next/image';

export default function WorkExperiencePage() {
  const { getBackgroundStyle, getCardClassName, getTextClassName, getSubTextClassName } = useTheme();
  const router = useRouter();
  const [workStatus, setWorkStatus] = useState(''); // 'first-job', 'worked-before', 'currently-working'
  const [employmentTypes, setEmploymentTypes] = useState({
    fullTime: false,
    partTime: false,
    casual: false
  });
  const [selectedIndustry, setSelectedIndustry] = useState('');
  const [selectedRole, setSelectedRole] = useState('');
  const [formData, setFormData] = useState({
    jobTitle: '',
    companyName: '',
    employmentDurationFrom: '',
    employmentDurationTo: '',
    workExperienceSummary: '',
    highestEducation: ''
  });

  const industries = [
    'Search Industry',
    'Carpentry',
    'Earthworks', 
    'Concrete',
    'Electrician',
    'Plumbing'
  ];

  const roles = [
    'Concrete finisher',
    'Steel fixer'
  ];

  const handleWorkStatusChange = (status) => {
    setWorkStatus(status);
    // Reset form data when status changes
    setFormData({
      jobTitle: '',
      companyName: '',
      employmentDurationFrom: '',
      employmentDurationTo: '',
      workExperienceSummary: '',
      highestEducation: ''
    });
  };

  const handleEmploymentTypeChange = (type) => {
    setEmploymentTypes(prev => ({
      ...prev,
      [type]: !prev[type]
    }));
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleContinue = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        alert('Please login first');
        router.push('/login');
        return;
      }

      // Update user profile with work experience
      const response = await fetch('http://localhost:5000/api/user/onboarding/work-experience', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          workStatus,
          employmentTypes,
          selectedIndustry,
          selectedRole,
          ...formData
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to save work experience');
      }

      // Navigate to availability page
      router.push('/onboarding/availability');
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
                    step <= 3 
                      ? 'bg-[#00EA72] text-white' 
                      : 'bg-gray-200 text-gray-500'
                  }`}>
                    {step}
                  </div>
                  {index < 3 && (
                    <div className={`w-8 h-0.5 mx-1 ${
                      step < 3 ? 'bg-[#00EA72]' : 'bg-gray-200'
                    }`} />
                  )}
                </div>
              ))}
            </div>
            <div className="flex justify-between text-xs px-2">
              <span className={`${getSubTextClassName()} text-center`}>Personal<br />Details</span>
              <span className={`${getSubTextClassName()} text-center`}>Personal<br />Summary</span>
              <span className={`${getTextClassName()} font-medium text-center`}>Skills</span>
              <span className={`${getSubTextClassName()} text-center`}>Availability</span>
            </div>
          </div>

          {/* Form Card */}
          <div className="flex-1 mx-4 mb-4">
            <div className={`${getCardClassName()} rounded-3xl px-8 py-8 h-full shadow-sm overflow-y-auto`}>
              <h2 className={`text-[22px] font-bold ${getTextClassName()} mb-8`}>
                Skills
              </h2>

              {/* Work Experience Section */}
              <div className="mb-8">
                <h3 className={`text-[16px] font-semibold ${getTextClassName()} mb-4`}>
                  Tell us about your work experience
                </h3>
                
                {/* Work Status Checkboxes */}
                <div className="space-y-3 mb-6">
                  <div className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      id="firstJob"
                      checked={workStatus === 'first-job'}
                      onChange={() => handleWorkStatusChange('first-job')}
                      className="w-4 h-4 text-[#00EA72] border-gray-300 rounded focus:ring-[#00EA72]"
                    />
                    <label htmlFor="firstJob" className={`text-[15px] ${getTextClassName()} cursor-pointer`}>
                      I am looking for my first job
                    </label>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      id="workedBefore"
                      checked={workStatus === 'worked-before'}
                      onChange={() => handleWorkStatusChange('worked-before')}
                      className="w-4 h-4 text-[#00EA72] border-gray-300 rounded focus:ring-[#00EA72]"
                    />
                    <label htmlFor="workedBefore" className={`text-[15px] ${getTextClassName()} cursor-pointer`}>
                      I have worked before
                    </label>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      id="currentlyWorking"
                      checked={workStatus === 'currently-working'}
                      onChange={() => handleWorkStatusChange('currently-working')}
                      className="w-4 h-4 text-[#00EA72] border-gray-300 rounded focus:ring-[#00EA72]"
                    />
                    <label htmlFor="currentlyWorking" className={`text-[15px] ${getTextClassName()} cursor-pointer`}>
                      I am currently working
                    </label>
                  </div>
                </div>

                {/* Conditional Form Fields */}
                {workStatus === 'first-job' && (
                  <div className="mb-6">
                    <h4 className={`text-[15px] font-semibold ${getTextClassName()} mb-3`}>
                      Highest Level of Education
                    </h4>
                    <p className={`text-[13px] ${getSubTextClassName()} mb-4`}>
                      We use this to show you relevant jobs
                    </p>
                    <Input
                      name="highestEducation"
                      value={formData.highestEducation}
                      onChange={handleInputChange}
                      placeholder="Diploma/Bachelor's/Master's/Doctorate"
                      className="h-12 rounded-xl border-gray-300 text-[15px]"
                    />
                  </div>
                )}

                {(workStatus === 'worked-before' || workStatus === 'currently-working') && (
                  <>
                    {/* Job Title */}
                    <div className="mb-4">
                      <Label htmlFor="jobTitle" className={`text-[13px] font-medium ${getTextClassName()} mb-2 block`}>
                        Job Title
                      </Label>
                      <Input
                        id="jobTitle"
                        name="jobTitle"
                        value={formData.jobTitle}
                        onChange={handleInputChange}
                        className="h-12 rounded-xl border-gray-300 text-[15px]"
                      />
                    </div>

                    {/* Company Name */}
                    <div className="mb-4">
                      <Label htmlFor="companyName" className={`text-[13px] font-medium ${getTextClassName()} mb-2 block`}>
                        Company Name
                      </Label>
                      <Input
                        id="companyName"
                        name="companyName"
                        value={formData.companyName}
                        onChange={handleInputChange}
                        className="h-12 rounded-xl border-gray-300 text-[15px]"
                      />
                    </div>

                    {/* Employment Duration */}
                    <div className="mb-4">
                      <Label className={`text-[13px] font-medium ${getTextClassName()} mb-2 block`}>
                        Employment Duration
                      </Label>
                      <div className="flex space-x-3">
                        <div className="flex-1">
                          <Label htmlFor="employmentDurationFrom" className={`text-[12px] ${getSubTextClassName()} mb-1 block`}>
                            From
                          </Label>
                          <Input
                            id="employmentDurationFrom"
                            name="employmentDurationFrom"
                            type="date"
                            value={formData.employmentDurationFrom}
                            onChange={handleInputChange}
                            className="h-12 rounded-xl border-gray-300 text-[15px]"
                          />
                        </div>
                        {workStatus === 'worked-before' && (
                          <div className="flex-1">
                            <Label htmlFor="employmentDurationTo" className={`text-[12px] ${getSubTextClassName()} mb-1 block`}>
                              To
                            </Label>
                            <Input
                              id="employmentDurationTo"
                              name="employmentDurationTo"
                              type="date"
                              value={formData.employmentDurationTo}
                              onChange={handleInputChange}
                              className="h-12 rounded-xl border-gray-300 text-[15px]"
                            />
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Work Experience Summary */}
                    <div className="mb-6">
                      <Label htmlFor="workExperienceSummary" className={`text-[13px] font-medium ${getTextClassName()} mb-2 block`}>
                        Work Experience Summary
                      </Label>
                      <p className={`text-[12px] ${getSubTextClassName()} mb-3`}>
                        Add a summary of your experience, responsibilities and key achievements.
                      </p>
                      <Textarea
                        id="workExperienceSummary"
                        name="workExperienceSummary"
                        value={formData.workExperienceSummary}
                        onChange={handleInputChange}
                        placeholder="I am a concrete builder with 3 years of experience, skilled in formwork and foundations and certified in MR Class..."
                        className="min-h-[100px] rounded-xl border-gray-300 text-[15px] resize-none"
                      />
                    </div>
                  </>
                )}

                {/* Employment Type */}
                <div className="mb-6">
                  <h4 className={`text-[15px] font-medium ${getTextClassName()} mb-3`}>
                    Employment type (optional)
                  </h4>
                  <p className={`text-[13px] ${getSubTextClassName()} mb-4`}>
                    Select an employment type that suits you best. You may select more than one.
                  </p>
                  
                  <div className="flex space-x-3 mb-4">
                    {[
                      { key: 'fullTime', label: 'Full-time' },
                      { key: 'partTime', label: 'Part-time' },
                      { key: 'casual', label: 'Casual' }
                    ].map((type) => (
                      <button
                        key={type.key}
                        onClick={() => handleEmploymentTypeChange(type.key)}
                        className={`px-4 py-2 rounded-full text-[13px] font-medium transition-colors ${
                          employmentTypes[type.key]
                            ? 'bg-[#00EA72] text-white'
                            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                        }`}
                      >
                        {type.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Industry and Role Selection */}
                <div className="flex space-x-3 mb-6">
                  <button className="flex-1 px-4 py-3 rounded-full bg-[#00EA72] text-white text-[13px] font-medium">
                    Industry Type ↓
                  </button>
                  <button className="flex-1 px-4 py-3 rounded-full bg-gray-200 text-gray-700 text-[13px] font-medium">
                    Main Role ↓
                  </button>
                </div>

                {/* Industry Options */}
                <div className="grid grid-cols-2 gap-3 mb-6">
                  {industries.map((industry, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <input
                        type="radio"
                        id={`industry-${index}`}
                        name="industry"
                        value={industry}
                        checked={selectedIndustry === industry}
                        onChange={(e) => setSelectedIndustry(e.target.value)}
                        className="w-4 h-4 text-[#00EA72] border-gray-300 focus:ring-[#00EA72]"
                      />
                      <label 
                        htmlFor={`industry-${index}`} 
                        className={`text-[13px] ${getTextClassName()} cursor-pointer`}
                      >
                        {industry}
                      </label>
                    </div>
                  ))}
                </div>

                {/* Role Options */}
                <div className="grid grid-cols-1 gap-3 mb-6">
                  {roles.map((role, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <input
                        type="radio"
                        id={`role-${index}`}
                        name="role"
                        value={role}
                        checked={selectedRole === role}
                        onChange={(e) => setSelectedRole(e.target.value)}
                        className="w-4 h-4 text-[#00EA72] border-gray-300 focus:ring-[#00EA72]"
                      />
                      <label 
                        htmlFor={`role-${index}`} 
                        className={`text-[13px] ${getTextClassName()} cursor-pointer`}
                      >
                        {role}
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Continue Button */}
              <div className="mt-8">
                <Button
                  onClick={handleContinue}
                  className="w-full h-12 bg-[#00EA72] hover:bg-[#00D66C] text-black font-medium text-[15px] rounded-full"
                >
                  Continue to Availability →
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}