import React from "react"
import { OrgIdProps } from "@/lib/types/organization/orgId"
import { getValidatedOrgFromParams } from "@/util/getValidatedOrgFromParams"
import CheckEmail from "@/components/pages/CheckEmail"
import { redirectIfAffiliateAuthed } from "@/lib/server/auth/authGuards"
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
    title: `${org.name} | Check Email Page`,
    description: org.description ?? `Check Email Page for ${org.name}`,
    url: `${orgBaseUrl}/checkEmail`,
    icon: org.logoUrl ?? "/refearnapp.svg",
    siteName: org.name,
    image: org.openGraphUrl ?? "/opengraph-update.png",
    indexable: false,
  })
}
const CheckEmailPage = async ({ params }: OrgIdProps) => {
  const orgId = await getValidatedOrgFromParams({ params })
  await redirectIfAffiliateAuthed(orgId)
  return (
    <>
      <CheckEmail affiliate orgId={orgId} />
    </>
  )
}
export default CheckEmailPage
