import { useAppQuery } from "@/hooks/useAppQuery"
import { api } from "@/lib/apiClient"

export function useBrandingPreference(
  orgId: string | undefined,
  affiliate: boolean
) {
  const { data, isPending } = useAppQuery(
    ["branding-pref", orgId],
    (id: string) => api.organization.branding.get([id]),
    [orgId as string],
    {
      enabled: !!orgId && affiliate,
      staleTime: 10 * 60 * 1000,
    }
  )

  return {
    showBranding: data?.showBranding ?? true,
    isLoading: isPending,
  }
}
