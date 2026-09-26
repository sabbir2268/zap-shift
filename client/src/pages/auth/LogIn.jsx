import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  ShieldCheck,
  Truck,
  PackageCheck,
} from "lucide-react";
import toast from "react-hot-toast";
import authImage from "../../assets/authImage.png";
import { useForm } from "react-hook-form";
import SocialLogin from "./SocialLogin";
import useAuth from "../../hooks/useAuth";

const Login = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();
  const { signIn } = useAuth();

  const from = location.state?.from?.pathname
    ? location.state.from.pathname + (location.state.from.search || "")
    : "/";

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const onSubmit = (data) => {
    setLoading(true);

    signIn(data.email, data.password)
      .then(() => {
        toast.success("Login successful!");
        navigate(from, { replace: true });
      })
      .catch((error) => {
        toast.error(error.message || "Invalid email or password");
      })
      .finally(() => {
        setLoading(false);
      });
  };

  return (
    <div className="grid w-full grid-cols-1 lg:grid-cols-5">
      {/* Form side */}
      <div className="flex flex-col justify-center p-8 sm:p-12 lg:col-span-3">
        <h2 className="text-4xl font-bold text-[var(--foreground)]">
          Welcome back
        </h2>
        <p className="mt-2 text-lg text-[var(--text)]/60">
          Login to track parcels, manage deliveries and more.
        </p>

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="mt-8 flex flex-col gap-5"
        >
          <div className="relative">
            <Mail
              size={18}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--foreground)]/50"
            />
            <input
              type="email"
              {...register("email", {
                required: true,
                pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
              })}
              name="email"
              placeholder="Email address"
              required
              className="w-full rounded-xl border-2 border-[var(--foreground)]/15 bg-[var(--card)] py-3.5 pl-12 pr-4 font-sans text-[var(--text)] placeholder:text-[var(--text)]/40 outline-none transition-all duration-300 focus:border-[var(--secondary)] focus:ring-4 focus:ring-[var(--secondary)]/20"
            />
            {errors.email && (
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-red-500">
                {errors.email.type === "required"
                  ? "Email is required"
                  : "Invalid email address"}
              </span>
            )}
          </div>

          <div className="relative">
            <Lock
              size={18}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--foreground)]/50"
            />
            <input
              type={showPassword ? "text" : "password"}
              {...register("password", { required: true, minLength: 6 })}
              name="password"
              placeholder="Password"
              required
              className="w-full rounded-xl border-2 border-[var(--foreground)]/15 bg-[var(--card)] py-3.5 pl-12 pr-12 font-sans text-[var(--text)] placeholder:text-[var(--text)]/40 outline-none transition-all duration-300 focus:border-[var(--secondary)] focus:ring-4 focus:ring-[var(--secondary)]/20"
            />
            {errors.password && (
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-red-500">
                {errors.password.type === "required"
                  ? "Password is required"
                  : "Password must be at least 6 characters"}
              </span>
            )}
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-[var(--foreground)]/50 transition-colors duration-300 hover:text-[var(--foreground)]"
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>

          <div className="flex items-center justify-between">
            <label className="flex cursor-pointer items-center gap-2 text-[var(--text)]/70">
              <input
                type="checkbox"
                className="h-4 w-4 accent-[var(--secondary)]"
              />
              Remember me
            </label>
            <Link
              to="/forgot-password"
              className="font-semibold text-[var(--foreground)] underline-offset-4 transition-colors duration-300 hover:text-[var(--secondary)] hover:underline"
            >
              Forgot password?
            </Link>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="group relative flex w-full items-center justify-center gap-2 overflow-hidden rounded-full bg-[var(--foreground)] px-6 py-3.5 text-lg font-bold text-[var(--primary)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_10px_30px_rgba(3,55,61,0.35)] active:translate-y-0 disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:translate-y-0"
          >
            <span className="absolute inset-0 -translate-x-full bg-white/20 skew-x-12 transition-transform duration-700 group-hover:translate-x-full" />
            <span className="relative z-10">
              {loading ? "Logging in..." : "Login"}
            </span>
            <ArrowRight
              size={18}
              className="relative z-10 transition-transform duration-300 group-hover:translate-x-1"
            />
          </button>
        </form>

        <div className="mt-6 flex items-center gap-3">
          <div className="h-px flex-1 bg-[var(--foreground)]/15"></div>
          <span className="text-[var(--text)]/50">or</span>
          <div className="h-px flex-1 bg-[var(--foreground)]/15"></div>
        </div>

        <SocialLogin />

        <p className="mt-6 text-center text-[var(--text)]/70">
          Don&apos;t have an account?{" "}
          <Link
            to="/register"
            state={location.state}
            className="font-bold text-[var(--foreground)] underline-offset-4 transition-colors duration-300 hover:text-[var(--secondary)] hover:underline"
          >
            Register
          </Link>
        </p>
      </div>

      {/* Image side */}
      <div className="relative m-4 flex min-h-72 flex-col items-center justify-center gap-6 overflow-hidden rounded-3xl bg-[var(--foreground)] p-6 sm:m-6 sm:gap-8 sm:p-8 lg:col-span-2 lg:m-8">
        <img
          src={authImage}
          alt="ZapShift delivery rider"
          className="relative z-10 max-h-44 w-full object-contain sm:max-h-60"
        />

        {/* Text */}
        <div className="relative z-10 w-full rounded-2xl border border-white/10 bg-white/10 p-6 backdrop-blur-md">
          <div className="flex items-center gap-2">
            <ShieldCheck size={20} className="text-[var(--secondary)]" />
            <span className="font-semibold text-[var(--secondary)]">
              Welcome back
            </span>
          </div>

          <ul className="mt-4 flex flex-col gap-3 text-[var(--primary)]/90">
            <li className="flex items-center gap-3">
              <Truck size={18} className="shrink-0 text-[var(--secondary)]" />
              Fast, reliable delivery you can trust
            </li>

            <li className="flex items-center gap-3">
              <PackageCheck
                size={18}
                className="shrink-0 text-[var(--secondary)]"
              />
              Real-time parcel tracking
            </li>

            <li className="flex items-center gap-3">
              <Mail size={18} className="shrink-0 text-[var(--secondary)]" />
              Instant alerts and updates
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Login;
