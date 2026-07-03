import { NextRequest, NextResponse } from "next/server"
import { handleRoute } from "@/lib/handleRoute"
import { AppError } from "@/lib/exceptions"
import { db } from "@/db/drizzle"
import { appsumoKeys, purchase, subscription } from "@/db/schema"
import { eq, and } from "drizzle-orm"
import crypto from "crypto"

/**
 * Utility: Verifies the AppSumo HMAC SHA256 Signature Header
 */
function verifyAppSumoSignature(
  rawBody: string,
  signature: string | null,
  timestamp: string | null
): boolean {
  if (!signature || !timestamp || !process.env.APPSUMO_API_KEY) return false

  const expectedSignature = crypto
    .createHmac("sha256", process.env.APPSUMO_API_KEY)
    .update(timestamp + rawBody)
    .digest("hex")

  return crypto.timingSafeEqual(
    Buffer.from(signature, "hex"),
    Buffer.from(expectedSignature, "hex")
  )
}

/**
 * Helper: Maps AppSumo numerical tiers to your database purchase enums
 */
function mapTierToPurchasePlan(tier: number): "PRO" | "ULTIMATE" {
  return tier <= 1 ? "PRO" : "ULTIMATE"
}

export const POST = handleRoute(
  "AppSumoWebhookAPI",
  async (req: NextRequest) => {
    const rawBody = await req.text()
    const signature = req.headers.get("X-Appsumo-Signature")
    const timestamp = req.headers.get("X-Appsumo-Timestamp")

    if (
      process.env.NODE_ENV === "production" &&
      !verifyAppSumoSignature(rawBody, signature, timestamp)
    ) {
      throw new AppError({
        status: 403,
        error: "UNAUTHORIZED_SIGNATURE",
        toast: "Webhook authenticity validation failed.",
      })
    }

    const payload = JSON.parse(rawBody)
    const { event, license_key, prev_license_key, tier, test } = payload

    if (!event || !license_key) {
      throw new AppError({
        status: 400,
        error: "MISSING_REQUIRED_FIELDS",
        toast: "Event type and License key parameters are required.",
      })
    }

    // ─── CRITICAL APPSUMO RULE: TEST HANDSHAKE ENGINE ──────────────────────────
    if (test === true) {
      return NextResponse.json(
        {
          event: event,
          success: true,
          message: "RefearnApp webhook endpoint verified successfully!",
        },
        { status: 200 }
      )
    }

    // ─── CORE LIFECYCLE EVENT ROUTER ───────────────────────────────────────────
    switch (event) {
      // 1. PURCHASE EVENT: Save the license key as inactive until activated via URL
      case "purchase": {
        const existingKey = await db.query.appsumoKeys.findFirst({
          where: eq(appsumoKeys.key, license_key),
        })

        if (!existingKey) {
          await db.insert(appsumoKeys).values({
            key: license_key,
            tier: tier ?? 1,
            status: "active", // Table defaults to active; will become 'claimed' at signup
          })
        }
        break
      }

      // 2. ACTIVATE EVENT: Confirm the license is active for onboarding
      case "activate": {
        const existingKey = await db.query.appsumoKeys.findFirst({
          where: eq(appsumoKeys.key, license_key),
        })

        if (!existingKey) {
          await db.insert(appsumoKeys).values({
            key: license_key,
            tier: tier ?? 1,
            status: "active",
          })
        } else {
          await db
            .update(appsumoKeys)
            .set({ status: "active", updatedAt: new Date() })
            .where(eq(appsumoKeys.key, license_key))
        }
        break
      }

      // 3. UPGRADE & DOWNGRADE EVENTS: Transition users between PRO and ULTIMATE
      case "upgrade":
      case "downgrade": {
        if (!prev_license_key) {
          throw new AppError({
            status: 400,
            error: "MISSING_PREV_KEY",
            toast:
              "Upgrades or downgrades require a tracking reference link to the original key.",
          })
        }

        const sourceLicense = await db.query.appsumoKeys.findFirst({
          where: eq(appsumoKeys.key, prev_license_key),
        })

        if (sourceLicense) {
          const currentTierEnum = mapTierToPurchasePlan(tier ?? 1)

          // Step A: Insert the replacement license entry preserving user links
          await db.insert(appsumoKeys).values({
            key: license_key,
            tier: tier ?? 1,
            status: sourceLicense.status, // Keeps 'claimed' if they already completed onboarding
            userId: sourceLicense.userId,
            redeemedAt: sourceLicense.redeemedAt,
          })

          if (sourceLicense.userId) {
            // Step B: Update or insert their current tier in the purchase table
            const existingPurchase = await db.query.purchase.findFirst({
              where: and(
                eq(purchase.userId, sourceLicense.userId),
                eq(purchase.isActive, true)
              ),
            })

            if (existingPurchase) {
              await db
                .update(purchase)
                .set({
                  tier: currentTierEnum,
                  reason:
                    event === "upgrade"
                      ? "UPGRADE_NO_BILL"
                      : "DOWNGRADE_NO_BILL",
                })
                .where(eq(purchase.id, existingPurchase.id))
            } else {
              await db.insert(purchase).values({
                userId: sourceLicense.userId,
                tier: currentTierEnum,
                price: "0.00",
                currency: "USD",
                isActive: true,
                reason:
                  event === "upgrade" ? "UPGRADE_NO_BILL" : "DOWNGRADE_NO_BILL",
              })
            }
          }
        }
        break
      }

      // 4. DEACTIVATE EVENT: Fires on refunds, chargebacks, or manual adjustments
      case "deactivate": {
        const targetLicense = await db.query.appsumoKeys.findFirst({
          where: eq(appsumoKeys.key, license_key),
        })

        if (targetLicense) {
          // A. Mark the AppSumo license key record as permanently deactivated
          await db
            .update(appsumoKeys)
            .set({ status: "deactivated", updatedAt: new Date() })
            .where(eq(appsumoKeys.key, license_key))

          if (targetLicense.userId) {
            // B. Delete the AppSumo item altogether from the purchase table
            await db
              .delete(purchase)
              .where(eq(purchase.userId, targetLicense.userId))

            // C. Check if a subscription record already exists for the user
            const existingSub = await db.query.subscription.findFirst({
              where: eq(subscription.userId, targetLicense.userId),
            })

            if (existingSub) {
              // Reset the existing subscription back to the base FREE plan tier
              await db
                .update(subscription)
                .set({
                  plan: "FREE",
                  billingInterval: null,
                  price: "0.00",
                  updatedAt: new Date(),
                })
                .where(eq(subscription.id, existingSub.id))
            } else {
              // Explicitly provision a fallback FREE tier row to preserve billing structure
              await db.insert(subscription).values({
                userId: targetLicense.userId,
                plan: "FREE",
                currency: "USD",
                price: "0.00",
              })
            }
          }
        }
        break
      }

      default:
        // Gracefully ignore unhandled hook types like supplementary add-on migrations
        break
    }

    return NextResponse.json(
      {
        event: event,
        success: true,
      },
      { status: 200 }
    )
  }
)
