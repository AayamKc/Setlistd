import { useEffect } from 'react'

const Toast = ({ message, type = 'success', onClose, duration = 3000 }) => {
  useEffect(() => {
    // Shorter duration for error messages
    const effectiveDuration = type === 'error' ? 2000 : duration
    const timer = setTimeout(() => {
      onClose()
    }, effectiveDuration)

    return () => clearTimeout(timer)
  }, [duration, onClose, type])

  const getToastStyles = () => {
    switch (type) {
      case 'success':
        return 'bg-primary text-secondary border border-primary-dark'
      case 'error':
        return 'bg-red-50 text-red-800 border border-red-200'
      case 'info':
        return 'bg-blue-50 text-blue-800 border border-blue-200'
      default:
        return 'bg-gray-50 text-gray-800 border border-gray-200'
    }
  }

  const getIcon = () => {
    switch (type) {
      case 'success':
        return (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        )
      case 'error':
        return (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        )
      case 'info':
        return (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        )
      default:
        return null
    }
  }

  return (
    <div className={`fixed top-4 right-4 z-[70] flex items-center gap-3 px-5 py-3 rounded-lg shadow-md ${getToastStyles()} animate-slide-in`}>
      <div className="flex-shrink-0">
        {getIcon()}
      </div>
      <span className="text-sm font-medium">{message}</span>
    </div>
  )
}

export default Toast