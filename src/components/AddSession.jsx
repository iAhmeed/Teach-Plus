import { useState } from "react";
import useStore from "@/store/useStore";

export default function AddSession({ onClose ,timetable }) {
  const [sessionData, setSessionData] = useState({
    dayOfWeek: "",
    startTime: "",
    endTime: "",
    type: "",
    classroom: "",
    module: "",
    groupNumber: "",
    academicYear: timetable.academicYear,
    academicLevel: timetable.academicLevel,
    semester: timetable.semester,
    teacherId: ""
  });

  const [errors, setErrors] = useState({});
  const { addSession, teachers } = useStore();

  const handleChange = (e) => {
    setSessionData({ ...sessionData, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: "" });
  };

  const isHalfHour = (time) => {
    const [hours, minutes] = time.split(":").map(Number);
    return minutes === 0 || minutes === 30;
  };

  const validate = () => {
    const newErrors = {};
    const fields = [
      "dayOfWeek",
      "startTime",
      "endTime",
      "type",
      "classroom",
      "module",
      "groupNumber",
      "teacherId"
    ];

    fields.forEach((field) => {
      if (!sessionData[field]) {
        newErrors[field] = "This field is required.";
      }
    });

    const { startTime, endTime } = sessionData;

    if (startTime) {
      if (startTime < "08:00" || startTime > "17:00") {
        newErrors.startTime = "Start time must be between 08:00 and 17:00.";
      } else if (!isHalfHour(startTime)) {
        newErrors.startTime = "Start time must be in half-hour format (e.g., 08:00 or 08:30).";
      }
    }

    if (endTime) {
      if (endTime < "08:30" || endTime > "17:30") {
        newErrors.endTime = "End time must be between 08:30 and 17:30.";
      } else if (!isHalfHour(endTime)) {
        newErrors.endTime = "End time must be in half-hour format (e.g., 08:30 or 09:00).";
      }
    }

    if (startTime && endTime && startTime >= endTime) {
      newErrors.endTime = newErrors.endTime || "";
      newErrors.endTime += " End time must be after start time.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    console.log(sessionData);
    
    e.preventDefault();
    if (!validate()) return;

    addSession(sessionData);
    onClose();
  };

  return (
    <div className="w-full mx-auto bg-white p-6 shadow-md rounded-lg">
      <h2 className="text-xl font-semibold text-blue-900 mb-4">Add a Session</h2>
      <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">

        <div>
          <label className="block text-sm font-medium text-blue-900">Day of the Week</label>
          <select
            name="dayOfWeek"
            value={sessionData.dayOfWeek}
            onChange={handleChange}
            className={`w-full p-2 border rounded ${errors.dayOfWeek ? "border-red-500" : "border-gray-400"} hover:cursor-pointer`}
          >
            <option value="">Select a day</option>
            {["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Saturday"].map((d) => (
              <option key={d} value={d}>{d}</option>
            ))}
          </select>
          {errors.dayOfWeek && <p className="text-red-600 text-sm mt-1">{errors.dayOfWeek}</p>}
        </div>


        <div>
          <label className="block text-sm font-medium text-blue-900">Start Time</label>
          <input
            type="time"
            name="startTime"
            value={sessionData.startTime}
            onChange={handleChange}
            className={`w-full p-2 border rounded ${errors.startTime ? "border-red-500" : "border-gray-400"} hover:cursor-text`}
            step="1800"
          />
          {errors.startTime && <p className="text-red-600 text-sm mt-1">{errors.startTime}</p>}
        </div>


        <div>
          <label className="block text-sm font-medium text-blue-900">End Time</label>
          <input
            type="time"
            name="endTime"
            value={sessionData.endTime}
            onChange={handleChange}
            className={`w-full p-2 border rounded ${errors.endTime ? "border-red-500" : "border-gray-400"} hover:cursor-text`}
            step="1800"
          />
          {errors.endTime && <p className="text-red-600 text-sm mt-1">{errors.endTime}</p>}
        </div>


        <div>
          <label className="block text-sm font-medium text-blue-900">Teacher</label>
          <select
            name="teacherId"
            value={sessionData.teacherId}
            onChange={handleChange}
            className={`w-full p-2 border rounded ${errors.teacherId ? "border-red-500" : "border-gray-400"} hover:cursor-pointer`}
          >
            <option value="">Select a teacher</option>
            {teachers.map((teacher) => (
              <option key={teacher.teacher_id} value={teacher.teacher_id}>
                {teacher.family_name} {teacher.first_name}
              </option>
            ))}
          </select>
          {errors.teacherId && <p className="text-red-600 text-sm mt-1">{errors.teacherId}</p>}
        </div>


        <div>
          <label className="block text-sm font-medium text-blue-900">Type</label>
          <select
            name="type"
            value={sessionData.type}
            onChange={handleChange}
            className={`w-full p-2 border rounded ${errors.type ? "border-red-500" : "border-gray-400"} hover:cursor-pointer`}
          >
            <option value="">Select a type</option>
            <option value="COURS">Cours</option>
            <option value="TD">TD</option>
            <option value="TP">TP</option>
          </select>
          {errors.type && <p className="text-red-600 text-sm mt-1">{errors.type}</p>}
        </div>


        <div>
          <label className="block text-sm font-medium text-blue-900">Module</label>
          <input
            type="text"
            name="module"
            value={sessionData.module}
            onChange={handleChange}
            className={`w-full p-2 border rounded ${errors.module ? "border-red-500" : "border-gray-400"}`}
          />
          {errors.module && <p className="text-red-600 text-sm mt-1">{errors.module}</p>}
        </div>


        <div>
          <label className="block text-sm font-medium text-blue-900">Classroom</label>
          <select
            name="classroom"
            value={sessionData.classroom}
            onChange={handleChange}
            className={`w-full p-2 border rounded ${errors.classroom ? "border-red-500" : "border-gray-400"} hover:cursor-pointer`}
          >
            <option value="">Select classroom</option>
            {["salle A1", "salle A2", "Amphi C", "salle TP1"].map((sl) => (
              <option key={sl} value={sl}>{sl}</option>
            ))}
          </select>
          {errors.classroom && <p className="text-red-600 text-sm mt-1">{errors.classroom}</p>}
        </div>


        <div>
          <label className="block text-sm font-medium text-blue-900">Group Number</label>
          <select
            name="groupNumber"
            value={sessionData.groupNumber}
            onChange={handleChange}
            className={`w-full p-2 border rounded ${errors.groupNumber ? "border-red-500" : "border-gray-400"} hover:cursor-pointer`}
          >
            <option value="">Select group number</option>
            {["G1", "G2", "G3", "G4", "G5", "G6", "G7", "G8", "G9", "G10", "G11", "G12", "G13", "G14", "G15"].map((g) => (
              <option key={g} value={g}>{g}</option>
            ))}
          </select>
          {errors.groupNumber && <p className="text-red-600 text-sm mt-1">{errors.groupNumber}</p>}
        </div>


        


        





        <div className="col-span-1 md:col-span-3 flex justify-center mt-4">
          <button
            type="submit"
            className="bg-[#141F75] text-white px-6 py-2 rounded hover:bg-blue-600 cursor-pointer transition"
          >
            Confirm
          </button>
        </div>
      </form>
    </div>
  );
}