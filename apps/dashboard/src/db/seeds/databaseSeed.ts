import { faker } from "@faker-js/faker"
import {
  buildAuthCustomizationSeed,
  buildDashboardCustomizationSeed,
} from "@/util/CustomizationSeed"
import {
  generateAffiliateClickId,
  generateAffiliateCode,
  generateAffiliatePaymentLinkId,
} from "@/util/idGenerators"

const parseDate = (str: string) => {
  const fixed = str.replace(" ", "T").replace(/(\.\d{3})\d+/, "$1") + "Z"
  return new Date(fixed)
}
const ORG_ID = "tp7JLBb5"
const PASSWORD_HASH =
  "$2b$10$PnbuKyGgf4XRYCHUr.EDtu6yTaVgGdihZM/u5q54Jryix9xYRG0q2"
const PAYPAL_PERSONAL_EMAILS = Array.from(
  { length: 20 },
  (_, i) => `personal-sb-${i + 1}@test.example.com`
)
const INVOICE_REASONS = ["subscription_create"] as const
const randomInt = (min: number, max: number) =>
  Math.floor(Math.random() * (max - min + 1)) + min

const randomDateIn2026 = () => {
  const month = randomInt(0, 11) // JS months 0–11
  const day = randomInt(1, 28) // safe for all months
  const hour = randomInt(0, 23)
  const minute = randomInt(0, 59)
  const second = randomInt(0, 59)

  return new Date(Date.UTC(2026, month, day, hour, minute, second))
}

export const PROMOTION_METHODS = [
  "social_media",
  "blog_website",
  "email_marketing",
  "paid_ads",
  "content_creation",
  "offline_networking",
  "other",
] as const

export const affiliate_seed = Array.from({ length: 20 }, (_, i) => {
  const isLast = i === 19

  const firstName = isLast
    ? "zekariyas"
    : faker.person.firstName().toLowerCase()
  const lastName = isLast ? "berihun" : faker.person.lastName().toLowerCase()

  const name = isLast ? "zekariyas" : `${firstName} ${lastName}`
  const email = isLast
    ? "zekariyasberihun8@gmail.com"
    : `${firstName}.${lastName}@example.com`

  // Generate 1-3 random promotion methods
  const methodsCount = randomInt(1, 3)
  const shuffledMethods = [...PROMOTION_METHODS].sort(() => 0.5 - Math.random())
  const promotionMethods = shuffledMethods.slice(0, methodsCount)

  return {
    id: crypto.randomUUID(),
    name: name,
    email: email,
    type: "AFFILIATE" as const,
    status: "active" as const,
    promotionMethods: promotionMethods,
    promotionDetails: `Promoting primarily via ${promotionMethods.join(", ")} targeting niche B2B SaaS audiences.`,
    websiteUrl: isLast
      ? "https://refearnapp.com"
      : `https://${firstName}marketing.com`,
    socialHandle: `@${firstName}_shares`,
    onboardingCompleted: true,
    organizationId: ORG_ID,
    createdAt: new Date(),
    updatedAt: new Date(),
  }
})

export const affiliate_link_seed = affiliate_seed.flatMap((affiliate) => {
  const firstDate = randomDateIn2026()
  const secondDate = randomDateIn2026()

  return [
    {
      id: generateAffiliateCode(),
      affiliateId: affiliate.id,
      organizationId: ORG_ID,
      createdAt: firstDate,
      updatedAt: firstDate,
    },
    {
      id: generateAffiliateCode(),
      affiliateId: affiliate.id,
      organizationId: ORG_ID,
      createdAt: secondDate,
      updatedAt: secondDate,
    },
  ]
})

const REFERRER_CHANNELS = [
  "direct",
  "x.com",
  "facebook.com",
  "linkedin.com",
  "instagram.com",
  "reddit.com",
  "github.com",
  "indiehackers.com",
  "producthunt.com",
]

export const affiliate_click_seed = affiliate_link_seed.flatMap((link) => {
  const clicksCount = randomInt(80, 250)

  return Array.from({ length: clicksCount }, () => {
    const date = randomDateIn2026()
    const referrer =
      REFERRER_CHANNELS[randomInt(0, REFERRER_CHANNELS.length - 1)]

    return {
      id: generateAffiliateClickId(),
      affiliateLinkId: link.id,
      userAgent:
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36",
      referrer: referrer,
      deviceType: Math.random() > 0.3 ? "desktop" : "mobile",
      browser: Math.random() > 0.2 ? "Chrome" : "Safari",
      os: Math.random() > 0.5 ? "Windows" : "MacOS",
      createdAt: date,
      updatedAt: date,
    }
  })
})

export const affiliate_invoice_seed = affiliate_link_seed.flatMap((link) => {
  const invoiceCount = randomInt(1, 2)

  return Array.from({ length: invoiceCount }, () => {
    const date = randomDateIn2026()
    const amount = randomInt(10, 100)
    const commission = Math.round(amount * 0.5 * 100) / 100
    const roll = Math.random()
    let paidAmount = 0
    let unpaidAmount = commission
    let status: "pending" | "paid" = "pending"

    if (roll > 0.7) {
      paidAmount = commission
      unpaidAmount = 0
      status = "paid" as const
    } else if (roll > 0.3) {
      paidAmount = Math.round(commission * 0.4 * 100) / 100
      unpaidAmount = Math.round((commission - paidAmount) * 100) / 100
      status = "pending" as const
    } else {
      paidAmount = 0
      unpaidAmount = commission
      status = "pending" as const
    }

    return {
      id: generateAffiliatePaymentLinkId(),
      paymentProvider: "stripe" as const,
      subscriptionId:
        Math.random() > 0.5 ? `sub_${crypto.randomUUID().slice(0, 10)}` : null,
      customerId: `cus_${crypto.randomUUID().slice(0, 10)}`,
      amount: amount.toFixed(2),
      currency: "USD" as const,
      rawAmount: amount.toFixed(2),
      rawCurrency: "USD",
      commission: commission.toFixed(2),
      paidAmount: paidAmount.toFixed(2),
      unpaidAmount: unpaidAmount.toFixed(2),
      affiliateLinkId: link.id,
      reason: INVOICE_REASONS[randomInt(0, INVOICE_REASONS.length - 1)],
      status: status,
      createdAt: date,
      updatedAt: date,
    }
  })
})

export const organization_seed = [
  {
    id: "tp7JLBb5",
    name: "Acme Inc",
    websiteUrl: "simulator.test",
    userId: "29022934-eb52-49af-aca4-b6ed553c89dd",
    logoUrl: null,
    referralParam: "ref" as const,
    cookieLifetimeValue: 30,
    cookieLifetimeUnit: "day" as const,
    commissionType: "PERCENTAGE" as const,
    commissionValue: "50.00",
    commissionDurationValue: 30,
    commissionDurationUnit: "day" as const,
    currency: "USD" as const,
    createdAt: parseDate("2025-07-16 11:44:07.514288"),
    updatedAt: parseDate("2025-07-16 11:44:07.514288"),
    attributionModel: "LAST_CLICK" as const,
  },
]

export const websiteDomain_seed = [
  {
    id: "4G7kH2B",
    orgId: "tp7JLBb5",
    domainName: "xmm.refearnapp.com",
    type: "DEFAULT" as const,
    isActive: true,
    isRedirect: false,
    isPrimary: true,
    isVerified: true,
    dnsStatus: "Verified" as const,
    createdAt: parseDate("2025-10-14 04:00:00"),
    updatedAt: parseDate("2025-10-14 04:00:00"),
  },
]

export const organization_auth_customization_seed = [
  buildAuthCustomizationSeed({
    id: "tp7JLBb5",
    auth: {
      useNotesCustomization: {
        customNotesLogin:
          '<p style="text-align: center;"><span style="color: rgb(13, 227, 17);">This is The Login Page</span></p>',
        customNotesSignup:
          '<p style="text-align: center;"><span style="color: rgb(61, 22, 202);">This is the Signup Page</span></p>',
      },
    },
    createdAt: parseDate("2025-08-12 10:53:45.821"),
    updatedAt: parseDate("2025-08-12 22:15:36.47"),
  }),
]

export const promotion_codes_seed = affiliate_seed.flatMap((affiliate, idx) => {
  const count = idx === 0 ? 25 : 2
  return Array.from({ length: count }, (_, i) => ({
    id: crypto.randomUUID(),
    code: `PROMO_${i}_${affiliate.name.replace(/\s+/g, "_").toUpperCase()}`,
    externalId: `ext_${crypto.randomUUID().slice(0, 8)}_${i}`,
    provider: "paddle" as const,
    isActive: true,
    discountType: "PERCENTAGE" as const,
    discountValue: "10.00",
    commissionType: "PERCENTAGE" as const,
    commissionValue: "20.00",
    commissionDurationValue: 1,
    commissionDurationUnit: "month" as const,
    affiliateId: affiliate.id,
    organizationId: ORG_ID,
    isSeenByAffiliate: i > 5,
    createdAt: randomDateIn2026(),
    updatedAt: new Date(),
  }))
})

export const referrals_seed = affiliate_seed.flatMap((affiliate, idx) => {
  const promo = promotion_codes_seed.find((p) => p.affiliateId === affiliate.id)
  const links = affiliate_link_seed.filter(
    (l) => l.affiliateId === affiliate.id
  )
  const totalClicksForAffiliate = affiliate_click_seed.filter((c) =>
    links.some((l) => l.id === c.affiliateLinkId)
  )
  const conversionRate = randomInt(5, 15) / 100
  const maxSignups = Math.max(
    1,
    Math.floor(totalClicksForAffiliate.length * conversionRate)
  )
  const count = idx === 0 ? Math.min(60, maxSignups) : Math.min(5, maxSignups)

  return Array.from({ length: count }, (_, i) => {
    const isConverted = i % 3 === 0
    const matchingClick =
      totalClicksForAffiliate[i % totalClicksForAffiliate.length]
    const signedAt = matchingClick
      ? matchingClick.createdAt
      : randomDateIn2026()
    const linkId = matchingClick
      ? matchingClick.affiliateLinkId
      : links[0]?.id || null

    const safeAffiliateName = affiliate.name.replace(/\s+/g, "_")

    return {
      id: crypto.randomUUID(),
      affiliateId: affiliate.id,
      organizationId: ORG_ID,
      signupEmail: `user_${i}_${safeAffiliateName}@example.com`,
      promotionCodeId: i % 2 === 0 ? promo?.id : null,
      affiliateLinkId: i % 2 !== 0 ? linkId : null,
      signedAt: signedAt,
      convertedAt: isConverted
        ? new Date(signedAt.getTime() + randomInt(1, 4) * 86400000)
        : null,
      totalRevenue: isConverted ? "150.00" : "0.00",
      commissionEarned: isConverted ? "30.00" : "0.00",
      isSeenByAffiliate: i >= 10,
      createdAt: signedAt,
      updatedAt: signedAt,
    }
  })
})

export const organization_dashboard_customization_seed = [
  buildDashboardCustomizationSeed({
    id: "tp7JLBb5",
    dashboard: {
      useKpiCardCustomization: {
        cardShadowThickness: "sm",
        cardShadow: true,
        cardBorder: true,
      },
    },
    createdAt: parseDate("2025-08-12 10:53:45.24"),
    updatedAt: parseDate("2025-08-12 20:11:21.372"),
  }),
]

export const user_seed = [
  {
    id: "29022934-eb52-49af-aca4-b6ed553c89dd",
    name: "Acme Admin",
    email: "admin@acmeinc.com", // Updated admin user identity
    role: "OWNER" as const,
    type: "ORGANIZATION" as const,
    createdAt: parseDate("2025-07-16 11:43:21.288497"),
    updatedAt: parseDate("2025-07-16 11:43:21.288497"),
  },
]

export const account_seed = [
  {
    id: "f1a2b3c4-d5e6-7f89-0123-456789abcdef",
    userId: "29022934-eb52-49af-aca4-b6ed553c89dd",
    provider: "credentials" as const,
    providerAccountId: "admin@acmeinc.com", // Linked to the clean admin credentials profile
    password: "$2b$10$StHXjJi6UvIye0GVPmDp4uRXnjAuBAuqNZhnzTLb24U0.l98LjH3C",
    emailVerified: parseDate("2025-07-16 11:43:21.288497"),
    createdAt: parseDate("2025-07-16 11:43:21.288497"),
    updatedAt: parseDate("2025-07-16 11:43:21.288497"),
  },
]

export const affiliate_account_seed = affiliate_seed.map((affiliate) => ({
  id: crypto.randomUUID(),
  affiliateId: affiliate.id,
  provider: "credentials" as const,
  providerAccountId: affiliate.email,
  password: PASSWORD_HASH,
  emailVerified: new Date(),
  createdAt: new Date(),
  updatedAt: new Date(),
}))

export const affiliate_payout_method_seed = affiliate_seed.map(
  (affiliate, index) => ({
    id: crypto.randomUUID(),
    affiliateId: affiliate.id,
    provider: "paypal" as const,
    accountIdentifier:
      PAYPAL_PERSONAL_EMAILS[index % PAYPAL_PERSONAL_EMAILS.length],
    isDefault: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  })
)

export const team_seed = Array.from({ length: 20 }, (_, i) => {
  const firstName = faker.person.firstName().toLowerCase()
  const lastName = faker.person.lastName().toLowerCase()

  return {
    id: crypto.randomUUID(),
    name: `${firstName} ${lastName}`,
    email: `${firstName}.${lastName}@acmeinc.com`,
    role: "TEAM" as const,
    type: "ORGANIZATION" as const,
    organizationId: ORG_ID,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  }
})

export const team_account_seed = team_seed.map((team) => ({
  id: crypto.randomUUID(),
  teamId: team.id,
  provider: "credentials" as const,
  providerAccountId: team.email,
  password: PASSWORD_HASH,
  emailVerified: new Date(),
  createdAt: new Date(),
  updatedAt: new Date(),
}))

export const purchase_seed = [
  {
    id: "pur_ultimate_lifetime",
    userId: "29022934-eb52-49af-aca4-b6ed553c89dd",
    tier: "ULTIMATE" as const,
    price: "29900",
    currency: "USD",
    priceId: "ultimate_lifetime",
    isActive: true,
    reason: "CONVERT_TO_ONE_TIME" as const,
    createdAt: parseDate("2025-07-16 11:44:00.000"),
  },
]
