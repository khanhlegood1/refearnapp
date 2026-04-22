import React from "react"
import { OrgIdProps } from "@/lib/types/organization/orgId"
import { MissingPaypalEmailCard } from "@/components/ui-custom/MissingPayoutEmailCard"
import { getValidatedOrgFromParams } from "@/util/getValidatedOrgFromParams"
import { requireAffiliateWithOrg } from "@/lib/server/auth/authGuards"
import { Metadata } from "next"
import { getOrganization } from "@/lib/server/organization/getOrganization"
import { getOrgBaseUrl } from "@/lib/server/organization/getOrgBaseUrl"
import { buildMetadata } from "@/util/BuildMetadata"
import AffiliateCouponsTable from "@/components/pages/AffiliateDashboard/AffiliateCoupon/affiliateCouponTable"
import { getLicense } from "@/lib/server/organization/getLicense"
import { LicenseRequiredState } from "@/components/ui-custom/LicenseRequiredState"
export async function generateMetadata({
  params,
}: OrgIdProps): Promise<Metadata> {
  const orgId = await getValidatedOrgFromParams({ params })
  const org = await getOrganization(orgId)
  const orgBaseUrl = await getOrgBaseUrl(org.id)
  return buildMetadata({
    title: `${org.name} | Dashboard Coupons Page`,
    description: org.description ?? `Dashboard Coupons for ${org.name}`,
    url: `${orgBaseUrl}/dashboard/coupons`,
    icon: org.logoUrl ?? "/refearnapp.svg",
    siteName: org.name,
    image: org.openGraphUrl ?? "/opengraph-update.png",
    indexable: false,
  })
}
const couponsPage = async ({ params }: OrgIdProps) => {
  const orgId = await getValidatedOrgFromParams({ params })
  await requireAffiliateWithOrg(orgId)
  const licenseResult = await getLicense()
  if (licenseResult !== null) {
    if (!licenseResult.ok) {
      return (
        <LicenseRequiredState
          featureName="Affiliate Coupons"
          requiredTier="ULTIMATE"
          isExpired={true}
          orgId={orgId}
        />
      )
    }
    const license = licenseResult.data
    const hasAccess =
      license.isActive && license.isUltimate && !!license.activationId

    if (!hasAccess) {
      const needsActivation = !license.activationId && !license.isCommunity
      return (
        <LicenseRequiredState
          featureName="Affiliate Coupons"
          requiredTier="ULTIMATE"
          isExpired={!license.isActive}
          needsActivation={needsActivation}
          orgId={orgId}
        />
      )
    }
  }
  return (
    <div className="space-y-6">
      <MissingPaypalEmailCard affiliate orgId={orgId} />
      <AffiliateCouponsTable orgId={orgId} affiliate />
    </div>
  )
}
export default couponsPage
