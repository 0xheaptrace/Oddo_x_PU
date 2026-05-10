import { Card, CardTitle } from '@/components/ui/Card'
import { PageTransition } from '@/components/PageTransition'
import { formatMoney } from '@/lib/utils'
import { useTripContext } from '@/hooks/useTripContext'
import { Link } from 'react-router-dom'
import { ArrowRight, Calendar, MapPin } from 'lucide-react'
import { differenceInCalendarDays, parseISO } from 'date-fns'

export function TripOverviewPage() {
  const { trip } = useTripContext()
  const days =
    differenceInCalendarDays(parseISO(trip.endDate), parseISO(trip.startDate)) + 1 || 1
  const total = trip.budgetLines.reduce((s, l) => s + l.amount, 0)

  return (
    <PageTransition>
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-sky-600" />
            Timeline
          </CardTitle>
          <p className="mt-2 text-sm text-slate-600">
            {new Date(trip.startDate).toLocaleDateString()} → {new Date(trip.endDate).toLocaleDateString()}
          </p>
          <p className="mt-1 text-2xl font-bold text-slate-900">{days} days</p>
          <Link
            to={`/dashboard/trips/${trip.id}/view`}
            className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-indigo-600 hover:text-indigo-700"
          >
            Open views <ArrowRight className="h-4 w-4" />
          </Link>
        </Card>
        <Card>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5 text-emerald-600" />
            Route
          </CardTitle>
          <p className="mt-2 text-sm text-slate-600">Stops planned</p>
          <p className="mt-1 text-2xl font-bold text-slate-900">{trip.stops.length} cities</p>
          <Link
            to={`/dashboard/trips/${trip.id}/itinerary`}
            className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-indigo-600 hover:text-indigo-700"
          >
            Edit planner <ArrowRight className="h-4 w-4" />
          </Link>
        </Card>
        <Card>
          <CardTitle>Budget snapshot</CardTitle>
          <p className="mt-2 text-sm text-slate-600">Tracked spend</p>
          <p className="mt-1 text-2xl font-bold text-slate-900">{formatMoney(total, trip.currency || 'INR')}</p>
          {trip.budgetCap != null && (
            <p className="text-xs text-slate-500">
              Cap {formatMoney(trip.budgetCap, trip.currency || 'INR')}
              {total > trip.budgetCap && (
                <span className="ml-2 font-semibold text-orange-600">Over cap</span>
              )}
            </p>
          )}
          <Link
            to={`/dashboard/trips/${trip.id}/budget`}
            className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-indigo-600 hover:text-indigo-700"
          >
            Cost breakdown <ArrowRight className="h-4 w-4" />
          </Link>
        </Card>
      </div>
    </PageTransition>
  )
}
