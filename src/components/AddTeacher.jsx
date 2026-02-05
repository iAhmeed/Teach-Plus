"use client";

import { useState } from "react";
import useStore from "@/store/useStore";
import { motion } from "framer-motion";

export default function AddTeacher({ onClose }) {
  const { addTeacher, uploidImage, isLoading } = useStore();

  const [form, setForm] = useState({
    firstName: "",
    familyName: "",
    phoneNumber: "",
    email: "",
    dateOfBirth: "",
    isActive: "0",
    hoursOutside: "0",
    bio: "",
    type: "Permanent",
    accountNumber: ""
  });

  const [errors, setErrors] = useState({});
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const validateInputs = () => {
    const newErrors = {};
    const nameRegex = /^[A-Z][a-z]*$/;

    if (!nameRegex.test(form.firstName)) {
      newErrors.firstName = "First name must be PascalCase. Ex: Mustapha";
    }

    if (!nameRegex.test(form.familyName)) {
      newErrors.familyName = "Family name must be PascalCase. Ex: Rahal";
    }

    const birthDate = new Date(form.dateOfBirth);
    const today = new Date();
    const age = today.getFullYear() - birthDate.getFullYear();

    if (age < 23 || age > 80 || !form.dateOfBirth) {
      newErrors.dateOfBirth = "Age required and must be between 23 and 80 years.";
    }

    const phoneRegex = /^\d{10}$/;
    if (!phoneRegex.test(form.phoneNumber)) {
      newErrors.phoneNumber = "Phone number must be exactly 10 digits.";
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(form.email)) {
      newErrors.email = "Email is not valid.";
    }

    if (!/^\d+$/.test(form.hoursOutside) || parseInt(form.hoursOutside) < 0 || parseInt(form.hoursOutside) > 21) {
      newErrors.hoursOutside = "Hours Outside must be a number between 0 and 21.";
    }

    if (form.bio.length > 100) {
      newErrors.bio = "Bio must be under 100 characters.";
    }

    if (!form.accountNumber.trim()) {
      newErrors.accountNumber = "Account number is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleAdd = async () => {
    if (!validateInputs()) return;

    let imageUrl = image
      ? await uploidImage(image)
      : "https://www.smithshearer.com.au/static/uploads/images/smsf-compliance-esperance-wfjxcpafclmz.png";

    addTeacher({
      ...form,
      picture: imageUrl,
    });

    onClose();
  };

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
        Add New Teacher
      </motion.h1>

      <motion.div
        className="w-full mx-auto p-6 bg-gray-100 rounded-xl flex flex-col h-full"
        initial={{ y: 20 }}
        animate={{ y: 0 }}
      >
        <motion.div
          className="flex flex-col items-center mb-6"
          whileHover={{ scale: 1.02 }}
        >
          <img
            src={
              preview ||
              "https://th.bing.com/th/id/OIP.939YVYG6r2voj7iGiDc1QQAAAA?w=300&h=300&rs=1&pid=ImgDetMain"
            }
            alt="Teacher"
            className="w-28 h-28 object-cover rounded-full border-4 border-gray-300"
          />
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 flex-grow">
          <div className="space-y-4">
            <motion.label
              className="block text-left text-[#141F75]"
              whileHover={{ x: 5 }}
            >
              First Name
            </motion.label>
            <motion.input
              name="firstName"
              value={form.firstName}
              onChange={handleChange}
              type="text"
              placeholder="Enter first name"
              className="w-full p-2 border rounded-md border-gray-200"
              whileFocus={{ scale: 1.02 }}
            />
            {errors.firstName && (
              <motion.p
                className="text-red-500 text-sm"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                {errors.firstName}
              </motion.p>
            )}

            <motion.label
              className="block text-left text-[#141F75]"
              whileHover={{ x: 5 }}
            >
              Family Name
            </motion.label>
            <motion.input
              name="familyName"
              value={form.familyName}
              onChange={handleChange}
              type="text"
              placeholder="Enter family name"
              className="w-full p-2 border rounded-md border-gray-200"
              whileFocus={{ scale: 1.02 }}
            />
            {errors.familyName && (
              <motion.p className="text-red-500 text-sm">
                {errors.familyName}
              </motion.p>
            )}

            <motion.label
              className="block text-left text-[#141F75]"
              whileHover={{ x: 5 }}
            >
              Email
            </motion.label>
            <motion.input
              name="email"
              value={form.email}
              onChange={handleChange}
              type="email"
              placeholder="Enter email"
              className="w-full p-2 border rounded-md border-gray-200"
              whileFocus={{ scale: 1.02 }}
            />
            {errors.email && (
              <motion.p className="text-red-500 text-sm">
                {errors.email}
              </motion.p>
            )}

            <motion.label
              className="block text-left text-[#141F75]"
              whileHover={{ x: 5 }}
            >
              Type
            </motion.label>
            <motion.select
              name="type"
              value={form.type}
              onChange={handleChange}
              className="w-full p-2 border rounded-md border-gray-200 cursor-pointer"
              whileHover={{ scale: 1.01 }}
            >
              <option value="Permanent">Permanent</option>
              <option value="Temporary">Temporary</option>
            </motion.select>
          </div>

          <div className="space-y-4">
            <motion.label
              className="block text-left text-[#141F75]"
              whileHover={{ x: 5 }}
            >
              Date of Birth
            </motion.label>
            <motion.input
              name="dateOfBirth"
              value={form.dateOfBirth}
              onChange={handleChange}
              type="date"
              className="w-full p-2 border rounded-md border-gray-200 cursor-text"
              whileFocus={{ scale: 1.02 }}
            />
            {errors.dateOfBirth && (
              <motion.p className="text-red-500 text-sm">
                {errors.dateOfBirth}
              </motion.p>
            )}

            <motion.label
              className="block text-left text-[#141F75]"
              whileHover={{ x: 5 }}
            >
              Phone Number
            </motion.label>
            <motion.input
              name="phoneNumber"
              value={form.phoneNumber}
              onChange={handleChange}
              type="text"
              placeholder="Enter phone number"
              className="w-full p-2 border rounded-md border-gray-200"
              whileFocus={{ scale: 1.02 }}
            />
            {errors.phoneNumber && (
              <motion.p className="text-red-500 text-sm">
                {errors.phoneNumber}
              </motion.p>
            )}

            <motion.label
              className="block text-left text-[#141F75]"
              whileHover={{ x: 5 }}
            >
              Hours Outside
            </motion.label>
            <motion.input
              name="hoursOutside"
              value={form.hoursOutside}
              onChange={handleChange}
              type="text"
              placeholder="Enter hours"
              className="w-full p-2 border rounded-md border-gray-200"
              whileFocus={{ scale: 1.02 }}
            />
            {errors.hoursOutside && (
              <motion.p className="text-red-500 text-sm">
                {errors.hoursOutside}
              </motion.p>
            )}

            <motion.label
              className="block text-left text-[#141F75]"
              whileHover={{ x: 5 }}
            >
              Account Number
            </motion.label>
            <motion.input
              name="accountNumber"
              value={form.accountNumber}
              onChange={handleChange}
              type="text"
              placeholder="Enter account number"
              className="w-full p-2 border rounded-md border-gray-200"
              whileFocus={{ scale: 1.02 }}
            />
            {errors.accountNumber && (
              <motion.p className="text-red-500 text-sm">
                {errors.accountNumber}
              </motion.p>
            )}
          </div>

          <div className="space-y-4">
            <motion.label
              className="block text-left text-[#141F75]"
              whileHover={{ x: 5 }}
            >
              Photo
            </motion.label>
            <motion.input
              type="file"
              onChange={handleImageChange}
              className="w-full p-2 border rounded-md border-gray-200 cursor-pointer"
              whileHover={{ scale: 1.01 }}
            />

            <motion.label
              className="block text-left text-[#141F75]"
              whileHover={{ x: 5 }}
            >
              Status
            </motion.label>
            <motion.select
              name="isActive"
              value={form.isActive}
              onChange={handleChange}
              className="w-full p-2 border rounded-md border-gray-200 cursor-pointer"
              whileHover={{ scale: 1.01 }}
            >
              <option value="0">Not Active</option>
              <option value="1">Active</option>
            </motion.select>

            <motion.label
              className="block text-left text-[#141F75]"
              whileHover={{ x: 5 }}
            >
              Bio
            </motion.label>
            <motion.textarea
              name="bio"
              value={form.bio}
              onChange={handleChange}
              placeholder="Write a short bio..."
              className="w-full p-2 border rounded-md border-gray-200"
              whileFocus={{ scale: 1.02 }}
            />
            {errors.bio && (
              <motion.p className="text-red-500 text-sm">
                {errors.bio}
              </motion.p>
            )}
          </div>
        </div>

        <motion.button
          onClick={handleAdd}
          className="w-full mt-4 p-3 text-white bg-[#141F75] hover:bg-[#141F75] cursor-pointer rounded-lg shadow-md transition"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          {isLoading ? "Loading..." : "Add Teacher"}
        </motion.button>
      </motion.div>
    </motion.div>
  );
}