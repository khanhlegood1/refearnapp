import { db } from "@/db/drizzle"
import { affiliate, affiliateInviteToken, websiteDomain } from "@/db/schema"
import { and, eq } from "drizzle-orm"
import { AppError } from "@/lib/exceptions"
import { sendVerificationEmail } from "@/lib/verificationEmail"

export async function inviteAffiliateService({
  email,
  message,
  orgId,
}: {
  email: string
  message: string
  orgId: string
}) {
  // 1. Fetch Primary Domain
  const primaryDomain = await db.query.websiteDomain.findFirst({
    where: and(
      eq(websiteDomain.orgId, orgId),
      eq(websiteDomain.isPrimary, true),
      eq(websiteDomain.isVerified, true)
    ),
  })

  const baseUrl = primaryDomain
    ? `https://${primaryDomain.domainName}`
    : process.env.NEXT_PUBLIC_BASE_URL

  // 2. Standard Duplicate Check
  const existing = await db.query.affiliate.findFirst({
    where: and(eq(affiliate.email, email), eq(affiliate.organizationId, orgId)),
  })
  if (existing)
    throw new AppError({ status: 409, toast: "Already an affiliate." })

  // 3. Create Invitation (token is handled by schema)
  const [invite] = await db
    .insert(affiliateInviteToken)
    .values({
      email,
      orgId,
      expiresAt: new Date(Date.now() + 48 * 60 * 60 * 1000),
    })
    .returning()

  // 4. Construct Link & Send Email
  const inviteLink = `${baseUrl}/signup?token=${invite.token}`

  await sendVerificationEmail(email, inviteLink, "affiliate-invite", orgId, {
    description: message,
  })
}
