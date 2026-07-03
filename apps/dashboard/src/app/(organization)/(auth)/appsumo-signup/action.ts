"use server"

import { user, account, appsumoKeys, purchase } from "@/db/schema"
import { db } from "@/db/drizzle"
import * as bcrypt from "bcrypt"
import jwt from "jsonwebtoken"
import { cookies } from "next/headers"
import { customAlphabet } from "nanoid"
import { MutationData } from "@/lib/types/organization/response"
import { handleAction } from "@/lib/handleAction"
import { AppError } from "@/lib/exceptions"
import { eq } from "drizzle-orm"

const generateCredentialsAccountId = customAlphabet("0123456789", 6)

type AppSumoSignupPayload = {
  name: string
  email: string
  password: string
  appsumoKey: string
}

/**
 * Helper: Maps AppSumo numerical tiers to your system's purchase enums
 */
function mapTierToPurchasePlan(tier: number): "PRO" | "ULTIMATE" {
  return tier <= 1 ? "PRO" : "ULTIMATE"
}

export const SignupAppSumoServer = async ({
  name,
  email,
  password,
  appsumoKey,
}: AppSumoSignupPayload): Promise<MutationData> => {
  return handleAction("AppSumo Signup Server", async () => {
    if (!email || !password || !name || !appsumoKey) {
      throw new AppError({
        status: 400,
        error: "Missing required fields.",
        toast: "Please fill in all required fields.",
      })
    }

    const normalizedEmail = email.trim().toLowerCase()
    const cleanKey = appsumoKey.trim()

    // 1. Fetch the pre-existing license entry populated during OAuth/Webhook step
    const existingCode = await db.query.appsumoKeys.findFirst({
      where: (k, { eq }) => eq(k.key, cleanKey),
    })

    if (!existingCode) {
      throw new AppError({
        status: 400,
        error: "Invalid license key.",
        toast:
          "The license token provided could not be matched. Please restart activation from AppSumo.",
      })
    }

    if (existingCode.status === "claimed") {
      throw new AppError({
        status: 400,
        error: "Key already redeemed.",
        toast:
          "This AppSumo tier license has already been linked to an account.",
      })
    }

    if (existingCode.status === "deactivated") {
      throw new AppError({
        status: 400,
        error: "Key deactivated.",
        toast:
          "This license key was deactivated due to a refund or change request.",
      })
    }

    // 2. Check if user already exists
    const existingUser = await db.query.user.findFirst({
      where: (u, { eq }) => eq(u.email, normalizedEmail),
    })

    if (existingUser) {
      throw new AppError({
        status: 409,
        error: "User already exists.",
        toast: "This email is already registered inside our platform.",
        fields: { email: "Email already in use" },
      })
    }

    const hashedPassword = await bcrypt.hash(password, 10)

    // 3. Insert user record
    const [newUser] = await db
      .insert(user)
      .values({
        name,
        email: normalizedEmail,
        type: "ORGANIZATION",
        role: "OWNER",
      })
      .returning()

    if (!newUser) {
      throw new AppError({
        status: 500,
        error: "User creation failed.",
        toast: "Something went wrong creating your account profile.",
      })
    }

    // 4. Create internal provider auth map
    // CRITICAL: emailVerified left as NULL to trigger the lazy verification banner system on dashboard view
    await db.insert(account).values({
      userId: newUser.id,
      provider: "credentials",
      providerAccountId: generateCredentialsAccountId(),
      password: hashedPassword,
      emailVerified: null,
    })

    // 5. Build dynamic Lifetime Purchase mapping row entry
    const purchaseTierEnum = mapTierToPurchasePlan(existingCode.tier ?? 1)
    await db.insert(purchase).values({
      userId: newUser.id,
      tier: purchaseTierEnum,
      price: "0.00",
      currency: "USD",
      isActive: true,
      reason: "CONVERT_TO_ONE_TIME", // Custom descriptive enum label assignment
    })

    // 6. Securely tie the key to the new identity
    await db
      .update(appsumoKeys)
      .set({
        status: "claimed",
        userId: newUser.id,
        redeemedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(appsumoKeys.key, cleanKey))

    // 7. Generate secure session cookie values
    const sessionPayload = {
      id: newUser.id,
      email: newUser.email,
      type: "ORGANIZATION",
      role: "OWNER",
      orgIds: [],
    }

    const sessionToken = jwt.sign(sessionPayload, process.env.SECRET_KEY!, {
      expiresIn: "1d",
    })

    const cookieStore = await cookies()
    cookieStore.set({
      name: "organizationToken",
      value: sessionToken,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
    })

    return {
      ok: true,
      toast: "Account activated successfully!",
      redirectUrl: "/create-company",
    }
  })
}
