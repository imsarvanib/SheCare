import { useEffect, useState } from 'react'

export const useMockLoading = (delayMs = 800) => {
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setIsLoading(false)
    }, delayMs)

    return () => window.clearTimeout(timer)
  }, [delayMs])

  return isLoading
}
