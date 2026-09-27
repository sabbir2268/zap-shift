import React, { useCallback, useEffect, useRef, useState } from "react";
import { AuthContext } from "./AuthContext";
import {
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  updateProfile,
  onAuthStateChanged,
  onIdTokenChanged,
} from "firebase/auth";
import { auth } from "../../firebase/firebase.init";
import api, { onForbidden } from "../AxiosContext/axiosClient";
import { ROLES, isAdminRole, isRiderRole } from "../../data/admin";

const googleProvider = new GoogleAuthProvider();

const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState(null);
  const [roleLoading, setRoleLoading] = useState(false);
  const [blockedReason, setBlockedReason] = useState(null);
  const profileRef = useRef(null);

  /*
   * The role is only ever read from the server, which reads it from the
   * database. Nothing that arrives from the browser is trusted here.
   */
  const loadProfile = useCallback(async () => {
    try {
      const data = await api.get("/api/users/me");
      profileRef.current = data;
      setProfile(data);
      setBlockedReason(null);
      return data;
    } catch (error) {
      /* no record for this account, so all it can ever be is a plain user */
      if (error.status === 404) {
        const plain = { role: ROLES.USER };
        profileRef.current = plain;
        setProfile(plain);
        return plain;
      }

      /* the account was blocked while the session was open. a block is not a
         role change, so the role we cached is worthless and the session has to
         end. the sign out also drops the token that will keep being refused */
      if (error.blocked) {
        profileRef.current = null;
        setProfile(null);
        setBlockedReason(error.message);
        signOut(auth).catch(() => {});
        return { role: ROLES.USER };
      }

      /* a dropped connection or an expired token is not a role change, so keep
         whatever we already know rather than throwing away a real admin */
      return profileRef.current || { role: ROLES.USER };
    }
  }, []);

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
    profileRef.current = null;
    setProfile(null);
    return signOut(auth).finally(() => setLoading(false));
  };

  const signInWithGoogle = () => {
    setLoading(true);
    return signInWithPopup(auth, googleProvider).finally(() =>
      setLoading(false)
    );
  };

  const updateUserProfile = (profileInfo) => {
    return updateProfile(auth.currentUser, profileInfo);
  };

  // observer
  useEffect(() => {
    const unSubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });

    return () => {
      unSubscribe();
    };
  }, []);

  /* load the signed in user's record so their role is available app wide */
  useEffect(() => {
    if (!user) {
      profileRef.current = null;
      setProfile(null);
      setRoleLoading(false);
      return;
    }

    let cancelled = false;

    setRoleLoading(true);

    loadProfile().finally(() => {
      if (!cancelled) setRoleLoading(false);
    });

    return () => {
      cancelled = true;
    };
  }, [user, loadProfile]);

  /*
   * A token refresh can mean a role change, so re-read the role whenever the
   * id token changes. This is what makes a demotion take effect without a
   * full page reload, and what makes an expired token transparent.
   */
  useEffect(() => {
    if (!user) return;

    const unSubscribe = onIdTokenChanged(auth, (currentUser) => {
      if (currentUser) loadProfile();
    });

    return () => {
      unSubscribe();
    };
  }, [user, loadProfile]);

  /*
   * If the server rejects a request as forbidden, the role we hold is stale,
   * most likely it was just taken away. Re-read it so the guards react.
   */
  useEffect(() => {
    if (!user) return;

    return onForbidden(() => loadProfile());
  }, [user, loadProfile]);

  const role = profile?.role;

  const authInfo = {
    user,
    loading,
    profile,
    role,
    /* guards must wait for this, otherwise a fresh admin gets bounced out */
    roleReady: !loading && !roleLoading,
    isAdmin: isAdminRole(role),
    isRider: isRiderRole(role),
    /* why the session ended, so the login screen can say so */
    blockedReason,
    loadProfile,
    createUser,
    signIn,
    logOut,
    signInWithGoogle,
    updateUserProfile,
  };

  return <AuthContext value={authInfo}>{children}</AuthContext>;
};

export default AuthProvider;
