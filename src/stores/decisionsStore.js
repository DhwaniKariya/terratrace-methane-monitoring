import { create } from 'zustand'

// Tracks operator decisions (Accepted/Rejected/Pending) against recommendation
// IDs. Kept separate from the generated mock data so a status change survives
// re-generating recommendations and can be read from any panel.
export const useDecisionsStore = create((set) => ({
  statusByRecId: {},
  setStatus: (recommendationId, status) =>
    set((state) => ({
      statusByRecId: { ...state.statusByRecId, [recommendationId]: status },
    })),
}))
