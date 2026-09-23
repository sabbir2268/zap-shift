import React, { use } from "react";
import { AuthContext } from "../context/AuthContext/AuthContext";

const useAuth = () => {
  const authInfo = use(AuthContext);
  return authInfo;
};

export default useAuth;

// no need to import authinfo in every file.
