"use client"
import React, { useState } from "react"
import { Globe, Megaphone, ArrowRight, Loader2, UserPlus } from "lucide-react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Form } from "@/components/ui/form"
import { InputField, TextareaField } from "@/components/Auth/FormFields"
import { useAuthCard } from "@/hooks/useAuthCard"
import { useAtomValue } from "jotai"
import {
  buttonCustomizationAtom,
  notesCustomizationAtom,
  themeCustomizationAtom,
} from "@/store/AuthCustomizationAtom"
import { registrationSettingsAtom } from "@/store/RegistrationSettingsAtom"
import { CardCustomizationOptions } from "@/components/ui-custom/Customization/AuthCustomization/CardCustomizationOptions"
import { InputCustomizationOptions } from "@/components/ui-custom/Customization/AuthCustomization/InputCustomizationOptions"
import { ButtonCustomizationOptions } from "@/components/ui-custom/Customization/AuthCustomization/ButtonCustomizationOptions"
import { ThemeCustomizationOptions } from "@/components/ui-custom/Customization/AuthCustomization/ThemeCustomizationOptions"
import { InlineNotesEditor } from "@/components/ui-custom/InlineEditor"
import { IsRichTextEmpty } from "@/util/IsRichTextEmpty"
import { OrgHeader } from "@/components/ui-custom/OrgHeader"
import { useContrastColor } from "@/hooks/useContrastColor"
import { PoweredByBranding } from "@/components/ui-custom/PoweredByBranding"
import { PROMOTION_METHODS } from "@/lib/constants"
import { z } from "zod"
import { useAppMutation } from "@/hooks/useAppMutation"
import { completeAffiliateOnboardingAction } from "@/app/affiliate/[orgId]/(auth)/onboarding/action"
import { MultiSelectField } from "@/components/ui-custom/MultiSelectField"
import { useQueryClient } from "@tanstack/react-query"
import { useBrandingPreference } from "@/hooks/useBrandingPreference"

const onboardingSchema = z.object({
  websiteUrl: z.string().url("Invalid URL").optional().or(z.literal("")),
  promotionMethod: z
    .array(z.string())
    .min(1, "Select at least one method")
    .default([]),
  promotionDetails: z.string().optional(),
  socialHandle: z.string().optional(),
})

type OnboardingValues = z.infer<typeof onboardingSchema>

type Props = {
  orgId: string
  affiliate: boolean
  isPreview?: boolean
}

const AffiliateOnboarding = ({
  orgId,
  affiliate,
  isPreview = false,
}: Props) => {
  const [previewLoading, setPreviewLoading] = useState(false)
  const regSettings = useAtomValue(registrationSettingsAtom)
  const queryClient = useQueryClient()
  const mutation = useAppMutation(
    async (values: OnboardingValues) => {
      return completeAffiliateOnboardingAction(orgId, values)
    },
    {
      affiliate: true,
      enableRedirect: true,
      onSuccess: () => {
        queryClient
          .invalidateQueries({
            queryKey: ["verify-affiliate-session", orgId],
          })
          .then(() => console.log("invalidated"))
      },
    }
  )
  const { backgroundColor } = useAtomValue(themeCustomizationAtom)
  const {
    buttonDisabledTextColor,
    buttonBackgroundColor,
    buttonDisabledBackgroundColor,
    buttonTextColor,
  } = useAtomValue(buttonCustomizationAtom)

  const { customNotesOnboarding } = useAtomValue(notesCustomizationAtom)
  const authCardStyle = useAuthCard(affiliate)
  const textColor = useContrastColor(backgroundColor)

  const form = useForm<OnboardingValues>({
    resolver: zodResolver(onboardingSchema),
    defaultValues: {
      websiteUrl: "",
      promotionMethod: [],
      promotionDetails: "",
      socialHandle: "",
    },
  })

  const promotionOptions = PROMOTION_METHODS.map((m) => ({
    value: m,
    label: m
      .split("_")
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(" "),
  }))

  const isLoading = isPreview ? previewLoading : mutation.isPending
  const { showBranding, isLoading: brandingLoading } = useBrandingPreference(
    orgId,
    affiliate
  )
  const onSubmit = async (data: OnboardingValues) => {
    if (isPreview) {
      setPreviewLoading(true)
      await new Promise((res) => setTimeout(res, 1500))
      setPreviewLoading(false)
      console.log("Preview Submit:", data)
      return
    }
    mutation.mutate(data)
  }

  return (
    <div
      className={`relative min-h-screen flex items-center justify-center p-4 ${
        affiliate && backgroundColor
          ? ""
          : "bg-gradient-to-b from-background to-background/80"
      }`}
      style={{ backgroundColor: (affiliate && backgroundColor) || undefined }}
    >
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <OrgHeader
            orgId={orgId}
            affiliate={affiliate}
            isPreview={isPreview}
          />
        </div>

        <Card
          className="relative transition-shadow duration-300"
          style={authCardStyle}
        >
          <CardHeader className="space-y-1">
            {isPreview ? (
              <InlineNotesEditor name="customNotesOnboarding" />
            ) : affiliate && !IsRichTextEmpty(customNotesOnboarding) ? (
              <div
                className="rich-text-preview"
                dangerouslySetInnerHTML={{ __html: customNotesOnboarding }}
              />
            ) : (
              <>
                <h2 className="text-2xl font-bold text-center">
                  Complete Application
                </h2>
                <p className="text-center text-muted-foreground">
                  Finalize your profile to get started
                </p>
              </>
            )}
          </CardHeader>

          <CardContent>
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="relative space-y-4"
              >
                {isPreview && (
                  <div className="absolute top-[-10] right-0 z-50">
                    <InputCustomizationOptions size="w-6 h-6" />
                  </div>
                )}

                {regSettings.askWebsiteUrl && (
                  <InputField
                    control={form.control}
                    name="websiteUrl"
                    label="Website URL"
                    type="text"
                    placeholder="https://yourwebsite.com"
                    icon={Globe}
                    affiliate={affiliate}
                  />
                )}

                {regSettings.askSocialHandle && (
                  <InputField
                    control={form.control}
                    name="socialHandle"
                    label="Social Handle"
                    type="text"
                    placeholder="@username"
                    icon={UserPlus}
                    affiliate={affiliate}
                  />
                )}

                {regSettings.askPromotionMethod && (
                  <MultiSelectField
                    control={form.control}
                    name="promotionMethod"
                    label="Promotion Methods"
                    options={promotionOptions}
                    icon={Megaphone}
                    affiliate={affiliate}
                  />
                )}

                {regSettings.askPromotionDetails && (
                  <TextareaField
                    control={form.control}
                    name="promotionDetails"
                    label="Strategy Details"
                    placeholder="Tell us how you plan to promote us..."
                    affiliate={affiliate}
                    rows={3}
                  />
                )}

                <Button
                  type="submit"
                  className="w-full"
                  disabled={isLoading}
                  style={{
                    backgroundColor: isLoading
                      ? (affiliate && buttonDisabledBackgroundColor) ||
                        undefined
                      : (affiliate && buttonBackgroundColor) || undefined,
                    color: isLoading
                      ? (affiliate && buttonDisabledTextColor) || undefined
                      : (affiliate && buttonTextColor) || undefined,
                  }}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      Please wait...
                    </>
                  ) : (
                    <>
                      Finish Application <ArrowRight className="ml-2 h-4 w-4" />
                    </>
                  )}
                </Button>
                {isPreview && <ButtonCustomizationOptions size="w-6 h-6" />}
              </form>
            </Form>
          </CardContent>

          {isPreview && (
            <div className="absolute bottom-0 left-0 p-2">
              <CardCustomizationOptions
                triggerSize="w-6 h-6"
                dropdownSize="w-[150px]"
              />
            </div>
          )}
        </Card>

        {!brandingLoading && affiliate && showBranding && (
          <PoweredByBranding color={textColor} />
        )}
      </div>

      {isPreview && (
        <div className="absolute bottom-0 left-0 z-50">
          <ThemeCustomizationOptions
            buttonSize="w-4 h-4 lg:w-8 lg:h-8"
            name="backgroundColor"
            showLabel={false}
          />
        </div>
      )}
    </div>
  )
}

export default AffiliateOnboarding
