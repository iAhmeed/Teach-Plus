"use client";
import useStore from "@/store/useStore.js";
import { useState } from 'react';

export default function Ranks() {
  const { ranks, addRankInfos, updateRankInfos, deleteRankInfos } = useStore();
  const [formData, setFormData] = useState({ rankName: '', rankPrice: '', fiscalYear: '' });
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState('');
  const [selectedRank, setSelectedRank] = useState(null);
  const [selectedFiscalYear, setSelectedFiscalYear] = useState(null);

  const getFiscalYears = () => {
    const currentYear = new Date().getFullYear();
    const years = [];
    
    for (let i = 0; i < 10; i++) {
      years.push(currentYear - i);
    }
    
    return years;
  };

  const filterRanksByFiscalYear = (ranks, fiscalYear) => {
    if (!fiscalYear) return ranks;
    return ranks.filter(rank => rank.fiscal_year == fiscalYear);
  };

  const filteredRanks = filterRanksByFiscalYear(ranks, selectedFiscalYear);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    if (error) setError('');
  };

  const validateForm = () => {
    if (!formData.rankName.trim()) {
      setError('Please enter a rank name');
      return false;
    }

    if (!formData.rankPrice || isNaN(formData.rankPrice)) {
      setError('Please enter a valid price');
      return false;
    }

    if (!formData.fiscalYear) {
      setError('Please select a fiscal year');
      return false;
    }

    const isDuplicate = ranks.some(rank => {
      if (editingId && rank.rank_id === editingId) return false;
      return rank.rank_name.toLowerCase() === formData.rankName.toLowerCase() && 
             rank.fiscal_year === formData.fiscalYear;
    });

    if (isDuplicate) {
      setError('A rank with this name already exists for the selected fiscal year');
      return false;
    }

    return true;
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    if (editingId !== null) {
      updateRankInfos(editingId, {
        newRankName: formData.rankName,
        newRankPrice: parseFloat(formData.rankPrice),
        newFiscalYear: formData.fiscalYear
      });
    } else {
      addRankInfos({
        rankName: formData.rankName,
        rankPrice: parseFloat(formData.rankPrice),
        fiscalYear: formData.fiscalYear
      });
    }

    setFormData({ rankName: '', rankPrice: '', fiscalYear: '' });
    setEditingId(null);
    setError('');
    setSelectedRank(null);
  };

  const handleEdit = (rank) => {
    setFormData({
      rankName: rank.rank_name,
      rankPrice: rank.rank_price.toString(),
      fiscalYear: rank.fiscal_year
    });
    setEditingId(rank.rank_id);
    setSelectedRank(rank);
    setError('');
  };

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this rank? This action cannot be undone.')) {
      deleteRankInfos(id);
      if (editingId === id) {
        setEditingId(null);
        setSelectedRank(null);
        setFormData({ rankName: '', rankPrice: '', fiscalYear: '' });
      }
    }
  };

 

  return (
    <div className="w-full p-6 bg-gray-50 min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-[#141F75]">Manage Ranks</h1>
        <div className="flex items-center space-x-4">
          <div>
            <label htmlFor="fiscalYear" className="block text-sm font-medium text-gray-700 mb-1">
              Fiscal Year
            </label>
            <select
              id="fiscalYear"
              value={selectedFiscalYear || ''}
              onChange={(e) => setSelectedFiscalYear(e.target.value || null)}
              className="p-2 cursor-pointer border border-gray-300 rounded-md focus:ring-[#141F75] focus:border-[#141F75]"
            >
              <option value="">All Years</option>
              {getFiscalYears().map((year) => (
                <option key={year} value={year}>
                  {year}
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
              <h2 className="text-xl font-semibold text-gray-800">Ranks</h2>
            </div>
            
            {filteredRanks.length === 0 ? (
              <div className="p-6 text-center text-gray-500">
                {ranks.length === 0 ? 'No ranks added yet' : 'No ranks found for selected fiscal year'}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rank Name</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fiscal Year</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredRanks.map(rank => (
                      <tr key={rank.rank_id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {rank.rank_name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {rank.rank_price} {" "} {"DA"}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {rank.fiscal_year}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex space-x-2">
                            <button
                              onClick={() => handleEdit(rank)}
                              className="px-3 cursor-pointer py-1 bg-indigo-100 text-indigo-700 rounded-md text-sm hover:bg-indigo-200"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleDelete(rank.rank_id)}
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
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Add New Rank</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="p-2 bg-red-100 text-red-700 rounded text-sm">
                  {error}
                </div>
              )}
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Rank Name</label>
                <input
                  type="text"
                  name="rankName"
                  value={formData.rankName}
                  onChange={handleInputChange}
                  placeholder="e.g. MCA , MCB ..."
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-[#141F75] focus:border-[#141F75]"
                  required
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Price (DA)</label>
                  <input
                    type="number"
                    name="rankPrice"
                    value={formData.rankPrice}
                    onChange={handleInputChange}
                    step="0.01"
                    min="0"
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-[#141F75] focus:border-[#141F75]"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Fiscal Year</label>
                  <select
                    name="fiscalYear"
                    value={formData.fiscalYear}
                    onChange={handleInputChange}
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-[#141F75] focus:border-[#141F75]"
                    required
                  >
                    <option value="">Select Year</option>
                    {getFiscalYears().map((year) => (
                      <option key={year} value={year}>
                        {year}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              
              <div className="flex justify-end">
                <button
                  type="submit"
                  className="px-4 cursor-pointer py-2 bg-[#141F75] text-white rounded-md hover:bg-[#0e1757] transition-colors"
                >
                  {editingId ? 'Update Rank' : 'Add Rank'}
                </button>
              </div>
            </form>
          </div>
        </>
      )}

      {editingId && selectedRank && (
        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="flex items-center mb-4">
            <button
              className="flex cursor-pointer items-center text-[#141F75] hover:text-[#0e1757] mr-4"
              onClick={() => {
                setEditingId(null);
                setSelectedRank(null);
                setFormData({ rankName: '', rankPrice: '', fiscalYear: '' });
                setError('');
              }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
              </svg>
              Back
            </button>
            <h2 className="text-xl font-semibold text-gray-800">Edit Rank</h2>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-2 bg-red-100 text-red-700 rounded text-sm">
                {error}
              </div>
            )}
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Rank Name</label>
              <input
                type="text"
                name="rankName"
                value={formData.rankName}
                onChange={handleInputChange}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-[#141F75] focus:border-[#141F75]"
                required
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Price (DA)</label>
                <input
                  type="number"
                  name="rankPrice"
                  value={formData.rankPrice}
                  onChange={handleInputChange}
                  step="0.01"
                  min="0"
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-[#141F75] focus:border-[#141F75]"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Fiscal Year</label>
                <select
                  name="fiscalYear"
                  value={formData.fiscalYear}
                  onChange={handleInputChange}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-[#141F75] focus:border-[#141F75]"
                  required
                >
                  <option value="">Select Year</option>
                  {getFiscalYears().map((year) => (
                    <option key={year} value={year}>
                      {year}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            
            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => {
                  setEditingId(null);
                  setSelectedRank(null);
                  setFormData({ rankName: '', rankPrice: '', fiscalYear: '' });
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
                Update Rank
              </button>
            </div>
          </form>
        </div>
      )}
    </div>  
  );
}