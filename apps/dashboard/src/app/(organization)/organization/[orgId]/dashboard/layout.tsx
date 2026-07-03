// app/dashboard/layout.tsx
import {
  SidebarProvider,
  SidebarInset,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import OrganizationDashboardSidebar from "@/components/OrganizationDashboardSidebar"
import { OrgIdProps } from "@/lib/types/organization/orgId"
import { getValidatedOrgFromParams } from "@/util/getValidatedOrgFromParams"
import { getUserPlan } from "@/lib/server/organization/getUserPlan"
import { requireOrganizationWithOrg } from "@/lib/server/auth/authGuards"
import { getUserOrgs } from "@/lib/server/organization/getUserOrgs"
import React from "react"
import { SubscriptionStatusBanner } from "@/components/ui-custom/SubscriptionStatusBanner"
import { getUserData } from "@/lib/server/organization/getUserProfile"
import { checkVersion } from "@/lib/server/organization/check-update"
import { SystemUpdate } from "@/components/ui-custom/SystemUpdate"
import { getLicense } from "@/lib/server/organization/getLicense"
import { EmailVerificationWrapper } from "@/components/ui-custom/EmailVerificationWrapper"
interface OrganizationDashboardLayoutProps extends OrgIdProps {
  children: React.ReactNode
}
export default async function DashboardLayout({
  children,
  params,
}: OrganizationDashboardLayoutProps) {
  const orgId = await getValidatedOrgFromParams({ params })
  const decoded = await requireOrganizationWithOrg(orgId)
  const plan = await getUserPlan()
  const orgs = await getUserOrgs(decoded.id)
  const userResponse = await getUserData()
  const user = userResponse.ok ? userResponse.data : null
  const isSelfHosted = process.env.NEXT_PUBLIC_SELF_HOSTED === "true"
  const updateResult = isSelfHosted ? await checkVersion() : null
  const updateInfo = updateResult?.ok ? updateResult.data : null
  const licenseResult = await getLicense()
  const licenseData = licenseResult?.ok ? licenseResult.data : null

  return (
    <SidebarProvider affiliate={false} orgId={orgId}>
      <OrganizationDashboardSidebar
        orgId={orgId}
        plan={plan}
        orgs={orgs}
        UserData={user}
        updateInfo={updateInfo}
        license={licenseData}
      />
      <SidebarInset className="relative flex w-full flex-1 flex-col bg-background overflow-auto">
        <div className="md:hidden px-6 pt-4">
          <SidebarTrigger />
        </div>
        <div className="py-6 px-6 w-full max-w-7xl mx-auto">
          <SystemUpdate variant="banner" updateInfo={updateInfo} />
          <EmailVerificationWrapper orgId={orgId} plan={plan} user={user} />
          <SubscriptionStatusBanner plan={plan} orgId={orgId} />
          {children}
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
