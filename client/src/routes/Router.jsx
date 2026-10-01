import { createBrowserRouter } from "react-router";
import RootLayout from "../layouts/RootLayout";
import AuthLayout from "../layouts/AuthLayout";
import DashboardLayout from "../layouts/DashboardLayout";
import AdminLayout from "../layouts/AdminLayout";
import RiderLayout from "../layouts/RiderLayout";
import PrivateRoutes from "./PrivateRoutes";
import AdminRoutes from "./AdminRoutes";
import RiderRoutes, { DashboardRedirect } from "./RoleRoutes";
import Home from "../pages/home/Home";
import Coverage from "../pages/coverage/Coverage";
import Service from "../pages/service/Service";
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
import AssignRider from "../pages/admin/assignRider/AssignRider";
import ManagePayments from "../pages/admin/managePayments/ManagePayments";
import Administration from "../pages/admin/administration/Administration";
import RiderHome from "../pages/rider/RiderHome";
import MyDeliveries from "../pages/rider/MyDeliveries";
import RiderProfile from "../pages/rider/RiderProfile";
import MyEarnings from "../pages/rider/MyEarnings";

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
        <DashboardRedirect>
          <DashboardLayout />
        </DashboardRedirect>
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
      { path: "assign-rider", element: <AssignRider /> },
      { path: "manage-payments", element: <ManagePayments /> },
      { path: "administration", element: <Administration /> },
    ],
  },
  {
    path: "/rider",
    element: (
      <PrivateRoutes>
        <RiderRoutes>
          <RiderLayout />
        </RiderRoutes>
      </PrivateRoutes>
    ),
    children: [
      { index: true, element: <RiderHome /> },
      { path: "deliveries", element: <MyDeliveries /> },
      { path: "earnings", element: <MyEarnings /> },
      /* the old cashout address still opens the earnings page, so a link that
         predates the rename is not a dead end */
      { path: "cashout", element: <MyEarnings /> },
      { path: "profile", element: <RiderProfile /> },
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
