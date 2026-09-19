import { createBrowserRouter } from "react-router";
import RootLayout from "../layouts/RootLayout";
import AuthLayout from "../layouts/AuthLayout";
import DashboardLayout from "../layouts/DashboardLayout";
import PrivateRoutes from "./PrivateRoutes";
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
import Login from "../pages/auth/LogIn";
import Register from "../pages/auth/Register";
import ForgotPassword from "../pages/auth/ForgotPassword";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <RootLayout />,
    children: [
      { index: true, element: <Home /> },
      { path: "coverage", element: <Coverage /> },
      { path: "service", element: <Service /> },
      { path: "be_a_rider", element: <BeARider /> },
    ],
  },
  {
    path: "/dashboard",
    element: (
      <PrivateRoutes>
        <DashboardLayout />
      </PrivateRoutes>
    ),
    children: [
      { index: true, element: <DashboardHome /> },
      { path: "send-parcel", element: <SendParcel /> },
      { path: "parcels", element: <MyParcels /> },
      { path: "track", element: <TrackParcel /> },
      { path: "profile", element: <Profile /> },
      { path: "update-parcel/:id", element: <UpdateParcel /> },
      { path: "payment/:id", element: <Payment /> },
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