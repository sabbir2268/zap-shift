import React from "react";
import { Link } from "react-router-dom";
import { Mail, ArrowLeft, KeyRound, Send, ShieldCheck, Truck, PackageCheck } from "lucide-react";
import authImage from "../../assets/authImage.png";
import { useForm } from "react-hook-form";

const ForgotPassword = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const onSubmit = (data) => {
    console.log(data);
  };

  return (
    <div className="grid w-full h-screen grid-cols-1 overflow-hidden  lg:grid-cols-5">
      {/* Form side */}
      <div className="flex flex-col justify-center p-8 sm:p-12 lg:col-span-3">
        <h2 className="text-4xl font-bold text-[var(--foreground)]">Forgot password?</h2>
        <p className="mt-2 text-lg text-[var(--text)]/60">
          No worries — enter your email and we&apos;ll send you a link to reset
          your password.
        </p>

        <form onSubmit={handleSubmit(onSubmit)} className="mt-8 flex flex-col gap-5">
          <div className="relative">
            <KeyRound
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

          <button
            type="submit"
            className="group relative flex w-full items-center justify-center gap-2 overflow-hidden rounded-full bg-[var(--foreground)] px-6 py-3.5 text-lg font-bold text-[var(--primary)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_10px_30px_rgba(3,55,61,0.35)] active:translate-y-0"
          >
            <span className="absolute inset-0 -translate-x-full bg-white/20 skew-x-12 transition-transform duration-700 group-hover:translate-x-full" />
            <span className="relative z-10">Send Reset Link</span>
            <Send
              size={18}
              className="relative z-10 transition-transform duration-300 group-hover:translate-x-1"
            />
          </button>
        </form>

        <Link
          to="/login"
          className="mt-6 flex items-center justify-center gap-2 font-bold text-[var(--foreground)] underline-offset-4 transition-colors duration-300 hover:text-[var(--secondary)] hover:underline"
        >
          <ArrowLeft size={16} />
          Back to login
        </Link>
      </div>

      {/* Image side */}
      <div className="relative flex min-h-72 flex-col justify-end overflow-hidden bg-[var(--foreground)] lg:col-span-2 lg:min-h-full">
        <img
          src={authImage}
          alt="ZapShift delivery rider"
          className="absolute inset-0 h-full w-full object-cover"
        />

        <div className="absolute inset-0 bg-gradient-to-b from-[var(--foreground)]/70 via-[var(--foreground)]/20 to-[var(--foreground)]/95"></div>

        {/* Brand badge */}
        <div className="absolute right-8 top-8 z-10 flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 backdrop-blur-md">
          <PackageCheck size={16} className="text-[var(--secondary)]" />
          <span className="text-sm font-semibold text-[var(--secondary)]">
            ZapShift
          </span>
        </div>

        {/* Text */}
        <div className="relative z-10 p-6 sm:p-8">
          <div className="rounded-2xl border border-white/10 bg-white/10 p-6 backdrop-blur-md">
            <div className="flex items-center gap-2">
              <ShieldCheck size={20} className="text-[var(--secondary)]" />
              <span className="font-semibold text-[var(--secondary)]">
                We&apos;ve got you covered
              </span>
            </div>

            <ul className="mt-4 flex flex-col gap-3 text-[var(--primary)]/90">
              <li className="flex items-center gap-3">
                <Truck size={18} className="shrink-0 text-[var(--secondary)]" />
                Back up and running in minutes
              </li>

              <li className="flex items-center gap-3">
                <PackageCheck size={18} className="shrink-0 text-[var(--secondary)]" />
                Secure reset link to your inbox
              </li>

              <li className="flex items-center gap-3">
                <Mail size={18} className="shrink-0 text-[var(--secondary)]" />
                No data lost, ever
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;