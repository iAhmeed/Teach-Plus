"use client";

import useStore from "@/store/useStore";
import { motion } from "framer-motion";

export default function DeleteTeacher({ onClose }) {
    const { deleteTeacher, selectTeacher } = useStore();

    const handleDelete = () => {
        deleteTeacher();
        selectTeacher(null);
        onClose();
    };

    return (
        <motion.div 
            className="flex flex-col items-center p-6 shadow-lg rounded-xl w-full mx-auto bg-white"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ type: "spring", stiffness: 300 }}
        >
            <motion.div 
                className="text-lg font-semibold text-blue-900 mb-4 text-center"
                initial={{ y: -10 }}
                animate={{ y: 0 }}
            >
                Are you sure you want to delete this teacher?
            </motion.div>
            
            <motion.button
                onClick={handleDelete}
                className="px-6 py-2 bg-red-600 text-white font-medium rounded-lg hover:bg-red-800 cursor-pointer transition"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
            >
                Delete Teacher
            </motion.button>

            <motion.button
                onClick={onClose}
                className="mt-3 px-6 py-2 bg-gray-200 text-gray-700 font-medium rounded-lg hover:bg-gray-300 cursor-pointer transition"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
            >
                Cancel
            </motion.button>
        </motion.div>
    );
}