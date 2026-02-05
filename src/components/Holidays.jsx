"use client"

import useStore from "@/store/useStore.js";
import { useState, useEffect } from 'react';

const formatDate = (dateString) => {
  if (!dateString) return '';
  
  const date = new Date(dateString);
  
  if (isNaN(date.getTime())) return dateString;
  
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  
  return `${day}/${month}/${year}`;
};

const parseAcademicYear = (academicYear) => {
  if (!academicYear) return null;
  const [startYear, endYear] = academicYear.split('/').map(Number);
  return {
    start: new Date(`${startYear}-09-01`), 
    end: new Date(`${endYear}-08-31`)     
  };
};

export default function Holidays() {
  const { holidays, addHoliday, updateHoliday, deleteHoliday } = useStore();
  
  const [formData, setFormData] = useState({ 
    description: '', 
    from: '', 
    to: '', 
    academicYear: '' 
  });
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState('');
  const [academicYears, setAcademicYears] = useState([]);
  const [selectedHoliday, setSelectedHoliday] = useState(null);
  const [filterYear, setFilterYear] = useState('');

  useEffect(() => {
    const currentYear = new Date().getFullYear();
    const years = [];
    for (let i = 9; i >= 0; i--) {
      const year = currentYear - i;
      years.push(`${year}/${year+1}`);
    }
    setAcademicYears(years);
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    if (error) setError('');
  };

  const validateForm = () => {
    if (!formData.description || !formData.from || !formData.to || !formData.academicYear) {
      setError('Please fill all fields');
      return false;
    }

    if (new Date(formData.to) < new Date(formData.from)) {
      setError('End date must be after start date');
      return false;
    }

    const academicYearRange = parseAcademicYear(formData.academicYear);
    if (academicYearRange) {
      const fromDate = new Date(formData.from);
      const toDate = new Date(formData.to);
      
      if (fromDate < academicYearRange.start || fromDate > academicYearRange.end) {
        setError('Start date must be within the academic year');
        return false;
      }
      
      if (toDate < academicYearRange.start || toDate > academicYearRange.end) {
        setError('End date must be within the academic year');
        return false;
      }
    }

    return true;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    if (editingId !== null) {
      updateHoliday(editingId, { 
        newDescription: formData.description,
        newFrom: formData.from,
        newTo: formData.to,
        newAcademicYear: formData.academicYear,
      });
    } else {
      addHoliday(formData);
    }

    setFormData({ description: '', from: '', to: '', academicYear: '' });
    setEditingId(null);
    setError('');
    setSelectedHoliday(null);
  };

  const handleEdit = (holiday) => {
    const formatForDateInput = (dateString) => {
      if (!dateString) return '';
      const date = new Date(dateString);
      return date.toISOString().split('T')[0];
    };

    setFormData({
      description: holiday.description,
      from: formatForDateInput(holiday.from),
      to: formatForDateInput(holiday.to),
      academicYear: holiday.academic_year,
    });
    setEditingId(holiday.holiday_id);
    setSelectedHoliday(holiday);
    setError('');
  };

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this holiday?')) {
      deleteHoliday(id);
    }
  };

  return (
    <div className="w-full p-6 bg-gray-50 min-h-screen">
      <h1 className="text-3xl font-bold text-[#141F75] mb-6">Manage Holidays</h1>

      {!editingId && (
        <>
          <div className="bg-white rounded-xl shadow-md overflow-hidden mb-8">
            <div className="p-4 border-b border-gray-200 flex justify-between items-center">
              <h2 className="text-xl font-semibold text-gray-800">Holidays</h2>
              <div className="flex items-center space-x-2">
                <label className="text-sm font-medium text-gray-700">Filter by Academic Year:</label>
                <select
                  value={filterYear}
                  onChange={(e) => setFilterYear(e.target.value)}
                  className="p-2 border border-gray-300 rounded-md focus:ring-[#141F75] focus:border-[#141F75]"
                >
                  <option value="">All Years</option>
                  {academicYears.map(year => (
                    <option key={year} value={year}>{year}</option>
                  ))}
                </select>
              </div>
            </div>
            
            {holidays?.length === 0 ? (
              <div className="p-6 text-center text-gray-500">
                No holidays 
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">From</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">To</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Academic Year</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {holidays
                      ?.filter(holiday => !filterYear || holiday.academic_year === filterYear)
                      ?.map((holiday) => (
                        <tr key={holiday.holiday_id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {holiday.description}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {formatDate(holiday.from)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {formatDate(holiday.to)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {holiday.academic_year}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <div className="flex space-x-2">
                              <button
                                onClick={() => handleEdit(holiday)}
                                className="px-3 cursor-pointer py-1 bg-indigo-100 text-indigo-700 rounded-md text-sm hover:bg-indigo-200"
                              >
                                Edit
                              </button>
                              <button
                                onClick={() => handleDelete(holiday.holiday_id)}
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
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Add New Holiday</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="p-2 bg-red-100 text-red-700 rounded text-sm">
                  {error}
                </div>
              )}
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <input
                    type="text"
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-[#141F75] focus:border-[#141F75]"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Academic Year</label>
                  <select
                    name="academicYear"
                    value={formData.academicYear}
                    onChange={handleInputChange}
                    className="w-full cursor-pointer p-2 border border-gray-300 rounded-md focus:ring-[#141F75] focus:border-[#141F75]"
                    required
                  >
                    <option value="">Select Academic Year</option>
                    {academicYears.map(year => (
                      <option key={year} value={year}>{year}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">From Date</label>
                  <input
                    type="date"
                    name="from"
                    value={formData.from}
                    onChange={handleInputChange}
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-[#141F75] focus:border-[#141F75]"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">To Date</label>
                  <input
                    type="date"
                    name="to"
                    value={formData.to}
                    onChange={handleInputChange}
                    className="w-full cursor-pointer p-2 border border-gray-300 rounded-md focus:ring-[#141F75] focus:border-[#141F75]"
                    required
                  />
                </div>
              </div>
              <div className="flex justify-end">
                <button
                  type="submit"
                  className="px-4 cursor-pointer py-2 bg-[#141F75] text-white rounded-md hover:bg-[#0e1757] transition-colors"
                >
                  Add Holiday
                </button>
              </div>
            </form>
          </div>
        </>
      )}

      {editingId && selectedHoliday && (
        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="flex items-center mb-4">
            <button
              className="flex cursor-pointer items-center text-[#141F75] hover:text-[#0e1757] mr-4"
              onClick={() => {
                setEditingId(null);
                setSelectedHoliday(null);
                setFormData({ description: '', from: '', to: '', academicYear: '' });
                setError('');
              }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
              </svg>
              Back
            </button>
            <h2 className="text-xl font-semibold text-gray-800">Edit Holiday</h2>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-2 bg-red-100 text-red-700 rounded text-sm">
                {error}
              </div>
            )}
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <input
                  type="text"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-[#141F75] focus:border-[#141F75]"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Academic Year</label>
                <select
                  name="academicYear"
                  value={formData.academicYear}
                  onChange={handleInputChange}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-[#141F75] focus:border-[#141F75]"
                  required
                >
                  <option value="">Select Academic Year</option>
                  {academicYears.map(year => (
                    <option key={year} value={year}>{year}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">From Date</label>
                <input
                  type="date"
                  name="from"
                  value={formData.from}
                  onChange={handleInputChange}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-[#141F75] focus:border-[#141F75]"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">To Date</label>
                <input
                  type="date"
                  name="to"
                  value={formData.to}
                  onChange={handleInputChange}
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
                  setSelectedHoliday(null);
                  setFormData({ description: '', from: '', to: '', academicYear: '' });
                  setError('');
                }}
                className="px-4 cursor-pointer py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 cursor-pointer py-2 bg-[#141F75] text-white rounded-md hover:bg-[#0e1757] transition-colors"
              >
                Update Holiday
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}