import React, { useState } from "react";
import Modal from "./Modal";
import UpdateSession from "./updateSession";
import useStore from "@/store/useStore";

const daysOfWeek = ["Sunday", "Monday", "Tuesday", "Wednesday",  "Thursday" , "Saturday"];
const startTimes = Array.from({ length: 20 }, (_, i) => {
  const h = Math.floor(i / 2) + 8;
  const m = i % 2 === 0 ? "00" : "30";
  return `${h.toString().padStart(2, "0")}:${m}`;
});

const Timetable = ({ sessions }) => {
  const [hoveredSession, setHoveredSession] = useState(null);
  const [selectedSession, setSelectedSession] = useState(null);
  const [isOpenUpdateSession, setIsOpenUpdateSession] = useState(false);
  const { selectSession, getTeachers } = useStore();

  const sessionColors = {
    "CM": "bg-indigo-600 hover:bg-indigo-700",
    "TD": "bg-emerald-600 hover:bg-emerald-700",
    "TP": "bg-amber-600 hover:bg-amber-700",
    "default": "bg-blue-600 hover:bg-blue-700"
  };

  const getSessionColor = (type) => {
    return sessionColors[type] || sessionColors.default;
  };

  return (
    <div className="overflow-x-auto p-4 bg-gray-50 rounded-xl">
      <table className="min-w-full border-collapse">
        <thead>
          <tr className="bg-[#141F75] text-white text-sm">
            <th className="p-3 text-left sticky left-0 z-10 bg-[#141F75]">Hour</th>
            {daysOfWeek.map((day) => (
              <th key={day} className="p-3 text-center min-w-[150px]">
                {day}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {startTimes.map((time) => (
            <tr key={time} className="border-b border-gray-200 hover:bg-gray-50">
              <td className="p-2 font-medium text-gray-700 sticky left-0 z-10 bg-white border-r">
                {time}
              </td>
              {daysOfWeek.map((day) => {
                const matchingSessions = sessions?.filter(
                  (s) => s.day_of_week === day && s.start_time.slice(0, 5) === time
                );

                return (
                  <td key={day + time} className="p-1 align-top h-16">
                    {matchingSessions?.length > 0 ? (
                      <div className="space-y-1">
                        {matchingSessions.map((session) => (
                          <div
                            key={session.session_id}
                            onMouseEnter={() => setHoveredSession(session)}
                            onMouseLeave={() => setHoveredSession(null)}
                            className={`${getSessionColor(session.type)} text-white p-2 rounded-lg text-sm transition-all duration-200 shadow-sm ${
                              hoveredSession === session ? "scale-[1.02] shadow-md z-20 relative" : ""
                            }`}
                          >
                            <div
                              onClick={() => {
                                setIsOpenUpdateSession(true);
                                setSelectedSession(session);
                                selectSession(session.session_id);
                                getTeachers();
                              }}
                              className="cursor-pointer space-y-1"
                            >
                              <div className="font-semibold truncate">
                                {session.module} ({session.type})
                              </div>
                              {hoveredSession === session && (
                                <div className="text-xs space-y-1">
                                  <div className="flex items-center">
                                    <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                    </svg>
                                    {session.classroom}
                                  </div>
                                  <div className="flex items-center">
                                    <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                    </svg>
                                    Group {session.group_number}
                                  </div>
                                  <div className="flex items-center">
                                    <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    End: {session.end_time.slice(0, 5)}
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="h-full bg-gray-50 rounded"></div>
                    )}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>

      {isOpenUpdateSession && (
        <Modal isOpen={isOpenUpdateSession} onClose={() => setIsOpenUpdateSession(false)}>
          <UpdateSession session={selectedSession} onClose={() => setIsOpenUpdateSession(false)} />
        </Modal>
      )}
    </div>
  );
};

export default Timetable;