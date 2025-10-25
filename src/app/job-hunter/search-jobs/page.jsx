'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';

export default function SearchJobsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [location, setLocation] = useState('');
  const [selectedIndustries, setSelectedIndustries] = useState([]);
  
  const industries = ['Carpentry', 'Earthworks', 'Electrician', 'Concrete', 'Plumbing'];

  const mockJobs = [
    {
      id: 1,
      title: 'Concrete Finisher',
      company: 'Absolute Concrete & constructions co.',
      location: 'O Nonnos Rd',
      distance: '5km',
      pay: '$140-$180 p/h',
      type: 'Full-time',
      tags: ['Formworker', 'Commercial', 'Desertaire', 'Residential'],
      licenses: ['MR Class', 'Cert III Concreting', 'Licenc to Manual'],
      posted: 'Less than 1hr ago',
    },
  ];

  return (
    <div className="min-h-screen bg-black">
      {/* Header */}
      <header className="bg-zinc-900 border-b border-zinc-800 p-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-8">
            <div className="text-white font-bold text-xl">HH</div>
            <nav className="flex gap-6">
              <a href="/search-jobs" className="text-emerald-500 text-sm">Search Jobs</a>
              <a href="/future-jobs" className="text-zinc-400 text-sm hover:text-white">Future Jobs</a>
              <a href="/networks" className="text-zinc-400 text-sm hover:text-white">Networks</a>
              <a href="/corporate" className="text-zinc-400 text-sm hover:text-white">Corporate</a>
            </nav>
          </div>
          <div className="flex items-center gap-4">
            <button className="text-white">🔔</button>
            <button className="text-white">👤</button>
            <button className="text-white">☰</button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto p-6">
        {/* Welcome Message */}
        <div className="mb-8">
          <h1 className="text-white text-2xl font-semibold mb-2">Good Morning, Sal Monella</h1>
        </div>

        {/* Search Section */}
        <div className="bg-zinc-900 rounded-lg p-6 mb-6 border border-zinc-800">
          <h2 className="text-white text-xl font-semibold mb-4">Find Jobs</h2>
          
          <div className="space-y-4">
            <Input
              type="text"
              placeholder="e. Search for jobs e.g. Concrete Finisher"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-zinc-800 border-zinc-700 text-white"
            />

            <div>
              <h3 className="text-white text-sm mb-2">Where</h3>
              <Input
                type="text"
                placeholder="Search Location"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="bg-zinc-800 border-zinc-700 text-white"
              />
              <button className="text-emerald-500 text-sm mt-2">Reset all filters</button>
            </div>

            <div>
              <p className="text-zinc-400 text-xs mb-2">Narrow searches with these additional fields</p>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="text-white text-sm mb-2">Industry Type</h4>
                  <div className="space-y-1">
                    <Checkbox id="van-truck" className="border-zinc-700" />
                    <label htmlFor="van-truck" className="text-white text-sm ml-2">Van / Truck</label>
                  </div>
                </div>
                
                <div>
                  <h4 className="text-white text-sm mb-2">Carpentry</h4>
                  <div className="space-y-1">
                    <Checkbox id="earthworks" className="border-zinc-700" />
                    <label htmlFor="earthworks" className="text-white text-sm ml-2">Earthworks</label>
                  </div>
                </div>
              </div>

              <div className="mt-4">
                <h4 className="text-white text-sm mb-2">Electrician</h4>
                <div className="flex flex-wrap gap-2">
                  {industries.map((industry) => (
                    <span
                      key={industry}
                      className="px-3 py-1 rounded-full bg-emerald-500 text-black text-sm"
                    >
                      {industry}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <Button className="w-full bg-emerald-500 hover:bg-emerald-600 text-black font-semibold h-12">
              Search
            </Button>
          </div>
        </div>

        {/* Job Listings */}
        <div className="space-y-4">
          {mockJobs.map((job) => (
            <div key={job.id} className="bg-zinc-900 rounded-lg p-6 border border-zinc-800">
              <div className="flex items-start gap-4">
                <div className="w-16 h-16 bg-zinc-800 rounded-lg flex items-center justify-center">
                  <span className="text-white text-2xl">🏢</span>
                </div>
                
                <div className="flex-1">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h3 className="text-white text-lg font-semibold">{job.title}</h3>
                      <p className="text-zinc-400 text-sm">{job.company}</p>
                    </div>
                    <Button variant="ghost" className="text-white">❤️</Button>
                  </div>

                  <div className="flex items-center gap-4 text-sm text-zinc-400 mb-3">
                    <span>📍 {job.location}</span>
                    <span>{job.distance}</span>
                    <span>💰 {job.pay}</span>
                    <span className="text-emerald-500">{job.type}</span>
                  </div>

                  <div className="mb-3">
                    <p className="text-white text-sm mb-2">{job.company}</p>
                    <p className="text-zinc-400 text-sm">
                      Absolute Concrete is a company delivering exceptional concrete solutions tailored for a client's needs.
                    </p>
                  </div>

                  <div className="mb-3">
                    <h4 className="text-white text-sm font-medium mb-2">Skills Required</h4>
                    <div className="flex flex-wrap gap-2">
                      {job.tags.map((tag) => (
                        <span key={tag} className="px-3 py-1 rounded-full bg-emerald-500 text-black text-xs">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="mb-3">
                    <h4 className="text-white text-sm font-medium mb-2">Essential Licences</h4>
                    <div className="flex flex-wrap gap-2">
                      {job.licenses.map((license) => (
                        <span key={license} className="px-3 py-1 rounded-full border border-emerald-500 text-emerald-500 text-xs">
                          {license}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-zinc-400 text-xs">{job.posted}</span>
                    <Button className="bg-emerald-500 hover:bg-emerald-600 text-black">
                      Apply Now
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Chat Widget */}
      <div className="fixed bottom-6 right-6 bg-emerald-500 rounded-full w-14 h-14 flex items-center justify-center cursor-pointer shadow-lg">
        <span className="text-black text-2xl">💬</span>
        <div className="absolute -top-2 -right-2 bg-red-500 rounded-full w-6 h-6 flex items-center justify-center text-white text-xs">
          9+
        </div>
      </div>
    </div>
  );
}
