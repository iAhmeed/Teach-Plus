"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { FiMail, FiLock } from "react-icons/fi";
import { AiOutlineEye, AiOutlineEyeInvisible } from "react-icons/ai";
import useStore from "@/store/useStore";
import logo from "@/images/logo.jpg"

const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [errorr, setErrorr] = useState("");

  const router = useRouter();
  const { login, isLoading ,error} = useStore();

  const handleForgotPassword = () => {
    router.push("/forgotPassword");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setEmailError("");
    setPasswordError("");
    setErrorr("");

   if (!email) {
  setEmailError("Email is required");
  return;
}

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

if (!emailRegex.test(email)) {
  setEmailError("Invalid email format");
  return;
}
    if (!password) {
      setPasswordError("Password is required");
      return;
    }

    try {
      await login(email, password);
      router.push("/admin/dashboard");
    } catch (err) {
      setErrorr(err.message);
    }
  };

  return (
    <div className="w-full h-screen font-poppins flex flex-wrap">
      <div className="p-6 flex flex-col justify-center bg-gray-50 w-full md:w-1/3">
        <div className="mb-52 text-center">
        <p className="text-blue-950 text-3xl md:text-4xl">
            <span className="font-extrabold">Teach</span>Plus
           
          </p>        </div>
        <div className="mt-16 text-center">
          <p className="text-2xl md:text-3xl font-bold text-blue-950">
            Simplify teaching schedules & payments
          </p>
          <p className="text-sm font-semibold leading-5 drop-shadow-[2px_2px_4px_rgba(0,0,0,0.5)] mt-4">
            This platform helps administrators and accountants manage teaching
            schedules, track extra hours, and process payments efficiently.
          </p>
        </div>
      </div>

      <div className="flex justify-center items-center w-full md:w-2/3">
        <form onSubmit={handleSubmit} className="text-black flex flex-col w-full max-w-md px-4">
          <p className="text-3xl text-blue-950 font-extrabold mb-4">Welcome!</p>
          <p className="text-gray-400 font-light text-sm mb-4">
            Log in with your corporate email address and the password assigned by the school.
          </p>

          <div className="mb-4 text-sm">
            <label className="block mb-2 font-medium text-gray-700">Email</label>
            <div className="relative">
              <FiMail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={`w-full pl-10 p-3 border rounded-lg bg-gray-100 focus:outline-none ${
                  emailError ? "border-red-500" : "focus:border-indigo-500"
                }`}
              />
            </div>
            {emailError && <p className="mt-1 text-red-500">{emailError}</p>}
          </div>
          <div className="mb-6 text-sm">
            <label className="block mb-2 font-medium text-gray-700">Password</label>
            <div className="relative">
              <FiLock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={`w-full pl-10 pr-10 p-3 border rounded-lg bg-gray-100 focus:outline-none ${
                  passwordError ? "border-red-500" : "focus:border-indigo-500"
                }`}
              />
              <div
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 cursor-pointer"
              >
                {showPassword ? <AiOutlineEyeInvisible size={20} /> : <AiOutlineEye size={20} />}
              </div>
            </div>
            {passwordError && <p className="mt-1 text-red-500">{passwordError}</p>}
          </div>

          <button
            type="submit"
            className="w-full bg-blue-950 text-white py-3 rounded-lg hover:bg-indigo-800 cursor-pointer transition duration-200 flex items-center justify-center gap-2"
            disabled={isLoading}
          >
            {isLoading ? "Logging in..." : "Proceed to my Account"}
            <span>→</span>
          </button>

          <p
            className="mt-4 text-right text-sm text-gray-500 cursor-pointer"
            onClick={handleForgotPassword}
          >
            Having Issues with your Password?
          </p>

          {error && <p className="mt-2 text-center text-red-500">{error}</p>}
        </form>
      </div>
    </div>
  );
};

export default LoginPage;