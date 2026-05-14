import React from "react"
import Settings from "@/components/pages/Dashboard/Settings/Settings"
import { OrgIdProps } from "@/lib/types/organization/orgId"
import { getValidatedOrgFromParams } from "@/util/getValidatedOrgFromParams"
import { ErrorCard } from "@/components/ui-custom/ErrorCard"
import { requireOrganizationWithOrg } from "@/lib/server/auth/authGuards"
import { Metadata } from "next"
import { buildMetadata } from "@/util/BuildMetadata"
import { getOrgSettings } from "@/lib/server/organization/getOrgSettings"
import { getUserPlan } from "@/lib/server/organization/getUserPlan"
import { getLicense } from "@/lib/server/organization/getLicense"
export async function generateMetadata({
  params,
}: OrgIdProps): Promise<Metadata> {
  const orgId = await getValidatedOrgFromParams({ params })

  return buildMetadata({
    title: "RefearnApp | Settings Page",
    description: "Settings Page",
    url: `https://refearnapp.com/organization/${orgId}/dashboard/settings`,
    indexable: false,
  })
}
const SettingsPage = async ({ params }: OrgIdProps) => {
  const orgId = await getValidatedOrgFromParams({ params })
  await requireOrganizationWithOrg(orgId)
  const [orgResponse, planInfo, licenseResult] = await Promise.all([
    getOrgSettings(orgId),
    getUserPlan(),
    getLicense(),
  ])
  if (!orgResponse.ok) {
    return <ErrorCard message={orgResponse.error || "Something went wrong"} />
  }
  let isUltimate = planInfo.plan === "ULTIMATE"
  if (licenseResult !== null) {
    if (licenseResult.ok) {
      const license = licenseResult.data
      isUltimate = license.isActive && license.isUltimate
    } else {
      isUltimate = false
    }
  }
  return (
    <Settings
      orgData={orgResponse.data}
      plan={isUltimate ? "ULTIMATE" : planInfo.plan}
    />
  )
}

export default SettingsPage
