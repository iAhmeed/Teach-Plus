"use client";
import TeacherCard from "@/components/teacherCard.jsx";
import { useEffect, useState } from "react";
import AddTeacher from "@/components/AddTeacher";
import useStore from "@/store/useStore.js";
import Modal from "@/components/Modal";

export default function Teachers() {
  const { filteredTeachers, ranks, searchTeacher, empty, filterTeachers } = useStore();
  const [query, setQuery] = useState("");
  const [openAdd, setOpenAdd] = useState(false);
  const [selectedFilter, setFilter] = useState("ALL");

  const uniqueRanks = [...new Set(ranks.map((rank) => rank.rank_name))];

  useEffect(() => {
    filterTeachers(selectedFilter);
  }, [selectedFilter]);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      searchTeacher(query);
    }, 500);
    return () => clearTimeout(timeoutId);
  }, [query]);

  const handleAddTeacher = () => {
    setOpenAdd(true);
  };

  return (
    <div className="w-full p-3">
      <h1 className="text-3xl font-bold text-[#141F75]">Teachers Management</h1>
      <p className="text-[#141F75] text-sm mb-4 font-mono">Manage all teachers in your institution</p>
      <hr className="text-gray-400 mb-4" />

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
        <div className="w-full sm:w-1/2">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search teachers by name..."
            className="w-full p-2 border bg-gray-200 border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
        </div>

        <div className="w-full sm:w-1/4">
          <select
            onChange={(e) => setFilter(e.target.value)}
            className="w-full px-2 py-2 text-center bg-gray-200 rounded-md text-blue-900 hover:cursor-pointer"
          >
            <option value="ALL">ALL</option>
            {uniqueRanks.map((rankName) => (
              <option key={rankName} value={rankName}>
                {rankName}
              </option>
            ))}
          </select>
        </div>

        <div className="w-full sm:w-1/4">
          <button
            className="w-full p-2 cursor-pointer text-white bg-[#2738BD] rounded-md hover:bg-blue-700 transition duration-200"
            onClick={handleAddTeacher}
          >
            Add Teacher
          </button>
        </div>
      </div>

      {filteredTeachers?.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {filteredTeachers.map((teacher) => (
            <TeacherCard key={teacher.teacher_id} teacherData={teacher} />
          ))}
        </div>
      ) : empty ? (
        <div className="flex flex-col items-center justify-center p-8 text-gray-500">
          <svg xmlns="http://www.w3.org/2000/svg" className="w-16 h-16 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="text-xl font-medium">No teachers found</p>
          <p className="text-sm">Try adjusting your search or add new teachers</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {[...Array(4)].map((_, index) => (
            <div key={index} className="p-4 bg-gray-200 rounded-md animate-pulse h-48"></div>
          ))}
        </div>
      )}

      {openAdd && (
        <Modal isOpen={openAdd} onClose={() => setOpenAdd(false)}>
          <AddTeacher onClose={() => setOpenAdd(false)} />
        </Modal>
      )}
    </div>
  );
}
