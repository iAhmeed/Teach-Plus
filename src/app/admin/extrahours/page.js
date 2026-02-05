"use client";

import { useState, useEffect } from 'react';
import useStore from "@/store/useStore";
import ExtraHoursSheet from '@/components/ExtraHoursSheet';
import Modal from '@/components/Modal';
import { motion } from 'framer-motion';
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

export default function ExtraHours() {
  const { 
    getExtraHoursSheet, 
    recalculateSheet, 
    getTotalExtraHours, 
    periods, 
    teachers, 
    getSubPeriods, 
    ranks 
  } = useStore();

  const [selectedTeacher, setSelectedTeacher] = useState(null);
  const [academicYear, setAcademicYear] = useState('');
  const [subPeriods, setSubPeriods] = useState([]);
  const [extraDays, setExtraDays] = useState([]);
  const [selectedSubPeriod, setSelectedSubPeriod] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [sheet, setSheet] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [type, setType] = useState('');
  const [category, setCategory] = useState('');
  const [selectedPeriod, setSelectedPeriod] = useState('');

  const currentYear = new Date().getFullYear();
  const academicYears = Array.from({ length: 10 }, (_, i) => {
    const year = currentYear - i;
    return `${year}/${year + 1}`;
  });

  const getRankPrice = (rankName, fromDate) => {
    
   
    
    try {
      const date = new Date(fromDate);
      

      const year = date.getFullYear()
      
      const matchingRanks = ranks.filter(rank =>
        rank.rank_name == rankName && year == rank.fiscal_year
      );
        if ( ! matchingRanks[0]) { alert("no rank in this year , please define rank") ; return}
  console.log(matchingRanks[0]?.rank_price);
  
      return matchingRanks[0]?.rank_price || 0;
    } catch {
      return 0;
    }
  };

  const fetchSubPeriods = async () => {
    if (!selectedTeacher || !academicYear) return;
    setIsLoading(true);
    try {
      const periods = await getSubPeriods(selectedTeacher.teacher_id, academicYear);
      setSubPeriods(periods);
      setSelectedSubPeriod('');
    } finally {
      setIsLoading(false);
    }
  };

  const handleExtraHours = async () => {
    if (selectedSubPeriod === '' || !subPeriods[selectedSubPeriod] || !subPeriods[selectedSubPeriod].rank){
    alert("Teacher without Rank , please enter a rank");
      return
    ;}

    setIsLoading(true);
    try {
      const period = subPeriods[selectedSubPeriod];
      const rankPrice = await getRankPrice(period.rank, period.from);
        
      const sheetData = await getExtraHoursSheet({
        teacherId: selectedTeacher.teacher_id,
        from: period.from,
        to: period.to,
        rank: period.rank,
        academicYear: academicYear,
        rankPrice: rankPrice
      });

      setSheet(sheetData.sheet);
      
      setExtraDays(sheetData.extraDays);
      setIsModalOpen(true);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRecalculate = async () => {
    if (!sheet.sheet_id) return;

    setIsLoading(true);
    try {
      const period = subPeriods[selectedSubPeriod];
      const rankPrice = await getRankPrice(period.rank, period.from);

      const sheetData = await recalculateSheet({
        teacherId: selectedTeacher.teacher_id,
        from: period.from,
        to: period.to,
        rank: period.rank,
        academicYear: academicYear,
        rankPrice: rankPrice,
        sheetId: sheet.sheet_id
      });

      setSheet(sheetData.sheet);
      setExtraDays(sheetData.extraDays);
      setIsModalOpen(true);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSubPeriods();
  }, [selectedTeacher, academicYear]);

  const handleExcelPage = async () => {
    
    if (!type || !category || !selectedPeriod) return;
    
    setIsLoading(true);
    try {
      const period = periods.find(p => p.period_id == selectedPeriod);

      if (!period) return;
      
      const listOfTeachers = await getTotalExtraHours(
        type, 
        category, 
        period.from, 
        period.to
      );
      
      const worksheet = XLSX.utils.json_to_sheet(listOfTeachers);
      const workbook = XLSX.utils.book_new();

      XLSX.utils.book_append_sheet(workbook, worksheet, "Extra Hours Report");

      const excelBuffer = XLSX.write(workbook, {
        bookType: "xlsx",
        type: "array",
      });

      const dataBlob = new Blob([excelBuffer], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });

      saveAs(dataBlob, `ExtraHours_${type}_${category}_${period.from}_${period.to}.xlsx`);
    } finally {
      setIsLoading(false);
      setIsFormModalOpen(false);
    }
  };

  return (
    <motion.div
      className="p-6 max-w-4xl mx-auto"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <motion.h1
        className="text-2xl font-bold mb-6 text-[#141F75]"
        initial={{ y: -20 }}
        animate={{ y: 0 }}
      >
        Extra Hours Management
      </motion.h1>

      <div className="mb-6 bg-white p-4 rounded-lg shadow-sm border border-gray-200">
        <h2 className="font-medium mb-2 text-[#141F75]">Select a Teacher</h2>
        {teachers?.length > 0 ? (
          <div className="rounded-lg max-h-60 overflow-y-auto">
            {teachers.map(teacher => (
              <motion.div
                key={teacher.teacher_id}
                onClick={() => setSelectedTeacher(teacher)}
                className={`p-3 hover:bg-gray-100 cursor-pointer transition-colors ${selectedTeacher?.teacher_id === teacher.teacher_id ? 'bg-blue-100' : ''}`}
                whileHover={{ scale: 0.99 }}
              >
                <div className="flex items-center gap-3">
                  {teacher.picture ? (
                    <img
                      src={teacher.picture}
                      alt={teacher.first_name}
                      className="w-10 h-10 rounded-full object-cover border border-gray-300"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
                      <span className="text-gray-500 text-xs">Photo</span>
                    </div>
                  )}
                  <div>
                    <p className="font-medium">{teacher.first_name} {teacher.family_name}</p>
                    <p className="text-sm text-gray-500">{teacher.rank}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500">No teachers available</p>
        )}
      </div>

      <motion.div className="mb-6 bg-white p-4 rounded-lg shadow-sm border border-gray-200">
        <label className="block mb-2 font-medium text-[#141F75]">Academic Year</label>
        <select
          value={academicYear}
          onChange={(e) => setAcademicYear(e.target.value)}
          className="w-full cursor-pointer p-2 border rounded-md focus:ring-2 focus:ring-blue-400 focus:border-blue-400"
          disabled={!selectedTeacher || isLoading}
        >
          <option value="">Select a year</option>
          {academicYears.map(year => (
            <option key={year} value={year}>{year}</option>
          ))}
        </select>
      </motion.div>

      {subPeriods?.length > 0 && (
        <motion.div className="mb-6 bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <label className="block mb-2 font-medium text-[#141F75]">Sub-Period</label>
          <select
            value={selectedSubPeriod}
            onChange={(e) => setSelectedSubPeriod(e.target.value)}
            className="w-full p-2 cursor-pointer border rounded-md focus:ring-2 focus:ring-blue-400 focus:border-blue-400"
            disabled={isLoading}
          >
            <option value="">Select a sub-period</option>
            {subPeriods.map((period, index) => (
              <option key={`${period.from}-${period.to}`} value={index}>
                From {new Date(period.from).toLocaleDateString()} to {new Date(period.to).toLocaleDateString()} - Rank: {period.rank ||"Unknown"}
              </option>
            ))}
          </select>
        </motion.div>
      )}

      <div className="flex justify-end gap-4">
        <motion.button
          className={`px-6 py-2 cursor-pointer rounded-md text-white font-medium ${!selectedSubPeriod ? 'bg-gray-400 cursor-not-allowed' : 'bg-[#2738BD] hover:bg-[#1e2e9e]'}`}
          disabled={!selectedSubPeriod || isLoading}
          onClick={handleExtraHours}
          whileHover={selectedSubPeriod ? { scale: 1.05 } : {}}
          whileTap={selectedSubPeriod ? { scale: 0.95 } : {}}
        >
          {isLoading ? (
            <span className="flex cursor-pointer items-center justify-center">
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Generating...
            </span>
          ) : (
            "Generate Sheet"
          )}
        </motion.button>

        <motion.button
          className="px-6 py-2 cursor-pointer rounded-md bg-green-600 text-white hover:bg-green-700"
          onClick={() => setIsFormModalOpen(true)}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          Generate Total Hours
        </motion.button>
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-4">
          <ExtraHoursSheet
            teacher={{
              rank: sheet?.rank || "unknown",
              extraDays: extraDays || [],
              firstName: selectedTeacher?.first_name || "first name",
              familyName: selectedTeacher?.family_name || "family name",
              academicYear: academicYear,
              from: subPeriods[selectedSubPeriod]?.from || "no date",
              to: subPeriods[selectedSubPeriod]?.to || "no date",
              rankPrice: sheet.rankPrice
            }}
          />
          <div className="mt-4 flex justify-end gap-2">
            <button 
              onClick={handleRecalculate} 
              className="px-4 cursor-pointer py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
            >
              Recalculate
            </button>
            <button 
              onClick={() => setIsModalOpen(false)} 
              className="px-4 cursor-pointer py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
            >
              Close
            </button>
          </div>
        </motion.div>
      </Modal>

      <Modal isOpen={isFormModalOpen} onClose={() => setIsFormModalOpen(false)}>
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-4 space-y-4">
          <h2 className="text-xl font-semibold text-[#141F75]">Extra Hours Report</h2>
          
          <div>
            <label className="block mb-1 text-sm font-medium">Teacher Type</label>
            <select 
              value={type} 
              onChange={(e) => setType(e.target.value)} 
              className="w-full cursor-pointer p-2 border rounded-md"
              disabled={isLoading}
            >
              <option value="">Select Type</option>
              <option value="Permanent">Permanent</option>
              <option value="Temporary">Temporary</option>
            </select>
          </div>
          
          <div>
            <label className="block mb-1 text-sm font-medium">Payment Method</label>
            <select 
              value={category} 
              onChange={(e) => setCategory(e.target.value)} 
              className="w-full cursor-pointer p-2 border rounded-md"
              disabled={isLoading}
            >
              <option value="">Select Method</option>
              <option value="CCP">CCP</option>
              <option value="BANK">Bank</option>
            </select>
          </div>
          
          <div>
            <label className="block mb-1 text-sm font-medium">Period</label>
            <select 
              value={selectedPeriod} 
              onChange={(e) => setSelectedPeriod(e.target.value)} 
              className="w-full cursor-pointer p-2 border rounded-md"
              disabled={isLoading}
            >
              <option value="">Select Period</option>
              {periods.map(period => (
                <option key={period.period_id} value={period.period_id}>
                  {new Date(period.from).toLocaleDateString()} to {new Date(period.to).toLocaleDateString()}
                </option>
              ))}
            </select>
          </div>
          
          <div className="flex justify-end gap-2 pt-4">
            <button 
              onClick={() => setIsFormModalOpen(false)} 
              className="px-4 cursor-pointer py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
              disabled={isLoading}
            >
              Cancel
            </button>
            <button 
              onClick={handleExcelPage} 
              className={`px-4 py-2 cursor-pointer rounded-md text-white font-medium ${
                !type || !category || !selectedPeriod || isLoading 
                  ? 'bg-gray-400 cursor-not-allowed' 
                  : 'bg-blue-600 hover:bg-blue-700'
              }`}
              disabled={!type || !category || !selectedPeriod || isLoading}
            >
              {isLoading ? (
                <span className="flex cursor-pointer items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Generating Report...
                </span>
              ) : (
                "Generate Report"
              )}
            </button>
          </div>
        </motion.div>
      </Modal>
    </motion.div>
  );
}