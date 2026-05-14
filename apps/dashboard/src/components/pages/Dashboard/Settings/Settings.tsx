"use client"

import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card"
import deepEqual from "fast-deep-equal"
import { useForm } from "react-hook-form"
import { Form } from "@/components/ui/form"
import { zodResolver } from "@hookform/resolvers/zod"
import { MutationData } from "@/lib/types/organization/response"
import {
  BadgeDollarSign,
  Building2,
  Calendar,
  Clock,
  Coins,
  Globe,
  Link2,
  Percent,
  History,
  Target,
  Loader2,
  Lock,
  Users,
  FileText,
  Sparkles,
} from "lucide-react"
import { z } from "zod"

import { updateOrgSettings } from "@/app/(organization)/organization/[orgId]/dashboard/settings/action"
import { orgSettingsSchema } from "@/lib/schema/orgSettingSchema"
import React, { useEffect, useMemo } from "react"
import { InputField, TextareaField } from "@/components/Auth/FormFields"
import { SelectField } from "@/components/ui-custom/SelectFields"
import { LogoUpload } from "@/components/ui-custom/LogoUpload"
import { OrgData } from "@/lib/types/organization/organization"
import { useAppMutation } from "@/hooks/useAppMutation"
import { updateTeamOrgSettings } from "@/app/(organization)/organization/[orgId]/teams/dashboard/settings/action"
import { useVerifyTeamSession } from "@/hooks/useVerifyTeamSession"
import { FormSection } from "@/components/ui-custom/FormSection"
import { Button } from "@/components/ui/button"
import { SwitchField } from "@/components/ui-custom/SwitchField"

type OrgFormData = z.infer<typeof orgSettingsSchema>
type Props = {
  orgData: OrgData
  plan: string
  isTeam?: boolean
}

export default function Settings({ orgData, plan, isTeam = false }: Props) {
  useVerifyTeamSession(orgData.id, isTeam)
  const safeDefaults: OrgFormData = useMemo(
    () => ({
      id: orgData?.id ?? "",
      name: orgData?.name ?? "",
      websiteUrl: orgData?.websiteUrl ?? "",
      logoUrl: orgData?.logoUrl ?? null,
      description: orgData?.description ?? "",
      openGraphUrl: orgData?.openGraphUrl ?? "",
      referralParam: (orgData?.referralParam as "ref" | "via" | "aff") ?? "ref",
      cookieLifetimeValue: String(orgData?.cookieLifetimeValue ?? "30"),
      cookieLifetimeUnit:
        (orgData?.cookieLifetimeUnit as "day" | "week" | "month" | "year") ??
        "day",
      commissionType:
        (orgData?.commissionType?.toUpperCase() as "PERCENTAGE" | "FLAT_FEE") ??
        "PERCENTAGE",
      commissionValue: String(Number(orgData.commissionValue ?? 0)),
      commissionDurationValue: String(orgData?.commissionDurationValue ?? "30"),
      commissionDurationUnit:
        (orgData?.commissionDurationUnit as
          | "day"
          | "week"
          | "month"
          | "year") ?? "day",
      currency:
        (orgData?.currency as "USD" | "EUR" | "GBP" | "CAD" | "AUD") ?? "USD",
      supportEmail: orgData?.supportEmail ?? "",
      attributionModel:
        (orgData?.attributionModel as "FIRST_CLICK" | "LAST_CLICK") ??
        "LAST_CLICK",
      isPrivate: orgData?.isPrivate ?? false,
      programType:
        (orgData?.programType as "open" | "invite_only" | "application") ??
        "open",
      minimumPayoutThreshold: String(
        Number(orgData?.minimumPayoutThreshold ?? 0)
      ),
      holdPeriodDays: String(orgData?.holdPeriodDays ?? 45),
      showBranding: orgData?.showBranding ?? true,
    }),
    [orgData]
  )

  const form = useForm<OrgFormData>({
    resolver: zodResolver(orgSettingsSchema),
    defaultValues: safeDefaults,
  })
  useEffect(() => {
    const subscription = form.watch((value, { name }) => {
      if (name === "programType") {
        form.setValue("isPrivate", value.programType !== "open")
      }
    })
    return () => subscription.unsubscribe()
  }, [form])
  const currentValues = form.watch()
  const updateFn = isTeam ? updateTeamOrgSettings : updateOrgSettings
  const mut = useAppMutation<MutationData, Partial<OrgData> & { id: string }>(
    async (data) => updateFn(data),
    {
      affiliate: false,
      onSuccess: (res) => {
        if (res.ok) {
          form.reset(form.getValues())
        }
      },
    }
  )
  const isFormUnchanged = useMemo(() => {
    return deepEqual(currentValues, safeDefaults)
  }, [currentValues, safeDefaults])
  const onSubmit = (data: OrgFormData) => {
    const changed = (Object.keys(data) as (keyof OrgData)[]).reduce(
      (acc, key) => {
        if (!deepEqual(data[key], safeDefaults[key])) {
          acc[key] = data[key] as any
        }
        return acc
      },
      {} as Partial<OrgData>
    )
    if (Object.keys(changed).length === 0) return

    mut.mutate({ id: data.id, ...changed })
  }
  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <div>
            <h1 className="text-3xl font-bold">Organization Settings</h1>
            <p className="text-muted-foreground">
              Manage your affiliate setup and configuration
            </p>
          </div>
        </div>
      </div>

      {/* Settings Form */}
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="fixed top-4 left-0 right-0 z-50 flex justify-end mb-6">
            <div className="bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border rounded-xl p-3 shadow-lg flex items-center gap-4 px-6 min-w-[320px]">
              <div className="flex-1">
                <p className="text-xs font-medium text-muted-foreground">
                  {form.formState.isDirty
                    ? "You have unsaved changes"
                    : "Settings are up to date"}
                </p>
              </div>
              <div className="flex gap-2">
                {form.formState.isDirty && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      form.reset(safeDefaults)
                    }}
                  >
                    Reset
                  </Button>
                )}
                <Button
                  type="submit"
                  size="sm"
                  disabled={mut.isPending || isFormUnchanged}
                  className="min-w-[120px]"
                >
                  {mut.isPending ? (
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  ) : (
                    <FileText className="w-4 h-4 mr-2" />
                  )}
                  Save Changes
                </Button>
              </div>
            </div>
          </div>
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <InputField
                  control={form.control}
                  name="name"
                  label="Company Name"
                  placeholder="Enter your name"
                  type="text"
                  icon={Building2}
                  affiliate={false}
                />{" "}
                <InputField
                  control={form.control}
                  name="websiteUrl"
                  label="Website URL"
                  placeholder="Enter your Domain"
                  type="text"
                  icon={Globe}
                  affiliate={false}
                />
                <InputField
                  control={form.control}
                  name="supportEmail"
                  label="Support Email"
                  placeholder="support@company.com"
                  type="email"
                  icon={Globe}
                  affiliate={false}
                />
                <SelectField
                  control={form.control}
                  name="attributionModel"
                  label="attribution model"
                  placeholder="attribution model"
                  options={[
                    { value: "FIRST_CLICK", label: "first_click" },
                    { value: "LAST_CLICK", label: "last_click" },
                  ]}
                  icon={
                    form.watch("attributionModel") === "FIRST_CLICK"
                      ? Target
                      : History
                  }
                  affiliate={false}
                />
                <SelectField
                  control={form.control}
                  name="referralParam"
                  label="Referral Parameter"
                  placeholder="Referral Parameter"
                  options={[
                    { value: "ref", label: "ref" },
                    { value: "via", label: "via" },
                    { value: "aff", label: "aff" },
                  ]}
                  icon={Link2}
                  affiliate={false}
                />
              </div>
              <div className="w-full">
                <TextareaField
                  control={form.control}
                  name="description"
                  label="Description"
                  placeholder="Enter your company description"
                  rows={5}
                  affiliate={false}
                />
              </div>
              <div className="flex justify-start">
                <LogoUpload
                  value={form.watch("openGraphUrl") || null}
                  onChange={(url) => form.setValue("openGraphUrl", url || "")}
                  affiliate={false}
                  orgId={orgData.id}
                  orgName={orgData.name}
                  field="openGraphUrl"
                  uploadId="Org-OpenGraph-Image"
                  className="w-[200px] h-[105px] rounded-md"
                  sharp={true}
                  uploadButtonLabel="OpenGraph Image"
                  dialogTitle="Uploading OG Image"
                  dialogDescription="Converting & optimizing your image… Please wait."
                />
              </div>
              <div className="flex justify-start">
                <LogoUpload
                  value={form.watch("logoUrl") || null}
                  onChange={(url) => form.setValue("logoUrl", url || "")}
                  affiliate={false}
                  orgId={orgData.id}
                  orgName={orgData.name}
                />
              </div>
            </CardContent>
          </Card>

          {/* Tracking and Commission Card */}
          <Card>
            <CardHeader>
              <CardTitle>Tracking and Commission</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormSection title="Cookie Lifetime Settings" borderTop>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <InputField
                    control={form.control}
                    name="cookieLifetimeValue"
                    label="Cookie Lifetime"
                    placeholder="Cookie Lifetime"
                    type="number"
                    icon={Clock}
                    affiliate={false}
                  />
                  <SelectField
                    control={form.control}
                    name="cookieLifetimeUnit"
                    label="Cookie Lifetime Unit"
                    placeholder="Cookie Lifetime Unit"
                    options={[
                      { value: "day", label: "Day" },
                      { value: "week", label: "Week" },
                      { value: "month", label: "Month" },
                      { value: "year", label: "Year" },
                    ]}
                    icon={Calendar}
                    affiliate={false}
                  />
                </div>
              </FormSection>
              <FormSection title="Commission Settings" borderTop>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <SelectField
                    control={form.control}
                    name="commissionType"
                    label="Commission Type"
                    placeholder="Commission Type"
                    options={[
                      { value: "PERCENTAGE", label: "Percentage" },
                      { value: "FLAT_FEE", label: "Flat Fee" },
                    ]}
                    icon={Coins}
                    affiliate={false}
                  />
                  <InputField
                    control={form.control}
                    name="commissionValue"
                    label="Commission Value"
                    placeholder="Commission Value"
                    type="number"
                    icon={
                      form.watch("commissionType") === "PERCENTAGE"
                        ? Percent
                        : BadgeDollarSign
                    }
                    affiliate={false}
                  />
                  {/*<InputField*/}
                  {/*  control={form.control}*/}
                  {/*  name="holdPeriodDays"*/}
                  {/*  label="Hold Period (Days)"*/}
                  {/*  placeholder="Hold Period (Days)"*/}
                  {/*  type="number"*/}
                  {/*  icon={Clock}*/}
                  {/*  affiliate={false}*/}
                  {/*/>*/}
                  {/*<InputField*/}
                  {/*  control={form.control}*/}
                  {/*  name="minimumPayoutThreshold"*/}
                  {/*  label="Min Payout Threshold"*/}
                  {/*  placeholder="Minimum Payout Threshold"*/}
                  {/*  type="number"*/}
                  {/*  icon={DollarSign}*/}
                  {/*  affiliate={false}*/}
                  {/*/>*/}
                </div>
              </FormSection>
              <FormSection title="Commission Duration" borderTop borderBottom>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <InputField
                    control={form.control}
                    name="commissionDurationValue"
                    label="Commission Duration"
                    placeholder="Commission Duration"
                    type="number"
                    icon={Calendar}
                    affiliate={false}
                  />
                  <SelectField
                    control={form.control}
                    name="commissionDurationUnit"
                    label="Duration Unit"
                    placeholder="Duration Unit"
                    options={[
                      { value: "day", label: "Day" },
                      { value: "week", label: "Week" },
                      { value: "month", label: "Month" },
                      { value: "year", label: "Year" },
                    ]}
                    icon={Calendar}
                    affiliate={false}
                  />
                </div>
              </FormSection>
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                <SelectField
                  control={form.control}
                  name="currency"
                  label="Currency"
                  placeholder="Currency"
                  options={[
                    { value: "USD", label: "USD" },
                    { value: "EUR", label: "EUR" },
                    { value: "GBP", label: "GBP" },
                    { value: "CAD", label: "CAD" },
                    { value: "AUD", label: "AUD" },
                  ]}
                  icon={BadgeDollarSign}
                  affiliate={false}
                />
              </div>
            </CardContent>
          </Card>

          {/* Program Access */}
          <Card>
            <CardHeader>
              <CardTitle>Program Access</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormSection title="Join Policy" borderTop>
                {/* Changed to a vertical flex container with spacing */}
                <div className="flex flex-col gap-2 max-w-md">
                  <SelectField
                    control={form.control}
                    name="programType"
                    label="Registration Method"
                    options={[
                      { value: "open", label: "Open — Anyone can join" },
                      {
                        value: "invite_only",
                        label: "Invite Only — Manual link only",
                      },
                      {
                        value: "application",
                        label: "Application — Approval required",
                      },
                    ]}
                    icon={form.watch("programType") === "open" ? Users : Lock}
                    affiliate={false}
                  />
                  {/* The text now naturally sits below the input */}
                  <p className="text-xs text-muted-foreground italic px-1">
                    {form.watch("programType") === "open"
                      ? "Program is visible to all potential affiliates."
                      : "Program is private. Affiliates need a specific invite or approval."}
                  </p>
                </div>
              </FormSection>
            </CardContent>
          </Card>

          {/*White-labeling*/}
          <Card className="overflow-hidden border-primary/20">
            <CardHeader className="bg-primary/5 py-4">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-primary" />
                <CardTitle className="text-lg">
                  Branding & White-labeling
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              <SwitchField
                control={form.control}
                name="showBranding"
                label="Show 'Powered by RefearnApp'"
                description="Display a small, professional link on your affiliate authentication pages. Keeping this enabled helps support the platform!"
                disabled={plan !== "ULTIMATE"}
                premiumBadge="Ultimate Feature"
              />
            </CardContent>
          </Card>
        </form>
      </Form>
    </div>
  )
}
