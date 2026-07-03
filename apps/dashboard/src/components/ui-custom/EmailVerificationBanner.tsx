// components/ui-custom/EmailVerificationBanner.tsx
"use client"

import React, { useState, useEffect } from "react"
import { useAppMutation } from "@/hooks/useAppMutation"
import { Button } from "@/components/ui/button"
import { AlertCircle, Loader2 } from "lucide-react"

interface EmailVerificationBannerProps {
  userId: string
  email: string
  role: string
  type: string
  onResend: (
    userId: string,
    email: string,
    role: string,
    type: string
  ) => Promise<{ ok: boolean; toast: string }>
}

export const EmailVerificationBanner = ({
  userId,
  email,
  role,
  type,
  onResend,
}: EmailVerificationBannerProps) => {
  const [countdown, setCountdown] = useState<number>(0)

  const mutation = useAppMutation(() => onResend(userId, email, role, type), {
    onSuccess: (res) => {
      if (res?.ok) {
        setCountdown(60)
      }
    },
  })
  useEffect(() => {
    if (countdown <= 0) return

    const timer = setInterval(() => {
      setCountdown((prev) => prev - 1)
    }, 1000)

    return () => clearInterval(timer)
  }, [countdown])

  const isDisabled = mutation.isPending || countdown > 0

  return (
    <div className="mb-4 flex flex-col sm:flex-row items-center justify-between gap-4 p-3.5 rounded-lg border border-amber-500/20 bg-amber-500/5 text-amber-600 dark:text-amber-400">
      <div className="flex items-center gap-2.5 text-sm">
        <AlertCircle className="w-4 h-4 shrink-0" />
        <p>
          <strong>Verify your email:</strong> Please check your inbox to
          complete your AppSumo license configuration.
        </p>
      </div>
      <Button
        size="sm"
        variant="outline"
        className="border-amber-500/30 hover:bg-amber-500/10 text-amber-700 dark:text-amber-300 h-8 text-xs whitespace-nowrap min-w-[140px]"
        onClick={() => mutation.mutate(undefined)}
        disabled={isDisabled}
      >
        {mutation.isPending ? (
          <>
            <Loader2 className="mr-1.5 h-3 w-3 animate-spin" />
            Sending...
          </>
        ) : countdown > 0 ? (
          `Retry in ${countdown}s`
        ) : (
          "Resend Verification Link"
        )}
      </Button>
    </div>
  )
}
