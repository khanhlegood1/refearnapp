"use client"

import React, { useState, useMemo, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { TableView } from "@/components/ui-custom/TableView"
import { TableTop } from "@/components/ui-custom/TableTop"
import { AppDialog } from "@/components/ui-custom/AppDialog"
import { affiliateCouponColumns } from "./affiliateCouponColumns"
import { AffiliateCouponDetails } from "@/components/ui-custom/AffiliateCouponDetails"
import { useAppTable } from "@/hooks/useAppTable"
import { useAppQuery } from "@/hooks/useAppQuery"
import { useQueryFilter } from "@/hooks/useQueryFilter"
import { api } from "@/lib/apiClient"
import PaginationControls from "@/components/ui-custom/PaginationControls"
import { AffiliateCouponData } from "@/lib/types/affiliate/affiliateCouponData"
import { useCustomToast } from "@/components/ui-custom/ShowCustomToast"
import { useAppMutation } from "@/hooks/useAppMutation"
import { markCouponAsSeenAction } from "@/app/affiliate/[orgId]/dashboard/coupons/action"
import { useRouter } from "next/navigation"
import { useQueryClient } from "@tanstack/react-query"
import { getDummyCoupons } from "@/lib/types/analytics/dummyCouponData"
import { useAtomValue } from "jotai"
import { dashboardThemeCustomizationAtom } from "@/store/DashboardCustomizationAtom"
import { useDashboardCard } from "@/hooks/useDashboardCard"
import { DashboardThemeCustomizationOptions } from "@/components/ui-custom/Customization/DashboardCustomization/DashboardThemeCustomizationOptions"
import { DashboardCardCustomizationOptions } from "@/components/ui-custom/Customization/DashboardCustomization/DashboardCardCustomizationOptions"
import { TableCustomizationOptions } from "@/components/ui-custom/Customization/DashboardCustomization/TableCustomizationOptions"
import { previewSimulationAtom } from "@/store/PreviewSimulationAtom"
import { showNotificationAtom } from "@/store/ShowNotificationAtom"
import { useVerifyAffiliateSession } from "@/hooks/useVerifyAffiliateSession"

export default function AffiliateCouponsTable({
  orgId,
  isPreview = false,
  affiliate = true,
}: {
  orgId: string
  isPreview?: boolean
  affiliate: boolean
}) {
  const {
    dashboardHeaderDescColor,
    dashboardHeaderNameColor,
    cardHeaderPrimaryTextColor,
  } = useAtomValue(dashboardThemeCustomizationAtom)
  useVerifyAffiliateSession(orgId, affiliate)
  const previewSimulation = useAtomValue(previewSimulationAtom)
  const dashboardCardStyle = useDashboardCard(true) // Always true for affiliate dashboard
  const showNotificationSwitch = useAtomValue(showNotificationAtom)
  const [selectedCoupon, setSelectedCoupon] =
    useState<AffiliateCouponData | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const { showCustomToast } = useCustomToast()
  const { filters, setFilters } = useQueryFilter({ emailKey: "code" })
  const router = useRouter()
  const queryClient = useQueryClient()

  // Simulate loading state for preview when filtering
  const [isFakeLoadingPreview, setIsFakeLoadingPreview] = useState(false)
  useEffect(() => {
    if (!isPreview) return
    setIsFakeLoadingPreview(true)
    const timer = setTimeout(() => setIsFakeLoadingPreview(false), 800)
    return () => clearTimeout(timer)
  }, [filters.offset, filters.email, isPreview])

  // 1. Live Data Fetching
  const {
    data: serverData,
    isPending,
    error,
  } = useAppQuery(
    ["affiliate-coupons", orgId, filters.offset, filters.email],
    (id, query) => api.affiliate.dashboard.coupons([id, query]),
    [orgId, { offset: filters.offset, code: filters.email }] as const,
    { enabled: !!orgId && !isPreview }
  )

  // 2. Dummy Data Logic (Search + Pagination)
  const processedData = useMemo(() => {
    if (!isPreview) return serverData
    if (previewSimulation === "empty") return { rows: [], hasNext: false }

    const allDummy = getDummyCoupons()
    const PAGE_SIZE = 10
    const searchFilter = filters.email?.toLowerCase() ?? ""

    const filtered = allDummy.filter(
      (c) => !searchFilter || c.code.toLowerCase().includes(searchFilter)
    )

    const currentOffset = filters.offset ?? 1
    const start = (currentOffset - 1) * PAGE_SIZE
    const end = start + PAGE_SIZE

    return {
      rows: filtered.slice(start, end),
      hasNext: filtered.length > end,
    }
  }, [isPreview, serverData, filters.email, filters.offset, previewSimulation])

  const { mutate: markAsSeen } = useAppMutation(
    ({ couponId }: { couponId: string }) =>
      markCouponAsSeenAction({ orgId, couponId }),
    {
      affiliate: true,
      disableSuccessToast: true,
      onSuccess: (res) => {
        if (res.ok && !isPreview) {
          router.refresh()
          queryClient
            .invalidateQueries({
              queryKey: ["affiliate-coupons", orgId],
            })
            .then(() =>
              console.log(
                "Affiliate coupons query invalidated after marking as seen"
              )
            )
        }
      },
    }
  )

  const handleDetailsClick = (coupon: AffiliateCouponData) => {
    setSelectedCoupon(coupon)
    setIsDialogOpen(true)
    if (!coupon.isSeenByAffiliate && !isPreview) {
      markAsSeen({ couponId: coupon.id })
    }
  }

  const effectiveShowNotification = isPreview ? showNotificationSwitch : true

  const columns = useMemo(
    () =>
      affiliateCouponColumns(
        handleDetailsClick,
        showCustomToast,
        effectiveShowNotification
      ),
    [handleDetailsClick, showCustomToast, effectiveShowNotification]
  )
  const rows = processedData?.rows ?? []
  const hasNext = processedData?.hasNext ?? false

  const { table } = useAppTable({
    data: rows,
    columns,
    manualPagination: true,
  })

  return (
    <div className="flex flex-col gap-6">
      {/* Header Section */}
      <div>
        <div className="flex flex-row gap-2 items-center">
          <h1
            className="text-3xl font-bold"
            style={{ color: dashboardHeaderNameColor || undefined }}
          >
            Promotion Codes
          </h1>
          {isPreview && (
            <DashboardThemeCustomizationOptions
              name="dashboardHeaderNameColor"
              buttonSize="w-4 h-4"
            />
          )}
        </div>
        <div className="flex flex-row gap-2 items-center">
          <p
            className="text-muted-foreground text-sm"
            style={{ color: dashboardHeaderDescColor || undefined }}
          >
            Share these exclusive discounts with your audience and earn rewards.
          </p>
          {isPreview && (
            <DashboardThemeCustomizationOptions
              name="dashboardHeaderDescColor"
              buttonSize="w-4 h-4"
            />
          )}
        </div>
      </div>

      {/* Main Table Container */}
      <Card className="relative" style={dashboardCardStyle}>
        {isPreview && (
          <div className="absolute bottom-0 left-0 p-2">
            <DashboardCardCustomizationOptions
              triggerSize="w-6 h-6"
              dropdownSize="w-[150px]"
            />
          </div>
        )}
        {isPreview && (
          <div className="absolute bottom-0 right-0 p-2">
            <TableCustomizationOptions triggerSize="w-6 h-6" />
          </div>
        )}

        <CardHeader>
          <CardTitle
            style={{ color: cardHeaderPrimaryTextColor || undefined }}
            className="text-lg"
          >
            <div className="flex flex-row items-center gap-2">
              Available Coupons
              {isPreview && (
                <DashboardThemeCustomizationOptions
                  name="cardHeaderPrimaryTextColor"
                  buttonSize="w-4 h-4"
                />
              )}
            </div>
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-4">
          <TableTop
            filters={{ email: filters.email ?? undefined }}
            onEmailChange={(val) =>
              setFilters({ email: val || undefined, offset: 1 })
            }
            onOrderChange={() => {}}
            affiliate={true}
            table={table}
            hideOrder={true}
            placeholder="Search by code..."
          />

          <TableView
            isPending={
              (isPending && !isPreview) ||
              (isPreview &&
                (isFakeLoadingPreview || previewSimulation === "loading"))
            }
            error={
              isPreview && previewSimulation === "error"
                ? "Simulated error fetching coupons."
                : error || undefined
            }
            table={table}
            columns={columns}
            affiliate={true}
            isPreview={isPreview}
            tableEmptyText="No coupons assigned to you yet."
          />

          <PaginationControls
            offset={filters.offset ?? 1}
            tableDataLength={rows.length}
            hasNext={hasNext}
            setFilters={setFilters}
          />
        </CardContent>
      </Card>

      <AppDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        title="Coupon Details"
        description="Review reward and sharing strategy."
        affiliate={true}
        showFooter={false}
      >
        {selectedCoupon && <AffiliateCouponDetails coupon={selectedCoupon} />}
      </AppDialog>
    </div>
  )
}
