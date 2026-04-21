"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useRouter } from "next/navigation"

import { Form } from "@/components/ui/form"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  BadgeDollarSign,
  Building2,
  Calendar,
  Clock,
  Coins,
  Globe,
  Link2,
  Loader2,
  Lock,
  Percent,
  Users,
} from "lucide-react"
import { CreateOrganization } from "@/app/(organization)/(auth)/create-company/action"
import { InputField } from "@/components/Auth/FormFields"
import { SelectField } from "@/components/ui-custom/SelectFields"
import { LogoUpload } from "@/components/ui-custom/LogoUpload"
import { DomainInputField } from "@/components/ui-custom/DomainInputField"
import React, { useMemo, useState } from "react"
import { CompanyFormValues, companySchema } from "@/lib/schema/companySchema"
import { useCustomToast } from "@/components/ui-custom/ShowCustomToast"
import { useCachedValidation } from "@/hooks/useCachedValidation"
import { useAppMutation } from "@/hooks/useAppMutation"
import { FormSection } from "@/components/ui-custom/FormSection"

type CreateCompanyProps = {
  mode: "create" | "add"
  embed?: boolean
}
const CreateCompany = ({ mode, embed }: CreateCompanyProps) => {
  const [domainType, setDomainType] = useState<
    "platform" | "custom-main" | "custom-subdomain" | null
  >(null)
  const { showCustomToast } = useCustomToast()
  const createCompanySchema = useMemo(
    () => companySchema(domainType),
    [domainType]
  )
  const form = useForm<CompanyFormValues>({
    resolver: zodResolver(createCompanySchema),
    defaultValues: {
      name: "",
      websiteUrl: "",
      logoUrl: "",
      referralParam: "ref",
      cookieLifetimeValue: 30,
      cookieLifetimeUnit: "day",
      commissionType: "percentage",
      commissionValue: 10,
      commissionDurationValue: 30,
      commissionDurationUnit: "day",
      currency: "USD",
      programType: "open",
      defaultDomain: "",
    },
  })
  const commissionType = form.watch("commissionType")
  const router = useRouter()
  const domainCache = useCachedValidation({
    id: "createCompany-domain",
    affiliate: false,
    showError: (msg) =>
      showCustomToast({
        type: "error",
        title: "Failed",
        description: msg,
        affiliate: false,
      }),
    errorMessage: "This domain is already linked to another organization.",
    maxCacheSize: 10,
  })
  const { mutate, isPending } = useAppMutation(CreateOrganization, {
    onSuccess: (res: any) => {
      if (res.ok && res.data?.id) {
        router.push(`/organization/${res.data.id}/dashboard/analytics`)
      } else {
        domainCache.addFailedValue(res.data)
      }
    },
  })

  const onSubmit = (data: CompanyFormValues) => {
    // 1. Clean the user input (strip protocol and www)
    let userInput = data.defaultDomain
      .trim()
      .toLowerCase()
      .replace(/^https?:\/\//, "")
      .replace(/^www\./, "")
      .split("/")[0]

    // 2. Clean the App Domain from ENV
    const rawAppDomain = process.env.NEXT_PUBLIC_APP_DOMAIN || "refearnapp.com"
    const cleanAppDomain = rawAppDomain
      .replace(/^https?:\/\//, "")
      .replace(/^www\./, "")
      .split("/")[0]

    // 3. Construct the final domain
    // If user entered "acme", make it "acme.voteflow.xyz"
    // If user entered "acme.com", keep it "acme.com"
    let finalDomain = userInput
    if (!userInput.includes(".")) {
      finalDomain = `${userInput}.${cleanAppDomain}`
    }

    // 4. Cache & Mutation
    if (
      domainCache.shouldSkip(
        finalDomain,
        `Domain name "${finalDomain}" already exists. Please choose another one.`
      )
    ) {
      return
    }

    mutate({ ...data, defaultDomain: finalDomain, mode })
  }
  const formContent = (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <InputField
            control={form.control}
            name="name"
            label="Company Name"
            placeholder="Acme Inc"
            type="text"
            icon={Building2}
            affiliate={false}
          />
          <InputField
            control={form.control}
            name="websiteUrl"
            label="Website URL"
            placeholder="example.com"
            type="text"
            icon={Globe}
            affiliate={false}
          />
          <LogoUpload
            value={form.watch("logoUrl") || null}
            onChange={(url) => {
              form.setValue("logoUrl", url || "")
            }}
            affiliate={false}
          />

          <SelectField
            control={form.control}
            name="referralParam"
            label="Referral URL Parameter"
            placeholder="Select referral param"
            options={[
              { value: "ref", label: "ref" },
              { value: "via", label: "via" },
              { value: "aff", label: "aff" },
            ]}
            icon={Link2}
            affiliate={false}
          />
        </div>

        <FormSection title="Cookie Lifetime Settings" borderTop>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <InputField
              control={form.control}
              name="cookieLifetimeValue"
              label="Cookie Lifetime"
              type="number"
              placeholder="30"
              icon={Clock}
              affiliate={false}
            />
            <SelectField
              control={form.control}
              name="cookieLifetimeUnit"
              label="Unit"
              placeholder="Select unit"
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
              placeholder="Select type"
              options={[
                { value: "percentage", label: "Percentage" },
                { value: "fixed", label: "Fixed" },
              ]}
              icon={Coins}
              affiliate={false}
            />
            <InputField
              control={form.control}
              name="commissionValue"
              label="Commission Value"
              type="number"
              placeholder="10"
              icon={commissionType === "percentage" ? Percent : BadgeDollarSign}
              affiliate={false}
            />
          </div>
        </FormSection>
        <FormSection title="Commission Duration" borderTop borderBottom>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <InputField
              control={form.control}
              name="commissionDurationValue"
              label="Commission Duration Value"
              type="number"
              placeholder="30"
              icon={Calendar}
              affiliate={false}
            />
            <SelectField
              control={form.control}
              name="commissionDurationUnit"
              label="Duration Unit"
              placeholder="Select unit"
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
        <SelectField
          control={form.control}
          name="currency"
          label="Currency"
          placeholder="Select currency"
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
        {/* --- ADDED SECTION --- */}
        <FormSection title="Program Privacy" borderTop>
          <div className="flex flex-col gap-2">
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
            <p className="text-xs text-muted-foreground italic px-1">
              {form.watch("programType") === "open"
                ? "Your program will be visible to everyone."
                : "Your program will be private and require manual approval/invites."}
            </p>
          </div>
        </FormSection>
        <DomainInputField
          control={form.control}
          form={form}
          onDomainTypeChange={setDomainType}
          createMode
        />
        <Button type="submit" className="w-full" disabled={isPending}>
          {isPending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            "Create Company"
          )}
        </Button>
      </form>
    </Form>
  )
  if (embed) {
    return (
      <div className="p-4">
        <h2 className="text-xl font-semibold mb-4">Create Your Company</h2>
        {formContent}
      </div>
    )
  }
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        <Card className="border-none shadow-lg">
          <CardHeader>
            <CardTitle className="text-2xl text-center">
              Create Your Company
            </CardTitle>
          </CardHeader>
          <CardContent>{formContent}</CardContent>
        </Card>
      </div>
    </div>
  )
}
export default CreateCompany
