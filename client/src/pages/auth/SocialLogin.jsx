import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import useAuth from "./../../hooks/useAuth";
import useAxios from "../../hooks/useAxios";

const SocialLogin = () => {
  const { signInWithGoogle } = useAuth();

  const navigate = useNavigate();
  const location = useLocation();
  const axiosInstance = useAxios();

  const from = location.state?.from?.pathname
    ? location.state.from.pathname + (location.state.from.search || "")
    : "/";

  const handleGoogleSignIn = () => {
    signInWithGoogle()
      .then(async(result) => {
        toast.success("Login successful!");
        const user = result.user;

        //store data in db
        const userInfo = {
          name: user.displayName,
          email: user.email,
          role: "user",
          created_at: new Date().toISOString(),
          last_log_in: new Date().toISOString(),
        };

        const res = await axiosInstance.post('/user', userInfo);
        console.log("user update info", res);

        navigate(from, { replace: true });
      })
      .catch((error) => {
        toast.error(error.message || "Google login failed");
      });
  };

  return (
    <button
      onClick={handleGoogleSignIn}
      className="w-full flex items-center justify-center gap-3 
      bg-[var(--secondary)] 
      hover:bg-[var(--foreground)] 
      text-[var(--foreground)] 
      hover:text-[var(--secondary)] 
      rounded-full py-3 px-4 
      font-bold
      transition duration-300"
    >
      <img
        src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
        alt="Google"
        className="w-5 h-5"
      />

      <span>Continue with Google</span>
    </button>
  );
};

export default SocialLogin;
