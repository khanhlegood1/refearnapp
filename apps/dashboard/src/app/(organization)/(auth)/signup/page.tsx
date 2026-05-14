import React from "react"
import Signup from "@/components/pages/Signup"
import { redirectIfAuthed } from "@/lib/server/auth/authGuards"
import type { Metadata } from "next"
import { buildMetadata } from "@/util/BuildMetadata"
import { restrictSelfHostedSignup } from "@/lib/server/organization/selfHostedGuards"
export const metadata: Metadata = buildMetadata({
  title: "RefearnApp | Signup Page",
  description: "Signup Page",
  url: "https://refearnapp.com/signup",
  indexable: false,
})
const signupPage = async () => {
  await redirectIfAuthed()
  await restrictSelfHostedSignup()
  return (
    <>
      <Signup affiliate={false} />
    </>
  )
}
export default signupPage
