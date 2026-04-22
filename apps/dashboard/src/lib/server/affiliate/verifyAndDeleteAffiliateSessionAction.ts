// app/affiliate/[orgId]/dashboard/action.ts
"use server"

import { cookies } from "next/headers"
import jwt from "jsonwebtoken"
import { db } from "@/db/drizzle"
import { affiliate } from "@/db/schema"
import { eq, and } from "drizzle-orm"
import { handleAction } from "@/lib/handleAction"
import { ActionResult } from "@/lib/types/organization/response"
import { AppError } from "@/lib/exceptions"

export const verifyAndDeleteAffiliateSessionAction = async (
  orgId: string
): Promise<ActionResult<{ reason: string }>> => {
  return handleAction("Verify Affiliate Session", async () => {
    const cookieStore = await cookies()
    const cookieName = `affiliateToken-${orgId}`
    const token = cookieStore.get(cookieName)?.value

    if (!token) {
      throw new AppError({ status: 401, toast: "No session found" })
    }

    // 1. Decode token to get ID
    const decoded = jwt.decode(token) as { id: string }

    // 2. Fetch current status from DB
    const affiliateData = await db.query.affiliate.findFirst({
      where: and(
        eq(affiliate.id, decoded.id),
        eq(affiliate.organizationId, orgId)
      ),
    })

    // 3. Handle Missing or Inactive/Rejected status
    if (!affiliateData) {
      cookieStore.delete(cookieName)
      throw new AppError({ status: 404, toast: "Account no longer exists" })
    }

    if (affiliateData.status !== "active") {
      cookieStore.delete(cookieName)

      const message =
        affiliateData.status === "pending"
          ? "Your account is now pending approval."
          : "Your account has been deactivated by the organization."

      throw new AppError({
        status: 403,
        toast: message,
      })
    }

    return { ok: true, data: { reason: "affiliate_active" } }
  })
}
