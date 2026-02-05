"use client";
import useStore from "@/store/useStore.js";
import { useState, useEffect } from 'react';

export default function Periods() {
  const { periods, addPeriod, updatePeriod, deletePeriod } = useStore();
  const [formData, setFormData] = useState({ name: '', from: '', to: '' });
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState('');
  const [selectedPeriod, setSelectedPeriod] = useState(null);
  const [selectedAcademicYear, setSelectedAcademicYear] = useState(null);

  // Generate academic years (current year and previous 9 years)
  const getAcademicYears = () => {
    const currentYear = new Date().getFullYear();
    const years = [];
    
    for (let i = 0; i < 10; i++) {
      const year = currentYear - i;
      years.push({
        label: `${year-1}/${year}`,
        start: `${year-1}-09-01`,
        end: `${year}-07-31`
      });
    }
    
    return years;
  };

  // Filter periods by selected academic year
  const filterPeriodsByAcademicYear = (periods, academicYear) => {
    if (!academicYear) return periods;
    
    const startDate = new Date(academicYear.start);
    const endDate = new Date(academicYear.end);
    
    return periods.filter(period => {
      const periodStart = new Date(period.from);
      const periodEnd = new Date(period.to);
      return periodStart >= startDate && periodEnd <= endDate;
    });
  };

  const filteredPeriods = filterPeriodsByAcademicYear(periods, selectedAcademicYear);

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  // Calculate duration in days
  const calculateDuration = (from, to) => {
    const start = new Date(from);
    const end = new Date(to);
    const diffTime = Math.abs(end - start);
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1; 
  };

  // Handle input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    if (error) setError('');
  };

  // Validate dates against academic year constraints
  const validateDates = () => {
    if (!formData.name.trim()) {
      setError('Please enter a name for the period');
      return false;
    }

    if (!formData.from || !formData.to) {
      setError('Please fill both date fields');
      return false;
    }

    const startDate = new Date(formData.from);
    const endDate = new Date(formData.to);

    if (endDate <= startDate) {
      setError('End date must be after start date');
      return false;
    }

    // Determine academic year based on start date
    const academicYear = getAcademicYearForDate(startDate);
    
    if (!academicYear) {
      setError('Period must start between September 1st and July 31st of an academic year');
      return false;
    }

    // Check if entire period is within academic year
    const academicEnd = new Date(academicYear.end);
    if (endDate > academicEnd) {
      setError(`Period must end by ${formatDate(academicYear.end)} (end of academic year)`);
      return false;
    }

    // Check for overlapping periods
    const isOverlapping = periods.some(period => {
      if (editingId && period.period_id === editingId) return false;
      
      const existingStart = new Date(period.from);
      const existingEnd = new Date(period.to);
      
      return (startDate <= existingEnd && endDate >= existingStart);
    });

    if (isOverlapping) {
      setError('This period overlaps with an existing period');
      return false;
    }

    return true;
  };

  // Get academic year for a given date
  const getAcademicYearForDate = (date) => {
    const dateObj = new Date(date);
    const month = dateObj.getMonth() + 1; // 1-12
    const year = dateObj.getFullYear();

    // Academic year runs from September to July
    if (month >= 9) { // Sept-Dec
      return {
        label: `${year}/${year+1}`,
        start: `${year}-09-01`,
        end: `${year+1}-07-31`
      };
    } else if (month <= 7) { // Jan-July
      return {
        label: `${year-1}/${year}`,
        start: `${year-1}-09-01`,
        end: `${year}-07-31`
      };
    }
    return null; // August is between academic years
  };

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();

    if (!validateDates()) return;

    if (editingId !== null) {
      updatePeriod(editingId, {
        newName: formData.name,
        newFrom: formData.from,
        newTo: formData.to
      });
    } else {
      addPeriod(formData);
    }

    setFormData({ name: '', from: '', to: '' });
    setEditingId(null);
    setError('');
    setSelectedPeriod(null);
  };

  // Edit a period
  const handleEdit = (period) => {
    setFormData({
      name: period.name,
      from: period.from,
      to: period.to
    });
    setEditingId(period.period_id);
    setSelectedPeriod(period);
    setError('');
    
    // Set academic year based on period dates
    const academicYear = getAcademicYearForDate(period.from);
    setSelectedAcademicYear(academicYear);
  };

  // Delete a period
  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this period? This action cannot be undone.')) {
      deletePeriod(id);
      if (editingId === id) {
        setEditingId(null);
        setSelectedPeriod(null);
        setFormData({ name: '', from: '', to: '' });
      }
    }
  };

  return (
    <div className="w-full p-6 bg-gray-50 min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-[#141F75]">Manage Periods</h1>
        <div className="flex items-center space-x-4">
          <div>
            <label htmlFor="academicYear" className="block text-sm font-medium text-gray-700 mb-1">
              Academic Year
            </label>
            <select
              id="academicYear"
              value={selectedAcademicYear ? selectedAcademicYear.label : ''}
              onChange={(e) => {
                const selected = getAcademicYears().find(year => year.label === e.target.value);
                setSelectedAcademicYear(selected || null);
              }}
              className="p-2 cursor-pointer border border-gray-300 rounded-md focus:ring-[#141F75] focus:border-[#141F75]"
            >
              <option value="">All Years</option>
              {getAcademicYears().map((year) => (
                <option key={year.label} value={year.label}>
                  {year.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {!editingId && (
        <>
          <div className="bg-white rounded-xl shadow-md overflow-hidden mb-8">
            <div className="p-4 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-800">Periods</h2>
            </div>
            
            {filteredPeriods.length === 0 ? (
              <div className="p-6 text-center text-gray-500">
                {periods.length === 0 ? 'No periods added yet' : 'No periods found for selected academic year'}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Start Date</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">End Date</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Duration (days)</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredPeriods.map(period => (
                      <tr key={period.period_id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {period.name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {formatDate(period.from)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {formatDate(period.to)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {calculateDuration(period.from, period.to)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex space-x-2">
                            <button
                              onClick={() => handleEdit(period)}
                              className="px-3 cursor-pointer py-1 bg-indigo-100 text-indigo-700 rounded-md text-sm hover:bg-indigo-200"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleDelete(period.period_id)}
                              className="px-3 cursor-pointer py-1 bg-red-100 text-red-700 rounded-md text-sm hover:bg-red-200"
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          <div className="bg-white rounded-xl shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Add New Period</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="p-2 bg-red-100 text-red-700 rounded text-sm">
                  {error}
                </div>
              )}
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Period Name</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="e.g. Ramadan Session, Winter Break"
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-[#141F75] focus:border-[#141F75]"
                  required
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                  <input
                    type="date"
                    name="from"
                    value={formData.from}
                    onChange={handleInputChange}
                    min={selectedAcademicYear?.start}
                    max={selectedAcademicYear?.end}
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-[#141F75] focus:border-[#141F75]"
                    required
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Must be between September 1 and July 31 of academic year
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                  <input
                    type="date"
                    name="to"
                    value={formData.to}
                    onChange={handleInputChange}
                    min={formData.from || selectedAcademicYear?.start}
                    max={selectedAcademicYear?.end}
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-[#141F75] focus:border-[#141F75]"
                    required
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Must be within same academic year as start date
                  </p>
                </div>
              </div>
              
              <div className="flex justify-end">
                <button
                  type="submit"
                  className="px-4 cursor-pointer py-2 bg-[#141F75] text-white rounded-md hover:bg-[#0e1757] transition-colors"
                >
                  Add Period
                </button>
              </div>
            </form>
          </div>
        </>
      )}

      {editingId && selectedPeriod && (
        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="flex items-center mb-4">
            <button
              className="flex cursor-pointer items-center text-[#141F75] hover:text-[#0e1757] mr-4"
              onClick={() => {
                setEditingId(null);
                setSelectedPeriod(null);
                setFormData({ name: '', from: '', to: '' });
                setError('');
                setSelectedAcademicYear(null);
              }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
              </svg>
              Back
            </button>
            <h2 className="text-xl font-semibold text-gray-800">Edit Period</h2>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-2 bg-red-100 text-red-700 rounded text-sm">
                {error}
              </div>
            )}
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Period Name</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-[#141F75] focus:border-[#141F75]"
                required
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                <input
                  type="date"
                  name="from"
                  value={formData.from}
                  onChange={handleInputChange}
                  min={selectedAcademicYear?.start}
                  max={selectedAcademicYear?.end}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-[#141F75] focus:border-[#141F75]"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">
                  Academic year: {selectedAcademicYear?.label}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                <input
                  type="date"
                  name="to"
                  value={formData.to}
                  onChange={handleInputChange}
                  min={formData.from || selectedAcademicYear?.start}
                  max={selectedAcademicYear?.end}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-[#141F75] focus:border-[#141F75]"
                  required
                />
              </div>
            </div>
            
            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => {
                  setEditingId(null);
                  setSelectedPeriod(null);
                  setFormData({ name: '', from: '', to: '' });
                  setError('');
                  setSelectedAcademicYear(null);
                }}
                className="px-4 cursor-pointer py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 cursor-pointer py-2 bg-[#141F75] text-white rounded-md hover:bg-[#0e1757] transition-colors"
              >
                Update Period
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}