"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { useDispatch } from "react-redux";
import { auth } from "@/firebase";
import { setSignOutState, setUserLoginDetails } from "@/store/UserSlice";

const AuthContext = createContext({ user: null, authReady: false });

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
            name: nextUser.displayName,
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
