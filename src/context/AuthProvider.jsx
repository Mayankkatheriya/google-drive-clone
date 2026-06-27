"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { useDispatch } from "react-redux";
import { auth } from "@/firebase";
import { setSignOutState, setUserLoginDetails } from "@/store/UserSlice";

const AuthContext = createContext({ authReady: false });

export function AuthProvider({ children }) {
  const dispatch = useDispatch();
  const [authReady, setAuthReady] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        dispatch(
          setUserLoginDetails({
            name: user.displayName,
            photo: user.photoURL,
          })
        );
      } else {
        dispatch(setSignOutState());
      }
      setAuthReady(true);
    });

    return unsubscribe;
  }, [dispatch]);

  return (
    <AuthContext.Provider value={{ authReady }}>{children}</AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
