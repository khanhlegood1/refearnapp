"use server"
import { handleAction } from "@/lib/handleAction"
import { getTeamAuthAction } from "@/lib/server/team/getTeamAuthAction"
import { inviteAffiliateService } from "@/lib/server/internal/inviteAffiliateService"

export const inviteTeamAffiliateAction = async (data: {
  email: string
  message: string
  orgId: string
}) => {
  return handleAction("inviteTeamAffiliateAction", async () => {
    await getTeamAuthAction(data.orgId)
    await inviteAffiliateService(data)
    return { ok: true, toast: "Affiliate invited successfully!" }
  })
}
