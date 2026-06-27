"use client";

import AppShellSkeleton from "./skeleton/AppShellSkeleton";
import LoginSkeleton from "./skeleton/LoginSkeleton";

export default function AuthSplash({ variant = "app" }) {
  if (variant === "login") {
    return <LoginSkeleton />;
  }

  return <AppShellSkeleton />;
}
