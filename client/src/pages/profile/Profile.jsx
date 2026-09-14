import React from "react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import {
  Mail,
  ShieldCheck,
  BadgeCheck,
  CalendarDays,
  KeyRound,
  LogOut,
  Package,
  UserRound,
} from "lucide-react";
import useAuth from "../../hooks/useAuth";

const Providers = {
  "google.com": "Google",
  "facebook.com": "Facebook",
  password: "Email & Password",
};

const Profile = () => {
  const { user, logOut } = useAuth();

  const rawName =
    user?.displayName?.trim() || user?.email?.split("@")[0]?.trim() || "User";

  const displayName = rawName
    .split(/[._-]+/g)
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");

  const email = user?.email || "No email provided";

  const [firstName = "", ...rest] = displayName.split(" ");
  const lastName = rest.pop() || "";
  const initials = `${firstName[0] || ""}${lastName[0] || ""}`.toUpperCase();

  const providerId = user?.providerData?.[0]?.providerId;
  const provider = Providers[providerId] || providerId || "Unknown";

  const memberSince = user?.metadata?.creationTime
    ? new Date(user.metadata.creationTime).toLocaleDateString(undefined, {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : "—";

  const handleLogout = () => {
    logOut()
      .then(() => toast.success("Logged out successfully!"))
      .catch((error) => toast.error(error.message || "Failed to log out"));
  };

  return (
    <section className="w-full bg-gray-50 py-12 md:py-16">
      <div className="max-w-xl mx-auto px-4 sm:px-6">
        <div className="rounded-3xl bg-white border border-gray-200 shadow-md overflow-hidden">
          {/* Header */}
          <div className=" bg-gradient-to-r from-indigo-500 to-purple-600 px-6 pt-14 pb-14 text-center">
            <div className="w-24 h-24 mx-auto rounded-full bg-white flex items-center justify-center text-3xl font-bold shadow-lg ring-4 ring-indigo-300 overflow-hidden">
              {user?.photoURL ? (
                <img
                  src={user.photoURL}
                  alt={displayName}
                  className="w-full h-full object-cover"
                />
              ) : initials ? (
                initials
              ) : (
                <UserRound size={40} className="text-indigo-500" />
              )}
            </div>

            <div className="relative z-10 mt-6">
              <h1 className="text-2xl md:text-3xl font-bold text-white break-words leading-tight">
                {displayName}
              </h1>

              <p className="mt-2 text-sm text-indigo-100 break-words">
                {email}
              </p>

              {user?.emailVerified && (
                <span className="inline-flex items-center gap-1.5 mt-4 px-3 py-1 rounded-full bg-green-500 text-white text-xs font-semibold">
                  <BadgeCheck size={14} />
                  Verified Account
                </span>
              )}
            </div>
          </div>

          {/* Details */}
          <div className="px-6 -mt-7">
            <div className="rounded-2xl border border-gray-200 bg-white divide-y divide-gray-100">
              <InfoRow
                icon={<UserRound size={18} />}
                label="Display Name"
                value={displayName}
              />
              <InfoRow icon={<Mail size={18} />} label="Email" value={email} />
              <InfoRow
                icon={<KeyRound size={18} />}
                label="Sign-in Method"
                value={provider}
              />
              <InfoRow
                icon={<CalendarDays size={18} />}
                label="Member Since"
                value={memberSince}
              />
              <InfoRow
                icon={<ShieldCheck size={18} />}
                label="Email Verification"
                value={user?.emailVerified ? "Verified" : "Not Verified"}
              />
            </div>
          </div>

          {/* Actions */}
          <div className="px-6 pt-6 pb-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Link
                to="/admin"
                className="flex items-center justify-center gap-2 px-6 py-3 rounded-full bg-indigo-600 text-white font-semibold hover:bg-indigo-700 transition-all duration-300"
              >
                <Package size={17} />
                My Parcels
              </Link>

              <button
                type="button"
                onClick={handleLogout}
                className="flex items-center justify-center gap-2 px-6 py-3 rounded-full border-2 border-red-400 text-red-500 font-semibold hover:bg-red-500 hover:text-white transition-all duration-300"
              >
                <LogOut size={17} />
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

const InfoRow = ({ icon, label, value }) => (
  <div className="flex items-center gap-4 px-5 py-4">
    <div className="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center shrink-0">
      {icon}
    </div>
    <div className="min-w-0 text-left">
      <p className="text-xs text-gray-500">{label}</p>
      <p className="text-sm font-semibold text-gray-800 break-words">{value}</p>
    </div>
  </div>
);

export default Profile;
