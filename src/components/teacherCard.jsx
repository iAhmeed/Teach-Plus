"use client";

import dynamic from "next/dynamic";
import { useState, useEffect, useRef } from "react";
import { HiDotsHorizontal } from "react-icons/hi";
import { FaRegEye } from "react-icons/fa";

const Absences = dynamic(() => import("./absencesList"), {
  ssr: false,
  loading: () => <p>Loading...</p>,
});
const ProfilTeacher = dynamic(() => import("./ProfilTeacher"), {
  ssr: false,
  loading: () => <p>Loading...</p>,
});
const Ranks = dynamic(() => import("./Ranks"), {
  ssr: false,
  loading: () => <p>Loading...</p>,
});
const DeleteTeacher = dynamic(() => import("./Delete"), {
  ssr: false,
  loading: () => <p>Loading...</p>,
});
const Modal = dynamic(() => import("./Modal"), {
  ssr: false,
  loading: () => <p>Loading...</p>,
});

import useStore from "@/store/useStore";

const TeacherCard = ({ teacherData }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState([false, ""]);
  const menuRef = useRef(null);

  const {
    getRanks,
    selectTeacher,
    getTeacher,
    getAbsences,
  } = useStore();

 

 
 

  function handleModal(option, teacherId) {
    setIsModalOpen([true, option]);
    selectTeacher(teacherId);
    switch (option) {
      case "absences":
        getAbsences();
        break;
      case "profil":
        getTeacher();
        break;
      case "ranks":
        getRanks();
        break;
      default:
        break;
    }
  }

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsMenuOpen(false);
      }
    };
    if (isMenuOpen) {
      document.addEventListener("click", handleClickOutside);
    }
    return () => document.removeEventListener("click", handleClickOutside);
  }, [isMenuOpen]);

  let ModalContent = null;
  if (isModalOpen[1] === "absences") {
    ModalContent = <Absences onClose={() => setIsModalOpen([false, ""])} />;
  } else if (isModalOpen[1] === "profil") {
    ModalContent = (
      <ProfilTeacher
        teacher={teacherData}
        onClose={() => setIsModalOpen([false, ""])}
      />
    );
  } else if (isModalOpen[1] === "ranks") {
    ModalContent = <Ranks onClose={() => setIsModalOpen([false, ""])} />;
  } else if (isModalOpen[1] === "delete") {
    ModalContent = <DeleteTeacher onClose={() => setIsModalOpen([false, ""])} />;
  }

  return (
    <div className="relative bg-gray-100 p-1 rounded-lg w-full text-center border border-gray-200">
      <div className="w-1/3 m-4 bg-gray-300 rounded-full overflow-hidden border border-gray-400">
        <img
          className="w-full aspect-square"
          src={
            teacherData.picture
              ? teacherData.picture
              : "https://www.smithshearer.com.au/static/uploads/images/smsf-compliance-esperance-wfjxcpafclmz.png"
          }
          alt={teacherData.family_name}
        />
      </div>
      <div className="flex flex-col items-center m-4">
        <div className="bg-white mx-4 p-2 w-full rounded-xl">
          <h2 className="text-md font-semibold text-left text-[#141F75]">
            {teacherData.family_name} {teacherData.first_name}
          </h2>
          <h4 className="text-left text-sm text-[#141F75]">
            {teacherData.rank ? teacherData.rank : "Unknown"}
          </h4>
          <p
            className={`text-sm text-left p-1 font-medium mt-1 ${
              teacherData.is_active ? "text-green-600" : "text-red-600"
            }`}
          >
            {teacherData.is_active ? "🟢 Active" : "🔴 Not Active"}
          </p>
          <button
            className="text-sm bg-blue-900 text-white rounded-2xl flex items-center gap-1 px-2 py-1 hover:cursor-pointer"
            onClick={() => handleModal("profil", teacherData.teacher_id)}
          >
            <FaRegEye /> View Profile
          </button>
        </div>
      </div>

      <button
        className="absolute top-4 right-4 p-2 text-gray-600 hover:text-gray-800 cursor-pointer"
        onClick={() => setIsMenuOpen(!isMenuOpen)}
      >
        <HiDotsHorizontal size={20} />
      </button>

      {isMenuOpen && (
        <div
          ref={menuRef}
          className="absolute right-4 top-12 bg-white border border-gray-300 shadow-md rounded-md w-40 text-left"
        >
          <ul className="text-sm text-gray-700">
            <li
              className="p-2 border-b cursor-pointer hover:bg-gray-100"
              onClick={() => handleModal("absences", teacherData.teacher_id)}
            >
              Manage Absences
            </li>
            <li
              className="p-2 border-b cursor-pointer hover:bg-gray-100"
              onClick={() => handleModal("ranks", teacherData.teacher_id)}
            >
              Manage Ranks
            </li>
            <li
              className="p-2 cursor-pointer text-red-600 hover:bg-gray-100"
              onClick={() => handleModal("delete", teacherData.teacher_id)}
            >
              Delete Teacher
            </li>
          </ul>
        </div>
      )}
      {ModalContent &&
        <Modal isOpen={isModalOpen[0]} onClose={() => setIsModalOpen([false, ""])}>
          {ModalContent}
        </Modal>}
    </div>
  );
};

export default TeacherCard;