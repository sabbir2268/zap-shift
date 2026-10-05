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
  Truck,
  LayoutDashboard,
  UserRound,
  Bike,
  Hash,
  Fingerprint,
  User,
  MapPin,
  Warehouse,
  Phone,
} from "lucide-react";
import useAuth from "../../hooks/useAuth";
import StatusBadge from "../../components/StatusBadge/StatusBadge";
import { getRiderServiceCenter } from "../../data/rider";
import { getRiderAge } from "../../utils/riders";

const Providers = {
  "google.com": "Google",
  "facebook.com": "Facebook",
  password: "Email & Password",
};

/* the one shortcut worth offering, which is the page that matters most to
   whoever is signed in */
const shortcuts = {
  rider: { to: "/rider/deliveries", label: "My Deliveries", icon: Truck },
  admin: { to: "/admin", label: "Admin Dashboard", icon: LayoutDashboard },
  user: { to: "/dashboard/parcels", label: "My Parcels", icon: Package },
};

/*
 * The profile page every role shares.
 *
 * Customer, rider and admin all open the same account card here, because a rider
 * is also a signed in account and used to be handed a plainer page than a
 * customer with the same picture. The picture, the name and the account details
 * are the same everywhere.
 *
 * A rider is the one role that carries a second record, the identity an admin
 * approved for them, so their record sits in a card of its own beside the account
 * card instead of being stacked inside it. An admin is the only one who can
 * change that record, so it is shown and never edited here.
 */
const Profile = () => {
  const { user, profile, isAdmin, isRider, logOut } = useAuth();

  const rider = profile?.riderInfo || {};
  const hasRiderRecord = isRider && Boolean(profile?.riderInfo);

  /* an approved rider record carries the name the application was made with, so
     it wins over the account name, which is empty for some older accounts */
  const rawName =
    rider.name?.trim() ||
    user?.displayName?.trim() ||
    user?.email?.split("@")[0]?.trim() ||
    "User";

  const displayName = rawName
    .split(/[._-]+/g)
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");

  const email = user?.email || rider.email || "No email provided";

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

  const shortcut = isRider
    ? shortcuts.rider
    : isAdmin
      ? shortcuts.admin
      : shortcuts.user;

  const ShortcutIcon = shortcut.icon;

  const handleLogout = () => {
    logOut()
      .then(() => toast.success("Logged out successfully!"))
      .catch((error) => toast.error(error.message || "Failed to log out"));
  };

  const accountCard = (
    <div className="rounded-3xl bg-[var(--surface)] border border-[var(--border)] shadow-md overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-500 to-purple-600 px-6 pt-14 pb-14 text-center">
        <div className="w-24 h-24 mx-auto rounded-full bg-[var(--surface)] flex items-center justify-center text-3xl font-bold shadow-lg ring-4 ring-indigo-300 overflow-hidden">
          {user?.photoURL ? (
            <img
              src={user.photoURL}
              alt={displayName}
              className="w-full h-full object-cover"
            />
          ) : initials ? (
            initials
          ) : (
            <UserRound size={40} className="text-indigo-500 dark:text-indigo-400" />
          )}
        </div>

        <div className="relative z-10 mt-6">
          <h1 className="text-2xl md:text-3xl font-bold text-white break-words leading-tight">
            {displayName}
          </h1>

          <p className="mt-2 text-sm text-indigo-100 break-words">{email}</p>

          {user?.emailVerified && (
            <span className="inline-flex items-center gap-1.5 mt-4 px-3 py-1 rounded-full bg-green-700 text-white text-xs font-semibold">
              <BadgeCheck size={14} />
              Verified Account
            </span>
          )}
        </div>
      </div>

      {/* Account details */}
      <div className="px-6 -mt-7">
        <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] divide-y divide-[var(--border)]">
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
            to={shortcut.to}
            className="flex items-center justify-center gap-2 px-6 py-3 rounded-full bg-indigo-600 text-white font-semibold hover:bg-indigo-700 transition-all duration-300"
          >
            <ShortcutIcon size={17} />
            {shortcut.label}
          </Link>

          <button
            type="button"
            onClick={handleLogout}
            className="flex items-center justify-center gap-2 px-6 py-3 rounded-full border-2 border-red-500/60 dark:border-red-400/60 text-red-600 dark:text-red-400 font-semibold hover:bg-red-600 hover:text-white transition-all duration-300"
          >
            <LogOut size={17} />
            Logout
          </button>
        </div>
      </div>
    </div>
  );

  const riderCard = (
    <div className="rounded-3xl bg-[var(--surface)] border border-[var(--border)] shadow-md overflow-hidden">
      <div className="flex items-center justify-between gap-3 bg-[var(--surface-muted)] px-5 py-3">
        <span className="flex items-center gap-2 font-semibold text-sm">
          <Bike size={16} />
          Rider Info
        </span>

        <StatusBadge
          kind="rider"
          /* the record only exists because an admin approved it, so approved is
             the honest answer whenever the application behind it is gone */
          value={profile?.riderStatus || "approved"}
          className="shrink-0"
        />
      </div>

      <div className="py-2 divide-y divide-[var(--border)]">
        <InfoRow
          icon={<Hash size={18} />}
          label="Rider ID"
          value={<span className="font-mono">{profile?.riderID || "—"}</span>}
        />
        <InfoRow
          icon={<Fingerprint size={18} />}
          label="Account UID"
          value={<span className="font-mono text-xs">{user?.uid || "—"}</span>}
        />
        <InfoRow
          icon={<User size={18} />}
          label="Age"
          value={getRiderAge(rider) ?? "—"}
        />
        <InfoRow
          icon={<MapPin size={18} />}
          label="Region"
          value={rider.region || "—"}
        />
        <InfoRow
          icon={<Warehouse size={18} />}
          label="Service Center"
          value={getRiderServiceCenter(rider) || "—"}
        />
        <InfoRow
          icon={<Phone size={18} />}
          label="Contact"
          value={rider.contact || user?.phoneNumber || "—"}
        />
        <InfoRow
          icon={<Mail size={18} />}
          label="Rider Email"
          value={rider.email || "—"}
        />
        <InfoRow
          icon={<ShieldCheck size={18} />}
          label="NID No"
          value={rider.nid || "—"}
        />
        <InfoRow
          icon={<CalendarDays size={18} />}
          label="Rider Since"
          value={
            profile?.riderSince
              ? new Date(profile.riderSince).toLocaleDateString()
              : "—"
          }
        />
      </div>
    </div>
  );

  return (
    <section className="w-full bg-[var(--background)] py-6 md:py-8">
      <div
        className={`mx-auto px-4 sm:px-6 ${
          hasRiderRecord ? "max-w-5xl" : "max-w-xl"
        }`}
      >
        {/* a rider reads two cards, side by side once there is room for both */}
        <div
          className={
            hasRiderRecord
              ? "grid items-start gap-6 lg:grid-cols-2"
              : undefined
          }
        >
          {accountCard}

          {hasRiderRecord && riderCard}
        </div>
      </div>
    </section>
  );
};

const InfoRow = ({ icon, label, value }) => (
  <div className="flex items-center gap-4 px-5 py-4">
    <div className="w-10 h-10 rounded-xl bg-indigo-100 dark:bg-indigo-400/15 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
      {icon}
    </div>
    <div className="min-w-0 text-left">
      <p className="text-xs text-[var(--text-muted)]">{label}</p>
      <p className="text-sm font-semibold text-[var(--foreground)] break-words">{value}</p>
    </div>
  </div>
);

export default Profile;