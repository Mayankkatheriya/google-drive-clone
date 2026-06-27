"use client";

import { Provider } from "react-redux";
import { ToastContainer } from "react-toastify";
import { store } from "@/store/Store";
import { ThemeProvider } from "@/context/ThemeContext";
import { ConfirmDialogProvider } from "@/context/ConfirmDialogProvider";
import { AuthProvider } from "@/context/AuthProvider";
import "react-toastify/dist/ReactToastify.css";

export default function Providers({ children }) {
  return (
    <ThemeProvider>
      <ConfirmDialogProvider>
        <Provider store={store}>
          <AuthProvider>
            {children}
            <ToastContainer
              position="top-right"
              autoClose={1000}
              hideProgressBar={false}
              newestOnTop={false}
              closeOnClick
              rtl={false}
              pauseOnFocusLoss
              draggable
              pauseOnHover
              theme="dark"
            />
          </AuthProvider>
        </Provider>
      </ConfirmDialogProvider>
    </ThemeProvider>
  );
}
