
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import { CartProvider } from "./contexts/CartContext";
import { AuthProvider } from "./contexts/AuthContext";
import { AdminEditProvider } from "./contexts/AdminEditContext";
import { SkinAnalysisProvider } from "./contexts/SkinAnalysisContext";
import { EditableContentProvider } from "./components/editor/EditableContentProvider"; 

import Index from "./pages/Index";
import Products from "./pages/Products";
import ProductPage from "./pages/ProductPage";
import Cart from "./pages/Cart";
import StoryPage from "./pages/StoryPage";
import NotFound from "./pages/NotFound";
import Auth from "./pages/Auth";
import Register from "./pages/Register";
import ResetPassword from "./pages/ResetPassword";
import UpdatePassword from "./pages/UpdatePassword";
import PhoneVerification from "./pages/PhoneVerification";
import Results from "./pages/Results";
import SkinAnalysis from "./pages/SkinAnalysis";
import Dashboard from "./pages/Dashboard";
import Orders from "./pages/dashboard/Orders";
import Feed from "./pages/dashboard/Feed";
import UserAddresses from "./pages/dashboard/Addresses";
import UserDiscountCodes from "./pages/dashboard/DiscountCodes";
import Checkout from "./pages/Checkout";
import UserDetailsForm from "./pages/UserDetailsForm";
import PaymentConfirmation from "./pages/PaymentConfirmation";
import Login from "./pages/Login";

import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminOverview from "./pages/admin/AdminOverview";
import AdminProducts from "./pages/admin/Products";
import SiteConfig from "./pages/admin/SiteConfig";
import EmailTemplatesPage from "./pages/admin/EmailTemplates";
import Subscriptions from "./pages/admin/Subscriptions";
import DiscountCodes from "./pages/admin/DiscountCodes";
import AdminAddresses from "./pages/admin/Addresses";
import AdminOrders from "./pages/admin/Orders";
import AdminCustomers from "./pages/admin/Customers";
import CustomerProfile from "./pages/admin/CustomerProfile";
import AffiliateApplications from "./pages/admin/AffiliateApplications";
import AffiliateApplicationDetail from "./pages/admin/AffiliateApplicationDetail";

import AffiliateApplication from "./pages/AffiliateApplication";
import AffiliateLogin from "./pages/affiliate/Login";
import AffiliateDashboard from "./pages/affiliate/Dashboard";

import AffiliateProfile from "./pages/dashboard/affiliates/Profile";
import AffiliateAnalytics from "./pages/dashboard/affiliates/Analytics";
import AffiliatePayments from "./pages/dashboard/affiliates/Payments";

import ProtectedRoute from "./components/auth/ProtectedRoute";
import PublicRoute from "./components/PublicRoute";
import SnippyChat from "./components/SnippyChat";
import SecuritySettings from './pages/admin/SecuritySettings';

import Terms from './pages/Terms';
import Privacy from './pages/Privacy';

import "./App.css";

function App() {
  console.log("App is rendering with routes");

  return (
    <HelmetProvider>
      <CartProvider>
        <BrowserRouter>
          <AuthProvider>
            <AdminEditProvider>
              <SkinAnalysisProvider>
                <EditableContentProvider>
                  <Routes>
                    {/* Public Routes */}
                    <Route path="/" element={<Index />} />
                    <Route path="/products" element={<Products />} />
                    <Route path="/products/:productId" element={<ProductPage />} />
                    <Route path="/cart" element={<Cart />} />
                    <Route path="/checkout" element={<Checkout />} />
                    <Route path="/story/:storyId" element={<StoryPage />} />
                    <Route path="/results" element={<Results />} />
                    <Route path="/skin-analysis" element={<SkinAnalysis />} />
                    <Route path="/auth" element={<Auth />} />
                    <Route path="/register" element={<Register />} />
                    <Route path="/reset-password" element={<ResetPassword />} />
                    <Route path="/update-password" element={<UpdatePassword />} />
                    <Route path="/phone-verification" element={<PhoneVerification />} />
                    <Route path="/user-details" element={<UserDetailsForm />} />
                    <Route path="/payment-confirmation" element={<PaymentConfirmation />} />
                    <Route path="/terms" element={<Terms />} />
                    <Route path="/privacy" element={<Privacy />} />
                    <Route path="/login" element={
                      <PublicRoute>
                        <Login />
                      </PublicRoute>
                    } />

                    {/* Protected Dashboard Routes */}
                    <Route path="/dashboard" element={
                      <ProtectedRoute>
                        <Dashboard />
                      </ProtectedRoute>
                    } />
                    <Route path="/dashboard/feed" element={
                      <ProtectedRoute>
                        <Feed />
                      </ProtectedRoute>
                    } />
                    <Route path="/dashboard/orders" element={
                      <ProtectedRoute>
                        <Orders />
                      </ProtectedRoute>
                    } />
                    <Route path="/dashboard/addresses" element={
                      <ProtectedRoute>
                        <UserAddresses />
                      </ProtectedRoute>
                    } />
                    <Route path="/dashboard/discount-codes" element={
                      <ProtectedRoute>
                        <UserDiscountCodes />
                      </ProtectedRoute>
                    } />

                    {/* Affiliate Section Dashboard Routes */}
                    <Route path="/dashboard/affiliates/profile" element={
                      <ProtectedRoute>
                        <AffiliateProfile />
                      </ProtectedRoute>
                    } />
                    <Route path="/dashboard/affiliates/analytics" element={
                      <ProtectedRoute>
                        <AffiliateAnalytics />
                      </ProtectedRoute>
                    } />
                    <Route path="/dashboard/affiliates/payments" element={
                      <ProtectedRoute>
                        <AffiliatePayments />
                      </ProtectedRoute>
                    } />

                    {/* Affiliate Routes */}
                    <Route path="/affiliate-application" element={<AffiliateApplication />} />
                    <Route path="/affiliate/login" element={<AffiliateLogin />} />
                    <Route path="/affiliate/dashboard" element={
                      <ProtectedRoute>
                        <AffiliateDashboard />
                      </ProtectedRoute>
                    } />

                    {/* Admin Routes */}
                    <Route path="/admin" element={
                      <ProtectedRoute>
                        <AdminDashboard />
                      </ProtectedRoute>
                    }>
                      <Route index element={<AdminOverview />} />
                      <Route path="products/*" element={<AdminProducts />} />
                      <Route path="site-config" element={<SiteConfig />} />
                      <Route path="email-templates" element={<EmailTemplatesPage />} />
                      <Route path="subscriptions" element={<Subscriptions />} />
                      <Route path="addresses" element={<AdminAddresses />} />
                      <Route path="orders" element={<AdminOrders />} />
                      <Route path="discount-codes" element={<DiscountCodes />} />
                      <Route path="customers" element={<AdminCustomers />} />
                      <Route path="customers/:userId" element={<CustomerProfile />} />
                      <Route path="affiliate-applications" element={<AffiliateApplications />} />
                      <Route path="affiliate-applications/:id" element={<AffiliateApplicationDetail />} />
                      <Route path="security-settings" element={<SecuritySettings />} />
                    </Route>

                    {/* Fallback */}
                    <Route path="*" element={<NotFound />} />
                  </Routes>

                  <SnippyChat />
                </EditableContentProvider>
              </SkinAnalysisProvider>
            </AdminEditProvider>
          </AuthProvider>
        </BrowserRouter>
      </CartProvider>
    </HelmetProvider>
  );
}

export default App;
