'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { useTheme } from '@/components/ThemeProvider';
import Image from 'next/image';

export default function WorkExperiencePage() {
  const { theme, getBackgroundStyle, getCardClassName, getTextClassName, getSubTextClassName } = useTheme();
  const router = useRouter();
  const [selectedIndustry, setSelectedIndustry] = useState('');
  const [selectedSkills, setSelectedSkills] = useState([]);
  const [isSaving, setIsSaving] = useState(false);

  const industries = [
    'Construction',
    'Carpentry',
    'Earthworks', 
    'Concrete',
    'Electrician',
    'Plumbing',
    'Painting',
    'Landscaping',
    'Roofing',
    'HVAC'
  ];

  const skillsByIndustry = {
    'Construction': ['Formwork', 'Steel Fixing', 'Scaffolding', 'Site Management', 'Blueprint Reading', 'Safety Compliance'],
    'Carpentry': ['Framing', 'Finishing', 'Cabinet Making', 'Door & Window Installation', 'Deck Building', 'Trim Work'],
    'Earthworks': ['Excavation', 'Grading', 'Drainage', 'Compaction', 'Site Preparation', 'Heavy Equipment Operation'],
    'Concrete': ['Formwork', 'Finishing', 'Steel Fixing', 'Pumping', 'Pouring', 'Curing'],
    'Electrician': ['Wiring', 'Circuit Installation', 'Panel Upgrades', 'Lighting', 'Fault Finding', 'Safety Testing'],
    'Plumbing': ['Pipe Fitting', 'Drainage', 'Gas Fitting', 'Bathroom Installation', 'Leak Detection', 'Water Heating'],
    'Painting': ['Surface Preparation', 'Spray Painting', 'Brush & Roller', 'Color Mixing', 'Wallpaper', 'Texture Work'],
    'Landscaping': ['Garden Design', 'Turf Laying', 'Irrigation', 'Planting', 'Paving', 'Retaining Walls'],
    'Roofing': ['Tile Installation', 'Metal Roofing', 'Gutter Installation', 'Leak Repair', 'Roof Inspection', 'Waterproofing'],
    'HVAC': ['Installation', 'Maintenance', 'Ductwork', 'Refrigeration', 'Ventilation', 'System Diagnostics']
  };

  const availableSkills = selectedIndustry ? skillsByIndustry[selectedIndustry] || [] : [];

  const handleSkillToggle = (skill) => {
    setSelectedSkills(prev => 
      prev.includes(skill) 
        ? prev.filter(s => s !== skill)
        : [...prev, skill]
    );
  };

  const handleContinue = async () => {
    setIsSaving(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        alert('Please login first');
        router.push('/login');
        return;
      }

      // Update user profile with simplified work experience
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/onboarding/work-experience`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          selectedIndustry,
          selectedSkills
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
    } finally {
      setIsSaving(false);
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
              src={theme === 'dark' ? '/logo-light.png' : '/logo-dark.png'}
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
              <h2 className={`text-[22px] font-bold ${getTextClassName()} mb-4`}>
                Skills
              </h2>
              <p className={`text-[14px] ${getSubTextClassName()} mb-8`}>
                Select your industry type and the skills you have
              </p>

              {/* Industry Type Selection */}
              <div className="mb-8">
                <h3 className={`text-[16px] font-semibold ${getTextClassName()} mb-4`}>
                  Industry Type
                </h3>
                
                <div className="grid grid-cols-2 gap-3">
                  {industries.map((industry, index) => (
                    <button
                      key={index}
                      onClick={() => {
                        setSelectedIndustry(industry);
                        setSelectedSkills([]); // Reset skills when industry changes
                      }}
                      className={`px-4 py-3 rounded-xl text-[14px] font-medium transition-all border-2 ${
                        selectedIndustry === industry
                          ? 'bg-[#00EA72] border-[#00EA72] text-black'
                          : `border-gray-300 dark:border-gray-600 ${getTextClassName()} hover:border-[#00EA72]`
                      }`}
                    >
                      {industry}
                    </button>
                  ))}
                </div>
              </div>

              {/* Skills Checklist */}
              {selectedIndustry && availableSkills.length > 0 && (
                <div className="mb-8">
                  <h3 className={`text-[16px] font-semibold ${getTextClassName()} mb-4`}>
                    Your Skills
                  </h3>
                  <p className={`text-[13px] ${getSubTextClassName()} mb-4`}>
                    Select all skills that apply to you
                  </p>
                  
                  <div className="space-y-3">
                    {availableSkills.map((skill, index) => (
                      <div key={index} className="flex items-center space-x-3">
                        <input
                          type="checkbox"
                          id={`skill-${index}`}
                          checked={selectedSkills.includes(skill)}
                          onChange={() => handleSkillToggle(skill)}
                          className="w-5 h-5 text-[#00EA72] border-gray-300 rounded focus:ring-[#00EA72]"
                        />
                        <label 
                          htmlFor={`skill-${index}`} 
                          className={`text-[15px] ${getTextClassName()} cursor-pointer`}
                        >
                          {skill}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {!selectedIndustry && (
                <div className={`text-center py-12 ${getSubTextClassName()}`}>
                  <p className="text-[15px]">Please select an industry type to see available skills</p>
                </div>
              )}

              {/* Continue Button */}
              <div className="mt-8">
                <Button
                  onClick={handleContinue}
                  disabled={!selectedIndustry || selectedSkills.length === 0 || isSaving}
                  className="w-full h-12 bg-[#00EA72] hover:bg-[#00D66C] text-black font-medium text-[15px] rounded-full disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isSaving && (
                    <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  )}
                  {isSaving ? 'Saving...' : 'Continue to Availability →'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}