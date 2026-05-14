import PendingApproval from "@/components/pages/PendingApproval"
import { getValidatedOrgFromParams } from "@/util/getValidatedOrgFromParams"
import { OrgIdProps } from "@/lib/types/organization/orgId"
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
    title: `${org.name} | Application Pending`,
    description: org.description ?? `Application Pending for ${org.name}`,
    url: `${orgBaseUrl}/pending-approval`,
    icon: org.logoUrl ?? "/refearnapp.svg",
    siteName: org.name,
    image: org.openGraphUrl ?? "/opengraph-update.png",
    indexable: false,
  })
}

const PendingApprovalPage = async ({ params }: OrgIdProps) => {
  const orgId = await getValidatedOrgFromParams({ params })
  await redirectIfAffiliateAuthed(orgId)
  return <PendingApproval affiliate orgId={orgId} />
}

export default PendingApprovalPage
