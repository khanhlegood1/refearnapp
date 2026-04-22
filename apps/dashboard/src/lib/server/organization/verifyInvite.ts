// @/lib/server/organization/verifyInvite.ts
import { db } from "@/db/drizzle"
import { affiliateInviteToken } from "@/db/schema"
import { and, eq, gt, isNull } from "drizzle-orm"

export async function verifyInviteToken(
  token: string | undefined,
  orgId: string
) {
  if (!token) return false

  const invite = await db.query.affiliateInviteToken.findFirst({
    where: and(
      eq(affiliateInviteToken.token, token),
      eq(affiliateInviteToken.orgId, orgId),
      gt(affiliateInviteToken.expiresAt, new Date()),
      isNull(affiliateInviteToken.usedAt)
    ),
  })

  return !!invite
}
