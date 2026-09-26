import React, { useEffect, useState } from "react";
import { AuthContext } from "./AuthContext";
import {
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  reauthenticateWithRedirect,
  signInWithPopup,
  signOut,
  updateProfile,
} from "firebase/auth";
import { signInWithEmailAndPassword } from "firebase/auth";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../../firebase/firebase.init";
import api from "../AxiosContext/axiosClient";
import { isAdminUser } from "../../data/admin";

const googleProvider = new GoogleAuthProvider();

const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState(null);
  const [roleLoading, setRoleLoading] = useState(false);

  const createUser = (email, password) => {
    setLoading(true);
    return createUserWithEmailAndPassword(auth, email, password).finally(() =>
      setLoading(false)
    );
  };

  const signIn = (email, password) => {
    setLoading(true);
    return signInWithEmailAndPassword(auth, email, password).finally(() =>
      setLoading(false)
    );
  };

  const logOut = () => {
    setLoading(true);
    return signOut(auth).finally(() => setLoading(false));
  };

  const signInWithGoogle = () => {
    setLoading(true);
    return signInWithPopup(auth, googleProvider).finally(() =>
      setLoading(false)
    );
  };

  const updateUserProfile = profileInfo =>{
    return updateProfile(auth.currentUser, profileInfo);
  }

  // observer
  useEffect(() => {
    const unSubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      console.log("user in the auth state change", currentUser);
      setLoading(false);
    });

    return () => {
      unSubscribe();
    };
  }, []);

  /* load the signed in user's record so their role is available app wide */
  useEffect(() => {
    if (!user) {
      setProfile(null);
      setRoleLoading(false);
      return;
    }

    let cancelled = false;
    setRoleLoading(true);

    api
      .get("/api/users/me")
      .then((data) => {
        if (!cancelled) setProfile(data);
      })
      .catch(() => {
        /* account has no record yet, treat it as a plain user */
        if (!cancelled) setProfile({ role: "user" });
      })
      .finally(() => {
        if (!cancelled) setRoleLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [user]);

  const authInfo = {
    user,
    loading,
    profile,
    role: profile?.role,
    roleReady: !loading && !roleLoading,
    isAdmin: isAdminUser(user, profile?.role),
    createUser,
    signIn,
    logOut,
    signInWithGoogle,
    updateUserProfile,
  };

  return <AuthContext value={authInfo}>{children}</AuthContext>;
};

export default AuthProvider;
