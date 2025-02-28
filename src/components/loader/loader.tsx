"use client"

import { motion } from "framer-motion"
import { cn } from "@/lib/utils"
import Lottie from "lottie-react"
import check from "@lottie/loading.json"

export interface LoaderProps {
  size?: "sm" | "md" | "lg"
  variant?: "spinner" | "dots" | "pulse"
  className?: string
}

export function Loader({ size = "md", variant = "spinner", className }: LoaderProps) {
  const sizeClasses = {
    sm: "w-4 h-4",
    md: "w-8 h-8",
    lg: "w-12 h-12",
  }

  // Default spinner
  return (
    <div className=" flex justify-center items-center">
      <Lottie
        animationData={check}
        loop={true}
        autoPlay={true}
        className="w-72 h-w-72"
      />
    </div>

  )
}

