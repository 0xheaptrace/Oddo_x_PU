import type { TripDetail } from '@/lib/types'
import { useOutletContext } from 'react-router-dom'

export type TripContext = {
  trip: TripDetail
  setTrip: React.Dispatch<React.SetStateAction<TripDetail | null>>
}

/** Outlet context always provides a loaded trip inside trip routes */

export function useTripContext() {
  return useOutletContext<TripContext>()
}
