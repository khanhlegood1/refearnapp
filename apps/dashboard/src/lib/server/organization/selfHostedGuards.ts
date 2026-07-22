// @/lib/server/organization/selfHostedGuards.ts
import { db } from "@/db/drizzle"
import { user } from "@/db/schema"
import { count } from "drizzle-orm"
import { redirect } from "next/navigation"
import { AppError } from "@/lib/exceptions"

/**
 * Prevents multiple signups in self-hosted mode.
 * If 1 user exists, it restricts new signups.
 */
export const restrictSelfHostedSignup = async (shouldRedirect = true) => {
  const isSelfHosted = process.env.NEXT_PUBLIC_SELF_HOSTED === "true"

  // Nếu không phải chế độ self-hosted, bỏ qua guard
  if (!isSelfHosted) return

  try {
    const [res] = await db.select({ value: count() }).from(user)
    const hasUser = res ? res.value > 0 : false

    if (hasUser) {
      if (shouldRedirect) {
        redirect("/login?error=RegistrationDisabled")
      } else {
        throw new AppError({
          status: 403,
          error: "RegistrationDisabled",
          toast: "Registration is disabled on this instance.",
        })
      }
    }
  } catch (error) {
    // Bắt buộc re-throw nếu lỗi đó là do redirect() của Next.js
    if ((error as any)?.digest?.startsWith("NEXT_PUBLIC_REDIRECTION_URL")) {
      throw error
    }

    // Nếu là AppError chủ động quăng ra thì throw tiếp
    if (error instanceof AppError) {
      throw error
    }

    console.error("Error in restrictSelfHostedSignup:", error)
  }
}
