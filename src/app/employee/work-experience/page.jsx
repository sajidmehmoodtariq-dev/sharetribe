'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';

export default function WorkExperiencePage() {
  const router = useRouter();
  const [step] = useState(3);
  const [formData, setFormData] = useState({
    hasWorkedBefore: false,
    currentlyWorking: false,
    highestEducation: '',
    jobTitle: '',
    companyName: '',
    employmentFrom: '',
    employmentTo: '',
    workExperienceSummary: '',
    employmentType: [],
    industryType: [],
    mainRole: [],
  });

  useEffect(() => {
    const data = JSON.parse(sessionStorage.getItem('employeeData') || '{}');
    if (data.workExperience) {
      setFormData(data.workExperience);
    }
  }, []);

  const handleContinue = () => {
    const existingData = JSON.parse(sessionStorage.getItem('employeeData') || '{}');
    sessionStorage.setItem('employeeData', JSON.stringify({
      ...existingData,
      workExperience: formData,
    }));
    router.push('/employee/availability');
  };

  const toggleArrayItem = (array, item) => {
    if (array.includes(item)) {
      return array.filter(i => i !== item);
    }
    return [...array, item];
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
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

        {/* Form Card */}
        <div className="bg-zinc-900 rounded-lg p-8 border border-zinc-800">
          <h2 className="text-white text-xl font-semibold mb-6">Skills</h2>

          <div className="space-y-6">
            {/* Tell Us About Your Work Experience */}
            <div>
              <h3 className="text-white text-base font-medium mb-3">Tell Us About Your Work Experience</h3>
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="hasWorkedBefore"
                    checked={formData.hasWorkedBefore}
                    onCheckedChange={(checked) => setFormData({ ...formData, hasWorkedBefore: checked })}
                    className="border-zinc-700 data-[state=checked]:bg-emerald-500"
                  />
                  <label htmlFor="hasWorkedBefore" className="text-white text-sm">
                    I have worked before
                  </label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="currentlyWorking"
                    checked={formData.currentlyWorking}
                    onCheckedChange={(checked) => setFormData({ ...formData, currentlyWorking: checked })}
                    className="border-zinc-700 data-[state=checked]:bg-emerald-500"
                  />
                  <label htmlFor="currentlyWorking" className="text-white text-sm">
                    I am currently working
                  </label>
                </div>
              </div>
            </div>

            {/* Highest Level of Education */}
            <div>
              <Label htmlFor="education" className="text-white text-sm mb-2 block">
                Highest Level of Education
              </Label>
              <p className="text-zinc-500 text-xs mb-2">Tell us how high you have</p>
              <Input
                id="education"
                type="text"
                placeholder="Degree under Bachelor (Associates, etc)"
                value={formData.highestEducation}
                onChange={(e) => setFormData({ ...formData, highestEducation: e.target.value })}
                className="bg-transparent border-zinc-700 text-white placeholder:text-zinc-500"
              />
            </div>

            {/* Job Title */}
            <div>
              <Label htmlFor="jobTitle" className="text-white text-sm mb-2 block">
                Job Title
              </Label>
              <Input
                id="jobTitle"
                type="text"
                value={formData.jobTitle}
                onChange={(e) => setFormData({ ...formData, jobTitle: e.target.value })}
                className="bg-transparent border-zinc-700 text-white"
              />
            </div>

            {/* Company Name */}
            <div>
              <Label htmlFor="companyName" className="text-white text-sm mb-2 block">
                Company Name
              </Label>
              <Input
                id="companyName"
                type="text"
                value={formData.companyName}
                onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                className="bg-transparent border-zinc-700 text-white"
              />
            </div>

            {/* Employment Duration */}
            <div>
              <Label className="text-white text-sm mb-2 block">Employment Duration</Label>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="from" className="text-zinc-400 text-xs mb-1 block">From</Label>
                  <Input
                    id="from"
                    type="date"
                    value={formData.employmentFrom}
                    onChange={(e) => setFormData({ ...formData, employmentFrom: e.target.value })}
                    className="bg-transparent border-zinc-700 text-white"
                  />
                </div>
                <div>
                  <Label htmlFor="to" className="text-zinc-400 text-xs mb-1 block">To</Label>
                  <Input
                    id="to"
                    type="date"
                    value={formData.employmentTo}
                    onChange={(e) => setFormData({ ...formData, employmentTo: e.target.value })}
                    className="bg-transparent border-zinc-700 text-white"
                  />
                </div>
              </div>
            </div>

            {/* Work Experience Summary */}
            <div>
              <Label className="text-white text-sm mb-2 block">Work Experience Summary</Label>
              <p className="text-zinc-500 text-xs mb-2">
                Add a summary of your responsibilities and skillsets you gained at this job
              </p>
              <Textarea
                placeholder="I am a concrete builder with 3 years of experience, skilled in formwork and foundations and certified in MR Class..."
                value={formData.workExperienceSummary}
                onChange={(e) => setFormData({ ...formData, workExperienceSummary: e.target.value })}
                className="bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-500 min-h-24"
              />
              <Button
                type="button"
                onClick={() => {
                  const existingData = JSON.parse(sessionStorage.getItem('employeeData') || '{}');
                  sessionStorage.setItem('employeeData', JSON.stringify({
                    ...existingData,
                    workExperience: formData,
                  }));
                  alert('Work experience saved!');
                }}
                variant="outline"
                className="mt-2 text-emerald-500 border-emerald-500 bg-transparent hover:bg-zinc-800"
              >
                Save
              </Button>
            </div>

            {/* Employment type (optional) */}
            <div>
              <Label className="text-white text-sm mb-2 block">Employment type (optional)</Label>
              <p className="text-zinc-500 text-xs mb-2">Select an employment type that suits you best</p>
              <div className="space-y-2">
                {['Full-time', 'Part-time', 'Casual'].map((type) => (
                  <div key={type} className="flex items-center space-x-2">
                    <Checkbox
                      id={type}
                      checked={formData.employmentType.includes(type)}
                      onCheckedChange={() => setFormData({ 
                        ...formData, 
                        employmentType: toggleArrayItem(formData.employmentType, type) 
                      })}
                      className="border-zinc-700 data-[state=checked]:bg-emerald-500"
                    />
                    <label htmlFor={type} className="text-white text-sm">
                      {type}
                    </label>
                  </div>
                ))}
              </div>
            </div>

            {/* Industry Type */}
            <div>
              <Label className="text-white text-sm mb-2 block">Industry Type ×</Label>
              <div className="grid grid-cols-2 gap-2 mt-2">
                {['Carpentry', 'Earthworks', 'Electrician', 'Concrete', 'Plumbing'].map((industry) => (
                  <Button
                    key={industry}
                    type="button"
                    onClick={() => setFormData({ 
                      ...formData, 
                      industryType: toggleArrayItem(formData.industryType, industry) 
                    })}
                    variant="outline"
                    className={`
                      ${formData.industryType.includes(industry)
                        ? 'bg-emerald-500 text-black border-emerald-500 hover:bg-emerald-600'
                        : 'bg-transparent text-white border-zinc-700 hover:bg-zinc-800'
                      }
                    `}
                  >
                    {industry}
                  </Button>
                ))}
              </div>
            </div>

            {/* Main Role */}
            <div>
              <Label className="text-white text-sm mb-2 block">Main Role ×</Label>
              <div className="grid grid-cols-2 gap-2 mt-2">
                {['Concrete Builder', 'Steel Fixer', 'Concrete Finisher', 'Carpenter'].map((role) => (
                  <Button
                    key={role}
                    type="button"
                    onClick={() => setFormData({ 
                      ...formData, 
                      mainRole: toggleArrayItem(formData.mainRole, role) 
                    })}
                    variant="outline"
                    className={`
                      ${formData.mainRole.includes(role)
                        ? 'bg-emerald-500 text-black border-emerald-500 hover:bg-emerald-600'
                        : 'bg-transparent text-white border-zinc-700 hover:bg-zinc-800'
                      }
                    `}
                  >
                    {role}
                  </Button>
                ))}
              </div>
              <Button
                type="button"
                onClick={() => {
                  // You can implement a modal or search functionality here
                  alert('Search industry feature coming soon!');
                }}
                variant="outline"
                className="mt-2 w-full border-zinc-700 text-zinc-400 hover:bg-zinc-800"
              >
                Search Industry
              </Button>
            </div>

            <Button
              onClick={handleContinue}
              className="w-full bg-transparent hover:bg-zinc-800 text-emerald-500 border border-emerald-500 font-semibold h-12"
            >
              Continue to Availability →
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
