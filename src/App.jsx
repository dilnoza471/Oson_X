import { Routes, Route, Navigate } from 'react-router-dom';
import ShopPage from './pages/shop/[shopId].jsx';
import AdminLogin from './pages/admin/login.jsx';
import AdminDashboard from './pages/admin/dashboard.jsx';
import ProtectedRoute from './components/shared/ProtectedRoute.jsx';

export default function App() {
  const urlParams = new URLSearchParams(window.location.search);
  const shop = urlParams.get('shop');

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <Routes>
        <Route
          path="/"
          element={
            shop ? <ShopPage shopId={shop} /> : <AdminLogin />
          }
        />
        <Route path="/shop/:shopId" element={<ShopPage />} />
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route
          path="/admin/dashboard"
          element={
            <ProtectedRoute>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />
      </Routes>
    </div>
  );
}
