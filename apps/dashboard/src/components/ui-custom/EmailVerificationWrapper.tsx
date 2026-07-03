// components/ui-custom/EmailVerificationWrapper.tsx
import React from "react"
import jwt from "jsonwebtoken"
import { PlanInfo } from "@/lib/types/organization/planInfo"
import { sendVerificationEmail } from "@/lib/verificationEmail"
import { EmailVerificationBanner } from "./EmailVerificationBanner"
import { handleAction } from "@/lib/handleAction"
import { SafeUserWithCapabilities } from "@/lib/types/organization/authUser"
import { AccountType } from "@/db/schema"

interface VerificationWrapperProps {
  orgId: string
  plan: PlanInfo
  user: (SafeUserWithCapabilities & { emailVerified: boolean }) | null
}

export async function EmailVerificationWrapper({
  orgId,
  plan,
  user,
}: VerificationWrapperProps) {
  // 1. Bail out early if conditions aren't met
  if (!plan.isAppSumo || !user || user.emailVerified) return null

  // 2. Define the server action with explicit parameters wrapped inside handleAction
  const handleResend = async (
    userId: string,
    email: string,
    role: string,
    type: string
  ) => {
    "use server"

    return handleAction("Resend Verification Link Inline", async () => {
      const token = jwt.sign(
        {
          id: userId,
          email: email,
          role: role,
          type: type,
        },
        process.env.SECRET_KEY as string,
        { expiresIn: "24h" }
      )

      const verifyUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/verify-login?organizationToken=${token}`

      await sendVerificationEmail(email, verifyUrl, "signup", orgId)

      return {
        ok: true,
        toast: "Verification email sent successfully!",
      }
    })
  }

  // 3. Render the client banner, passing down the target payload bindings safely
  return (
    <EmailVerificationBanner
      userId={user.id}
      email={user.email}
      role={user.role}
      type={user.type as AccountType}
      onResend={handleResend}
    />
  )
}
