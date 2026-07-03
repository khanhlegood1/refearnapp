// app/(organization)/(auth)/appsumo-signup/page.ts
import React from "react"
import Signup from "@/components/pages/Signup"
import InvalidAppSumoKey from "@/components/pages/InvalidAppSumoKey"
import { redirectIfAuthed } from "@/lib/server/auth/authGuards"
import type { Metadata } from "next"
import { buildMetadata } from "@/util/BuildMetadata"
import { restrictSelfHostedSignup } from "@/lib/server/organization/selfHostedGuards"
import { db } from "@/db/drizzle"

type Props = {
  searchParams: Promise<{ key?: string }>
}

export const metadata: Metadata = buildMetadata({
  title: "RefearnApp | AppSumo Activation",
  description: "Activate your AppSumo lifetime deal account.",
  url: "https://refearnapp.com/appsumo-signup",
  indexable: false,
})

const AppSumoSignupPage = async ({ searchParams }: Props) => {
  await redirectIfAuthed()
  await restrictSelfHostedSignup()

  const { key } = await searchParams

  if (!key) {
    return (
      <InvalidAppSumoKey message="No AppSumo license token was detected in your activation URL." />
    )
  }

  const cleanKey = key.trim()
  const keyRecord = await db.query.appsumoKeys.findFirst({
    where: (k, { and, eq }) => and(eq(k.key, cleanKey), eq(k.status, "active")),
  })
  if (!keyRecord) {
    const backupCheck = await db.query.appsumoKeys.findFirst({
      where: (k, { eq }) => eq(k.key, cleanKey),
    })

    if (!backupCheck) {
      return (
        <InvalidAppSumoKey message="This AppSumo license token does not exist. Please double-check your link from the AppSumo backend." />
      )
    }

    if (backupCheck.status === "claimed") {
      return (
        <InvalidAppSumoKey message="This license key has already been redeemed and is linked to an account profile." />
      )
    }

    if (backupCheck.status === "deactivated") {
      return (
        <InvalidAppSumoKey message="This license has been permanently deactivated due to a recent refund or license alteration." />
      )
    }
    return (
      <InvalidAppSumoKey message="This license key is not currently in a valid state for activation." />
    )
  }

  return (
    <>
      <Signup affiliate={false} appsumoKey={cleanKey} />
    </>
  )
}

export default AppSumoSignupPage
