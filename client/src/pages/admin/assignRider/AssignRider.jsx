import React, { useCallback, useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import {
  Package,
  RefreshCw,
  Search,
  Bike,
  Truck,
  X,
  Hash,
  MapPin,
  Phone,
  Building2,
  Loader2,
  UserCheck,
  CheckCircle2,
  Clock,
  Lock,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import useAxios from "../../../hooks/useAxios";
import StatusBadge from "../../../components/StatusBadge/StatusBadge";
import PageLoader from "../../../components/PageLoader/PageLoader";

const normalize = (value) => String(value || "").trim().toLowerCase();

/* only approved riders are on the road, held ones are not available */
const isActiveRider = (rider) => rider.status === "approved";

/* a parcel only becomes assignable once its payment is confirmed. the server
   refuses the assignment anyway, this is here so the admin is told before they
   pick a rider rather than after */
const isPaid = (parcel) => parcel?.paymentStatus === "paid";

/* A rider is matched on where the parcel is going, not where it came from. A
   parcel going to another region is carried to the destination service center by
   a company truck, and the rider who hands it over is the customer is already
   based in that region, so a rider from the pickup region cannot deliver it. */
const servesRegion = (rider, region) =>
  normalize(rider.region) === normalize(region);

const AssignRider = () => {
  const api = useAxios();

  const [parcels, setParcels] = useState([]);
  const [riders, setRiders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [assignTarget, setAssignTarget] = useState(null);
  const [assigningId, setAssigningId] = useState(null);

  const loadData = useCallback(async () => {
    setLoading(true);

    try {
      const [parcelData, riderData] = await Promise.all([
        api.get("/api/parcels"),
        api.get("/api/rider-applications"),
      ]);

      setParcels(Array.isArray(parcelData) ? parcelData : []);
      setRiders(Array.isArray(riderData) ? riderData : []);
    } catch (error) {
      toast.error(error.message || "Failed to load data");
    } finally {
      setLoading(false);
    }
  }, [api]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const activeRiders = useMemo(
    () => riders.filter(isActiveRider),
    [riders]
  );

  const filtered = useMemo(() => {
    const term = query.trim().toLowerCase();

    if (!term) return parcels;

    return parcels.filter((parcel) =>
      [
        parcel.parcelTitle,
        parcel._id,
        parcel.senderName,
        parcel.senderRegion,
        parcel.receiverName,
        parcel.receiverRegion,
        parcel.userEmail,
        parcel.riderID,
        parcel.riderName,
      ]
        .filter(Boolean)
        .some((value) => value.toLowerCase().includes(term))
    );
  }, [parcels, query]);

  const handleAssign = async (parcel, riderID) => {
    if (riderID && !isPaid(parcel)) {
      toast.error("Payment is not confirmed for this parcel");
      setAssignTarget(null);
      return;
    }

    setAssigningId(parcel._id);
    setAssignTarget(null);

    try {
      const updated = await api.patch(`/api/parcels/${parcel._id}/rider`, {
        riderID,
      });

      setParcels((prev) =>
        prev.map((item) => (item._id === parcel._id ? updated : item))
      );

      toast.success(
        riderID
          ? `${updated.riderName || riderID} assigned to ${parcel.parcelTitle || "parcel"}!`
          : "Rider unassigned!"
      );
    } catch (error) {
      toast.error(error.message || "Failed to assign rider");
    } finally {
      setAssigningId(null);
    }
  };

  return (
    <section className="w-full bg-[var(--background)] py-6 md:py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-[var(--foreground)]">
              Assign Rider
            </h1>
            <p className="mt-3 text-[var(--text)] leading-7">
              Pick a parcel and hand it to an active rider based in the region
              it is being delivered to.
            </p>
          </div>

          <button
            type="button"
            onClick={loadData}
            className="
              px-6 py-3
              rounded-full
              bg-[var(--ink)]
              text-[var(--secondary)]
              font-semibold
              hover:bg-[var(--surface)]
              hover:text-[var(--foreground)]
              transition-all duration-300
              flex items-center gap-2
            "
          >
            <RefreshCw size={16} />
            Refresh
          </button>
        </div>

        {/* Parcel search */}
        <div className="relative mb-6">
          <Search
            size={18}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text)]/50"
          />

          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search parcel by name, id, sender, receiver or region"
            className="
              w-full
              rounded-full
              border
              border-[var(--border)]
              bg-[var(--surface)]
              py-3
              pl-11
              pr-4
              outline-none
              focus:border-[var(--foreground)]
            "
          />
        </div>

        {loading ? (
          <PageLoader className="min-h-[60vh]" />
        ) : filtered.length === 0 ? (
          <div className="bg-[var(--surface)] rounded-3xl border border-[var(--border)] p-16 text-center">
            <Package size={48} className="mx-auto text-[var(--text)]" />
            <h2 className="mt-4 text-xl font-bold text-[var(--foreground)]">
              No parcels found
            </h2>
            <p className="mt-2 text-sm text-[var(--text)]">
              {query
                ? "No parcels match your search."
                : "Parcels sent by users will appear here."}
            </p>
          </div>
        ) : (
          <ParcelTable
            parcels={filtered}
            riderCount={activeRiders.length}
            assigningId={assigningId}
            onAssign={(parcel) => {
              if (!isPaid(parcel)) {
                toast.error(
                  "Payment is not confirmed for this parcel. It cannot be assigned to a rider yet."
                );
                return;
              }
              setAssignTarget(parcel);
            }}
          />
        )}
      </div>

      {assignTarget && (
        <RiderPickerModal
          parcel={assignTarget}
          riders={activeRiders}
          onAssign={(riderID) => handleAssign(assignTarget, riderID)}
          onClose={() => setAssignTarget(null)}
        />
      )}
    </section>
  );
};

const ParcelTable = ({ parcels, riderCount, assigningId, onAssign }) => {
  return (
    <div className="bg-[var(--surface)] rounded-3xl border border-[var(--border)] overflow-hidden">
      {/* Legend */}
      <div className="flex flex-wrap items-center gap-3 border-b border-[var(--border)] px-5 py-3">
        <span className="text-xs font-semibold text-[var(--text)]">
          {parcels.length} parcel{parcels.length === 1 ? "" : "s"}
        </span>

        <span className="flex items-center gap-1.5 text-xs text-[var(--text)]">
          <Bike size={13} />
          {riderCount} active rider{riderCount === 1 ? "" : "s"}
        </span>

        {/* the rule the page is built around, said out loud once */}
        <span className="flex items-center gap-1.5 text-xs text-amber-700 dark:text-amber-300">
          <Lock size={13} />
          Only paid parcels can be assigned
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-[var(--border)] text-xs uppercase tracking-wide text-[var(--text)]/50">
              <th className="px-4 py-3 font-semibold">Parcel</th>
              <th className="px-4 py-3 font-semibold">Date</th>
              <th className="px-4 py-3 font-semibold">Payment</th>
              <th className="px-4 py-3 font-semibold">Delivery Status</th>
              <th className="px-4 py-3 font-semibold text-right">Action</th>
            </tr>
          </thead>

          <tbody>
            {parcels.map((parcel) => {
              const assigning = assigningId === parcel._id;
              const paid = isPaid(parcel);

              return (
                <tr
                  key={parcel._id}
                  className="border-b border-[var(--border)] last:border-0 hover:bg-[var(--surface-hover)]/60 transition-colors"
                >
                  {/* Parcel name + id */}
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-9 h-9 rounded-xl bg-[var(--secondary)] text-[var(--text-on-secondary)] flex items-center justify-center shrink-0">
                        <Package size={17} />
                      </div>

                      <div className="min-w-0">
                        <p className="font-semibold text-[var(--foreground)] truncate max-w-[220px]">
                          {parcel.parcelTitle || "Untitled"}
                        </p>

                        <p className="text-[11px] text-[var(--text)] font-mono truncate flex items-center gap-1">
                          <Hash size={10} />
                          {parcel._id}
                        </p>

                        {parcel.riderID ? (
                          <>
                            <p className="text-[11px] text-green-600 dark:text-green-400 font-medium truncate flex items-center gap-1">
                              <UserCheck size={10} />
                              {parcel.riderName || parcel.riderID}
                            </p>

                            {parcel.assignedAt ? (
                              <p className="text-[11px] text-[var(--text)] truncate flex items-center gap-1">
                                <Clock size={10} />
                                Assigned{" "}
                                {new Date(
                                  parcel.assignedAt
                                ).toLocaleString()}
                              </p>
                            ) : null}
                          </>
                        ) : null}
                      </div>
                    </div>
                  </td>

                  {/* Date */}
                  <td className="px-4 py-3">
                    <span className="text-[var(--text)] whitespace-nowrap">
                      {parcel.createdAt
                        ? new Date(parcel.createdAt).toLocaleDateString()
                        : "—"}
                    </span>
                  </td>

                  {/* Payment, the gate on being able to assign anyone at all */}
                  <td className="px-4 py-3">
                    <StatusBadge
                      kind="payment"
                      value={parcel.paymentStatus}
                      bare
                    />
                  </td>

                  {/* Status */}
                  <td className="px-4 py-3">
                    <StatusBadge
                      kind="delivery"
                      value={parcel.status}
                      bare
                    />
                  </td>

                  {/* Action */}
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-2">
                      {/* an assigned parcel says so, rather than still offering
                          an assign button as though nobody had been given it */}
                      {parcel.riderID ? (
                        <span
                          className="
                            inline-flex
                            items-center
                            gap-1.5
                            rounded-xl
                            border border-green-200 dark:border-green-400/40
                  bg-green-50
                  dark:bg-green-400/15
                  px-3 py-2
                            text-sm
                            font-semibold
                            text-green-700 dark:text-green-300
                          "
                        >
                          <CheckCircle2 size={15} />
                          Assigned
                        </span>
                      ) : null}

                      <button
                        type="button"
                        onClick={() => onAssign(parcel)}
                        disabled={assigning || !paid}
                        title={
                          paid
                            ? "Assign a rider"
                            : "Payment must be confirmed before a rider can be assigned"
                        }
                        className="
                          inline-flex
                          items-center
                          gap-2
                          rounded-xl
                          border
                          border-blue-200 dark:border-blue-400/40
                          px-4
                          py-2
                          text-sm
                          font-semibold
                          text-blue-600 dark:text-blue-400
                          hover:bg-blue-50 dark:hover:bg-blue-400/20
                          transition
                          disabled:cursor-not-allowed
                          disabled:opacity-60
                        "
                      >
                        {assigning ? (
                          <Loader2 size={15} className="animate-spin" />
                        ) : (
                          <UserCheck size={15} />
                        )}
                        {parcel.riderID ? "Change Rider" : "Assign Rider"}
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const RiderPickerModal = ({ parcel, riders, onAssign, onClose }) => {
  const [query, setQuery] = useState("");
  const [showAll, setShowAll] = useState(false);

  const term = query.trim().toLowerCase();

  const matchesQuery = (rider) =>
    !term ||
    [rider.name, rider.riderID, rider.contact, rider.serviceCenter, rider.email]
      .filter(Boolean)
      .some((value) => value.toLowerCase().includes(term));

  /* riders based in the region the parcel is delivered to come first, everyone
     else stays available behind the toggle so a parcel is never stranded */
  const nearRiders = riders.filter(
    (rider) => servesRegion(rider, parcel.receiverRegion) && matchesQuery(rider)
  );
  const farRiders = riders.filter(
    (rider) => !servesRegion(rider, parcel.receiverRegion) && matchesQuery(rider)
  );

  /* a search is an explicit request, so it reaches across every region */
  const groups = useMemo(() => {
    const list = showAll || term ? farRiders : [];

    const byCenter = new Map();

    list.forEach((rider) => {
      const key = rider.serviceCenter || "Unassigned service center";
      if (!byCenter.has(key)) byCenter.set(key, []);
      byCenter.get(key).push(rider);
    });

    return [...byCenter.entries()];
  }, [farRiders, showAll, term]);

  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center px-4">
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      <div
        className="
          relative
          w-full
          max-w-lg
          max-h-[85vh]
          flex flex-col
          bg-[var(--surface)]
          rounded-3xl
          shadow-2xl
        "
      >
        <div className="h-2 bg-blue-500 rounded-t-3xl shrink-0" />

        <div className="p-6 overflow-y-auto">
          <button
            type="button"
            onClick={onClose}
            className="
              absolute
              right-4
              top-5
              w-9 h-9
              rounded-full
              bg-[var(--surface-muted)]
              flex items-center justify-center
              text-[var(--text-muted)]
              hover:bg-[var(--surface-hover)]
              transition
            "
          >
            <X size={18} />
          </button>

          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-blue-100 dark:bg-blue-400/15 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
              <UserCheck size={21} />
            </div>

            <div className="min-w-0">
              <h2 className="text-xl font-bold text-[var(--foreground)]">
                Assign Rider
              </h2>
              <p className="text-xs text-[var(--text)] truncate">
                {parcel.parcelTitle || "Untitled"}
              </p>
            </div>
          </div>

          {/* Route */}
          <div className="mt-4 flex items-center gap-3 rounded-2xl border border-[var(--border)] bg-[var(--surface-muted)] px-4 py-3 text-sm">
            <div className="min-w-0 flex-1">
              <p className="text-[11px] text-[var(--text)]">PICKUP</p>
              <p className="font-semibold truncate">
                {parcel.senderRegion || "—"}
              </p>
            </div>

            <Truck size={17} className="text-[var(--text)] shrink-0" />

            <div className="min-w-0 flex-1 text-right">
              <p className="text-[11px] text-[var(--text)]">DELIVERY</p>
              <p className="font-semibold truncate">
                {parcel.receiverRegion || "—"}
              </p>
            </div>
          </div>

          {/* Currently assigned */}
          {parcel.riderID && (
              <div className="mt-4 flex items-center gap-3 rounded-2xl border border-green-200 dark:border-green-400/40 bg-green-50 dark:bg-green-400/15 px-4 py-3">
              <CheckCircle2 size={18} className="text-green-600 dark:text-green-400 shrink-0" />

              <div className="min-w-0 flex-1">
                <p className="text-[11px] text-green-700 dark:text-green-300">Currently assigned</p>
                <p className="text-sm font-semibold text-green-900 dark:text-green-300 truncate">
                  {parcel.riderName || "—"}
                </p>

                {parcel.assignedAt ? (
                  <p className="text-[11px] text-green-700 dark:text-green-300 truncate flex items-center gap-1">
                    <Clock size={10} />
                    {new Date(parcel.assignedAt).toLocaleString()}
                  </p>
                ) : null}
              </div>

              <button
                type="button"
                onClick={() => onAssign(null)}
                className="
                  shrink-0
                  rounded-lg
                  border
                  border-red-200 dark:border-red-400/40
                  px-3
                  py-1.5
                  text-xs
                  font-semibold
                  text-red-500 dark:text-red-400
                  hover:bg-red-50 dark:hover:bg-red-400/20
                  transition
                "
              >
                Unassign
              </button>
            </div>
          )}

          {/* Rider search */}
          <div className="relative mt-4">
            <Search
              size={17}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text)]/50"
            />

            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search rider by name, id, contact or service center"
              className="
                w-full
                rounded-full
                border
                border-[var(--border)]
                bg-[var(--surface)]
                py-2.5
                pl-11
                pr-4
                outline-none
                focus:border-[var(--foreground)]
              "
            />
          </div>

          {/* Near riders */}
          <div className="mt-4 rounded-2xl border border-[var(--border)] overflow-hidden">
            <div className="flex items-center gap-2 px-4 py-3 bg-[var(--surface-muted)]">
              <Bike size={16} />
              <span className="font-semibold text-sm">
                Active riders in {parcel.receiverRegion || "this region"}
              </span>

              <span className="ml-auto rounded-full bg-blue-100 dark:bg-blue-400/15 px-2.5 py-0.5 text-xs font-semibold text-blue-700 dark:text-blue-300">
                {nearRiders.length}
              </span>
            </div>

            {nearRiders.length === 0 ? (
              <p className="p-4 text-sm text-[var(--text)]">
                {term
                  ? "No active rider matches your search."
                  : `No active rider is based in ${
                      parcel.receiverRegion || "this region"
                    } yet. A rider from another region would have to cover the
                    whole route.`}
              </p>
            ) : (
              <div className="max-h-72 overflow-y-auto divide-y divide-[var(--border)]">
                {nearRiders.map((rider) => (
                  <RiderRow
                    key={rider.riderID}
                    rider={rider}
                    current={rider.riderID === parcel.riderID}
                    onAssign={() => onAssign(rider.riderID)}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Riders from other regions */}
          {farRiders.length > 0 && (
            <div className="mt-4 rounded-2xl border border-dashed border-orange-200 dark:border-orange-400/40 bg-orange-50/40 overflow-hidden">
              <button
                type="button"
                onClick={() => setShowAll((prev) => !prev)}
                className="w-full flex items-center gap-2 px-4 py-3 text-left"
              >
                <MapPin size={16} className="text-orange-600 dark:text-orange-400 shrink-0" />
                <span className="text-sm font-semibold text-[var(--foreground)]">
                  Riders from other regions
                </span>

                <span className="ml-auto rounded-full bg-orange-100 dark:bg-orange-400/15 px-2.5 py-0.5 text-xs font-semibold text-orange-800 dark:text-orange-300">
                  {farRiders.length}
                </span>

                {showAll ? (
                  <ChevronUp size={16} className="text-orange-600 dark:text-orange-400 shrink-0" />
                ) : (
                  <ChevronDown
                    size={16}
                    className="text-orange-600 dark:text-orange-400 shrink-0"
                  />
                )}
              </button>

              {showAll &&
                groups.map(([center, list]) => (
                  <div
                    key={center}
                    className="border-t border-orange-100"
                  >
                <div className="flex items-center gap-2 px-4 py-2 bg-orange-50/60 dark:bg-orange-400/15">
                  <Building2
                    size={13}
                    className="text-orange-600 dark:text-orange-400 shrink-0"
                  />

                  <span className="text-xs font-semibold text-orange-800 dark:text-orange-200 truncate">
                        {center}
                      </span>

                      <span className="ml-auto text-xs text-orange-600 dark:text-orange-400">
                        {list.length}
                      </span>
                    </div>

                    <div className="divide-y divide-[var(--border)] bg-[var(--surface)]">
                      {list.map((rider) => (
                        <RiderRow
                          key={rider.riderID}
                          rider={rider}
                          current={rider.riderID === parcel.riderID}
                          onAssign={() => onAssign(rider.riderID)}
                        />
                      ))}
                    </div>
                  </div>
                ))}
            </div>
          )}
        </div>

        <div className="px-6 pb-6">
          <button
            type="button"
            onClick={onClose}
            className="
              w-full
              rounded-xl
              border
              border-[var(--border)]
              py-2.5
              text-sm
              font-semibold
              text-[var(--foreground)]
              hover:bg-[var(--surface-muted)]
              transition
            "
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

const RiderRow = ({ rider, current, onAssign }) => (
  <button
    type="button"
    onClick={onAssign}
    disabled={current}
    className="
      w-full
      px-4 py-3
      flex items-center gap-3
      text-left
                  hover:bg-blue-50/60
                  dark:hover:bg-blue-400/15
                  transition
      disabled:cursor-not-allowed
      disabled:bg-green-50 dark:disabled:bg-green-400/20
    "
  >
    <div className="w-9 h-9 rounded-full bg-[var(--secondary)] text-[var(--text-on-secondary)] flex items-center justify-center shrink-0 font-bold text-xs">
      {rider.name?.[0]?.toUpperCase() || "R"}
    </div>

    <div className="min-w-0 flex-1">
      <p className="text-sm font-semibold text-[var(--foreground)] truncate">
        {rider.name}
      </p>

      <p className="text-[11px] text-[var(--text)] font-mono truncate">
        {rider.riderID}
      </p>

      <p className="text-[11px] text-[var(--text)] truncate flex items-center gap-1">
        <MapPin size={10} />
        {rider.region || "—"}
      </p>

      <p className="text-[11px] text-[var(--text)] truncate flex items-center gap-1">
        <Building2 size={10} />
        {rider.serviceCenter || "—"}
      </p>

      {rider.contact ? (
        <p className="text-[11px] text-[var(--text)] truncate flex items-center gap-1">
          <Phone size={10} />
          {rider.contact}
        </p>
      ) : null}
    </div>

    <span className="text-xs font-semibold text-blue-600 dark:text-blue-400 shrink-0">
      {current ? "Assigned" : "Assign"}
    </span>
  </button>
);

export default AssignRider;
