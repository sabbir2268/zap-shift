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
  Warehouse,
  Loader2,
  UserCheck,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import useAxios from "../../../hooks/useAxios";
import StatusBadge from "../../../components/StatusBadge/StatusBadge";

const normalize = (value) => String(value || "").trim().toLowerCase();

/* only approved riders are on the road, held ones are not available */
const isActiveRider = (rider) => rider.status === "approved";

/* a rider can take a parcel when their division is the pickup division */
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
              Pick a parcel and hand it to an active rider near the pickup
              region.
            </p>
          </div>

          <button
            type="button"
            onClick={loadData}
            className="
              px-6 py-3
              rounded-full
              bg-[var(--foreground)]
              text-[var(--secondary)]
              font-semibold
              hover:bg-[var(--primary)]
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
              border-gray-200
              bg-white
              py-3
              pl-11
              pr-4
              outline-none
              focus:border-[var(--foreground)]
            "
          />
        </div>

        {loading ? (
          <div className="flex justify-center py-24">
            <span className="loading loading-spinner loading-xl"></span>
          </div>
        ) : filtered.length === 0 ? (
          <div className="bg-white rounded-3xl border border-gray-200 p-16 text-center">
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
            onAssign={(parcel) => setAssignTarget(parcel)}
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
    <div className="bg-white rounded-3xl border border-gray-200 overflow-hidden">
      {/* Legend */}
      <div className="flex flex-wrap items-center gap-3 border-b border-gray-100 px-5 py-3">
        <span className="text-xs font-semibold text-[var(--text)]">
          {parcels.length} parcel{parcels.length === 1 ? "" : "s"}
        </span>

        <span className="flex items-center gap-1.5 text-xs text-[var(--text)]">
          <Bike size={13} />
          {riderCount} active rider{riderCount === 1 ? "" : "s"}
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-gray-200 text-xs uppercase tracking-wide text-[var(--text)]/50">
              <th className="px-4 py-3 font-semibold">Parcel</th>
              <th className="px-4 py-3 font-semibold">Date</th>
              <th className="px-4 py-3 font-semibold">Delivery Status</th>
              <th className="px-4 py-3 font-semibold text-right">Action</th>
            </tr>
          </thead>

          <tbody>
            {parcels.map((parcel) => {
              const assigning = assigningId === parcel._id;

              return (
                <tr
                  key={parcel._id}
                  className="border-b border-gray-100 last:border-0 hover:bg-gray-50/60 transition-colors"
                >
                  {/* Parcel name + id */}
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-9 h-9 rounded-xl bg-[var(--secondary)] text-[var(--foreground)] flex items-center justify-center shrink-0">
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
                          <p className="text-[11px] text-green-600 font-medium truncate">
                            {parcel.riderName || parcel.riderID}
                          </p>
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
                    <div className="flex items-center justify-end">
                      <button
                        type="button"
                        onClick={() => onAssign(parcel)}
                        disabled={assigning}
                        className="
                          inline-flex
                          items-center
                          gap-2
                          rounded-xl
                          border
                          border-blue-200
                          px-4
                          py-2
                          text-sm
                          font-semibold
                          text-blue-600
                          hover:bg-blue-50
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
    [rider.name, rider.riderID, rider.contact, rider.warehouse, rider.email]
      .filter(Boolean)
      .some((value) => value.toLowerCase().includes(term));

  /* riders whose division is the pickup division come first, everyone else
     stays available behind the toggle so a parcel is never stranded */
  const nearRiders = riders.filter(
    (rider) => servesRegion(rider, parcel.senderRegion) && matchesQuery(rider)
  );
  const farRiders = riders.filter(
    (rider) => !servesRegion(rider, parcel.senderRegion) && matchesQuery(rider)
  );

  /* a search is an explicit request, so it reaches across every region */
  const groups = useMemo(() => {
    const list = showAll || term ? farRiders : [];

    const byWarehouse = new Map();

    list.forEach((rider) => {
      const key = rider.warehouse || "Unassigned warehouse";
      if (!byWarehouse.has(key)) byWarehouse.set(key, []);
      byWarehouse.get(key).push(rider);
    });

    return [...byWarehouse.entries()];
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
          bg-white
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
              bg-gray-100
              flex items-center justify-center
              text-gray-500
              hover:bg-gray-200
              transition
            "
          >
            <X size={18} />
          </button>

          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center shrink-0">
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
          <div className="mt-4 flex items-center gap-3 rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm">
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
            <div className="mt-4 flex items-center gap-3 rounded-2xl border border-green-200 bg-green-50 px-4 py-3">
              <CheckCircle2 size={18} className="text-green-600 shrink-0" />

              <div className="min-w-0 flex-1">
                <p className="text-[11px] text-green-700">Currently assigned</p>
                <p className="text-sm font-semibold text-green-900 truncate">
                  {parcel.riderName || "—"}
                </p>
              </div>

              <button
                type="button"
                onClick={() => onAssign(null)}
                className="
                  shrink-0
                  rounded-lg
                  border
                  border-red-200
                  px-3
                  py-1.5
                  text-xs
                  font-semibold
                  text-red-500
                  hover:bg-red-50
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
              placeholder="Search rider by name, id, contact or warehouse"
              className="
                w-full
                rounded-full
                border
                border-gray-200
                bg-white
                py-2.5
                pl-11
                pr-4
                outline-none
                focus:border-[var(--foreground)]
              "
            />
          </div>

          {/* Near riders */}
          <div className="mt-4 rounded-2xl border border-gray-200 overflow-hidden">
            <div className="flex items-center gap-2 px-4 py-3 bg-gray-100">
              <Bike size={16} />
              <span className="font-semibold text-sm">
                Active riders in {parcel.senderRegion || "this region"}
              </span>

              <span className="ml-auto rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-semibold text-blue-700">
                {nearRiders.length}
              </span>
            </div>

            {nearRiders.length === 0 ? (
              <p className="p-4 text-sm text-[var(--text)]">
                {term
                  ? "No active rider matches your search."
                  : `No active rider is based in ${
                      parcel.senderRegion || "this region"
                    } yet.`}
              </p>
            ) : (
              <div className="max-h-72 overflow-y-auto divide-y divide-gray-100">
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
            <div className="mt-4 rounded-2xl border border-dashed border-orange-200 bg-orange-50/40 overflow-hidden">
              <button
                type="button"
                onClick={() => setShowAll((prev) => !prev)}
                className="w-full flex items-center gap-2 px-4 py-3 text-left"
              >
                <MapPin size={16} className="text-orange-600 shrink-0" />
                <span className="text-sm font-semibold text-[var(--foreground)]">
                  Riders from other regions
                </span>

                <span className="ml-auto rounded-full bg-orange-100 px-2.5 py-0.5 text-xs font-semibold text-orange-800">
                  {farRiders.length}
                </span>

                {showAll ? (
                  <ChevronUp size={16} className="text-orange-600 shrink-0" />
                ) : (
                  <ChevronDown
                    size={16}
                    className="text-orange-600 shrink-0"
                  />
                )}
              </button>

              {showAll &&
                groups.map(([warehouse, list]) => (
                  <div
                    key={warehouse}
                    className="border-t border-orange-100"
                  >
                    <div className="flex items-center gap-2 px-4 py-2 bg-orange-50/60">
                      <Warehouse
                        size={13}
                        className="text-orange-600 shrink-0"
                      />
                      <span className="text-xs font-semibold text-orange-800 truncate">
                        {warehouse}
                      </span>

                      <span className="ml-auto text-xs text-orange-600">
                        {list.length}
                      </span>
                    </div>

                    <div className="divide-y divide-gray-100 bg-white">
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
              border-gray-200
              py-2.5
              text-sm
              font-semibold
              text-[var(--foreground)]
              hover:bg-gray-100
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
      transition
      disabled:cursor-not-allowed
      disabled:bg-green-50
    "
  >
    <div className="w-9 h-9 rounded-full bg-[var(--secondary)] text-[var(--foreground)] flex items-center justify-center shrink-0 font-bold text-xs">
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
        {rider.region ? <MapPin size={10} /> : null}
        {rider.region || "—"}
        {rider.contact ? (
          <>
            <span className="text-[var(--text)]/40">•</span>
            <Phone size={10} />
            {rider.contact}
          </>
        ) : null}
      </p>
    </div>

    <span className="text-xs font-semibold text-blue-600 shrink-0">
      {current ? "Assigned" : "Assign"}
    </span>
  </button>
);

export default AssignRider;
