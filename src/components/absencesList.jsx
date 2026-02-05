"use client";
import useStore from "@/store/useStore";
import { useRef, useState, useEffect } from "react";

export default function AbsenceList() {
  const { 
    absences, 
    selectedTeacher, 
    getTeacherTimeTable, 
    teacherTimeTable, 
    markAbsence, 
    updateAbsence, 
    selectAbsence, 
    catchUpAbsence, 
    deleteAbsence 
  } = useStore();
  
  const [updateForm, setUpdateForm] = useState(false);
  const [filteredSessions, setFilteredSessions] = useState(teacherTimeTable);
  const [selectedAbsence, setSelectedAbsence] = useState(null);
  const [academicYear, setAcademicYear] = useState("");
  const [semester, setSemester] = useState("S1");

  const date = useRef("");
  const selectedSession = useRef("");
  const notes = useRef("");
  const reason = useRef("");
  const newDate = useRef("");
  const newSelectedSession = useRef("");
  const newNotes = useRef("");
  const newReason = useRef("");

  // Generate academic years (current year and previous 9 years)
  const generateAcademicYears = () => {
    const currentYear = new Date().getFullYear();
    const years = [];
    
    for (let i = 0; i < 10; i++) {
      const startYear = currentYear - i;
      const endYear = startYear + 1;
      years.push(`${startYear}/${endYear}`);
    }
    
    return years;
  };

  const academicYears = generateAcademicYears();

  // Fetch timetable when academic year or semester changes
  useEffect(() => {
    if (selectedTeacher && academicYear && semester) {
      getTeacherTimeTable( academicYear, semester);
    }
  }, [selectedTeacher, academicYear, semester, getTeacherTimeTable]);

  // Update filtered sessions when teacherTimeTable changes
  useEffect(() => {
    setFilteredSessions(teacherTimeTable);
  }, [teacherTimeTable]);

  const filterSessionsByDate = (selectedDate) => {
    if (!selectedDate) {
      setFilteredSessions(teacherTimeTable);
      return;
    }

    const dayOfWeek = new Date(selectedDate).toLocaleString("en-us", { weekday: "long" });
    const filtered = teacherTimeTable.filter((session) => 
      session.day_of_week.toLowerCase() === dayOfWeek.toLowerCase()
    );
    setFilteredSessions(filtered);
  };

  const openUpdateForm = (absence) => {
    setSelectedAbsence(absence);
    setUpdateForm(true);
    selectAbsence(absence.absence_id);
  };

  const handleAdd = (e) => {
    e.preventDefault();
    if (date.current.value && selectedSession.current.value) {
      markAbsence({
        teacherId: selectedTeacher,
        date: date.current.value,
        sessionId: selectedSession.current.value,
        reason: reason.current.value,
        notes: notes.current.value
      });
     
      date.current.value = "";
      selectedSession.current.value = "";
      reason.current.value = "";
      notes.current.value = "";
      setFilteredSessions(teacherTimeTable);
    }
  };

  const handleUpdate = (e) => {
    e.preventDefault();
    if (newDate.current.value && newSelectedSession.current.value) {
      updateAbsence({
        date: newDate.current.value,
        sessionId: newSelectedSession.current.value,
        reason: newReason.current.value,
        notes: newNotes.current.value
      });
    }
    setUpdateForm(false);
    setSelectedAbsence(null);
  };

  return (
    <div className="w-full p-6 bg-gray-50 min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-[#141F75]">Manage Absences</h1>
      </div>

      {/* Academic Year and Semester Selection */}
      <div className="bg-white rounded-xl shadow-md p-6 mb-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Select Academic Period</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Academic Year</label>
            <select
              value={academicYear}
              onChange={(e) => setAcademicYear(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-[#141F75] focus:border-[#141F75]"
              required
            >
              <option value="">Select Academic Year</option>
              {academicYears.map((year) => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Semester</label>
            <select
              value={semester}
              onChange={(e) => setSemester(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-[#141F75] focus:border-[#141F75]"
              required
            >
              <option value="S1">Semester 1</option>
              <option value="S2">Semester 2</option>
            </select>
          </div>
        </div>
      </div>

      {!updateForm && (
        <>
          <div className="bg-white rounded-xl shadow-md overflow-hidden mb-8">
            <div className="p-4 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-800">Absences</h2>
            </div>
            
            {absences?.length === 0 ? (
              <div className="p-6 text-center text-gray-500">
                {absences?.length === 0 ? 'No absences recorded yet' : 'No absences found for selected academic year'}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Reason</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Notes</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {absences?.map((absence) => (
                      <tr key={absence.absence_id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {new Date(absence.date).toLocaleDateString("en-GB")}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            absence.caught_up ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                          }`}>
                            {absence.caught_up ? 'Caught Up' : 'Pending'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {absence.reason || '-'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 max-w-xs truncate">
                          {absence.notes || '-'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex space-x-2">
                            <button
                              onClick={() => catchUpAbsence(absence.absence_id)}
                              className={`px-3 cursor-pointer py-1 rounded-md text-sm ${
                                absence.caught_up 
                                  ? 'bg-gray-200 text-gray-700 hover:bg-gray-300' 
                                  : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                              }`}
                            >
                              {absence.caught_up ? 'Undo' : 'Mark as Caught Up'}
                            </button>
                            <button
                              onClick={() => openUpdateForm(absence)}
                              className="px-3 py-1 cursor-pointer bg-indigo-100 text-indigo-700 rounded-md text-sm hover:bg-indigo-200"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => deleteAbsence(absence.absence_id)}
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

          {teacherTimeTable.length !== 0 && (
            <div className="bg-white rounded-xl shadow-md p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Record New Absence</h2>
              <form onSubmit={handleAdd} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                    <input
                      ref={date}
                      type="date"
                      className="w-full p-2 border border-gray-300 rounded-md focus:ring-[#141F75] focus:border-[#141F75]"
                      onChange={(e) => filterSessionsByDate(e.target.value)}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Session</label>
                    <select
                      ref={selectedSession}
                      className="w-full p-2 border border-gray-300 rounded-md focus:ring-[#141F75] focus:border-[#141F75]"
                      required
                    >
                      <option value="">Select a session</option>
                      {filteredSessions.map((session) => (
                        <option key={session.session_id} value={session.session_id}>
                          {session.day_of_week} - {session.start_time} to {session.end_time}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Reason</label>
                    <input
                      type="text"
                      ref={reason}
                      className="w-full p-2 border border-gray-300 rounded-md focus:ring-[#141F75] focus:border-[#141F75]"
                      placeholder="Enter reason for absence"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                    <input
                      type="text"
                      ref={notes}
                      className="w-full p-2 border border-gray-300 rounded-md focus:ring-[#141F75] focus:border-[#141F75]"
                      placeholder="Additional notes"
                    />
                  </div>
                </div>
                <div className="flex justify-end">
                  <button
                    type="submit"
                    className="px-4 py-2 cursor-pointer bg-[#141F75] text-white rounded-md hover:bg-[#0e1757] transition-colors"
                  >
                    Add Absence
                  </button>
                </div>
              </form>
            </div>
          )}

          {teacherTimeTable.length === 0 && academicYear && (
            <div className="p-4 bg-yellow-50 border-l-4 border-yellow-400 text-yellow-700">
              <p className="font-medium">No Timetable Available</p>
              <p>This teacher has no timetable entries for the selected academic period.</p>
            </div>
          )}
        </>
      )}

      {updateForm && selectedAbsence && (
        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="flex items-center mb-4">
            <button
              className="flex cursor-pointer items-center text-[#141F75] hover:text-[#0e1757] mr-4"
              onClick={() => {
                setUpdateForm(false);
                setSelectedAbsence(null);
              }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
              </svg>
              Back
            </button>
            <h2 className="text-xl font-semibold text-gray-800">Update Absence</h2>
          </div>

          <form onSubmit={handleUpdate} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                <input
                  ref={newDate}
                  type="date"
                  defaultValue={new Date(selectedAbsence.date).toISOString().split('T')[0]}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-[#141F75] focus:border-[#141F75]"
                  required
                  onChange={(e) => {
                    if (e.target.value) {
                      const dayOfWeek = new Date(e.target.value).toLocaleString("en-us", { weekday: "long" });
                      const filtered = teacherTimeTable.filter((session) => 
                        session.day_of_week.toLowerCase() === dayOfWeek.toLowerCase()
                      );
                      setFilteredSessions(filtered);
                    } else {
                      setFilteredSessions(teacherTimeTable);
                    }
                  }}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Session</label>
                <select
                  ref={newSelectedSession}
                  defaultValue={selectedAbsence.session_id}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-[#141F75] focus:border-[#141F75]"
                  required
                >
                  <option value="">Select a session</option>
                  {filteredSessions.map((session) => (
                    <option key={session.session_id} value={session.session_id}>
                      {session.day_of_week} - {session.start_time} to {session.end_time}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Reason</label>
                <input
                  type="text"
                  ref={newReason}
                  defaultValue={selectedAbsence.reason}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-[#141F75] focus:border-[#141F75]"
                  placeholder="Enter reason for absence"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                <input
                  type="text"
                  ref={newNotes}
                  defaultValue={selectedAbsence.notes}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-[#141F75] focus:border-[#141F75]"
                  placeholder="Additional notes"
                />
              </div>
            </div>
            <div className="flex justify-end">
              <button
                type="submit"
                className="px-4 py-2 cursor-pointer bg-[#141F75] text-white rounded-md hover:bg-[#0e1757] transition-colors"
              >
                Update Absence
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}