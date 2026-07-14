import { getNetworkParticipants, matchTrades, REFERENCE_PRICE_EUR_PER_T } from '../../data/creditExchangeData'
import { useCreditExchangeStore } from '../../stores/creditExchangeStore'
import '../../styles/Panels.css'
import '../../styles/CreditExchange.css'

const STATUS_FLOW = ['Suggested', 'Proposed', 'Accepted', 'Retired']

function CarbonCreditExchange() {
  const participants = getNetworkParticipants()
  const trades = matchTrades(participants)
  const statusByTradeId = useCreditExchangeStore((state) => state.statusByTradeId)
  const setTradeStatus = useCreditExchangeStore((state) => state.setTradeStatus)

  const totalSurplus = Math.round(participants.filter((p) => p.balanceT > 0).reduce((sum, p) => sum + p.balanceT, 0))
  const totalDeficit = Math.round(Math.abs(participants.filter((p) => p.balanceT < 0).reduce((sum, p) => sum + p.balanceT, 0)))
  const matchableVolume = Math.round(trades.reduce((sum, t) => sum + t.quantityT, 0))

  const sortedParticipants = [...participants].sort((a, b) => b.balanceT - a.balanceT)

  const advanceStatus = (tradeId, current) => {
    const idx = STATUS_FLOW.indexOf(current)
    const next = STATUS_FLOW[Math.min(idx + 1, STATUS_FLOW.length - 1)]
    setTradeStatus(tradeId, next)
  }

  return (
    <div className="panel">
      <div className="panel-header">
        <h2>Carbon Credit Exchange</h2>
        <p>Network-wide view - who has spare credits, who's short, by end of the 90-day reporting period</p>
      </div>

      <div className="exchange-explainer">
        <strong>How this works:</strong> each participant gets an allocated allowance set below their
        business-as-usual emissions (the same shrinking-cap mechanic as the EU ETS). Verified avoided
        emissions from the network's own OGMP 2.0-grade measurement data reduce a branch's projected
        emissions, freeing up a surplus it can sell. Anyone projected to exceed their allowance shows a
        deficit and needs to buy credits instead - the same "sell your spare allowance, buy to cover your
        excess" mechanic used in real cap-and-trade markets. Reference price: €{REFERENCE_PRICE_EUR_PER_T}/tCO2e,
        a blend between voluntary-market and compliance-market rates given the measurement-based data backing it.
      </div>

      <div className="kpi-grid">
        <div className="kpi-card status-healthy">
          <span className="kpi-label">Network surplus</span>
          <div className="kpi-value">{totalSurplus.toLocaleString()} tCO2e</div>
          <div className="kpi-sub">available to sell</div>
        </div>
        <div className="kpi-card status-critical">
          <span className="kpi-label">Network deficit</span>
          <div className="kpi-value">{totalDeficit.toLocaleString()} tCO2e</div>
          <div className="kpi-sub">needed to cover excess</div>
        </div>
        <div className="kpi-card">
          <span className="kpi-label">Matchable volume</span>
          <div className="kpi-value">{matchableVolume.toLocaleString()} tCO2e</div>
          <div className="kpi-sub">across {trades.length} suggested trades</div>
        </div>
        <div className="kpi-card">
          <span className="kpi-label">Reference price</span>
          <div className="kpi-value">€{REFERENCE_PRICE_EUR_PER_T}/t</div>
          <div className="kpi-sub">blended network rate</div>
        </div>
      </div>

      <div className="table-scroll">
        <table className="participant-table">
          <thead>
            <tr>
              <th>Participant</th>
              <th>Region</th>
              <th>Allocated</th>
              <th>Projected emissions</th>
              <th>Balance</th>
            </tr>
          </thead>
          <tbody>
            {sortedParticipants.map((p) => (
              <tr key={p.id}>
                <td>
                  <span className="participant-name">{p.name}</span>
                  {p.type === 'own-branch' && <span className="participant-tag">Your network</span>}
                </td>
                <td>{p.region}</td>
                <td>{p.allocatedCreditsT.toLocaleString()} t</td>
                <td>{p.projectedEmissionsT.toLocaleString()} t</td>
                <td className={p.balanceT >= 0 ? 'balance-surplus' : 'balance-deficit'}>
                  {p.balanceT >= 0 ? '+' : ''}{p.balanceT.toLocaleString()} t
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="panel-header">
        <h2 style={{ fontSize: '1.05rem' }}>Suggested trades</h2>
      </div>

      {trades.length === 0 ? (
        <div className="empty-state">No matchable surplus/deficit pairs right now.</div>
      ) : (
        <div className="data-card-list">
          {trades.map((t) => {
            const status = statusByTradeId[t.tradeId] || 'Suggested'
            const isRetired = status === 'Retired'
            return (
              <div className="trade-card" key={t.tradeId}>
                <div className="data-card-top">
                  <div className="trade-parties">
                    {t.sellerName} <span className="arrow">sells to</span> {t.buyerName}
                  </div>
                  <span className={`badge-pill ${status.toLowerCase()}`}>{status}</span>
                </div>

                <div className="field-row">
                  <div>
                    <span className="field-label">Quantity</span>
                    <span className="field-value">{t.quantityT.toLocaleString()} tCO2e</span>
                  </div>
                  <div>
                    <span className="field-label">Price</span>
                    <span className="field-value">€{t.pricePerTonEUR}/t</span>
                  </div>
                  <div>
                    <span className="field-label">Total value</span>
                    <span className="field-value">€{t.totalValueEUR.toLocaleString()}</span>
                  </div>
                </div>

                <div className="trade-status-actions">
                  <button disabled={isRetired} onClick={() => advanceStatus(t.tradeId, status)}>
                    {isRetired ? 'Retired' : `Advance to ${STATUS_FLOW[STATUS_FLOW.indexOf(status) + 1]}`}
                  </button>
                  <button className="retire" disabled={isRetired} onClick={() => setTradeStatus(t.tradeId, 'Retired')}>
                    Retire credit
                  </button>
                  <button onClick={() => setTradeStatus(t.tradeId, 'Suggested')}>Reset</button>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

export default CarbonCreditExchange
