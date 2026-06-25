"use client";

import React, { useEffect } from "react";
import { useSelector } from "react-redux";
import { useRouter } from "next/navigation";
import { selectUserName } from "../store/UserSlice";

const ProtectedRoute = ({ children }) => {
  const userName = useSelector(selectUserName);
  const router = useRouter();

  useEffect(() => {
    if (!userName) {
      router.replace("/");
    }
  }, [userName, router]);

  if (!userName) {
    return null;
  }

  return children;
};

export default ProtectedRoute;
