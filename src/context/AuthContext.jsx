import React, { useEffect, useState } from "react";
import { 
  onAuthStateChanged, 
  signInWithRedirect,
  signInWithPopup, 
  signOut 
} from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { auth, googleProvider, db } from "../firebase";

import { AuthContext } from "./authContextBase";

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const ADMIN_EMAILS = [
    "jcesperanza@neu.edu.ph".toLowerCase(),
  ];

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setLoading(true);
      try {
        if (!firebaseUser) {
          setUser(null);
          return;
        }

        const email = (firebaseUser.email || "").toLowerCase();

        if (!email.endsWith("@neu.edu.ph")) {
          await signOut(auth);
          setError("Access restricted to @neu.edu.ph accounts only.");
          setUser(null);
          return;
        }

        const userDocRef = doc(db, "users", firebaseUser.uid);
        const userDoc = await getDoc(userDocRef);

        let userData = {
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          displayName: firebaseUser.displayName,
          photoURL: firebaseUser.photoURL,
          role: "Student",         
          canMaintain: false,
          blocked: false,
          college: "",
        };

        if (ADMIN_EMAILS.includes(email)) {
          userData.role = "Admin";
          userData.canMaintain = true;
        }

        if (userDoc.exists()) {
          userData = { ...userData, ...userDoc.data() };

          if (ADMIN_EMAILS.includes(email)) {
            userData.role = "Admin";
            userData.canMaintain = true;
          }
        } else {
          await setDoc(userDocRef, userData);
        }

        if (userData.blocked) {
          await signOut(auth);
          setError("Your account has been blocked.");
          setUser(null);
          return;
        }

        setUser(userData);
        setError(null);
      } catch (err) {
        console.error("Auth bootstrap failed:", err);

        const message =
          err?.code === "permission-denied" ||
          String(err?.message || "").toLowerCase().includes("insufficient permissions")
            ? "Firestore permission denied. Make sure your Firestore rules are deployed to the same Firebase project your app is using, and that authenticated @neu.edu.ph users can read/write /users/{uid}."
            : err?.message || "Authentication failed.";

        setError(message);
        setUser(null);

        try {
          await signOut(auth);
        } catch {
          // ignore
        }
      } finally {
        setLoading(false);
      }
    });

    return unsubscribe;
  }, []);

  const login = async () => {
    try {
      setError(null);
      await signInWithPopup(auth, googleProvider);
    } catch (err) {
      console.error("Login failed:", err);

      const code = err?.code || "";
      const msg = String(err?.message || "");

      const shouldFallbackToRedirect =
        code === "auth/missing-or-invalid-nonce" ||
        msg.toLowerCase().includes("missing-or-invalid-nonce") ||
        msg.toLowerCase().includes("duplicate credential") ||
        code === "auth/popup-blocked";

      if (shouldFallbackToRedirect) {
        try {
          setError(
            "Popup sign-in failed due to browser privacy restrictions. Falling back to redirect sign-in… If this repeats, disable strict tracking protection / allow third-party cookies for this site and avoid private/incognito mode."
          );
          await signInWithRedirect(auth, googleProvider);
          return;
        } catch (redirectErr) {
          console.error("Redirect login failed:", redirectErr);
          setError(redirectErr?.message || "Redirect sign-in failed.");
          return;
        }
      }

      setError(err?.message || "Login failed.");
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
      setUser(null);
    } catch (err) {
      console.error("Logout failed:", err);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, error, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};