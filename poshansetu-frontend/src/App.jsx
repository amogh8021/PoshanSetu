import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import LoginPage from './pages/common/LoginPage';
import ParentDashboard from './pages/parent/ParentDashboard';
import WorkerDashboard from './pages/worker/WorkerDashboard';
import AdminDashboard from './pages/admin/AdminDashboard';
import { useEffect, useState } from 'react';

function OfflineBanner() {
  const [offline, setOffline] = useState(!navigator.onLine);
  useEffect(() => {
    const on = () => setOffline(false);
    const off = () => setOffline(true);
    window.addEventListener('online', on);
    window.addEventListener('offline', off);
    return () => { window.removeEventListener('online', on); window.removeEventListener('offline', off); };
  }, []);
  if (!offline) return null;
  return (
    <div className="bg-amber-400 text-amber-900 text-center text-xs py-2 font-medium sticky top-0 z-50">
      ⚠️ You are offline — some features may not work
    </div>
  );
}

function RoleRedirect() {
  const { role, token } = useAuth();
  if (!token) return <Navigate to="/login" replace />;
  if (role === 'PARENT') return <Navigate to="/parent" replace />;
  if (role === 'WORKER') return <Navigate to="/worker" replace />;
  if (role === 'ADMIN') return <Navigate to="/admin" replace />;
  return <Navigate to="/login" replace />;
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ToastProvider>
          <OfflineBanner />
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/" element={<RoleRedirect />} />
            <Route
              path="/parent/*"
              element={
                <ProtectedRoute allowedRoles={['PARENT']}>
                  <ParentDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/worker/*"
              element={
                <ProtectedRoute allowedRoles={['WORKER']}>
                  <WorkerDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/*"
              element={
                <ProtectedRoute allowedRoles={['ADMIN']}>
                  <AdminDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/unauthorized"
              element={
                <div className="min-h-screen flex items-center justify-center bg-slate-50">
                  <div className="text-center">
                    <h1 className="text-4xl font-bold text-red-500 mb-2">403</h1>
                    <p className="text-slate-600">You don&apos;t have access to this page.</p>
                    <a href="/login" className="text-indigo-600 text-sm mt-4 block hover:underline">Go back to Login</a>
                  </div>
                </div>
              }
            />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </ToastProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
