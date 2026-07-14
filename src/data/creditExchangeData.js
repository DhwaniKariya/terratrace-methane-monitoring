import { branches, generateIncidents } from './mockData'
import { generateVerifications } from './verificationData'

// Reference price per tCO2e for network trades. Real markets split into two
// tiers: compliance schemes like the EU ETS (~€69-83/tCO2e in 2026, already
// EUR-denominated) and voluntary-market offsets (~€7-28/tCO2e average,
// source: carboncredits.com). OGMP 2.0-grade, measurement-based methane
// credits are a higher-trust tier than typical voluntary offsets but aren't
// a compliance instrument, so we use a blended reference price between the
// two bands rather than either extreme.
export const REFERENCE_PRICE_EUR_PER_T = 41
const REPORTING_PERIOD_DAYS = 90

// External operators who've also opted into the shared monitoring network,
// per the Industry-wide Intelligence Network concept (Solution.docx Module
// 5) - a credit exchange only makes sense across companies, not within one.
const NETWORK_PARTNERS = [
  { id: 'partner-1', name: 'Meridian Gas Holdings', region: 'North Sea', allocatedCreditsT: 4200, projectedEmissionsT: 3550 },
  { id: 'partner-2', name: 'Northfield Energy Partners', region: 'Gulf Coast, US', allocatedCreditsT: 3100, projectedEmissionsT: 3980 },
  { id: 'partner-3', name: 'Solene Petroleum', region: 'West Africa', allocatedCreditsT: 2600, projectedEmissionsT: 3340 },
  { id: 'partner-4', name: 'Arkwright Basin Resources', region: 'Permian, US', allocatedCreditsT: 3800, projectedEmissionsT: 2960 },
]

function ownBranchParticipant(branch) {
  const incidents = generateIncidents(branch.id)
  const verifications = generateVerifications(branch.id)

  const currentCh4KgH = incidents.reduce((sum, i) => sum + i.ch4Rate, 0)
  // Business-as-usual projection for the rest of the reporting period if
  // nothing changes, minus what's already been verified as avoided.
  const bauEmissionsT = Math.round((currentCh4KgH * 24 * REPORTING_PERIOD_DAYS) / 1000)
  const avoidedT = Math.round(verifications.reduce((sum, v) => sum + v.co2eReductionT, 0))
  const projectedEmissionsT = Math.max(0, bauEmissionsT - avoidedT)

  // Allocated allowance modeled as a cap-and-trade style cap set below
  // business-as-usual, the same shrinking-cap mechanic as the EU ETS -
  // it's meant to reward abatement, not just rubber-stamp current output.
  const allocatedCreditsT = Math.round(bauEmissionsT * 0.85)

  return {
    id: `branch-${branch.id}`,
    name: branch.name,
    region: branch.location,
    type: 'own-branch',
    allocatedCreditsT,
    projectedEmissionsT,
  }
}

export const getNetworkParticipants = () => {
  const ownParticipants = branches.map(ownBranchParticipant)
  const partnerParticipants = NETWORK_PARTNERS.map((p) => ({ ...p, type: 'network-partner' }))

  return [...ownParticipants, ...partnerParticipants].map((p) => ({
    ...p,
    balanceT: p.allocatedCreditsT - p.projectedEmissionsT,
  }))
}

// Greedy bilateral matching: largest surplus paired with largest deficit
// first, same logic a broker uses when matching OTC trades, until one side
// runs out. This is a suggestion engine, not a live order book - real
// exchanges also handle partial fills and multiple counterparties per trade.
export const matchTrades = (participants) => {
  const sellers = participants
    .filter((p) => p.balanceT > 0)
    .map((p) => ({ ...p, remaining: p.balanceT }))
    .sort((a, b) => b.remaining - a.remaining)
  const buyers = participants
    .filter((p) => p.balanceT < 0)
    .map((p) => ({ ...p, remaining: -p.balanceT }))
    .sort((a, b) => b.remaining - a.remaining)

  const trades = []
  let si = 0
  let bi = 0
  let tradeNum = 1

  while (si < sellers.length && bi < buyers.length) {
    const seller = sellers[si]
    const buyer = buyers[bi]
    const quantityT = Math.min(seller.remaining, buyer.remaining)

    if (quantityT > 0) {
      trades.push({
        tradeId: `TRD-${String(tradeNum).padStart(3, '0')}`,
        sellerId: seller.id,
        sellerName: seller.name,
        buyerId: buyer.id,
        buyerName: buyer.name,
        quantityT,
        pricePerTonEUR: REFERENCE_PRICE_EUR_PER_T,
        totalValueEUR: quantityT * REFERENCE_PRICE_EUR_PER_T,
      })
      tradeNum += 1
    }

    seller.remaining -= quantityT
    buyer.remaining -= quantityT
    if (seller.remaining <= 0) si += 1
    if (buyer.remaining <= 0) bi += 1
  }

  return trades
}
