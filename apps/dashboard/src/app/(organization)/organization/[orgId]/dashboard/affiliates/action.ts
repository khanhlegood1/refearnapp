"use server"
import { handleAction } from "@/lib/handleAction"
import { getOrgAuth } from "@/lib/server/organization/GetOrgAuth"
import { inviteAffiliateService } from "@/lib/server/internal/inviteAffiliateService"

export const inviteAffiliateAction = async (data: {
  email: string
  message: string
  orgId: string
}) => {
  return handleAction("inviteAffiliateAction", async () => {
    await getOrgAuth(data.orgId)
    await inviteAffiliateService(data)
    return { ok: true, toast: "Affiliate invited successfully!" }
  })
}
