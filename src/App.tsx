import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { RestaurantProvider } from './contexts/RestaurantContext';
import { PlatformProvider } from './contexts/PlatformContext';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/common/ProtectedRoute';
import LoginPage from './pages/login/LoginPage';
import QuickSetupPage from './pages/setup/QuickSetupPage';
import CustomerMenu from './pages/customer/CustomerMenu';
import KitchenDisplay from './pages/kitchen/KitchenDisplay';
import AdminDashboard from './pages/admin/AdminDashboard';
import WaiterInterface from './pages/waiter/WaiterInterface';
import SuperAdminDashboard from './pages/super-admin/SuperAdminDashboard';
import CashierPOS from './pages/cashier/CashierPOS';
import CEODashboard from './pages/ceo/CEODashboard';
import NotFoundPage from './pages/not-found/NotFoundPage';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <PlatformProvider>
        <RestaurantProvider>
          <Routes>
            <Route path="/" element={<Navigate to="/login" replace />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/setup" element={<QuickSetupPage />} />

            {/* Mijoz uchun menyu login talab qilmaydi (QR orqali ochiladi) */}
            <Route path="/menu/:restaurantSlug/:tableToken" element={<CustomerMenu />} />

            <Route
              path="/kitchen"
              element={
                <ProtectedRoute allowedRoles={['kitchen']}>
                  <KitchenDisplay />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <AdminDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/waiter"
              element={
                <ProtectedRoute allowedRoles={['waiter']}>
                  <WaiterInterface />
                </ProtectedRoute>
              }
            />
            <Route
              path="/super-admin"
              element={
                <ProtectedRoute allowedRoles={['super-admin']}>
                  <SuperAdminDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/cashier"
              element={
                <ProtectedRoute allowedRoles={['cashier']}>
                  <CashierPOS />
                </ProtectedRoute>
              }
            />
            <Route
              path="/ceo"
              element={
                <ProtectedRoute allowedRoles={['ceo']}>
                  <CEODashboard />
                </ProtectedRoute>
              }
            />

            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </RestaurantProvider>
        </PlatformProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
