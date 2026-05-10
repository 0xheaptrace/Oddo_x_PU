export type TripListItem = {
  id: string
  name: string
  destination: string
  description?: string | null
  startDate: string
  endDate: string
  coverImageUrl?: string | null
  status: string
  currency?: string
  travelers?: number
  shareMode?: string
  shareSlug?: string | null
  isPublic: boolean
  cityCount?: number
  durationDays?: number
  budgetPreview?: number
  budgetCap?: number | null
}

export type TripDetail = TripListItem & {
  stops: Stop[]
  budgetLines: BudgetLine[]
  packingLists: PackingList[]
  notes: TripNote[]
}

export type Stop = {
  id: string
  tripId: string
  sortOrder: number
  city: string
  country?: string | null
  arrivalDate?: string | null
  departureDate?: string | null
  stayNights?: number | null
  hotelName?: string | null
  hotelNotes?: string | null
  transportFromPrev?: string | null
  transportNotes?: string | null
  lat?: number | null
  lng?: number | null
  activities: Activity[]
}

export type Activity = {
  id: string
  stopId: string
  title: string
  category: string
  status?: string
  assignedTo?: string | null
  description?: string | null
  startTime?: string | null
  endTime?: string | null
  durationMinutes?: number | null
  cost?: number | null
  imageUrl?: string | null
  address?: string | null
  rating?: number | null
  transportMode?: string | null
}

export type BudgetLine = {
  id: string
  tripId: string
  category: string
  label: string
  amount: number
  date?: string | null
}

export type PackingList = {
  id: string
  tripId: string
  name: string
  template?: string | null
  items: PackingItem[]
}

export type PackingItem = {
  id: string
  packingListId: string
  category: string
  label: string
  packed: boolean
  sortOrder: number
}

export type TripNote = {
  id: string
  tripId: string
  dayDate?: string | null
  title?: string | null
  content: string
  reminderAt?: string | null
  contactInfo?: string | null
  createdAt: string
}

export type Destination = {
  id: string
  name: string
  country: string
  slug: string
  imageUrl?: string | null
  popularity: number
  avgCostPerDay?: number | null
  attractionsCount?: number | null
  lat?: number | null
  lng?: number | null
  weatherSummary?: string | null
}

export type BrowseActivity = {
  id: string
  title: string
  category: string
  city: string
  country: string
  description?: string | null
  durationMinutes?: number | null
  priceEstimate?: number | null
  rating?: number | null
  imageUrl?: string | null
}
