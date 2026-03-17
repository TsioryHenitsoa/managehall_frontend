import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useEffect } from 'react'
import { useAuthStore } from './stores/auth.store.ts'
import AuthPage from './pages/auth/AuthPage.tsx'
import Layout from './components/layout/Layout.tsx'
import DashboardPage from './pages/dashboard/DashboardPage.tsx'
import SallesPage from './pages/salles/SallesPage.tsx'
import SalleDetailPage from './pages/salles/SalleDetailPage.tsx'
import ReservationsPage from './pages/reservations/ReservationsPage.tsx'
import AnalyticsPage from './pages/analytics/AnalyticsPage.tsx'
import HistoryPage from './pages/history/HistoryPage.tsx'
import ToastContainer from './components/ui/ToastContainer.tsx'

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
  return isAuthenticated ? <>{children}</> : <Navigate to="/auth" replace />
}

function PublicRoute({ children }: { children: React.ReactNode }) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
  return isAuthenticated ? <Navigate to="/dashboard" replace /> : <>{children}</>
}

function App() {
  const hydrate = useAuthStore((s) => s.hydrate)

  useEffect(() => {
    hydrate()
  }, [hydrate])

  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route path="/auth" element={<PublicRoute><AuthPage /></PublicRoute>} />
          <Route element={<ProtectedRoute><Layout /></ProtectedRoute>}>
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/salles" element={<SallesPage />} />
            <Route path="/salles/:id" element={<SalleDetailPage />} />
            <Route path="/reservations" element={<ReservationsPage />} />
            <Route path="/analytics" element={<AnalyticsPage />} />
            <Route path="/history" element={<HistoryPage />} />
          </Route>
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </BrowserRouter>
      <ToastContainer />
    </>
  )
}

export default App
