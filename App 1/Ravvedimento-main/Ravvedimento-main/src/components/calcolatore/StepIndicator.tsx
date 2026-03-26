"use client"

import React from "react"
import { Check } from "lucide-react"
import { cn } from "@/lib/utils"

interface StepIndicatorProps {
  currentStep: number
  totalSteps?: number
  labels?: string[]
}

export function StepIndicator({ 
  currentStep, 
  totalSteps = 3,
  labels = ["Dati Tributo", "Date", "Risultato"]
}: StepIndicatorProps) {
  return (
    <div className="w-full">
      <div className="flex items-center justify-between">
        {Array.from({ length: totalSteps }).map((_, index) => {
          const stepNumber = index + 1
          const isCompleted = stepNumber < currentStep
          const isCurrent = stepNumber === currentStep
          
          return (
            <React.Fragment key={stepNumber}>
              <div className="flex flex-col items-center">
                <div
                  className={cn(
                    "flex h-10 w-10 items-center justify-center rounded-full border-2 transition-all duration-300",
                    isCompleted && "border-success bg-success text-white",
                    isCurrent && "border-primary bg-primary text-white",
                    !isCompleted && !isCurrent && "border-neutral-200 bg-white text-neutral-400"
                  )}
                >
                  {isCompleted ? (
                    <Check className="h-5 w-5" />
                  ) : (
                    <span className="text-sm font-semibold">{stepNumber}</span>
                  )}
                </div>
                <span
                  className={cn(
                    "mt-2 text-xs font-medium",
                    isCurrent ? "text-primary" : isCompleted ? "text-success" : "text-neutral-400"
                  )}
                >
                  {labels[index]}
                </span>
              </div>
              
              {index < totalSteps - 1 && (
                <div
                  className={cn(
                    "h-1 flex-1 mx-2 rounded-full transition-colors duration-300",
                    isCompleted ? "bg-success" : "bg-neutral-200"
                  )}
                />
              )}
            </React.Fragment>
          )
        })}
      </div>
    </div>
  )
}
