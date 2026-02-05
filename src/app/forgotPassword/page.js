'use client'

import { useState } from 'react'
import useStore from '@/store/useStore'
import { MdEmail } from 'react-icons/md'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const { forgotPassword, isLoading, error } = useStore()

  const handleSubmit = async (e) => {
    e.preventDefault()
    await forgotPassword(email)
  }

  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      <div className="hidden lg:flex flex-col justify-center items-center w-full lg:w-1/2 bg-gradient-to-b from-[#F6F9FC] to-white border-r border-gray-200 p-10">
        <div className="text-center max-w-md">
          <div className="text-4xl font-extrabold text-blue-950 mb-6">
            TEACH<span className="text-blus-950">PLUS</span>
          </div>
          <h2 className="text-2xl font-bold text-blue-950 mb-2">
            Reset your password
          </h2>
          <p className="text-gray-600 text-sm">
            Enter your corporate email address and we’ll send you instructions
            to reset your password.
          </p>
        </div>
      </div>

      <div className="flex flex-1 items-center justify-center px-4 py-12">
        <div className="max-w-md w-full space-y-6">
          <div>
            <h1 className="text-3xl font-bold text-blue-950">Forgot Password</h1>
            <p className="text-sm text-gray-500 mt-2">
              Enter your email address to receive a reset link
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="email" className="text-sm font-medium text-gray-700">
                Email Address
              </label>
              <div className="relative mt-1">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400">
                  <MdEmail className="w-5 h-5" />
                </span>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="pl-10 py-2 px-3 block w-full border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-2 bg-blue-950 text-white font-semibold rounded-lg hover:bg-indigo-900 transition"
            >
              {isLoading ? 'Sending...' : 'Send Reset Link'}
            </button>
          </form>

          {error && <p className="text-red-600 text-sm mt-2">{error}</p>}
        </div>
      </div>
    </div>
  )
}
