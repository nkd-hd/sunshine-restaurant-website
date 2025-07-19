"use client"

import { useState, useEffect } from "react"
import { CheckCircle, Clock, AlertCircle, CreditCard, Smartphone, Building2 } from "lucide-react"
import { Button } from "~/components/ui/button"

interface PaymentStatusProps {
  paymentMethod: "MTN_MOMO" | "ORANGE_MONEY" | "CASH"
  paymentStatus: "PENDING" | "COMPLETED" | "FAILED" | "REFUNDED"
  paymentReference?: string
  additionalInfo?: Record<string, any>
  onRetry?: () => void
  onVerify?: () => void
}

export default function PaymentStatus({
  paymentMethod,
  paymentStatus,
  paymentReference,
  additionalInfo,
  onRetry,
  onVerify
}: PaymentStatusProps) {
  const [timeLeft, setTimeLeft] = useState<number | null>(null)

  useEffect(() => {
    if (paymentStatus === "PENDING" && additionalInfo?.timeout) {
      const timeout = additionalInfo.timeout
      let minutes = 0
      
      if (timeout.includes("5 minutes")) minutes = 5
      else if (timeout.includes("10 minutes")) minutes = 10
      else if (timeout.includes("24 hours")) minutes = 24 * 60

      if (minutes > 0) {
        setTimeLeft(minutes * 60) // Convert to seconds
        
        const interval = setInterval(() => {
          setTimeLeft(prev => {
            if (prev && prev > 0) {
              return prev - 1
            } else {
              clearInterval(interval)
              return 0
            }
          })
        }, 1000)

        return () => clearInterval(interval)
      }
    }
  }, [paymentStatus, additionalInfo])

  const getMethodIcon = () => {
    switch (paymentMethod) {
      case "MTN_MOMO":
        return <div className="h-8 w-8 bg-yellow-500 rounded-full flex items-center justify-center">
          <span className="text-white text-xs font-bold">MTN</span>
        </div>
      case "ORANGE_MONEY":
        return <div className="h-8 w-8 bg-orange-500 rounded-full flex items-center justify-center">
          <span className="text-white text-xs font-bold">OM</span>
        </div>
      case "CASH":
        return <Smartphone className="h-8 w-8 text-green-600" />
      default:
        return <Smartphone className="h-8 w-8 text-gray-600" />
    }
  }

  const getStatusIcon = () => {
    switch (paymentStatus) {
      case "COMPLETED":
        return <CheckCircle className="h-8 w-8 text-green-600" />
      case "PENDING":
        return <Clock className="h-8 w-8 text-yellow-600" />
      case "FAILED":
        return <AlertCircle className="h-8 w-8 text-red-600" />
      case "REFUNDED":
        return <AlertCircle className="h-8 w-8 text-orange-600" />
      default:
        return <Clock className="h-8 w-8 text-gray-600" />
    }
  }

  const getStatusMessage = () => {
    switch (paymentStatus) {
      case "COMPLETED":
        return "Payment completed successfully"
      case "PENDING":
        if (paymentMethod === "MTN_MOMO") {
          return "Check your phone for MTN Mobile Money prompt"
        } else if (paymentMethod === "ORANGE_MONEY") {
          return "Complete payment in your Orange Money app"
        }
        return "Payment is being processed"
      case "FAILED":
        return "Payment failed. Please try again."
      case "REFUNDED":
        return "Payment has been refunded"
      default:
        return "Processing payment..."
    }
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  return (
    <div className="bg-white border rounded-lg p-6 space-y-4">
      {/* Header */}
      <div className="flex items-center space-x-4">
        {getMethodIcon()}
        <div className="flex-1">
          <h3 className="font-semibold text-lg">
            {paymentMethod.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())} Payment
          </h3>
          {paymentReference && (
            <p className="text-sm text-gray-500">Reference: {paymentReference}</p>
          )}
        </div>
        {getStatusIcon()}
      </div>

      {/* Status Message */}
      <div className={`p-4 rounded-lg border ${{
        COMPLETED: 'bg-green-50 border-green-200 text-green-800',
        PENDING: 'bg-yellow-50 border-yellow-200 text-yellow-800',
        FAILED: 'bg-red-50 border-red-200 text-red-800',
        REFUNDED: 'bg-orange-50 border-orange-200 text-orange-800'
      }[paymentStatus]}`}>
        <p className="font-medium">{getStatusMessage()}</p>
        
        {timeLeft !== null && timeLeft > 0 && paymentStatus === "PENDING" && (
          <p className="text-sm mt-1">
            Time remaining: {formatTime(timeLeft)}
          </p>
        )}
      </div>

      {/* Additional Instructions */}
      {additionalInfo?.instructions && paymentStatus === "PENDING" && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 className="font-medium text-blue-900 mb-2">Instructions</h4>
          <p className="text-sm text-blue-800">{additionalInfo.instructions}</p>
        </div>
      )}


      {/* Action Buttons */}
      <div className="flex gap-3">
        {paymentStatus === "PENDING" && onVerify && (
          <Button 
            onClick={onVerify}
            variant="outline"
            className="flex-1"
          >
            Check Status
          </Button>
        )}
        
        {paymentStatus === "FAILED" && onRetry && (
          <Button 
            onClick={onRetry}
            className="flex-1"
          >
            Try Again
          </Button>
        )}
        
        {paymentStatus === "COMPLETED" && (
          <div className="flex-1 text-center py-2">
            <span className="text-green-600 font-medium">✓ Payment Successful</span>
          </div>
        )}
      </div>
    </div>
  )
}
