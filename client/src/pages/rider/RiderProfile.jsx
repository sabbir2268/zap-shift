import React from "react";
import {
  Bike,
  User,
  MapPin,
  Phone,
  Warehouse,
  Hash,
  Fingerprint,
  Mail,
  CalendarDays,
  ShieldCheck,
} from "lucide-react";
import useAuth from "../../hooks/useAuth";
import StatusBadge from "../../components/StatusBadge/StatusBadge";

const RiderProfile = () => {
  const { user, profile } = useAuth();

  const rider = profile?.riderInfo || {};

  const name = rider.name || user?.displayName || "Rider";
  const initial = name[0]?.toUpperCase() || "R";

  return (
    <section className="w-full bg-[var(--background)] py-6 md:py-8">
      <div className="max-w-3xl mx-auto px-4 sm:px-6">
        <h1 className="text-3xl md:text-4xl font-bold text-[var(--foreground)]">
          My Profile
        </h1>

        <p className="mt-3 mb-8 text-[var(--text)] leading-7">
          The rider record an admin approved for you. Only an admin can change
          it.
        </p>

        {/* Identity */}
        <div className="flex flex-wrap items-center gap-4 rounded-3xl border border-gray-200 bg-white p-6">
          <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-[var(--secondary)] text-2xl font-bold text-[var(--foreground)]">
            {initial}
          </div>

          <div className="min-w-0 flex-1">
            <h2 className="truncate text-xl font-bold text-[var(--foreground)]">
              {name}
            </h2>

            <p className="truncate text-sm text-[var(--text)]">
              {rider.email || user?.email}
            </p>
          </div>

          <StatusBadge
            kind="rider"
            value={profile?.riderStatus || "approved"}
            className="shrink-0"
          />
        </div>

        {/* Details */}
        <div className="mt-6 rounded-3xl border border-gray-200 bg-white overflow-hidden">
          <div className="flex items-center gap-2 px-5 py-3 bg-gray-100">
            <Bike size={16} />
            <span className="font-semibold text-sm">Rider Info</span>
          </div>

          <div className="divide-y divide-gray-100">
            <DetailRow
              icon={<Hash size={15} />}
              label="Rider ID"
              value={
                <span className="font-mono">
                  {profile?.riderID || "Not assigned"}
                </span>
              }
            />

            <DetailRow
              icon={<Fingerprint size={15} />}
              label="Account UID"
              value={
                <span className="font-mono text-xs">
                  {user?.uid || profile?.uid || "—"}
                </span>
              }
            />

            <DetailRow
              icon={<User size={15} />}
              label="Age"
              value={rider.age || "—"}
            />

            <DetailRow
              icon={<MapPin size={15} />}
              label="Region"
              value={rider.region || "—"}
            />

            <DetailRow
              icon={<Warehouse size={15} />}
              label="Service Center"
              value={rider.serviceCenter || "—"}
            />

            <DetailRow
              icon={<Phone size={15} />}
              label="Contact"
              value={rider.contact || user?.phoneNumber || "—"}
            />

            <DetailRow
              icon={<Mail size={15} />}
              label="Email"
              value={rider.email || user?.email || "—"}
            />

            <DetailRow
              icon={<ShieldCheck size={15} />}
              label="NID No"
              value={rider.nid || "—"}
            />

            <DetailRow
              icon={<CalendarDays size={15} />}
              label="Rider Since"
              value={
                profile?.riderSince
                  ? new Date(profile.riderSince).toLocaleDateString()
                  : "—"
              }
            />
          </div>
        </div>
      </div>
    </section>
  );
};

const DetailRow = ({ icon, label, value }) => (
  <div className="flex items-center justify-between gap-3 px-5 py-3.5">
    <span className="flex items-center gap-2 text-sm text-[var(--text)]">
      {icon}
      {label}
    </span>

    <span className="text-sm font-medium text-right">{value}</span>
  </div>
);

export default RiderProfile;
