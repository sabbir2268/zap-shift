import React from "react";
import useAuth from "./../../hooks/useAuth";

const SocialLogin = () => {
  const { signInWithGoogle } = useAuth();

  const handleGoogleSignIn = () => {
    signInWithGoogle()
      .then((result) => {
        console.log(result);
      })
      .catch((error) => {
        console.log(error);
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
