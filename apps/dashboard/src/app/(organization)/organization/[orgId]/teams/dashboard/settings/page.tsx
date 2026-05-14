import React from "react"
import Settings from "@/components/pages/Dashboard/Settings/Settings"
import { OrgIdProps } from "@/lib/types/organization/orgId"
import { getValidatedOrgFromParams } from "@/util/getValidatedOrgFromParams"
import { ErrorCard } from "@/components/ui-custom/ErrorCard"
import { requireTeamWithOrg } from "@/lib/server/auth/authGuards"
import { Metadata } from "next"
import { buildMetadata } from "@/util/BuildMetadata"
import { getTeamOrgSettings } from "@/lib/server/team/getTeamOrgSettings"
import { getOrgPlan } from "@/lib/server/organization/getUserPlan"
import { getLicense } from "@/lib/server/organization/getLicense"
export async function generateMetadata({
  params,
}: OrgIdProps): Promise<Metadata> {
  const orgId = await getValidatedOrgFromParams({ params })

  return buildMetadata({
    title: "RefearnApp | Teams Settings Page",
    description: "Teams Settings Page",
    url: `https://refearnapp.com/organization/${orgId}/teams/dashboard/settings`,
    indexable: false,
  })
}
const SettingsPage = async ({ params }: OrgIdProps) => {
  const orgId = await getValidatedOrgFromParams({ params })
  await requireTeamWithOrg(orgId)
  const [orgResponse, planInfo, licenseResult] = await Promise.all([
    getTeamOrgSettings(orgId),
    getOrgPlan(orgId),
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
      isTeam
    />
  )
}

export default SettingsPage
