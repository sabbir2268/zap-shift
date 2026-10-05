import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import { RouterProvider } from "react-router-dom";
import { router } from "./routes/Router";
import AuthProvider from "./context/AuthContext/AuthProvider";
import AxiosProvider from "./context/AxiosContext/AxiosProvider";
import ThemeProvider from "./context/ThemeContext/ThemeProvider";
import AppToaster from "./components/Toast/AppToaster";

const queryClient = new QueryClient();

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <ThemeProvider>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <AxiosProvider>
            <RouterProvider router={router} />
            <AppToaster />
          </AxiosProvider>
        </AuthProvider>
      </QueryClientProvider>
    </ThemeProvider>
  </StrictMode>,
);
