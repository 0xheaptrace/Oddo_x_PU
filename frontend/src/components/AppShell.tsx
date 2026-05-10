import { cn } from '@/lib/utils'
import { useAuthStore } from '@/store/authStore'
import { useUiStore } from '@/store/uiStore'
import {
  Backpack,
  BarChart3,
  Compass,
  LayoutDashboard,
  LogOut,
  MapPinned,
  Menu,
  NotebookPen,
  Plane,
  Settings,
  Share2,
  Sparkles,
  Wallet,
  X,
  Moon,
  Sun,
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useState } from 'react'
import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { QuickJump } from '@/components/QuickJump'

const nav = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/dashboard/trips', label: 'My Trips', icon: Plane },
  { to: '/dashboard/explore/cities', label: 'Explore Cities', icon: Compass },
  { to: '/dashboard/explore/activities', label: 'Activities', icon: Sparkles },
  { to: '/dashboard/shared', label: 'Shared Trips', icon: Share2 },
]

function tripLinks(lastTripId: string | null) {
  const base = lastTripId ? `/dashboard/trips/${lastTripId}` : '/dashboard/trips'
  return [
    { to: `${base}/itinerary`, label: 'Itinerary', icon: MapPinned, disabled: !lastTripId },
    { to: `${base}/budget`, label: 'Budget', icon: Wallet, disabled: !lastTripId },
    { to: `${base}/packing`, label: 'Packing', icon: Backpack, disabled: !lastTripId },
    { to: `${base}/notes`, label: 'Notes', icon: NotebookPen, disabled: !lastTripId },
  ]
}

export function AppShell() {
  const navigate = useNavigate()
  const logout = useAuthStore((s) => s.logout)
  const user = useAuthStore((s) => s.user)
  const sidebarCollapsed = useUiStore((s) => s.sidebarCollapsed)
  const setSidebarCollapsed = useUiStore((s) => s.setSidebarCollapsed)
  const lastTripId = useUiStore((s) => s.lastTripId)
  const theme = useUiStore((s) => s.theme)
  const toggleTheme = useUiStore((s) => s.toggleTheme)
  const [mobileOpen, setMobileOpen] = useState(false)

  const asideWidth = sidebarCollapsed ? 'md:w-[76px]' : 'md:w-64'

  return (
    <div className="flex min-h-screen">
      <QuickJump />
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-40 hidden flex-col border-r backdrop-blur-xl md:flex',
          'border-[color:var(--panel-border)] bg-[color:var(--panel-bg)]',
          asideWidth,
          'transition-[width] duration-300 ease-out',
        )}
      >
        <div className="flex h-16 items-center gap-2 border-b border-slate-100/80 px-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-600 to-sky-500 text-lg font-bold text-white shadow-lg shadow-indigo-500/25">
            T
          </div>
          {!sidebarCollapsed && (
            <div className="leading-tight">
              <p className="font-display text-sm font-bold text-slate-900">Traveloop</p>
              <p className="text-[11px] text-slate-500">Plan smarter journeys</p>
            </div>
          )}
        </div>

        <nav className="flex flex-1 flex-col gap-1 overflow-y-auto px-2 py-4">
          {nav.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-gradient-to-r from-indigo-600/10 to-sky-500/10 text-indigo-800 ring-1 ring-indigo-100'
                    : 'text-slate-600 hover:bg-slate-100/80',
                  sidebarCollapsed && 'justify-center px-2',
                )
              }
            >
              <item.icon className="h-5 w-5 shrink-0 text-indigo-600" />
              {!sidebarCollapsed && item.label}
            </NavLink>
          ))}
          <div className="my-2 border-t border-slate-100 pt-2">
            <p
              className={cn(
                'mb-1 px-3 text-[10px] font-semibold uppercase tracking-wider text-slate-400',
                sidebarCollapsed && 'hidden',
              )}
            >
              Trip tools
            </p>
            {tripLinks(lastTripId).map((item) => (
              <NavLink
                key={item.to}
                to={item.disabled ? '/dashboard/trips' : item.to}
                onClick={(e) => {
                  if (item.disabled) {
                    e.preventDefault()
                    navigate('/dashboard/trips')
                  }
                }}
                className={({ isActive }) =>
                  cn(
                    'flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium transition-colors',
                    isActive && !item.disabled
                      ? 'bg-slate-900/[0.04] text-slate-900'
                      : 'text-slate-600 hover:bg-slate-100/80',
                    sidebarCollapsed && 'justify-center px-2',
                    item.disabled && 'opacity-70',
                  )
                }
              >
                <item.icon className="h-4 w-4 shrink-0 text-sky-600" />
                {!sidebarCollapsed && item.label}
              </NavLink>
            ))}
          </div>
        </nav>

        <div className="border-t border-slate-100 p-2">
          <NavLink
            to="/dashboard/profile"
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium transition-colors',
                isActive ? 'bg-slate-100 text-slate-900' : 'text-slate-600 hover:bg-slate-50',
                sidebarCollapsed && 'justify-center',
              )
            }
          >
            <Settings className="h-4 w-4 text-slate-500" />
            {!sidebarCollapsed && 'Profile & settings'}
          </NavLink>
          {user?.role === 'ADMIN' && (
            <NavLink
              to="/dashboard/admin"
              className={({ isActive }) =>
                cn(
                  'mt-1 flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium transition-colors',
                  isActive ? 'bg-purple-50 text-purple-900' : 'text-purple-700 hover:bg-purple-50/80',
                  sidebarCollapsed && 'justify-center',
                )
              }
            >
              <BarChart3 className="h-4 w-4" />
              {!sidebarCollapsed && 'Admin analytics'}
            </NavLink>
          )}
          <button
            type="button"
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className="mt-2 flex w-full items-center justify-center rounded-xl border border-dashed border-slate-200 py-2 text-xs font-medium text-slate-500 hover:bg-slate-50"
          >
            {sidebarCollapsed ? 'Expand' : 'Collapse'}
          </button>
        </div>
      </aside>

      {/* Mobile drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm md:hidden"
            onClick={() => setMobileOpen(false)}
          >
            <motion.aside
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ type: 'spring', damping: 28, stiffness: 320 }}
              className="absolute left-0 top-0 flex h-full w-[280px] flex-col bg-white shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between border-b border-slate-100 px-4 py-4">
                <span className="font-display font-bold text-slate-900">Menu</span>
                <button type="button" className="rounded-lg p-2 hover:bg-slate-100" onClick={() => setMobileOpen(false)}>
                  <X className="h-5 w-5" />
                </button>
              </div>
              <nav className="flex flex-col gap-1 p-3">
                {[...nav, ...tripLinks(lastTripId)].map((item) => (
                  <NavLink
                    key={item.to}
                    to={'disabled' in item && item.disabled ? '/dashboard/trips' : item.to}
                    onClick={() => setMobileOpen(false)}
                    className="rounded-xl px-3 py-3 text-sm font-medium text-slate-700 hover:bg-slate-50"
                  >
                    {item.label}
                  </NavLink>
                ))}
              </nav>
            </motion.aside>
          </motion.div>
        )}
      </AnimatePresence>

      <div className={cn('flex flex-1 flex-col', sidebarCollapsed ? 'md:pl-[76px]' : 'md:pl-64')}>
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b px-4 backdrop-blur-xl md:px-8 border-[color:var(--panel-border)] bg-[color:var(--panel-bg)]">
          <div className="flex items-center gap-3">
            <button
              type="button"
              className="rounded-xl p-2 hover:bg-slate-100 md:hidden"
              onClick={() => setMobileOpen(true)}
              aria-label="Open menu"
            >
              <Menu className="h-6 w-6 text-slate-700" />
            </button>
            <div className="hidden text-sm text-slate-500 md:block">
              Signed in as{' '}
              <span className="font-semibold text-slate-800">{user?.name ?? 'Traveler'}</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={toggleTheme}
              className="inline-flex items-center gap-2 rounded-xl border px-3 py-2 text-sm font-medium shadow-sm hover:opacity-95 border-[color:var(--panel-border)] bg-[color:var(--panel-solid)] text-[color:var(--text)]"
              aria-label="Toggle theme"
              title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
              <span className="hidden sm:inline">{theme === 'dark' ? 'Light' : 'Dark'}</span>
            </button>
            <button
              type="button"
              onClick={() => {
                logout()
                navigate('/login')
              }}
              className="inline-flex items-center gap-2 rounded-xl border px-3 py-2 text-sm font-medium shadow-sm hover:opacity-95 border-[color:var(--panel-border)] bg-[color:var(--panel-solid)] text-[color:var(--text)]"
            >
              <LogOut className="h-4 w-4" />
              Log out
            </button>
          </div>
        </header>

        <main className="flex-1 px-4 py-8 md:px-8">
          <div className="mx-auto max-w-6xl">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  )
}
