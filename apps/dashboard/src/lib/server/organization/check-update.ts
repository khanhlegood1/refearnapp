// lib/util/check-updates.ts
import { db } from "@/db/drizzle"
import { systemSettings } from "@/db/schema"
import { handleAction } from "@/lib/handleAction"
import { AppError } from "@/lib/exceptions"
import { ActionResult } from "@/lib/types/organization/response"
import { eq } from "drizzle-orm"

export type UpdateInfo = {
  isNewer: boolean
  latestVersion: string
  url: string
  changelog: string
  installedVersion: string
}

export async function checkVersion(): Promise<ActionResult<UpdateInfo>> {
  return handleAction("Check GitHub Version", async () => {
    // 1. Get current version from DB (The "Truth")
    const settings = await db
      .select()
      .from(systemSettings)
      .where(eq(systemSettings.id, 1))
      .limit(1)
    const installedVersion = settings[0]?.installedVersion || "0.1.0"

    const REPO = "ZAK123DSFDF/refearnapp"
    const res = await fetch(
      `https://api.github.com/repos/${REPO}/releases/latest`,
      { next: { revalidate: 3600 } }
    )

    if (!res.ok) {
      throw new AppError({
        status: res.status,
        toast: "Could not fetch latest version from GitHub",
      })
    }

    const data = await res.json()
    const latestVersion = data.tag_name.replace("v", "")

    const latest = latestVersion.split(".").map(Number)
    const installed = installedVersion.split(".").map(Number)

    let isNewer = false
    for (let i = 0; i < 3; i++) {
      if (latest[i] > (installed[i] || 0)) {
        isNewer = true
        break
      }
      if (latest[i] < (installed[i] || 0)) {
        isNewer = false
        break
      }
    }

    return {
      ok: true,
      data: {
        isNewer,
        latestVersion,
        url: data.html_url,
        changelog: data.body,
        installedVersion,
      },
    }
  })
}
