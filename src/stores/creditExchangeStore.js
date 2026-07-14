import { create } from 'zustand'

// Mirrors the real registry lifecycle (Verra/Gold Standard): a trade is
// Suggested by the matching engine, the seller/buyer Propose and Accept it,
// and once Retired a credit is permanently removed from circulation so it
// can never be resold or double-counted.
export const useCreditExchangeStore = create((set) => ({
  statusByTradeId: {},
  setTradeStatus: (tradeId, status) =>
    set((state) => ({
      statusByTradeId: { ...state.statusByTradeId, [tradeId]: status },
    })),
}))
