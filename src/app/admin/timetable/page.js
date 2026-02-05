"use client";

import Shedule from "@/components/Shedule";
import useStore from "@/store/useStore.js";
import { useEffect, useState } from "react";
import Modal from "@/components/Modal";
import AddSession from "@/components/AddSession";

export default function Schedule() {
  const { sessions, getSessions, getTeachers } = useStore();
  const [filterTimeTable, setFilterTimeTable] = useState({
    academicLevel: "",
    semester: "",
    academicYear: "",
  });
  const currentYear = new Date().getFullYear();
  const academicYears = Array.from({ length: 10 }, (_, i) => `${currentYear - i}/${currentYear - i + 1}`);
  const [isOpenAddSession, setIsOpenAddSession] = useState(false);

  useEffect(() => {
    getSessions(filterTimeTable);
  }, [filterTimeTable]);

  return (
    <div className=" w-full  p-6 bg-white rounded-lg shadow-md">
      <h1 className="text-3xl font-bold text-[#141F75]">Sessions Management</h1>
      <p className="text-[#141F75] text-sm mb-4">View, organize and manage all scheduled sessions efficiently</p>
      <hr className=" text-gray-400"></hr>
      <br></br>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">

        <select name="academicYear" onChange={(e) =>
          setFilterTimeTable({ ...filterTimeTable, academicYear: e.target.value })
        } className="w-full p-2 border-gray-300 border rounded hover:cursor-pointer" >
          <option value="" disabled>Select Academic Year</option>
          {academicYears.map((year) => (
            <option key={year} value={year}>
              {year}
            </option>
          ))}
        </select>

        <select
          onChange={(e) =>
            setFilterTimeTable({ ...filterTimeTable, semester: e.target.value })
          }
          className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400 hover:cursor-pointer"
        >
          <option value="">Select Semester</option>
          <option value="s1">S1</option>
          <option value="s2">S2</option>
        </select>

        <select
          onChange={(e) =>
            setFilterTimeTable({ ...filterTimeTable, academicLevel: e.target.value })
          }
          className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400 hover:cursor-pointer"
        >
          <option value="">Select Academic Level</option>
          <option value="1">1CP</option>
          <option value="2">2CP</option>
          <option value="3">1CS</option>
          <option value="4">2CS</option>
          <option value="5">3CS</option>
        </select>
        <button onClick={() => { setIsOpenAddSession(true); getTeachers() }} className="w-full hover:cursor-pointer p-2 text-amber-50 bg-[#141F75] border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400">Add session</button>
      </div>

      <div className="bg-gray-100 p-4 rounded-md shadow-inner">
        <Shedule sessions={sessions} />
      </div>
      {isOpenAddSession && <Modal isOpen={isOpenAddSession} onClose={() => setIsOpenAddSession(false)}> <AddSession onClose={() => setIsOpenAddSession(false)} timetable={filterTimeTable}/> </Modal>}
    </div>
  );
}
