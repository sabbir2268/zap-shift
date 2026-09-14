import { createBrowserRouter } from "react-router";
import Home from "../pages/home/Home";
import RootLayout from "../layouts/RootLayout";
import AuthLayout from "../layouts/AuthLayout";
import Login from "../pages/auth/LogIn";
import Register from "../pages/auth/Register";
import ForgotPassword from "../pages/auth/ForgotPassword";
import Coverage from "../pages/coverage/Coverage";
import SendParcel from "../pages/sendParcel/SendParcel";
import Service from "../pages/service/service";
import AdminParcels from "../pages/admin/AdminParcels";
import Profile from "../pages/profile/Profile";
import BeARider from "../pages/beARider/BeARider";
import PrivateRoutes from './PrivateRoutes';

export const router = createBrowserRouter([
  {
    path: "/",
    element: <RootLayout></RootLayout>,
    children: [
      {
        index: "true",
        element: <Home></Home>,
      },
      {
        path: "coverage",
        element: <Coverage></Coverage>,
      },
      {
        path: "service",
        element: <Service></Service>,
      },
      {
        path: "be_a_rider",
        element: <BeARider></BeARider>,
      },
      {
        path: "send_parcel",
        element: <PrivateRoutes>
          <SendParcel></SendParcel>
        </PrivateRoutes>
      },
      {
        path: "admin",
        element: <PrivateRoutes>
          <AdminParcels></AdminParcels>
        </PrivateRoutes>
      },
      {
        path: "profile",
        element: <PrivateRoutes>
          <Profile></Profile>
        </PrivateRoutes>
      },
    ],
  },
  {
    path: "/",
    element: <AuthLayout></AuthLayout>,
    children: [
      {
        path: "login",
        element: <Login></Login>,
      },
      {
        path: "register",
        element: <Register></Register>,
      },
      {
        path: "forgot-password",
        element: <ForgotPassword></ForgotPassword>,
      },
    ],
  },
]);
