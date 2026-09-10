import { UserRound, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

const LoginButton = () => {
  const navigate = useNavigate();
  return (
    <button
      onClick={() => navigate("/login")}
      className="
        group relative overflow-hidden
        flex items-center gap-2
        rounded-full
        border-2 border-[var(--foreground)]
        px-5 py-2.5
        text-[var(--foreground)]
        font-bold text-lg
        transition-all duration-300
        hover:-translate-y-1
        hover:bg-[var(--foreground)]
        hover:text-white
        hover:shadow-[0_8px_25px_rgba(3,55,61,0.35)]
        active:translate-y-0
      "
    >
      <span
        className="
          absolute inset-0
          -translate-x-full
          bg-white/20
          skew-x-12
          transition-transform duration-700
          group-hover:translate-x-full
        "
      />

      <UserRound
        size={18}
        className="
          relative z-10
          transition-transform duration-300
          group-hover:rotate-12
        "
      />

      <span className="relative z-10">Login</span>
    </button>
  );
};


const RegisterButton = () => {
  const navigate = useNavigate();
  return (
    <button
      onClick={() => navigate("/register")}
      className="
        group relative overflow-hidden
        flex items-center gap-2
        rounded-full
        bg-[var(--secondary)]
        px-5 py-2.5
        text-[var(--foreground)]
        font-bold text-lg
        shadow-md
        transition-all duration-300
        hover:-translate-y-1
        hover:shadow-[0_10px_30px_rgba(202,235,102,0.55)]
        active:translate-y-0
      "
    >
      <span
        className="
          absolute inset-0
          -translate-x-full
          bg-white/50
          skew-x-12
          transition-transform duration-700
          group-hover:translate-x-full
        "
      />

      <span className="relative z-10">Register</span>

      <ArrowRight
        size={18}
        className="
          relative z-10
          transition-all duration-300
          group-hover:translate-x-1
        "
      />
    </button>
  );
};

export { LoginButton, RegisterButton };