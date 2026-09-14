import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  UserRound,
  Mail,
  Phone,
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
import useAuth from "../../hooks/useAuth";
import SocialLogin from "./SocialLogin";

const Register = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname
    ? location.state.from.pathname + (location.state.from.search || "")
    : "/";

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm();

  const { createUser } = useAuth();

  const onSubmit = (data) => {
    setLoading(true);

    createUser(data.email, data.password)
      .then(() => {
        toast.success("Account created successfully!");
        navigate(from, { replace: true });
      })
      .catch((error) => {
        toast.error(error.message || "Failed to create account");
      })
      .finally(() => {
        setLoading(false);
      });
  };

  return (
    <div className="grid w-full min-h-screen grid-cols-1 lg:grid-cols-5">
      {/* Form side */}
      <div className="flex flex-col justify-center p-8 sm:p-12 lg:col-span-3">
        <h2 className="text-4xl font-bold text-[var(--foreground)]">
          Create account
        </h2>
        <p className="mt-2 text-lg text-[var(--text)]/60">
          Join ZapShift to send, track and manage your deliveries.
        </p>

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="mt-8 flex flex-col gap-5"
        >
          <div className="relative">
            <UserRound
              size={18}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--foreground)]/50"
            />
            <input
              type="text"
              {...register("name", { required: false })}
              name="name"
              placeholder="Full name"
              required
              className="w-full rounded-xl border-2 border-[var(--foreground)]/15 bg-[var(--card)] py-3.5 pl-12 pr-4 font-sans text-[var(--text)] placeholder:text-[var(--text)]/40 outline-none transition-all duration-300 focus:border-[var(--secondary)] focus:ring-4 focus:ring-[var(--secondary)]/20"
            />
            {errors.name && (
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-red-500">
                Name is required
              </span>
            )}
          </div>

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
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
              <Phone
                size={18}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--foreground)]/50"
              />
              <input
                type="tel"
                {...register("phone", { required: false })}
                name="phone"
                placeholder="Phone number"
                required
                className="w-full rounded-xl border-2 border-[var(--foreground)]/15 bg-[var(--card)] py-3.5 pl-12 pr-4 font-sans text-[var(--text)] placeholder:text-[var(--text)]/40 outline-none transition-all duration-300 focus:border-[var(--secondary)] focus:ring-4 focus:ring-[var(--secondary)]/20"
              />
              {errors.phone && (
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-red-500">
                  Phone is required
                </span>
              )}
            </div>
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

          <div className="relative">
            <Lock
              size={18}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--foreground)]/50"
            />
            <input
              type={showConfirmPassword ? "text" : "password"}
              {...register("confirmPassword", {
                required: true,
                minLength: 6,
                validate: (value) =>
                  value === watch("password") || "Passwords do not match",
              })}
              name="confirmPassword"
              placeholder="Confirm password"
              required
              className="w-full rounded-xl border-2 border-[var(--foreground)]/15 bg-[var(--card)] py-3.5 pl-12 pr-12 font-sans text-[var(--text)] placeholder:text-[var(--text)]/40 outline-none transition-all duration-300 focus:border-[var(--secondary)] focus:ring-4 focus:ring-[var(--secondary)]/20"
            />
            {errors.confirmPassword && (
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-red-500">
                {errors.confirmPassword.type === "required"
                  ? "Confirm password is required"
                  : errors.confirmPassword.message}
              </span>
            )}
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-[var(--foreground)]/50 transition-colors duration-300 hover:text-[var(--foreground)]"
              aria-label={
                showConfirmPassword ? "Hide password" : "Show password"
              }
            >
              {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="group relative flex w-full items-center justify-center gap-2 overflow-hidden rounded-full bg-[var(--foreground)] px-6 py-3.5 text-lg font-bold text-[var(--primary)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_10px_30px_rgba(3,55,61,0.35)] active:translate-y-0 disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:translate-y-0"
          >
            <span className="absolute inset-0 -translate-x-full bg-white/20 skew-x-12 transition-transform duration-700 group-hover:translate-x-full" />
            <span className="relative z-10">
              {loading ? "Creating account..." : "Create Account"}
            </span>
            <ArrowRight
              size={18}
              className="relative z-10 transition-transform duration-300 group-hover:translate-x-1"
            />
          </button>
          <SocialLogin></SocialLogin>
        </form>

        <p className="mt-6 text-center text-[var(--text)]/70">
          Already have an account?{" "}
          <Link
            to="/login"
            state={location.state}
            className="font-bold text-[var(--foreground)] underline-offset-4 transition-colors duration-300 hover:text-[var(--secondary)] hover:underline"
          >
            Login
          </Link>
        </p>
      </div>

      <div className="relative flex min-h-72 flex-col justify-end overflow-hidden bg-[var(--foreground)] lg:col-span-2 lg:min-h-full">
        <img
          src={authImage}
          alt="ZapShift delivery rider"
          className="absolute inset-0 h-full w-full object-contain p-6 sm:p-10"
        />

        <div className="absolute inset-0 bg-gradient-to-b from-[var(--foreground)]/70 via-[var(--foreground)]/20 to-[var(--foreground)]/95"></div>

        {/* Text */}
        <div className="relative z-10 p-6 sm:p-8">
          <div className="rounded-2xl border border-white/10 bg-white/10 p-6 backdrop-blur-md">
            <div className="flex items-center gap-2">
              <ShieldCheck size={20} className="text-[var(--secondary)]" />
              <span className="font-semibold text-[var(--secondary)]">
                Why join us?
              </span>
            </div>

            <ul className="mt-4 flex flex-col gap-3 text-[var(--primary)]/90">
              <li className="flex items-center gap-3">
                <Truck size={18} className="shrink-0 text-[var(--secondary)]" />
                On-time delivery, every time
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
    </div>
  );
};

export default Register;
