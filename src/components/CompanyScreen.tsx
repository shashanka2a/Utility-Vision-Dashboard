"use client";

import { useState } from "react";
import { Upload } from "lucide-react";

export function CompanyScreen() {
  const [companyData, setCompanyData] = useState({
    companyName: "Wick'd Environmental Technologies",
    companyPhone: '+1 (904) 796-7790',
    companyEmail: 'brad@wickd-fl.com',
    ccEmails: 'savannah@wickd-fl.com',
    industry: 'Construction',
    subIndustry: 'Environmental Services',
    employeeRange: '10-50',
    searchAddress: '',
    streetAddress: '864 Southwest Spirit Avenue',
    city: 'Fort White',
    state: 'Florida',
    zipCode: '32038',
    country: 'United States',
    reportLanguage: 'English',
    brandColor: '#FF6633'
  });

  const handleChange = (field: string, value: string) => {
    setCompanyData({ ...companyData, [field]: value });
  };

  const handleSave = () => {
    alert('Company information saved successfully!');
  };

  const handleReset = () => {
    if (confirm('Reset all changes?')) {
      window.location.reload();
    }
  };

  return (
    <div className="h-full">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl">Company info</h1>
          <div className="flex items-center gap-3">
            <button className="text-sm text-gray-700 hover:text-black transition-colors">
              View report preview
            </button>
            <button
              onClick={handleReset}
              className="px-4 py-2 border border-gray-300 rounded text-sm hover:bg-gray-100 transition-colors"
            >
              Reset
            </button>
            <button
              onClick={handleSave}
              className="px-4 py-2 bg-[#FF6633] text-white rounded text-sm hover:bg-[#E55A2B] transition-colors"
            >
              Save
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        <div className="max-w-5xl mx-auto bg-white border border-gray-300 rounded-lg">
          <div className="flex">
            {/* Logo Upload Section */}
            <div className="w-64 p-6 border-r border-gray-300">
              <div className="space-y-4">
                <div className="w-24 h-24 bg-white border-2 border-gray-300 rounded-lg flex items-center justify-center">
                  <div className="w-16 h-16 bg-[#FF6633] rounded flex items-center justify-center">
                    <span className="text-white font-bold text-xl">UV</span>
                  </div>
                </div>
                <button className="w-full flex items-center justify-center gap-2 px-3 py-2 border border-gray-300 rounded text-sm hover:bg-gray-100 transition-colors">
                  <Upload className="w-4 h-4" />
                  <span>Upload logo</span>
                </button>
              </div>
            </div>

            {/* Form Section */}
            <div className="flex-1 p-6">
              <div className="grid grid-cols-2 gap-4">
                {/* Company Name */}
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Company name
                  </label>
                  <input
                    type="text"
                    value={companyData.companyName}
                    onChange={(e) => handleChange('companyName', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-[#FF6633] focus:border-transparent"
                  />
                </div>

                {/* Company Phone */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Company phone
                  </label>
                  <input
                    type="text"
                    value={companyData.companyPhone}
                    onChange={(e) => handleChange('companyPhone', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-[#FF6633] focus:border-transparent"
                  />
                </div>

                {/* Company Email */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Company email
                  </label>
                  <input
                    type="email"
                    value={companyData.companyEmail}
                    onChange={(e) => handleChange('companyEmail', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-[#FF6633] focus:border-transparent"
                  />
                </div>

                {/* CC Emails */}
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    CC Emails
                  </label>
                  <input
                    type="text"
                    value={companyData.ccEmails}
                    onChange={(e) => handleChange('ccEmails', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-[#FF6633] focus:border-transparent"
                    placeholder="Separate multiple emails with commas"
                  />
                </div>

                {/* Industry */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Industry
                  </label>
                  <select
                    value={companyData.industry}
                    onChange={(e) => handleChange('industry', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-[#FF6633] focus:border-transparent"
                  >
                    <option>Construction</option>
                    <option>Environmental Services</option>
                    <option>Utilities</option>
                    <option>Infrastructure</option>
                  </select>
                </div>

                {/* Sub Industry */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Sub industry
                  </label>
                  <select
                    value={companyData.subIndustry}
                    onChange={(e) => handleChange('subIndustry', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-[#FF6633] focus:border-transparent"
                  >
                    <option>Environmental Services</option>
                    <option>Civil Engineering</option>
                    <option>Landscaping</option>
                    <option>General Contracting</option>
                  </select>
                </div>

                {/* Employee Range */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Employee range
                  </label>
                  <select
                    value={companyData.employeeRange}
                    onChange={(e) => handleChange('employeeRange', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-[#FF6633] focus:border-transparent"
                  >
                    <option>1-10</option>
                    <option>10-50</option>
                    <option>50-100</option>
                    <option>100-500</option>
                    <option>500+</option>
                  </select>
                </div>

                {/* Search Address */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Search address
                  </label>
                  <input
                    type="text"
                    value={companyData.searchAddress}
                    onChange={(e) => handleChange('searchAddress', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-[#FF6633] focus:border-transparent"
                    placeholder="Search for address"
                  />
                </div>

                {/* Street Address */}
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Street address
                  </label>
                  <input
                    type="text"
                    value={companyData.streetAddress}
                    onChange={(e) => handleChange('streetAddress', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-[#FF6633] focus:border-transparent"
                  />
                </div>

                {/* City */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    City
                  </label>
                  <input
                    type="text"
                    value={companyData.city}
                    onChange={(e) => handleChange('city', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-[#FF6633] focus:border-transparent"
                  />
                </div>

                {/* State */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    State
                  </label>
                  <input
                    type="text"
                    value={companyData.state}
                    onChange={(e) => handleChange('state', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-[#FF6633] focus:border-transparent"
                  />
                </div>

                {/* ZIP Code */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    ZIP code
                  </label>
                  <input
                    type="text"
                    value={companyData.zipCode}
                    onChange={(e) => handleChange('zipCode', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-[#FF6633] focus:border-transparent"
                  />
                </div>

                {/* Country */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Country
                  </label>
                  <input
                    type="text"
                    value={companyData.country}
                    onChange={(e) => handleChange('country', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-[#FF6633] focus:border-transparent"
                  />
                </div>

                {/* Report Display Language */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Report display language
                  </label>
                  <select
                    value={companyData.reportLanguage}
                    onChange={(e) => handleChange('reportLanguage', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-[#FF6633] focus:border-transparent"
                  >
                    <option>English</option>
                    <option>Spanish</option>
                    <option>French</option>
                  </select>
                </div>

                {/* Brand Color */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Brand color
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="color"
                      value={companyData.brandColor}
                      onChange={(e) => handleChange('brandColor', e.target.value)}
                      className="w-12 h-10 border border-gray-300 rounded cursor-pointer"
                    />
                    <input
                      type="text"
                      value={companyData.brandColor}
                      onChange={(e) => handleChange('brandColor', e.target.value)}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-[#FF6633] focus:border-transparent"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
