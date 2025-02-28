"use client"

import { useEffect, useState } from "react"
import { usePathname } from "next/navigation"
import { Loader } from "@/components/loader/loader"

type LoadingWrapperProps = {
  children: React.ReactNode
}

export function LoadingWrapper({ children }: LoadingWrapperProps) {
  const [isLoading, setIsLoading] = useState(false)
  const pathname = usePathname()

  useEffect(() => {
    const handleStart = () => setIsLoading(true)
    const handleComplete = () => setIsLoading(false)

    window.addEventListener("routeChangeStart", handleStart)
    window.addEventListener("routeChangeComplete", handleComplete)
    window.addEventListener("routeChangeError", handleComplete)

    return () => {
      window.removeEventListener("routeChangeStart", handleStart)
      window.removeEventListener("routeChangeComplete", handleComplete)
      window.removeEventListener("routeChangeError", handleComplete)
    }
  }, [])

  useEffect(
    () => {
      setIsLoading(true)
      const timer = setTimeout(() => setIsLoading(false), 1000)
      return () => clearTimeout(timer)
    },
    [
      /* pathname */
    ],
  )

  return (
    <>
      {isLoading && (
        <div className="fixed inset-0 flex items-center justify-center bg-background/80 z-50">
          <Loader size="lg" />
        </div>
      )}
      {children}
    </>
  )
}

