"use client";

import dynamic from "next/dynamic";
import { Provider } from "react-redux";
import { store } from "@/store/Store";
import { ThemeProvider } from "@/context/ThemeContext";
import { ConfirmDialogProvider } from "@/context/ConfirmDialogProvider";
import { AuthProvider } from "@/context/AuthProvider";

const ToastHost = dynamic(() => import("@/components/common/ToastHost"), {
  ssr: false,
});

export default function Providers({ children }) {
  return (
    <ThemeProvider>
      <ConfirmDialogProvider>
        <Provider store={store}>
          <AuthProvider>
            {children}
            <ToastHost />
          </AuthProvider>
        </Provider>
      </ConfirmDialogProvider>
    </ThemeProvider>
  );
}
