"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { useDispatch } from "react-redux";
import { auth } from "@/firebase";
import { setSignOutState, setUserLoginDetails } from "@/store/UserSlice";

const AuthContext = createContext({
  user: null,
  authReady: false,
  needsEmailVerification: false,
  refreshUser: async () => false,
});

/** Email/password users have no displayName; the app treats an empty name as signed out. */
export function getUserDisplayName(user) {
  return user?.displayName || user?.email?.split("@")[0] || "User";
}

export function AuthProvider({ children }) {
  const dispatch = useDispatch();
  const [user, setUser] = useState(null);
  const [emailVerified, setEmailVerified] = useState(false);
  const [authReady, setAuthReady] = useState(false);

  const applyUser = useCallback(
    (nextUser) => {
      setUser(nextUser);
      setEmailVerified(Boolean(nextUser?.emailVerified));

      // Unverified email accounts stay signed out in the app until they click the link.
      if (nextUser?.emailVerified) {
        dispatch(
          setUserLoginDetails({
            name: getUserDisplayName(nextUser),
            photo: nextUser.photoURL,
          })
        );
      } else {
        dispatch(setSignOutState());
      }
    },
    [dispatch]
  );

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (nextUser) => {
      applyUser(nextUser);
      setAuthReady(true);
    });

    return unsubscribe;
  }, [applyUser]);

  /** Re-reads the user from Firebase (e.g. after they click the verification link). */
  const refreshUser = useCallback(async () => {
    const current = auth.currentUser;
    if (!current) return false;
    await current.reload();
    if (current.emailVerified) {
      // New ID token carries email_verified=true for the API routes and Firestore rules.
      await current.getIdToken(true);
    }
    applyUser(current);
    return current.emailVerified;
  }, [applyUser]);

  const value = useMemo(
    () => ({
      user,
      authReady,
      needsEmailVerification: Boolean(user) && !emailVerified,
      refreshUser,
    }),
    [user, authReady, emailVerified, refreshUser]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
