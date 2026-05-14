import { getOrgPlan } from "@/lib/server/organization/getUserPlan"
import { NextResponse } from "next/server"
import { db } from "@/db/drizzle"
import { eq } from "drizzle-orm"
import { organization } from "@/db/schema"
import { handleRoute } from "@/lib/handleRoute"

export const GET = handleRoute("Get Branding", async (_, { orgId }) => {
  const org = await db.query.organization.findFirst({
    where: eq(organization.id, orgId),
    columns: {
      id: true,
      showBranding: true,
    },
  })

  if (!org) {
    return NextResponse.json(
      { ok: false, toast: "Organization not found" },
      { status: 404 }
    )
  }

  const planInfo = await getOrgPlan(orgId)

  const isUltimate = planInfo.plan === "ULTIMATE"

  return NextResponse.json({
    ok: true,
    data: {
      showBranding: isUltimate ? org.showBranding : true,
    },
  })
})
