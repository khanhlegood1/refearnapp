// @/app/affiliate/[orgId]/dashboard/referrals/AffiliateReferralsTable.tsx
"use client"

import React, { useMemo, useState, useEffect } from "react"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { TableView } from "@/components/ui-custom/TableView"
import { useQueryFilter } from "@/hooks/useQueryFilter"
import { useAppQuery } from "@/hooks/useAppQuery"
import { api } from "@/lib/apiClient"
import PaginationControls from "@/components/ui-custom/PaginationControls"
import { useAppTable } from "@/hooks/useAppTable"
import { AffiliateReferralColumns } from "./AffiliateReferralColumns"
import { useAtomValue } from "jotai"
import { previewSimulationAtom } from "@/store/PreviewSimulationAtom"
import { dashboardThemeCustomizationAtom } from "@/store/DashboardCustomizationAtom"
import { useDashboardCard } from "@/hooks/useDashboardCard"
import { getDummyReferrals } from "@/lib/types/analytics/dummyReferralData"
import { DashboardThemeCustomizationOptions } from "@/components/ui-custom/Customization/DashboardCustomization/DashboardThemeCustomizationOptions"
import { useVerifyAffiliateSession } from "@/hooks/useVerifyAffiliateSession"

export default function AffiliateReferralsTable({
  orgId,
  isPreview = false,
  affiliate = true,
}: {
  orgId: string
  isPreview?: boolean
  affiliate: boolean
}) {
  const { cardHeaderPrimaryTextColor } = useAtomValue(
    dashboardThemeCustomizationAtom
  )
  const previewSimulation = useAtomValue(previewSimulationAtom)
  const dashboardCardStyle = useDashboardCard(true)
  useVerifyAffiliateSession(orgId, affiliate)
  const { filters, setFilters } = useQueryFilter({})

  // Fake loading effect for preview pagination
  const [isFakeLoadingPreview, setIsFakeLoadingPreview] = useState(false)
  useEffect(() => {
    if (!isPreview) return
    setIsFakeLoadingPreview(true)
    const timer = setTimeout(() => setIsFakeLoadingPreview(false), 500)
    return () => clearTimeout(timer)
  }, [filters.offset, isPreview])

  // 1. Live Data Fetching (Disabled in preview)
  const {
    data: serverData,
    isPending,
    error,
  } = useAppQuery(
    ["affiliate-referrals", orgId, filters.offset],
    (id, query) => api.affiliate.dashboard.referrals([id, query]),
    [orgId, { offset: filters.offset }] as const,
    { enabled: !!orgId && !isPreview }
  )

  // 2. Data Processing (Live vs Dummy)
  const processedData = useMemo(() => {
    if (!isPreview) return serverData
    if (previewSimulation === "empty") return { rows: [], hasNext: false }

    const allDummy = getDummyReferrals()
    const PAGE_SIZE = 10
    const start = ((filters.offset ?? 1) - 1) * PAGE_SIZE
    const end = start + PAGE_SIZE

    return {
      rows: allDummy.slice(start, end),
      hasNext: allDummy.length > end,
    }
  }, [isPreview, serverData, filters.offset, previewSimulation])

  const columns = AffiliateReferralColumns
  const rows = processedData?.rows ?? []
  const hasNext = processedData?.hasNext ?? false

  const { table } = useAppTable({
    data: rows,
    columns,
    manualPagination: true,
  })

  return (
    <Card style={dashboardCardStyle} className="relative">
      <CardHeader>
        <CardTitle
          style={{ color: cardHeaderPrimaryTextColor || undefined }}
          className="flex items-center gap-2"
        >
          My Referrals
          {isPreview && (
            <DashboardThemeCustomizationOptions
              name="cardHeaderPrimaryTextColor"
              buttonSize="w-4 h-4"
            />
          )}
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Track your personal signups and earned commissions from your links.
        </p>
      </CardHeader>
      <CardContent>
        <TableView
          isPending={
            (isPending && !isPreview) ||
            (isPreview &&
              (isFakeLoadingPreview || previewSimulation === "loading"))
          }
          error={
            isPreview && previewSimulation === "error"
              ? "Simulated error fetching referrals."
              : error || undefined
          }
          table={table}
          affiliate={true}
          columns={columns}
          isPreview={isPreview}
          tableEmptyText="You haven't referred any users yet."
        />
        <PaginationControls
          offset={filters.offset ?? 1}
          tableDataLength={rows.length}
          hasNext={hasNext}
          setFilters={setFilters}
        />
      </CardContent>
    </Card>
  )
}
