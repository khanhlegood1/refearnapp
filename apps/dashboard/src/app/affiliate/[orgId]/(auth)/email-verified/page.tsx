import React from "react"
import EmailVerified from "@/components/pages/Email-verified"
import { OrgIdProps } from "@/lib/types/organization/orgId"
import { getValidatedOrgFromParams } from "@/util/getValidatedOrgFromParams"
import { requireAffiliateWithOrg } from "@/lib/server/auth/authGuards"
import { Metadata } from "next"
import { getOrganization } from "@/lib/server/organization/getOrganization"
import { getOrgBaseUrl } from "@/lib/server/organization/getOrgBaseUrl"
import { buildMetadata } from "@/util/BuildMetadata"
export async function generateMetadata({
  params,
}: OrgIdProps): Promise<Metadata> {
  const orgId = await getValidatedOrgFromParams({ params })
  const org = await getOrganization(orgId)
  const orgBaseUrl = await getOrgBaseUrl(org.id)
  return buildMetadata({
    title: `${org.name} | Email Verified Page`,
    description: org.description ?? `Email Verified Page for ${org.name}`,
    url: `${orgBaseUrl}/email-verified`,
    icon: org.logoUrl ?? "/refearnapp.svg",
    siteName: org.name,
    image: org.openGraphUrl ?? "/opengraph-update.png",
    indexable: false,
  })
}
const emailVerifiedPage = async ({ params }: OrgIdProps) => {
  const orgId = await getValidatedOrgFromParams({ params })
  await requireAffiliateWithOrg(orgId)
  return (
    <>
      <EmailVerified orgId={orgId} affiliate />
    </>
  )
}
export default emailVerifiedPage
