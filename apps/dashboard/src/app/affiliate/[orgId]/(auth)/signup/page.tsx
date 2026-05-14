import React from "react"
import Signup from "@/components/pages/Signup"
import { OrgIdProps } from "@/lib/types/organization/orgId"
import { getValidatedOrgFromParams } from "@/util/getValidatedOrgFromParams"
import { redirectIfAffiliateAuthed } from "@/lib/server/auth/authGuards"
import { Metadata } from "next"
import { getOrganization } from "@/lib/server/organization/getOrganization"
import { getOrgBaseUrl } from "@/lib/server/organization/getOrgBaseUrl"
import { buildMetadata } from "@/util/BuildMetadata"
import InvalidInvite from "@/components/pages/InvalidInvite"
import { notFound } from "next/navigation"
import { validateOrg } from "@/util/ValidateOrg"
import { verifyInviteToken } from "@/lib/server/organization/verifyInvite"
export async function generateMetadata({
  params,
}: OrgIdProps): Promise<Metadata> {
  const orgId = await getValidatedOrgFromParams({ params })
  const org = await getOrganization(orgId)
  const orgBaseUrl = await getOrgBaseUrl(org.id)
  return buildMetadata({
    title: `${org.name} | Signup Page`,
    description: org.description ?? `Signup Page for ${org.name}`,
    url: `${orgBaseUrl}/signup`,
    icon: org.logoUrl ?? "/refearnapp.svg",
    siteName: org.name,
    image: org.openGraphUrl ?? "/opengraph-update.png",
    indexable: false,
  })
}
const AffiliateSignupPage = async ({
  params,
  searchParams,
}: OrgIdProps & { searchParams: Promise<{ token?: string }> }) => {
  const { orgId } = await params
  const { token } = await searchParams

  const { orgFound, org } = await validateOrg(orgId)
  if (!orgFound || !org) notFound()

  if (org.programType === "invite_only") {
    const isValid = await verifyInviteToken(token, orgId)

    if (!isValid) {
      return (
        <InvalidInvite
          affiliate
          orgId={orgId}
          message="This is a private program. You need a valid invitation link to join."
        />
      )
    }
  }
  await redirectIfAffiliateAuthed(orgId)
  return (
    <>
      <Signup affiliate orgId={orgId} inviteToken={token} />
    </>
  )
}
export default AffiliateSignupPage
