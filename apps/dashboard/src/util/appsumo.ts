export function mapTierToPurchasePlan(tier: number): "PRO" | "ULTIMATE" {
  return tier <= 1 ? "PRO" : "ULTIMATE"
}
