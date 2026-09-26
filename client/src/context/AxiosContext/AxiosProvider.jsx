import React from "react";
import { AxiosContext } from "./AxiosContext";
import api from "./axiosClient";

const AxiosProvider = ({ children }) => {
  return <AxiosContext value={api}>{children}</AxiosContext>;
};

export default AxiosProvider;
