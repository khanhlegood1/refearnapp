// hooks/useVerifyAffiliateSession.ts
"use client"

import { useEffect } from "react"
import { useAppQuery } from "@/hooks/useAppQuery"
import { verifyAndDeleteAffiliateSessionAction } from "@/lib/server/affiliate/verifyAndDeleteAffiliateSessionAction"

export function useVerifyAffiliateSession(orgId: string, affiliate: boolean) {
  const query = useAppQuery(
    ["verify-affiliate-session", orgId],
    verifyAndDeleteAffiliateSessionAction,
    [orgId],
    {
      enabled: !!orgId && affiliate,
    }
  )

  useEffect(() => {
    if (affiliate && query.error) {
      window.location.href = `/affiliate/${orgId}/login`
    }
  }, [query.error, orgId, affiliate])

  return query
}
