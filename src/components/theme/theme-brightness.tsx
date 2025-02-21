'use client'

import { Label } from '@radix-ui/react-label'
import { useEffect, useState } from 'react'
import { Skeleton } from '../ui/skeleton'


export function ThemeBrightness() {
  const [isLoading, setIsLoading] = useState(true)

  const [brightness, setBrightness] = useState(() => {
    if (typeof window !== "undefined") {
      const storedBrightness = localStorage.getItem("brightness")
      return storedBrightness !== null ? Number(storedBrightness) : 50
    }
    return 50
  })
  
  const [contrast, setContrast] = useState(() => {
    if (typeof window !== "undefined") {
      const storedContrast = localStorage.getItem("contrast")
      return storedContrast !== null ? Number(storedContrast) : 50
    }
    return 50
  })

  // Simulate loading until the component is mounted
  useEffect(() => {
    // For demonstration purposes, you could also introduce a delay here.
    setIsLoading(false)
  }, [])

  // Save brightness and contrast to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem("brightness", brightness.toString())
    localStorage.setItem("contrast", contrast.toString())
  }, [brightness, contrast])

  // Update CSS variables based on brightness and contrast
  useEffect(() => {
    const mappedBrightness = (brightness / 50) * 100
    const mappedContrast = (contrast / 50) * 100
    document.documentElement.style.setProperty("--brightness", mappedBrightness + "%")
    document.documentElement.style.setProperty("--contrast", mappedContrast + "%")
  }, [brightness, contrast])

  function resetValues() {
    setBrightness(50)
    setContrast(50)
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-6 w-1/2" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-6 w-1/2" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-1/3" />
      </div>
    )
  }

  return (
    <>
      <div>
        <Label htmlFor="brightness-slider" className="text-base font-medium">
          Brightness: {brightness}%
        </Label>
        <input
          id="brightness-slider"
          type="range"
          min="20"
          max="70"
          value={brightness}
          onChange={(e) => setBrightness(Number(e.target.value))}
          className="w-full"
        />
      </div>
      <div>
        <Label htmlFor="contrast-slider" className="text-base font-medium">
          Contrast: {contrast}%
        </Label>
        <input
          id="contrast-slider"
          type="range"
          min="20"
          max="70"
          value={contrast}
          onChange={(e) => setContrast(Number(e.target.value))}
          className="w-full"
        />
      </div>
      <div>
        <button
          onClick={resetValues}
          className="mt-2 px-4 py-2 bg-blue-500 text-white rounded"
        >
          Reset to Default
        </button>
      </div>
    </>
  )
}
