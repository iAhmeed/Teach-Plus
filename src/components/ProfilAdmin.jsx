"use client"

import useStore from "@/store/useStore.js";
import { useState, useEffect, useRef } from 'react';
import { MdEmail, MdPerson, MdHome, MdWork } from "react-icons/md";
import { FaPhone, FaCalendarAlt, FaUserCircle, FaCamera } from "react-icons/fa";

export default function Profiluser() {
    const { user, updateProfile, uploidImage } = useStore();
    const [formData, setFormData] = useState({
        email: '',
        phoneNumber: '',
        firstName: '',
        familyName: '',
        dateOfBirth: '',
        department: '',
        address: '',
        picture: ''
    });
    const [previewImage, setPreviewImage] = useState('');
    const fileInputRef = useRef(null);

    const isoToInputDate = (isoString) => {
        if (!isoString) return '';
        const date = new Date(isoString);
        return date.toISOString().split('T')[0];
    };

    useEffect(() => {
        if (user) {
            setFormData({
                email: user.email || '',
                phoneNumber: user.phone_number || '', 
                firstName: user.first_name || '',
                familyName: user.family_name || '',
                dateOfBirth: isoToInputDate(user.date_of_birth) || '',
                department: user.department || '',
                address: user.address || '',
                picture: user.picture || ''
            });
            setPreviewImage(user.picture || '');
        }
    }, [user]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleImageChange = async (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setPreviewImage(reader.result);
            };
            reader.readAsDataURL(file);

            try {
                const imageUrl = await uploidImage(file);
                setFormData(prev => ({
                    ...prev,
                    picture: imageUrl
                }));
            } catch (error) {
                console.error("Error uploading image:", error);
            }
        }
    };

    const triggerFileInput = () => {
        fileInputRef.current.click();
    };

    const handleSubmit = (e) => {
        e.preventDefault();
       
        const dataToSubmit = {
            newEmail: formData.email,
            newPhoneNumber: formData.phoneNumber,
            newFirstName: formData.firstName,
            newFamilyName: formData.familyName,
            newDateOfBirth: formData.dateOfBirth ? new Date(formData.dateOfBirth).toISOString() : null,
            newDepartment: formData.department,
            newAddress: formData.address,
            newPicture: formData.picture
        };
        
        updateProfile(dataToSubmit);
    };

    return (
        <div className="w-full p-6 bg-gray-50 min-h-screen">
            <h1 className="text-3xl font-bold text-[#141F75] mb-6">Update Profile</h1>
            
            <div className="bg-white rounded-xl shadow-md p-6 w-full mx-auto">
                <div className="flex flex-col items-center mb-8">
                    <div className="relative">
                        {previewImage ? (
                            <img 
                                src={previewImage} 
                                alt="Profile" 
                                className="w-32 h-32 rounded-full object-cover border-4 border-white shadow-md"
                            />
                        ) : (
                            <FaUserCircle className="w-32 h-32 text-gray-400" />
                        )}
                        <button 
                            onClick={triggerFileInput}
                            className="absolute cursor-pointer bottom-0 right-0 bg-[#141F75] text-white p-2 rounded-full hover:bg-[#0e1757] transition duration-200 shadow-lg"
                        >
                            <FaCamera className="text-lg" />
                        </button>
                        <input 
                            type="file" 
                            ref={fileInputRef}
                            onChange={handleImageChange}
                            accept="image/*"
                            className="hidden"
                        />
                    </div>
                    <p className="mt-2 text-sm text-gray-600">Click on camera to change photo</p>
                </div>
      
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="relative">
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                First Name
                            </label>
                            <div className="relative">
                                <MdPerson className="absolute left-3 top-3 text-gray-400" />
                                <input
                                    type="text"
                                    name="firstName"
                                    value={formData.firstName}
                                    onChange={handleChange}
                                    className="w-full pl-10 p-2 border border-gray-300 rounded-md focus:ring-[#141F75] focus:border-[#141F75]"
                                />
                            </div>
                        </div>
                        <div className="relative">
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Last Name
                            </label>
                            <div className="relative">
                                <MdPerson className="absolute left-3 top-3 text-gray-400" />
                                <input
                                    type="text"
                                    name="familyName"
                                    value={formData.familyName}
                                    onChange={handleChange}
                                    className="w-full pl-10 p-2 border border-gray-300 rounded-md focus:ring-[#141F75] focus:border-[#141F75]"
                                />
                            </div>
                        </div>
                    </div>
        
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Phone Number
                            </label>
                            <div className="relative">
                                <FaPhone className="absolute left-3 top-3 text-gray-400" />
                                <input
                                    type="tel"
                                    name="phoneNumber"
                                    value={formData.phoneNumber}
                                    onChange={handleChange}
                                    className="w-full pl-10 p-2 border border-gray-300 rounded-md focus:ring-[#141F75] focus:border-[#141F75]"
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Email
                            </label>
                            <div className="relative">
                                <MdEmail className="absolute left-3 top-3 text-gray-400" />
                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    className="w-full pl-10 p-2 border border-gray-300 rounded-md focus:ring-[#141F75] focus:border-[#141F75]"
                                />
                            </div>
                        </div>
                    </div>
        
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Birth Date
                            </label>
                            <div className="relative">
                                <FaCalendarAlt className="absolute left-3 top-3 text-gray-400" />
                                <input
                                    type="date"
                                    name="dateOfBirth"
                                    value={formData.dateOfBirth}
                                    onChange={handleChange}
                                    className="w-full pl-10 p-2 border border-gray-300 rounded-md focus:ring-[#141F75] focus:border-[#141F75]"
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Department
                            </label>
                            <div className="relative">
                                <MdWork className="absolute left-3 top-3 text-gray-400" />
                                <input
                                    type="text"
                                    name="department"
                                    value={formData.department}
                                    onChange={handleChange}

                                    className="w-full pl-10 p-2 bg-gray-100 border border-gray-300 rounded-md "
                                />
                            </div>
                        </div>
                    </div>
        
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Address
                        </label>
                        <div className="relative">
                            <MdHome className="absolute left-3 top-3 text-gray-400" />
                            <textarea
                                name="address"
                                value={formData.address}
                                onChange={handleChange}
                                rows={3}
                                className="w-full pl-10 p-2 border border-gray-300 rounded-md focus:ring-[#141F75] focus:border-[#141F75]"
                            />
                        </div>
                    </div>
        
                    <div className="pt-4 flex justify-center">
                        <button
                            type="submit"
                            className="px-6 cursor-pointer py-2 bg-[#141F75] text-white rounded-md hover:bg-[#0e1757] transition-colors shadow-md"
                        >
                            Update Profile
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}