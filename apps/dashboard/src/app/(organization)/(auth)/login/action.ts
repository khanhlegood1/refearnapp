"use server"

import { db } from "@/db/drizzle"
import * as bcrypt from "bcrypt"
import jwt from "jsonwebtoken"
import { sendVerificationEmail } from "@/lib/verificationEmail"
import { MutationData } from "@/lib/types/organization/response"
import { handleAction } from "@/lib/handleAction"
import { AppError } from "@/lib/exceptions"
import { cookies } from "next/headers"

export const LoginServer = async ({
  email,
  password,
  rememberMe = false,
}: {
  email: string
  password: string
  rememberMe?: boolean
}): Promise<MutationData> => {
  return handleAction("Login Server", async () => {
    if (!email || !password) {
      throw new AppError({
        status: 400,
        error: "Email and password are required.",
        toast: "Please enter your login credentials.",
        fields: {
          email: !email ? "Email is required" : "",
          password: !password ? "Password is required" : "",
        },
      })
    }

    const existingUser = await db.query.user.findFirst({
      where: (u, { eq }) => eq(u.email, email),
    })

    if (!existingUser) {
      throw new AppError({
        status: 404,
        error: "User not found.",
        toast: "Invalid credentials. Please check your email and password.",
        fields: { email: "User not found" },
      })
    }

    const userAcc = await db.query.account.findFirst({
      where: (ua, { and, eq }) =>
        and(eq(ua.userId, existingUser.id), eq(ua.provider, "credentials")),
    })

    if (!userAcc || !userAcc.password) {
      throw new AppError({
        status: 401,
        error: "User account not found.",
        toast: "Invalid credentials. No password found for this user.",
      })
    }

    const validPassword = await bcrypt.compare(password, userAcc.password)

    if (!validPassword) {
      throw new AppError({
        status: 401,
        error: "Invalid password.",
        toast: "Invalid credentials. Please check your password.",
        fields: { password: "Invalid password" },
      })
    }

    const orgs = await db.query.organization.findMany({
      where: (org, { eq }) => eq(org.userId, existingUser.id),
    })

    const orgIds = orgs.map((o) => o.id)
    const activeOrgId = orgIds.length > 0 ? orgIds[0] : undefined

    const appsumoClaim = await db.query.appsumoKeys.findFirst({
      where: (k, { and, eq, ne }) =>
        and(eq(k.userId, existingUser.id), ne(k.status, "deactivated")),
    })
    if (appsumoClaim) {
      const sessionPayload = {
        id: existingUser.id,
        email: existingUser.email,
        role: existingUser.role,
        type: existingUser.type,
        orgIds,
        activeOrgId,
        rememberMe,
      }
      const tokenExpiry = rememberMe ? "30d" : "1d"
      const sessionToken = jwt.sign(sessionPayload, process.env.SECRET_KEY!, {
        expiresIn: tokenExpiry,
      })

      const cookieStore = await cookies()
      cookieStore.set({
        name: "organizationToken",
        value: sessionToken,
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        ...(rememberMe && { maxAge: 60 * 60 * 24 * 30 }),
      })

      return {
        ok: true,
        toast: "Logged in successfully!",
        redirectUrl: activeOrgId
          ? `/organization/${activeOrgId}/dashboard/analytics`
          : "/create-company",
      }
    }

    const token = jwt.sign(
      {
        id: existingUser.id,
        email: existingUser.email,
        role: existingUser.role,
        type: existingUser.type,
        orgIds,
        activeOrgId,
        rememberMe,
      },
      process.env.SECRET_KEY as string,
      { expiresIn: "15m" }
    )
    const verifyUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/verify-login?organizationToken=${token}`
    await sendVerificationEmail(existingUser.email, verifyUrl, "login")
    return {
      ok: true,
      toast: "Verification email sent",
      redirectUrl: `/checkEmail?email=${encodeURIComponent(existingUser.email)}`,
    }
  })
}
