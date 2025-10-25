'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';

export default function PersonalSummaryPage() {
  const router = useRouter();
  const [step] = useState(2);
  const [personalSummary, setPersonalSummary] = useState('');

  useEffect(() => {
    const data = JSON.parse(sessionStorage.getItem('employeeData') || '{}');
    if (data.personalSummary) {
      setPersonalSummary(data.personalSummary);
    }
  }, []);

  const handleContinue = () => {
    const existingData = JSON.parse(sessionStorage.getItem('employeeData') || '{}');
    sessionStorage.setItem('employeeData', JSON.stringify({
      ...existingData,
      personalSummary,
    }));
    router.push('/employee/work-experience');
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
          <span className="text-zinc-400 text-sm">Personal Details</span>
          <span className="text-emerald-500 text-sm">Personal Summary</span>
          <span className="text-zinc-400 text-sm">Skills</span>
          <span className="text-zinc-400 text-sm">Availability</span>
        </div>

        {/* Form Card */}
        <div className="bg-zinc-900 rounded-lg p-8 border border-zinc-800 mt-8">
          <h2 className="text-white text-xl font-semibold mb-2">Personal Details</h2>
          
          <div className="mb-6">
            <h3 className="text-white text-base font-medium mb-2">Personal Summary</h3>
            <p className="text-zinc-400 text-sm mb-4">
              Add a personal summary /description to your profile to introduce who you are
            </p>

            <Textarea
              placeholder="I am a concrete builder with 3 years of experience, skilled in formwork and foundations and certified in MR Class..."
              value={personalSummary}
              onChange={(e) => setPersonalSummary(e.target.value)}
              className="bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-500 min-h-32 resize-none"
            />
          </div>

          <Button
            onClick={handleContinue}
            className="w-full bg-transparent hover:bg-zinc-800 text-emerald-500 border border-emerald-500 font-semibold h-12"
          >
            Continue to Work Experience →
          </Button>
        </div>
      </div>
    </div>
  );
}
