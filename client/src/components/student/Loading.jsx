import React, { useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'

const Loading = () => {
  const { path } = useParams()
  const navigate = useNavigate()

  useEffect(() => {
    if (path) {
      const timer = setTimeout(() => {
        navigate(`/${path}`) // navigate to /<path>
      }, 5000)
      return () => clearTimeout(timer)
    }
  }, [path, navigate])

  return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div
        role="status"
        aria-live="polite"
        className="flex flex-col items-center space-y-4"
      >
        <div
          className="w-16 h-16 sm:w-20 sm:h-20 rounded-full border-4 border-gray-300 border-t-blue-400 animate-spin"
          aria-hidden="true"
        />
        <span className="text-sm text-gray-600">Processing, please wait...</span>
      </div>
    </div>
  )
}

export default Loading
