import { NextRequest, NextResponse } from "next/server"
import { handleRoute } from "@/lib/handleRoute"

export const GET = handleRoute(
  "AppSumoOAuthCallback",
  async (req: NextRequest) => {
    const url = new URL(req.url)
    const code = url.searchParams.get("code")

    // AppSumo validation ping — no code present, just return 200
    if (!code) {
      return new NextResponse("OK", { status: 200 })
    }

    // Exchange code for access token
    const tokenRes = await fetch("https://appsumo.com/openid/token/", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        client_id: process.env.APPSUMO_CLIENT_ID!,
        client_secret: process.env.APPSUMO_CLIENT_SECRET!,
        redirect_uri: process.env.APPSUMO_REDIRECT_URI!,
        code,
        grant_type: "authorization_code",
      }),
    })

    if (!tokenRes.ok) {
      throw new Error(`Token exchange failed: ${tokenRes.status}`)
    }

    const { access_token } = await tokenRes.json()

    // Fetch the license key using the access token
    const licenseRes = await fetch(
      `https://appsumo.com/openid/license_key/?access_token=${access_token}`
    )

    if (!licenseRes.ok) {
      throw new Error(`License key fetch failed: ${licenseRes.status}`)
    }

    const { license_key } = await licenseRes.json()

    // Always redirect to appsumo-signup — page handles all status cases
    return NextResponse.redirect(
      new URL(
        `/appsumo-signup?key=${license_key}`,
        process.env.NEXT_PUBLIC_BASE_URL!
      )
    )
  }
)
