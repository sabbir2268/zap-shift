import { use } from "react";
import { AxiosContext } from "../context/AxiosContext/AxiosContext";

const useAxios = () => {
  const api = use(AxiosContext);
  return api;
};

export default useAxios;