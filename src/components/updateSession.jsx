import useStore from "@/store/useStore";
import { useState } from "react";

export default function UpdateSession({ session, onClose }) {
  const withCamelcase = {
    academicLevel: session.academic_level,
    academicYear: session.academic_year,
    adminId: session.admin_id,
    classroom: session.classroom,
    createdAt: session.created_at,
    dayOfWeek: session.day_of_week,
    endTime: session.end_time,
    groupNumber: session.group_number,
    module: session.module,
    semester: session.semester,
    sessionId: session.session_id,
    startTime: session.start_time,
    teacherId: session.teacher_id,
    type: session.type
  };

  const [updatedSession, setUpdatedSession] = useState(withCamelcase);
  const [isModified, setIsModified] = useState(false);
  const [errors, setErrors] = useState({});
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [action, setAction] = useState("0");
  const originalTeacherId = session.teacher_id;

  const { teachers, updateSession, deleteSession } = useStore();
  const currentYear = new Date().getFullYear();
  const academicYears = Array.from({ length: 10 }, (_, i) => `${currentYear - i}/${currentYear - i + 1}`);

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
      "academicYear",
      "academicLevel",
      "semester",
      "teacherId"
    ];

    fields.forEach((field) => {
      if (!updatedSession[field]) {
        newErrors[field] = "This field is required.";
      }
    });

    const { startTime, endTime } = updatedSession;

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

  const handleChange = (e) => {
    setUpdatedSession({ ...updatedSession, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: "" });
    setIsModified(true);
  };

  const handleUpdate = (e) => {
    e.preventDefault();
    if (!validate()) return;

    if (updatedSession.teacherId !== originalTeacherId) {
      setShowConfirmation(true);
      return;
    }

    updateSession({ ...updatedSession, action: "0" });
    setIsModified(false);
    onClose();
  };

  const handleConfirmUpdate = (selectedAction) => {
    setAction(selectedAction);
    updateSession({ ...updatedSession, action: selectedAction });
    setShowConfirmation(false);
    setIsModified(false);
    onClose();
  };

  const handleDelete = () => {
    deleteSession(updatedSession.sessionId);
    setIsModified(false);
    onClose();
  };

  return (
    <div className="w-full mx-auto bg-white p-6 shadow-md rounded-lg">
      <h2 className="text-xl font-semibold text-blue-900 mb-4">Update Session</h2>

      {showConfirmation && (
        <div className="fixed inset-0 bg-white flex items-center justify-center z-50">
          <div className="bg-inherit p-4 sm:p-6 rounded-lg shadow-lg max-w-md w-full mx-4 sm:mx-auto">
  <h3 className="text-lg font-semibold mb-4 text-center sm:text-left">Confirm Teacher Change</h3>
  <p className="mb-6 text-sm sm:text-base text-center sm:text-left">You have changed the teacher for this session. Please choose how to handle its absences:</p>
  
  <div className="flex flex-col sm:flex-row sm:justify-between gap-3">
    <button
      onClick={() => handleConfirmUpdate("1")}
      className="px-4 py-2 cursor-pointer bg-[#141F75] text-white rounded hover:bg-green-600 text-sm sm:text-base"
    >
      Delete absences
    </button>
    <button
      onClick={() => handleConfirmUpdate("2")}
      className="px-4 py-2 cursor-pointer bg-[#141F75] text-white rounded hover:bg-blue-600 text-sm sm:text-base"
    >
      Assign to new teacher
    </button>
    <button
      onClick={() => setShowConfirmation(false)}
      className="px-4 py-2 cursor-pointer bg-gray-500 text-white rounded hover:bg-gray-600 text-sm sm:text-base"
    >
      Cancel
    </button>
  </div>
</div>
        </div>
      )}

      <form className="grid grid-cols-1 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-blue-900">Day of the Week</label>
          <select
            name="dayOfWeek"
            value={updatedSession.dayOfWeek}
            onChange={handleChange}
            className={`w-full p-2 border rounded ${errors.dayOfWeek ? "border-red-500" : "border-gray-300"} hover:cursor-pointer`}
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
            value={updatedSession.startTime}
            onChange={handleChange}
            className={`w-full p-2 border rounded ${errors.startTime ? "border-red-500" : "border-gray-300"} hover:cursor-text`}
            step="1800"
          />
          {errors.startTime && <p className="text-red-600 text-sm mt-1">{errors.startTime}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-blue-900">End Time</label>
          <input
            type="time"
            name="endTime"
            value={updatedSession.endTime}
            onChange={handleChange}
            className={`w-full p-2 border rounded ${errors.endTime ? "border-red-500" : "border-gray-300"} hover:cursor-text`}
            step="1800"
          />
          {errors.endTime && <p className="text-red-600 text-sm mt-1">{errors.endTime}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-blue-900">Teacher</label>
          <select
            name="teacherId"
            value={updatedSession.teacherId}
            onChange={handleChange}
            className={`w-full p-2 border rounded ${errors.teacherId ? "border-red-500" : "border-gray-300"} hover:cursor-pointer`}
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
            value={updatedSession.type}
            onChange={handleChange}
            className={`w-full p-2 border rounded ${errors.type ? "border-red-500" : "border-gray-300"} hover:cursor-pointer`}
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
            value={updatedSession.module}
            onChange={handleChange}
            className={`w-full p-2 border rounded ${errors.module ? "border-red-500" : "border-gray-300"}`}
          />
          {errors.module && <p className="text-red-600 text-sm mt-1">{errors.module}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-blue-900">Classroom</label>
          <select
            name="classroom"
            value={updatedSession.classroom}
            onChange={handleChange}
            className={`w-full p-2 border rounded ${errors.classroom ? "border-red-500" : "border-gray-300"} hover:cursor-pointer`}
          >
            <option value="">Select classroom</option>
            {["salle A1", "salle A2","salle A3" ,  "Amphi C","Amphi D", "Amphi E" , "salle TP1","salle TP2",""].map((sl) => (
              <option key={sl} value={sl}>{sl}</option>
            ))}
          </select>
          {errors.classroom && <p className="text-red-600 text-sm mt-1">{errors.classroom}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-blue-900">Group Number</label>
          <select
            name="groupNumber"
            value={updatedSession.groupNumber}
            onChange={handleChange}
            className={`w-full p-2 border rounded ${errors.groupNumber ? "border-red-500" : "border-gray-300"} hover:cursor-pointer`}
          >
            <option value="">Select group number</option>
            {["G1", "G2", "G3", "G4", "G5", "G6", "G7", "G8", "G9", "G10", "G11", "G12", "G13", "G14", "G15"].map((g) => (
              <option key={g} value={g}>{g}</option>
            ))}
          </select>
          {errors.groupNumber && <p className="text-red-600 text-sm mt-1">{errors.groupNumber}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-blue-900">Academic Year</label>
          <select
            name="academicYear"
            value={updatedSession.academicYear}
            onChange={handleChange}
            className={`w-full p-2 border rounded ${errors.academicYear ? "border-red-500" : "border-gray-300"} hover:cursor-pointer`}
          >
            <option value="" disabled>Select academic year</option>
            {academicYears.map((year) => (
              <option key={year} value={year}>{year}</option>
            ))}
          </select>
          {errors.academicYear && <p className="text-red-600 text-sm mt-1">{errors.academicYear}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-blue-900">Academic Level</label>
          <select
            name="academicLevel"
            value={updatedSession.academicLevel}
            onChange={handleChange}
            className={`w-full p-2 border rounded ${errors.academicLevel ? "border-red-500" : "border-gray-300"} hover:cursor-pointer`}
          >
            <option value="">Select academic level</option>
            {["1CP", "2CP", "1CS", "2CS", "3CS"].map((d) => (
              <option key={d} value={d}>{d}</option>
            ))}
          </select>
          {errors.academicLevel && <p className="text-red-600 text-sm mt-1">{errors.academicLevel}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-blue-900">Semester</label>
          <select
            name="semester"
            value={updatedSession.semester}
            onChange={handleChange}
            className={`w-full p-2 border rounded ${errors.semester ? "border-red-500" : "border-gray-300"} hover:cursor-pointer`}
          >
            <option value="">Select semester</option>
            {["S1", "S2"].map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
          {errors.semester && <p className="text-red-600 text-sm mt-1">{errors.semester}</p>}
        </div>

        <div className="col-span-1 md:col-span-3 flex justify-between mt-4">
          <button
            type="submit"
            onClick={handleUpdate}
            disabled={!isModified}
            className={`px-6 py-2 rounded text-white transition 
              ${isModified ? "bg-blue-500 hover:bg-blue-600 cursor-pointer" : "bg-gray-400 cursor-not-allowed"}`}
          >
            Update
          </button>

          <button
            type="button"
            onClick={handleDelete}
            className="bg-red-500 hover:bg-red-600 cursor-pointer text-white px-6 py-2 rounded transition"
          >
            Delete
          </button>
        </div>
      </form>
    </div>
  );
}