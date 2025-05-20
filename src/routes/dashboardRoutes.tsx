
import { lazy } from "react";
import { RouteObject } from "react-router-dom";

// Import components
import Dashboard from "@/pages/dashboard/Dashboard";
import CreateEvent from "@/pages/dashboard/CreateEvent";
import CreateMemory from "@/pages/dashboard/CreateMemory";
import EditMemory from "@/pages/dashboard/EditMemory";
import EventsManagement from "@/pages/dashboard/EventsManagement";
import MemoryDetail from "@/pages/dashboard/MemoryDetail";
import Memories from "@/pages/dashboard/Memories";
import AddRestaurant from "@/pages/dashboard/AddRestaurant";
import RestaurantMenu from "@/pages/dashboard/RestaurantMenu";
import SocialMedia from "@/pages/dashboard/SocialMedia";
import AffiliateLinks from "@/pages/dashboard/AffiliateLinks";
import MyAccount from "@/pages/dashboard/MyAccount";
import Settings from "@/pages/dashboard/Settings";
import AdminSettings from "@/pages/dashboard/AdminSettings";

// Lazy loaded components
const Users = lazy(() => import("@/pages/dashboard/Users"));
const PaymentSuccessPage = lazy(
  () => import("@/pages/dashboard/PaymentSuccessPage")
);
const PaymentsPage = lazy(() => import("@/pages/dashboard/PaymentsPage"));
const EventPayment = lazy(() => import("@/pages/dashboard/EventPayment"));

// Changed from RouteObject to JSX.Element since we're using it in App.tsx
const DashboardRoutes = () => (
  <>
    {dashboardRoutes.map((route) => (
      <Route
        key={route.path || 'index'}
        path={route.path}
        element={route.element}
      >
        {route.children?.map(child => (
          <Route 
            key={child.path || 'index-child'}
            index={child.index}
            path={child.path}
            element={child.element}
          />
        ))}
      </Route>
    ))}
  </>
);

const dashboardRoutes: RouteObject[] = [
  {
    path: "dashboard",
    children: [
      {
        index: true,
        element: <Dashboard />,
      },
      {
        path: "events",
        element: <EventsManagement />,
      },
      {
        path: "events/create",
        element: <CreateEvent />,
      },
      {
        path: "events/edit/:id",
        element: <CreateEvent />,
      },
      {
        path: "events/payment",
        element: <EventPayment />,
      },
      {
        path: "memories",
        element: <Memories />,
      },
      {
        path: "memories/create",
        element: <CreateMemory />,
      },
      {
        path: "memories/edit/:id",
        element: <EditMemory />,
      },
      {
        path: "memories/:id",
        element: <MemoryDetail />,
      },
      {
        path: "restaurants/add",
        element: <AddRestaurant />,
      },
      {
        path: "restaurant-menu/:id",
        element: <RestaurantMenu />,
      },
      {
        path: "social-media",
        element: <SocialMedia />,
      },
      {
        path: "affiliate-links",
        element: <AffiliateLinks />,
      },
      {
        path: "users",
        element: <Users />,
      },
      {
        path: "my-account",
        element: <MyAccount />,
      },
      {
        path: "settings",
        element: <Settings />,
      },
      {
        path: "payment-success",
        element: <PaymentSuccessPage />,
      },
      {
        path: "payments",
        element: <PaymentsPage />,
      },
      {
        path: "admin-settings",
        element: <AdminSettings />,
      },
    ],
  },
];

export { DashboardRoutes };
export default dashboardRoutes;
