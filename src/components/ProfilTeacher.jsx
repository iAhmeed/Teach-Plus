"use client";

import { useState, useEffect } from "react";
import useStore from "@/store/useStore";
import { motion, AnimatePresence } from "framer-motion";

export default function ProfileTeacher({ teacher, onClose }) {
  const [isChanged, setIsChanged] = useState(false);
  const [errors, setErrors] = useState({});
  const { updateTeacher, uploidImage, timeTableOfTeacher } = useStore();
  const [timetable, setTimetable] = useState([]);
  const [period, setPeriod] = useState({
    semester: "S1",
    academicYear: `${new Date().getFullYear() - 1}/${new Date().getFullYear()}`
  });
  const [isLoadingTimetable, setIsLoadingTimetable] = useState(false);

  const initialTeacher = {
    teacherId: teacher.teacher_id,
    email: teacher.email,
    phoneNumber: teacher.phone_number,
    dateOfBirth: teacher.date_of_birth,
    familyName: teacher.family_name,
    firstName: teacher.first_name,
    hoursOutside: teacher.hours_outside || "0",
    isActive: teacher.is_active,
    bio: teacher.bio,
    picture: teacher.picture,
    type: teacher.type || "Permanent",
    accountNumber: teacher.account_number || ""
  };

  const [updatedTeacher, setUpdatedTeacher] = useState(initialTeacher);

  useEffect(() => {
    const fetchTimetable = async () => {
      setIsLoadingTimetable(true);
      try {
        const result = await timeTableOfTeacher(teacher.teacher_id, period);
        setTimetable(result || []);
      } catch (error) {
        console.error("Error fetching timetable:", error);
        setTimetable([]);
      } finally {
        setIsLoadingTimetable(false);
      }
    };

    fetchTimetable();
  }, [period, teacher.teacher_id, timeTableOfTeacher]);

  const validateInputs = () => {
    const newErrors = {};
    const pascalCaseRegex = /^[A-Z][a-z]+(?: [A-Z][a-z]+)*$/;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const phoneRegex = /^\d{10}$/;
    const age = new Date().getFullYear() - new Date(updatedTeacher.dateOfBirth).getFullYear();

    if (!pascalCaseRegex.test(updatedTeacher.firstName)) {
      newErrors.firstName = "First name must be in PascalCase (e.g., John)";
    }

    if (!pascalCaseRegex.test(updatedTeacher.familyName)) {
      newErrors.familyName = "Family name must be in PascalCase (e.g., Smith)";
    }

    if (age < 23 || age > 80) {
      newErrors.dateOfBirth = "Teacher age must be between 23 and 80 years";
    }

    if (!phoneRegex.test(updatedTeacher.phoneNumber)) {
      newErrors.phoneNumber = "Phone number must be exactly 10 digits";
    }

    if (!emailRegex.test(updatedTeacher.email)) {
      newErrors.email = "Invalid email format";
    }

    if (
      !/^\d+$/.test(updatedTeacher.hoursOutside) ||
      Number(updatedTeacher.hoursOutside) < 0 ||
      Number(updatedTeacher.hoursOutside) > 21
    ) {
      newErrors.hoursOutside = "Hours Outside must be between 0 and 21";
    }


    if (updatedTeacher.bio.length > 100) {
      newErrors.bio = "Bio must be under 100 characters";
    }

    if (!updatedTeacher.accountNumber.trim()) {
      newErrors.accountNumber = "Account number is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setIsChanged(true);
    setUpdatedTeacher((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handlePeriodChange = (e) => {
    const { name, value } = e.target;
    setPeriod(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      try {
        const imageUrl = await uploidImage(file);
        setUpdatedTeacher((prev) => ({ ...prev, picture: imageUrl }));
        setIsChanged(true);
      } catch (error) {
        console.error("Image upload failed:", error);
      }
    }
  };

  const handleUpdate = () => {
    if (!isChanged) return;
    if (!validateInputs()) return;

    updateTeacher(updatedTeacher);
    setIsChanged(false);
    onClose();
  };

  const currentYear = new Date().getFullYear();
  const academicYearOptions = Array.from({ length: 10 }, (_, i) =>
    `${currentYear - i - 1}/${currentYear - i}`
  ).reverse();

  const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  return (
    <motion.div
      className="w-full"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <motion.h1
        className="text-left p-3 text-[#141F75] text-3xl"
        initial={{ x: -20 }}
        animate={{ x: 0 }}
      >
        Update Teacher Profile
      </motion.h1>

      <motion.div
        className="w-full mx-auto p-6 bg-white shadow-md rounded-lg flex flex-col"
        initial={{ y: 20 }}
        animate={{ y: 0 }}
      >
        <motion.div
          className="flex justify-center mb-6"
          whileHover={{ scale: 1.02 }}
        >
          <img
            src={updatedTeacher.picture || "/default-avatar.png"}
            alt="Teacher"
            className="w-32 h-32 object-cover rounded-full border-4 border-gray-200"
          />
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            {
              label: "First Name",
              name: "firstName",
              type: "text",
              value: updatedTeacher.firstName,
              error: errors.firstName,
            },
            {
              label: "Family Name",
              name: "familyName",
              type: "text",
              value: updatedTeacher.familyName,
              error: errors.familyName,
            },
            {
              label: "Date of Birth",
              name: "dateOfBirth",
              type: "date",
              value: new Date(updatedTeacher.dateOfBirth).toISOString().split("T")[0] || "0000-00-00",
              error: errors.dateOfBirth,
            },
            {
              label: "Phone Number",
              name: "phoneNumber",
              type: "tel",
              value: updatedTeacher.phoneNumber,
              error: errors.phoneNumber,
            },
            {
              label: "Profile Photo",
              name: "picture",
              type: "file",
              onChange: handleFileChange,
            },
            {
              label: "Hours Outside",
              name: "hoursOutside",
              type: "number",
              value: updatedTeacher.hoursOutside,
              error: errors.hoursOutside,
            },
            {
              label: "Status",
              name: "isActive",
              type: "select",
              value: updatedTeacher.isActive,
              options: [
                { label: "Not Active", value: 0 },
                { label: "Active", value: 1 },
              ],
            },
            {
              label: "Type",
              name: "type",
              type: "select",
              value: updatedTeacher.type,
              options: [
                { label: "Permanent", value: "Permanent" },
                { label: "Temporary", value: "Temporary" },
              ],
            },
            {
              label: "Account Number",
              name: "accountNumber",
              type: "text",
              value: updatedTeacher.accountNumber,
              error: errors.accountNumber,
            },
            {
              label: "Email",
              name: "email",
              type: "email",
              value: updatedTeacher.email,
              error: errors.email,
            },
            {
              label: "Biography",
              name: "bio",
              type: "textarea",
              value: updatedTeacher.bio,
              error: errors.bio,
              className: "md:col-span-2 lg:col-span-3"
            },
          ].map((field, idx) => (
            <motion.div
              key={idx}
              className={`space-y-2 ${field.className || ""}`}
              whileHover={{ y: -2 }}
            >
              <motion.label
                className="block text-left text-[#141F75] font-medium"
                whileHover={{ x: 3 }}
              >
                {field.label}
              </motion.label>

              {field.type === "select" ? (
                <motion.select
                  name={field.name}
                  value={field.value}
                  onChange={handleChange}
                  className="w-full p-2 border rounded-md border-gray-200 hover:cursor-pointer"
                  whileFocus={{ scale: 1.01 }}
                >
                  {field.options.map((opt, i) => (
                    <option key={i} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </motion.select>
              ) : field.type === "textarea" ? (
                <motion.textarea
                  name={field.name}
                  value={field.value}
                  onChange={handleChange}
                  className="w-full p-2 border rounded-md border-gray-200 min-h-[100px]"
                  whileFocus={{ scale: 1.01 }}
                />
              ) : field.type === "file" ? (
                <motion.div
                  whileHover={{ scale: 1.01 }}
                >
                  <input
                    type="file"
                    name={field.name}
                    onChange={field.onChange}
                    className="w-full p-2 border rounded-md border-gray-200 hover:cursor-pointer"
                  />
                </motion.div>
              ) : (
                <motion.input
                  type={field.type}
                  name={field.name}
                  value={field.value}
                  onChange={handleChange}
                  className="w-full p-2 border rounded-md border-gray-200"
                  whileFocus={{ scale: 1.01 }}
                />
              )}

              <AnimatePresence>
                {field.error && (
                  <motion.p
                    className="text-red-500 text-sm"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                  >
                    {field.error}
                  </motion.p>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>

        <motion.div
          className="mt-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <motion.h2
            className="text-xl font-semibold text-[#141F75] mb-4"
            whileHover={{ x: 5 }}
          >
            Teacher Timetable
          </motion.h2>

          <div className="flex gap-4 mb-6">
            <motion.div className="flex-1 space-y-2">
              <label className="block text-left text-[#141F75] font-medium">Semester</label>
              <motion.select
                name="semester"
                value={period.semester}
                onChange={handlePeriodChange}
                className="w-full p-2 border rounded-md border-gray-200 hover:cursor-pointer"
                whileFocus={{ scale: 1.01 }}
              >
                <option value="S1">Semester 1 (S1)</option>
                <option value="S2">Semester 2 (S2)</option>
              </motion.select>
            </motion.div>

            <motion.div className="flex-1 space-y-2">
              <label className="block text-left text-[#141F75] font-medium">Academic Year</label>
              <motion.select
                name="academicYear"
                value={period.academicYear}
                onChange={handlePeriodChange}
                className="w-full p-2 border rounded-md border-gray-200 hover:cursor-pointer"
                whileFocus={{ scale: 1.01 }}
              >
                {academicYearOptions.map(year => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </motion.select>
            </motion.div>
          </div>

          {isLoadingTimetable ? (
            <motion.div
              className="flex justify-center items-center h-32"
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
            >
              <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full"></div>
            </motion.div>
          ) : timetable.length > 0 ? (
            <motion.div
              className="overflow-x-auto"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
            >
              <table className="min-w-full bg-white border border-gray-200">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="py-2 px-4 border-b">Day</th>
                    <th className="py-2 px-4 border-b">Start Time</th>
                    <th className="py-2 px-4 border-b">End Time</th>
                    <th className="py-2 px-4 border-b">Type</th>
                    <th className="py-2 px-4 border-b">Module</th>
                    <th className="py-2 px-4 border-b">Level</th>
                    <th className="py-2 px-4 border-b">Classroom</th>
                  </tr>
                </thead>
                <tbody>
                  {timetable
                    .sort((a, b) => daysOfWeek.indexOf(a.day_of_week) - daysOfWeek.indexOf(b.day_of_week))
                    .map((session, index) => (
                      <motion.tr
                        key={index}
                        className="hover:bg-gray-50"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: index * 0.05 }}
                      >
                        <td className="py-2 px-4 border-b text-center">{session.day_of_week}</td>
                        <td className="py-2 px-4 border-b text-center">{session.start_time}</td>
                        <td className="py-2 px-4 border-b text-center">{session.end_time}</td>
                        <td className="py-2 px-4 border-b text-center">{session.type}</td>
                        <td className="py-2 px-4 border-b text-center">{session.module}</td>
                        <td className="py-2 px-4 border-b text-center">{session.academic_level}</td>
                        <td className="py-2 px-4 border-b text-center">{session.classroom}</td>
                      </motion.tr>
                    ))}
                </tbody>
              </table>
            </motion.div>
          ) : (
            <motion.div
              className="text-center py-8 text-gray-500"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              No timetable available for the selected period.
            </motion.div>
          )}
        </motion.div>

        <motion.div className="flex gap-4 mt-8">
          <motion.button
            onClick={onClose}
            className="flex-1 p-3 cursor-pointer bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            Cancel
          </motion.button>

          <motion.button
            onClick={handleUpdate}
            disabled={!isChanged}
            className={`flex-1 p-3 text-white rounded-lg ${isChanged
                ? "bg-blue-600  hover:bg-blue-700 cursor-pointer"
                : "bg-gray-400  cursor-not-allowed"
              }`}
            whileHover={isChanged ? { scale: 1.02 } : {}}
            whileTap={isChanged ? { scale: 0.98 } : {}}
          >
            Update Profile
          </motion.button>
        </motion.div>
      </motion.div>
    </motion.div>
  );
}