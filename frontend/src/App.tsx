import { api } from '@/api/client'
import { AppShell } from '@/components/AppShell'
import { GuestRoute, ProtectedRoute } from '@/components/ProtectedRoute'
import { useAuthStore } from '@/store/authStore'
import { useEffect } from 'react'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'

import { LandingPage } from '@/pages/LandingPage'
import { LoginPage } from '@/pages/LoginPage'
import { SignupPage } from '@/pages/SignupPage'
import { ForgotPasswordPage } from '@/pages/ForgotPasswordPage'
import { DashboardPage } from '@/pages/DashboardPage'
import { MyTripsPage } from '@/pages/MyTripsPage'
import { CreateTripPage } from '@/pages/CreateTripPage'
import { TripLayout } from '@/pages/TripLayout'
import { TripOverviewPage } from '@/pages/TripOverviewPage'
import { ItineraryBuilderPage } from '@/pages/ItineraryBuilderPage'
import { ItineraryViewPage } from '@/pages/ItineraryViewPage'
import { BudgetPage } from '@/pages/BudgetPage'
import { PackingPage } from '@/pages/PackingPage'
import { NotesPage } from '@/pages/NotesPage'
import { CitiesPage } from '@/pages/CitiesPage'
import { ActivitiesPage } from '@/pages/ActivitiesPage'
import { SharedTripsPage } from '@/pages/SharedTripsPage'
import { ProfilePage } from '@/pages/ProfilePage'
import { PublicSharePage } from '@/pages/PublicSharePage'
import { AdminPage } from '@/pages/AdminPage'
import { TripRequestsPage } from '@/pages/TripRequestsPage'

function AuthBootstrap() {
  useEffect(() => {
    const token = useAuthStore.getState().token
    if (!token) return
    let cancelled = false
    ;(async () => {
      try {
        const { data } = await api.get<{ user: NonNullable<ReturnType<typeof useAuthStore.getState>['user']> }>(
          '/auth/me',
        )
        if (!cancelled) useAuthStore.getState().setAuth(token, data.user)
      } catch {
        if (!cancelled) useAuthStore.getState().logout()
      }
    })()
    return () => {
      cancelled = true
    }
  }, [])

  return null
}

function AdminGate() {
  const role = useAuthStore((s) => s.user?.role)
  if (role !== 'ADMIN') return <Navigate to="/dashboard" replace />
  return <AdminPage />
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthBootstrap />
      <Toaster position="top-center" toastOptions={{ className: 'rounded-xl shadow-lg' }} />
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route
          path="/login"
          element={
            <GuestRoute>
              <LoginPage />
            </GuestRoute>
          }
        />
        <Route
          path="/signup"
          element={
            <GuestRoute>
              <SignupPage />
            </GuestRoute>
          }
        />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/share/:slug" element={<PublicSharePage />} />

        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <AppShell />
            </ProtectedRoute>
          }
        >
          <Route index element={<DashboardPage />} />
          <Route path="trips" element={<MyTripsPage />} />
          <Route path="trips/new" element={<CreateTripPage />} />
          <Route path="trips/:tripId" element={<TripLayout />}>
            <Route index element={<TripOverviewPage />} />
            <Route path="itinerary" element={<ItineraryBuilderPage />} />
            <Route path="view" element={<ItineraryViewPage />} />
            <Route path="budget" element={<BudgetPage />} />
            <Route path="packing" element={<PackingPage />} />
            <Route path="notes" element={<NotesPage />} />
            <Route path="requests" element={<TripRequestsPage />} />
          </Route>
          <Route path="explore/cities" element={<CitiesPage />} />
          <Route path="explore/activities" element={<ActivitiesPage />} />
          <Route path="shared" element={<SharedTripsPage />} />
          <Route path="profile" element={<ProfilePage />} />
          <Route path="admin" element={<AdminGate />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
