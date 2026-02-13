'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { FiLock, FiEye, FiEyeOff } from 'react-icons/fi'
import { MdLockReset } from 'react-icons/md'
import useStore from '@/store/useStore'

export default function ResetPassword() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const token = searchParams.get('token')

  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [message, setMessage] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const { resetPassword, success, error } = useStore()

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (password !== confirmPassword) {
      setMessage("Passwords do not match")
      return
    }

    setIsSubmitting(true)
    try {
      await resetPassword(token, password)
      // Note: useStore already sets success/error
      setTimeout(() => {
        router.push('/')
      }, 2000)
    } catch (err) {
      // Error is handled in the store
    } finally {
      setIsSubmitting(false)
    }
  }

  // Effect to sync local message with store if needed, or just display store error/success directly
  const displayMessage = message || error || success;

  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      <div className="hidden md:flex md:flex-col justify-between w-full md:w-1/2 bg-gradient-to-br from-blue-50 to-white px-10 py-12">
        <div>
          <h1 className="text-3xl font-bold text-blue-950 mb-4">TEACHPLUS</h1>
        </div>
        <div className="flex flex-col justify-center flex-grow">
          <h2 className="text-3xl font-extrabold text-blue-950 mb-4">
            Simplify teaching <br /> schedules & payments
          </h2>
          <p className="text-gray-600">
            This platform helps administrators and accountants manage teaching schedules,
            track extra hours, and process payments efficiently.
          </p>
        </div>
        <div className="text-sm text-gray-400">
          &copy; {new Date().getFullYear()} TeachPlus. All rights reserved.
        </div>
      </div>

      <div className="w-full md:w-1/2 flex items-center justify-center bg-white px-8 py-12">
        <div className="max-w-md w-full">
          <h2 className="text-3xl font-bold text-blue-950 mb-6">RESET PASSWORD</h2>
          <p className="text-gray-600 mb-6 text-sm">
            Enter a new password and confirm it to reset your access.
          </p>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="relative">
              <FiLock className="absolute top-3 left-3 text-gray-400" />
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="New Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
              <div
                className="absolute top-3 right-3 text-gray-400 cursor-pointer"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <FiEyeOff /> : <FiEye />}
              </div>
            </div>

            <div className="relative">
              <MdLockReset className="absolute top-3 left-3 text-gray-400" />
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="Confirm Password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-indigo-500"
              />
              <div
                className="absolute top-3 right-3 text-gray-400 cursor-pointer"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <FiEyeOff /> : <FiEye />}
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-blue-950 text-white font-semibold py-2 cursor-pointer rounded-lg hover:bg-indigo-800 transition disabled:opacity-50"
            >
              {isSubmitting ? 'Processing...' : 'Reset Password'}
            </button>

            {displayMessage && (
              <p className={`text-sm text-center mt-3 ${(displayMessage.includes("successfully") || displayMessage === success) ? "text-green-600" : "text-red-500"
                }`}>
                {displayMessage}
              </p>
            )}
          </form>
        </div>
      </div>
    </div>
  )
}
