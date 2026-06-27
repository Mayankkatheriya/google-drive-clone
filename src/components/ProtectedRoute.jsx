"use client";

import { useEffect } from "react";
import { useSelector } from "react-redux";
import { useRouter } from "next/navigation";
import { selectUserName } from "../store/UserSlice";
import { useAuth } from "@/context/AuthProvider";
import AuthSplash from "./common/AuthSplash";

const ProtectedRoute = ({ children }) => {
  const { authReady } = useAuth();
  const userName = useSelector(selectUserName);
  const router = useRouter();

  useEffect(() => {
    if (authReady && !userName) {
      router.replace("/");
    }
  }, [authReady, userName, router]);

  if (!authReady || !userName) {
    return <AuthSplash />;
  }

  return children;
};

export default ProtectedRoute;
