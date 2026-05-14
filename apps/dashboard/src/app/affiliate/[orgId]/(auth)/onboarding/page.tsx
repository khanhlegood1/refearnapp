import AffiliateOnboarding from "@/components/pages/AffiliateOnboarding"
import { getValidatedOrgFromParams } from "@/util/getValidatedOrgFromParams"
import { OrgIdProps } from "@/lib/types/organization/orgId"
import { Metadata } from "next"
import { getOrganization } from "@/lib/server/organization/getOrganization"
import { getOrgBaseUrl } from "@/lib/server/organization/getOrgBaseUrl"
import { buildMetadata } from "@/util/BuildMetadata"
import { requireAffiliateWithOrg } from "@/lib/server/auth/authGuards"

export async function generateMetadata({
  params,
}: OrgIdProps): Promise<Metadata> {
  const validatedOrgId = await getValidatedOrgFromParams({ params })
  const org = await getOrganization(validatedOrgId)
  const orgBaseUrl = await getOrgBaseUrl(org.id)

  return buildMetadata({
    title: `${org.name} | Complete Your Application`,
    description: `Finish setting up your affiliate account for ${org.name}`,
    url: `${orgBaseUrl}/onboarding`,
    icon: org.logoUrl ?? "/refearnapp.svg",
    siteName: org.name,
    image: org.openGraphUrl ?? "/opengraph-update.png",
    indexable: false,
  })
}

const OnboardingPage = async ({ params }: OrgIdProps) => {
  const orgId = await getValidatedOrgFromParams({ params })
  await requireAffiliateWithOrg(orgId)
  return <AffiliateOnboarding affiliate orgId={orgId} />
}

export default OnboardingPage
