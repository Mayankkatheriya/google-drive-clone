"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { useDispatch } from "react-redux";
import { auth } from "@/firebase";
import { setSignOutState, setUserLoginDetails } from "@/store/UserSlice";

const AuthContext = createContext({ user: null, authReady: false });

/** Email/password users have no displayName; the app treats an empty name as signed out. */
export function getUserDisplayName(user) {
  return user?.displayName || user?.email?.split("@")[0] || "User";
}

export function AuthProvider({ children }) {
  const dispatch = useDispatch();
  const [user, setUser] = useState(null);
  const [authReady, setAuthReady] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (nextUser) => {
      setUser(nextUser);

      if (nextUser) {
        dispatch(
          setUserLoginDetails({
            name: getUserDisplayName(nextUser),
            photo: nextUser.photoURL,
          })
        );
      } else {
        dispatch(setSignOutState());
      }

      setAuthReady(true);
    });

    return unsubscribe;
  }, [dispatch]);

  const value = useMemo(() => ({ user, authReady }), [user, authReady]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
