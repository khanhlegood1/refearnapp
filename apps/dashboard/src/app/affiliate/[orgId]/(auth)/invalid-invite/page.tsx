import InvalidInvite from "@/components/pages/InvalidInvite"
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
    title: `${org.name} | Invalid Invitation`,
    description: org.description ?? `Invalid Invitation for ${org.name}`,
    url: `${orgBaseUrl}/invalid-invite`,
    icon: org.logoUrl ?? "/refearnapp.svg",
    siteName: org.name,
    image: org.openGraphUrl ?? "/opengraph-update.png",
    indexable: false,
  })
}

const InvalidInvitePage = async ({ params }: OrgIdProps) => {
  const orgId = await getValidatedOrgFromParams({ params })
  await redirectIfAffiliateAuthed(orgId)
  return <InvalidInvite affiliate orgId={orgId} />
}

export default InvalidInvitePage
