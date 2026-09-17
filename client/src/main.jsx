import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import { Toaster } from "react-hot-toast";

import { RouterProvider } from "react-router-dom";
import { router } from "./routes/Router";
import AuthProvider from "./context/AuthContext/AuthProvider";
import AxiosProvider from "./context/AxiosContext/AxiosProvider";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <AuthProvider>
      <AxiosProvider>
        <RouterProvider router={router} />
        <Toaster position="top-center" />
      </AxiosProvider>
    </AuthProvider>
  </StrictMode>,
);
