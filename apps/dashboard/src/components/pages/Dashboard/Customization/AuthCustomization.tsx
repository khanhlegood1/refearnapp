"use client"

import React, { useEffect, useState } from "react"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"

import Login from "@/components/pages/Login"
import Signup from "@/components/pages/Signup"

import ForgotPassword from "@/components/pages/Forgot-password"
import ResetPassword from "@/components/pages/Reset-password"
import InvalidToken from "@/components/pages/InvalidToken"
import EmailVerified from "@/components/pages/Email-verified"
import CheckEmail from "@/components/pages/CheckEmail"
import PendingState from "@/components/ui-custom/PendingState"
import ErrorState from "@/components/ui-custom/ErrorState"
import { DomainHeader } from "@/components/ui-custom/DomainHeader"
import PendingApproval from "@/components/pages/PendingApproval"
import InvalidInvite from "@/components/pages/InvalidInvite"
import AffiliateOnboarding from "@/components/pages/AffiliateOnboarding"
import { useAtom } from "jotai"
import { Form } from "@/components/ui/form"
import { registrationSettingsAtom } from "@/store/RegistrationSettingsAtom"
import { FileText, LinkIcon, UserPlus } from "lucide-react"
import { Switch } from "@/components/ui/switch"
import { useForm } from "react-hook-form"
import { InputField } from "@/components/Auth/FormFields"
import {
  RegistrationFormValues,
  registrationSchema,
} from "@/lib/schema/registrationSchema"
import { zodResolver } from "@hookform/resolvers/zod"
interface AuthCustomizationProps {
  setMainTab?: (tab: string) => void
  orgId: string
  domain?: string
  tab: string
  setTab: (tab: string) => void
}
export const AuthCustomization = ({
  setMainTab,
  orgId,
  domain,
  tab,
  setTab,
}: AuthCustomizationProps) => {
  const routeMap: Record<string, string> = {
    login: "/login",
    signup: "/signup",
    "forgot-password": "/forgot-password",
    "reset-password": "/reset-password",
    "invalid-token": "/invalid-token",
    "email-verified": "/email-verified",
    "check-email": "/check-email",
    "splash-loading": "/",
    "splash-error": "/",
    "pending-approval": "/pending-approval",
    "invalid-invite": "/invalid-invite",
    onboarding: "/onboarding",
  }
  const [errorCycle, setErrorCycle] = useState<"loading" | "error">("error")
  const [regSettings, setRegSettings] = useAtom(registrationSettingsAtom)
  const form = useForm<RegistrationFormValues>({
    resolver: zodResolver(registrationSchema),
    mode: "onChange",
    defaultValues: {
      tosUrl: regSettings.tosUrl || "",
      privacyPolicyUrl: regSettings.privacyPolicyUrl || "",
    },
  })
  const {
    watch,
    formState: { isValid },
  } = form
  const tosUrl = watch("tosUrl")
  const privacyUrl = watch("privacyPolicyUrl")
  useEffect(() => {
    if (isValid) {
      setRegSettings((prev) => ({
        ...prev,
        tosUrl: tosUrl || "",
        privacyPolicyUrl: privacyUrl || "",
      }))
    }
  }, [tosUrl, privacyUrl, isValid, setRegSettings])
  const handleRetry = () => {
    setErrorCycle("loading")
    setTimeout(() => setErrorCycle("error"), 1500)
  }
  return (
    <div className="border rounded-lg p-4 transition-all duration-300 mt-6 shadow-md">
      {domain && (
        <DomainHeader domain={domain} route={routeMap[tab]} className="mb-4" />
      )}
      <div className="mb-6">
        {/* Case 1: Signup Tab - Legal Settings */}
        {tab === "signup" && (
          <div className="p-4 bg-primary/5 border border-primary/20 rounded-lg animate-in fade-in slide-in-from-top-2">
            <div className="flex items-center gap-2 mb-3 text-primary">
              <FileText className="w-4 h-4" />
              <h3 className="text-sm font-bold uppercase tracking-wider">
                Legal Settings (Signup Page)
              </h3>
            </div>
            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-2">
                <Switch
                  checked={regSettings.showTos}
                  onCheckedChange={(val) =>
                    setRegSettings({ ...regSettings, showTos: val })
                  }
                />
                <label className="text-sm font-medium">
                  Show Terms & Privacy Checkbox
                </label>
              </div>

              {regSettings.showTos && (
                <Form {...form}>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-in zoom-in-95 duration-200">
                    <InputField
                      control={form.control}
                      name="tosUrl"
                      label="Terms of Service URL"
                      placeholder="https://yourbrand.com/terms"
                      type="text"
                      icon={LinkIcon}
                      affiliate={false}
                    />
                    <InputField
                      control={form.control}
                      name="privacyPolicyUrl"
                      label="Privacy Policy URL"
                      placeholder="https://yourbrand.com/privacy"
                      type="text"
                      icon={LinkIcon}
                      affiliate={false}
                    />
                  </div>
                </Form>
              )}
            </div>
          </div>
        )}

        {/* Case 2: Onboarding Tab - Question Controls */}
        {tab === "onboarding" && (
          <div className="p-4 bg-orange-500/5 border border-orange-500/20 rounded-lg animate-in fade-in slide-in-from-top-2">
            <div className="flex items-center gap-2 mb-3 text-orange-600">
              <UserPlus className="w-4 h-4" />
              <h3 className="text-sm font-bold uppercase tracking-wider">
                Onboarding Questions
              </h3>
            </div>
            {/* Updated Grid to handle 4 switches (2x2 on mobile, 4 in a row on large screens) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="flex items-center gap-2">
                <Switch
                  checked={regSettings.askWebsiteUrl}
                  onCheckedChange={(val) =>
                    setRegSettings({ ...regSettings, askWebsiteUrl: val })
                  }
                />
                <label className="text-sm font-medium">Ask Website</label>
              </div>
              <div className="flex items-center gap-2">
                <Switch
                  checked={regSettings.askSocialHandle}
                  onCheckedChange={(val) =>
                    setRegSettings({ ...regSettings, askSocialHandle: val })
                  }
                />
                <label className="text-sm font-medium">Ask Social</label>
              </div>
              <div className="flex items-center gap-2">
                <Switch
                  checked={regSettings.askPromotionMethod}
                  onCheckedChange={(val) =>
                    setRegSettings({ ...regSettings, askPromotionMethod: val })
                  }
                />
                <label className="text-sm font-medium">Ask Method</label>
              </div>
              {/* Added Promotion Details Switch here */}
              <div className="flex items-center gap-2">
                <Switch
                  checked={regSettings.askPromotionDetails}
                  onCheckedChange={(val) =>
                    setRegSettings({ ...regSettings, askPromotionDetails: val })
                  }
                />
                <label className="text-sm font-medium">
                  Ask Strategy Details
                </label>
              </div>
            </div>
          </div>
        )}
      </div>
      <Tabs value={tab} onValueChange={setTab}>
        <TabsList className="flex flex-wrap gap-2 mb-4 overflow-x-auto whitespace-nowrap">
          <TabsTrigger value="login">Login</TabsTrigger>
          <TabsTrigger value="signup">Signup</TabsTrigger>
          <TabsTrigger value="onboarding">Onboarding</TabsTrigger>
          <TabsTrigger value="forgot-password">Forgot Password</TabsTrigger>
          <TabsTrigger value="reset-password">Reset Password</TabsTrigger>
          <TabsTrigger value="invalid-token">Invalid Token</TabsTrigger>
          <TabsTrigger value="email-verified">Email Verified</TabsTrigger>
          <TabsTrigger value="check-email">Check Email</TabsTrigger>
          <TabsTrigger value="splash-loading">Splash Loading</TabsTrigger>
          <TabsTrigger value="splash-error">Splash Error</TabsTrigger>
          <TabsTrigger value="pending-approval">Pending Approval</TabsTrigger>
          <TabsTrigger value="invalid-invite">Invalid Invite</TabsTrigger>
        </TabsList>
        <TabsContent value="login">
          <Login orgId={orgId} affiliate isPreview setTab={setTab} />
        </TabsContent>
        <TabsContent value="signup">
          <Signup orgId={orgId} affiliate isPreview setTab={setTab} />
        </TabsContent>
        <TabsContent value="onboarding">
          <AffiliateOnboarding orgId={orgId} affiliate isPreview />
        </TabsContent>
        <TabsContent value="forgot-password">
          <ForgotPassword orgId={orgId} affiliate isPreview setTab={setTab} />
        </TabsContent>
        <TabsContent value="reset-password">
          <ResetPassword
            orgId={orgId}
            affiliate
            isPreview
            setTab={setTab}
            userId="1234"
          />
        </TabsContent>
        <TabsContent value="invalid-token">
          <InvalidToken orgId={orgId} affiliate isPreview />
        </TabsContent>{" "}
        <TabsContent value="email-verified">
          <EmailVerified
            orgId={orgId}
            affiliate
            isPreview
            setMainTab={setMainTab}
          />
        </TabsContent>
        <TabsContent value="check-email">
          <CheckEmail affiliate isPreview orgId={orgId} />
        </TabsContent>
        <TabsContent value="splash-loading">
          <PendingState affiliate isPreview />
        </TabsContent>
        <TabsContent value="splash-error">
          {errorCycle === "loading" ? (
            <PendingState affiliate message="Retrying..." />
          ) : (
            <ErrorState affiliate isPreview onRetry={handleRetry} />
          )}
        </TabsContent>
        <TabsContent value="pending-approval">
          <PendingApproval orgId={orgId} affiliate isPreview />
        </TabsContent>
        <TabsContent value="invalid-invite">
          <InvalidInvite orgId={orgId} affiliate isPreview />
        </TabsContent>
      </Tabs>
    </div>
  )
}
