import { createBrowserRouter } from "react-router";
import RootLayout from "../layouts/RootLayout";
import AuthLayout from "../layouts/AuthLayout";
import DashboardLayout from "../layouts/DashboardLayout";
import AdminLayout from "../layouts/AdminLayout";
import PrivateRoutes from "./PrivateRoutes";
import AdminRoutes, { AdminRedirect } from "./AdminRoutes";
import Home from "../pages/home/Home";
import Coverage from "../pages/coverage/Coverage";
import Service from "../pages/service/service";
import BeARider from "../pages/beARider/BeARider";
import DashboardHome from "../pages/dashboard/DashboardHome";
import SendParcel from "../pages/dashboard/sendParcel/SendParcel";
import MyParcels from "../pages/dashboard/myParcels/MyParcels";
import TrackParcel from "../pages/dashboard/trackParcel/TrackParcel";
import Profile from "../pages/dashboard/profile/Profile";
import UpdateParcel from "../pages/dashboard/updateParcel/UpdateParcel";
import Payment from "../pages/dashboard/payment/Payment";
import PaymentHistory from "../pages/dashboard/payment/PaymentHistory";
import Login from "../pages/auth/LogIn";
import Register from "../pages/auth/Register";
import ForgotPassword from "../pages/auth/ForgotPassword";
import AdminHome from "../pages/admin/AdminHome";
import PendingRiders from "../pages/admin/riders/PendingRiders";
import ActiveRiders from "../pages/admin/riders/ActiveRiders";
import ManageUsers from "../pages/admin/manageUsers/ManageUsers";
import ManageParcels from "../pages/admin/manageParcels/ManageParcels";
import ManagePayments from "../pages/admin/managePayments/ManagePayments";
import Administration from "../pages/admin/administration/Administration";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <RootLayout />,
    children: [
      { index: true, element: <Home /> },
      { path: "coverage", element: <Coverage /> },
      { path: "service", element: <Service /> },
      {
        path: "be_a_rider",
        element: (
          <PrivateRoutes>
            <BeARider />
          </PrivateRoutes>
        ),
      },
    ],
  },
  {
    path: "/dashboard",
    element: (
      <PrivateRoutes>
        <AdminRedirect>
          <DashboardLayout />
        </AdminRedirect>
      </PrivateRoutes>
    ),
    children: [
      {
        index: true,
        element: <DashboardHome />,
      },
      { path: "send-parcel", element: <SendParcel /> },
      { path: "parcels", element: <MyParcels /> },
      { path: "track", element: <TrackParcel /> },
      { path: "profile", element: <Profile /> },
      { path: "update-parcel/:id", element: <UpdateParcel /> },
      { path: "payment/:id", element: <Payment /> },
      { path: "payments", element: <PaymentHistory /> },
    ],
  },
  {
    path: "/admin",
    element: (
      <PrivateRoutes>
        <AdminRoutes>
          <AdminLayout />
        </AdminRoutes>
      </PrivateRoutes>
    ),
    children: [
      { index: true, element: <AdminHome /> },
      { path: "pending-riders", element: <PendingRiders /> },
      { path: "active-riders", element: <ActiveRiders /> },
      { path: "manage-users", element: <ManageUsers /> },
      { path: "manage-parcels", element: <ManageParcels /> },
      { path: "manage-payments", element: <ManagePayments /> },
      { path: "administration", element: <Administration /> },
    ],
  },
  {
    element: <AuthLayout />,
    children: [
      { path: "/login", element: <Login /> },
      { path: "/register", element: <Register /> },
      { path: "/forgot-password", element: <ForgotPassword /> },
    ],
  },
]);
