import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import {
  RefreshCw,
  X,
  User,
  MapPin,
  Phone,
  Hash,
  Fingerprint,
  Truck,
  Eye,
  Search,
  PauseCircle,
  PlayCircle,
  Loader2,
} from "lucide-react";
import useAxios from "../../../hooks/useAxios";

const RIDER_STATUS = {
  pending: { label: "Pending", className: "bg-yellow-100 text-yellow-800" },
  approved: { label: "Approved", className: "bg-green-100 text-green-800" },
  rejected: { label: "Rejected", className: "bg-red-100 text-red-800" },
  held: { label: "On Hold", className: "bg-orange-100 text-orange-800" },
};

const getRiderStatus = (value) => RIDER_STATUS[value] || RIDER_STATUS.pending;

const RiderList = ({
  status,
  title,
  description,
  empty,
  allowSearch = false,
  allowHold = false,
  includeHeld = false,
  table = false,
}) => {
  const api = useAxios();

  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [query, setQuery] = useState("");
  const [workingId, setWorkingId] = useState(null);

  const changeStatus = useCallback(
    async (rider, nextStatus, message) => {
      setWorkingId(rider._id);

      try {
        const updated = await api.patch(`/api/rider-applications/${rider._id}`, {
          status: nextStatus,
        });

        setApplications((prev) =>
          prev.map((item) =>
            item._id === rider._id ? { ...item, ...updated } : item
          )
        );

        toast.success(message);

        if (updated?.roleUpdate === "no user record") {
          toast.error(
            "Approved, but no matching user record was found to promote.",
            { id: `promote-${rider._id}` }
          );
        }
      } catch (error) {
        toast.error(error.message || "Failed to update rider");
      } finally {
        setWorkingId(null);
      }
    },
    [api]
  );

  const handleHold = (rider) =>
    changeStatus(rider, "held", `${rider.name} placed on hold!`);

  const handleActivate = (rider) =>
    changeStatus(rider, "approved", `${rider.name} is active again!`);

  const loadApplications = useCallback(async () => {
    setLoading(true);

    try {
      const data = await api.get("/api/rider-applications");
      setApplications(Array.isArray(data) ? data : []);
    } catch (error) {
      toast.error(error.message || "Failed to load riders");
    } finally {
      setLoading(false);
    }
  }, [api]);

  useEffect(() => {
    loadApplications();
  }, [loadApplications]);

  const matchQuery = (list) => {
    const term = query.trim().toLowerCase();

    if (!term) return list;

    return list.filter((application) =>
      [
        application.name,
        application.email,
        application.uid,
        application.warehouse,
      ]
        .filter(Boolean)
        .some((value) => value.toLowerCase().includes(term))
    );
  };

  /* In table mode the main list merges the held riders into one table */
  const filtered = useMemo(() => {
    const list = applications.filter((application) => {
      const current = application.status || "pending";

      if (includeHeld && current === "held") return true;

      return current === status;
    });

    return matchQuery(list);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [applications, status, includeHeld, query]);

  /* Held riders are kept out of the main grid and shown in their own block */
  const heldRiders = useMemo(
    () => (allowHold ? matchQuery(
      applications.filter((application) => application.status === "held")
    ) : []),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [applications, allowHold, query]
  );

  return (
    <section className="w-full bg-[var(--background)] py-6 md:py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-[var(--foreground)]">
              {title}
            </h1>
            <p className="mt-3 text-[var(--text)] leading-7">{description}</p>
          </div>

          <button
            type="button"
            onClick={loadApplications}
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

        {allowSearch && (
          <div className="relative mb-6">
            <Search
              size={18}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text)]/50"
            />

            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by name, email, uid or warehouse"
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
        )}

        {loading ? (
          <div className="flex justify-center py-24">
            <span className="loading loading-spinner loading-xl"></span>
          </div>
        ) : filtered.length === 0 ? (
          <div className="bg-white rounded-3xl border border-gray-200 p-16 text-center">
            <empty.icon size={48} className="mx-auto text-[var(--text)]" />
            <h2 className="mt-4 text-xl font-bold text-[var(--foreground)]">
              {empty.title}
            </h2>
            <p className="mt-2 text-sm text-[var(--text)]">{empty.hint}</p>
          </div>
        ) : table ? (
          <RiderTable
            riders={filtered}
            workingId={workingId}
            onView={(rider) => setSelected(rider)}
            onHold={handleHold}
            onActivate={handleActivate}
          />
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {filtered.map((rider) => (
                <RiderCard
                  key={rider._id}
                  rider={rider}
                  allowHold={allowHold}
                  workingId={workingId}
                  onView={() => setSelected(rider)}
                  onHold={() => handleHold(rider)}
                />
              ))}
            </div>

            {/* ============ HELD RIDERS (ISOLATED) ============ */}
            {heldRiders.length > 0 && (
              <div className="mt-10 rounded-3xl border-2 border-dashed border-orange-200 bg-orange-50/40 p-5 md:p-6">
                <div className="mb-5 flex items-center gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-orange-100 text-orange-600">
                    <PauseCircle size={20} />
                  </div>

                  <div>
                    <h2 className="text-lg font-bold text-[var(--foreground)]">
                      On Hold
                    </h2>
                    <p className="text-xs text-[var(--text)]">
                      These riders are temporarily paused and not delivering.
                    </p>
                  </div>

                  <span className="ml-auto shrink-0 rounded-full bg-orange-100 px-3 py-1 text-xs font-semibold text-orange-800">
                    {heldRiders.length}
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {heldRiders.map((rider) => (
                    <RiderCard
                      key={rider._id}
                      rider={rider}
                      held
                      allowActivate
                      workingId={workingId}
                      onView={() => setSelected(rider)}
                      onActivate={() => handleActivate(rider)}
                    />
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {selected && (
        <RiderModal
          rider={selected}
          onClose={() => setSelected(null)}
          onDone={() => {
            setSelected(null);
            loadApplications();
          }}
        />
      )}
    </section>
  );
};

const RiderTable = ({ riders, workingId, onView, onHold, onActivate }) => {
  const heldCount = riders.filter((rider) => rider.status === "held").length;

  return (
    <div className="bg-white rounded-3xl border border-gray-200 overflow-hidden">
      {/* Legend */}
      <div className="flex flex-wrap items-center gap-3 border-b border-gray-100 px-5 py-3">
        <span className="text-xs font-semibold text-[var(--text)]">
          {riders.length} rider{riders.length === 1 ? "" : "s"}
        </span>

        <span className="flex items-center gap-1.5 text-xs text-[var(--text)]">
          <span className="w-2.5 h-2.5 rounded-full bg-green-400" />
          Active ({riders.length - heldCount})
        </span>

        <span className="flex items-center gap-1.5 text-xs text-[var(--text)]">
          <span className="w-2.5 h-2.5 rounded-full bg-orange-400" />
          On Hold ({heldCount})
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-gray-200 text-xs uppercase tracking-wide text-[var(--text)]/50">
              <th className="px-4 py-3 font-semibold">Rider</th>
              <th className="hidden px-4 py-3 font-semibold md:table-cell">
                Email
              </th>
              <th className="hidden px-4 py-3 font-semibold lg:table-cell">
                Region
              </th>
              <th className="hidden px-4 py-3 font-semibold xl:table-cell">
                Contact
              </th>
              <th className="hidden px-4 py-3 font-semibold lg:table-cell">
                Warehouse
              </th>
              <th className="px-4 py-3 font-semibold">Status</th>
              <th className="px-4 py-3 font-semibold text-right">Action</th>
            </tr>
          </thead>

          <tbody>
            {riders.map((rider) => {
              const riderStatus = getRiderStatus(rider.status);
              const isHeld = rider.status === "held";
              const busy = workingId === rider._id;

              return (
                <tr
                  key={rider._id}
                  className={`
                    border-b border-gray-100 last:border-0
                    ${isHeld ? "bg-orange-50/40" : ""}
                  `}
                >
                  {/* Rider */}
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <div
                        className={`
                          w-9 h-9
                          rounded-full
                          flex items-center justify-center shrink-0
                          text-xs
                          font-bold
                          ${
                            isHeld
                              ? "bg-orange-100 text-orange-700"
                              : "bg-[var(--secondary)] text-[var(--foreground)]"
                          }
                        `}
                      >
                        {rider.name?.[0]?.toUpperCase() || "R"}
                      </div>

                      <div className="min-w-0">
                        <p className="font-semibold text-[var(--foreground)] truncate">
                          {rider.name}
                        </p>
                      </div>
                    </div>
                  </td>

                  <td className="hidden px-4 py-3 md:table-cell">
                    <span className="text-[var(--text)] truncate">
                      {rider.email || "—"}
                    </span>
                  </td>

                  <td className="hidden px-4 py-3 lg:table-cell">
                    {rider.region || "—"}
                  </td>

                  <td className="hidden px-4 py-3 xl:table-cell">
                    {rider.contact || "—"}
                  </td>

                  <td className="hidden px-4 py-3 lg:table-cell">
                    {rider.warehouse || "—"}
                  </td>

                  {/* Status */}
                  <td className="px-4 py-3">
                    <span
                      className={`
                        inline-block
                        rounded-full
                        px-3
                        py-1
                        text-xs
                        font-medium
                        whitespace-nowrap
                        ${riderStatus.className}
                      `}
                    >
                      {riderStatus.label}
                    </span>
                  </td>

                  {/* Action */}
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => onView(rider)}
                        title="View Details"
                        className="
                          w-9
                          h-9
                          rounded-lg
                          border
                          border-gray-200
                          flex
                          items-center
                          justify-center
                          text-[var(--foreground)]
                          hover:bg-gray-100
                          transition
                        "
                      >
                        <Eye size={15} />
                      </button>

                      {isHeld ? (
                        <button
                          type="button"
                          onClick={() => onActivate(rider)}
                          disabled={busy}
                          title="Make active"
                          className="
                            w-9
                            h-9
                            rounded-lg
                            border
                            border-green-200
                            flex
                            items-center
                            justify-center
                            text-green-600
                            hover:bg-green-50
                            transition
                            disabled:cursor-not-allowed
                            disabled:opacity-60
                          "
                        >
                          {busy ? (
                            <Loader2 size={15} className="animate-spin" />
                          ) : (
                            <PlayCircle size={15} />
                          )}
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => onHold(rider)}
                          disabled={busy}
                          title="Place on hold"
                          className="
                            w-9
                            h-9
                            rounded-lg
                            border
                            border-orange-200
                            flex
                            items-center
                            justify-center
                            text-orange-600
                            hover:bg-orange-50
                            transition
                            disabled:cursor-not-allowed
                            disabled:opacity-60
                          "
                        >
                          {busy ? (
                            <Loader2 size={15} className="animate-spin" />
                          ) : (
                            <PauseCircle size={15} />
                          )}
                        </button>
                      )}
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

const RiderCard = ({
  rider,
  held = false,
  allowHold = false,
  allowActivate = false,
  workingId,
  onView,
  onHold,
  onActivate,
}) => {
  const riderStatus = getRiderStatus(rider.status);

  return (
    <div
      className={`
        bg-white rounded-3xl border p-5
        ${held ? "border-orange-200 opacity-90" : "border-gray-200"}
      `}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <div
            className={`
              w-11 h-11
              rounded-full
              flex items-center justify-center shrink-0
              font-bold
              ${
                held
                  ? "bg-orange-100 text-orange-700"
                  : "bg-[var(--secondary)] text-[var(--foreground)]"
              }
            `}
          >
            {rider.name?.[0]?.toUpperCase() || "R"}
          </div>

          <div className="min-w-0">
            <p className="font-semibold text-[var(--foreground)] truncate">
              {rider.name}
            </p>

            <p className="text-xs text-[var(--text)] truncate">
              {rider.email}
            </p>
          </div>
        </div>

        <span
          className={`
            text-xs
            font-medium
            px-3
            py-1.5
            rounded-full
            shrink-0
            ${riderStatus.className}
          `}
        >
          {riderStatus.label}
        </span>
      </div>

      {/* UID */}
      <div className="mt-3 flex items-center gap-2 text-xs text-[var(--text)]">
        <Fingerprint size={13} className="shrink-0" />
        <span className="truncate font-mono">
          {rider.uid || "uid not assigned"}
        </span>
      </div>

      {/* Meta */}
      <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
        <div>
          <p className="text-[11px] text-[var(--text)]">AGE</p>
          <p className="font-semibold">{rider.age || "—"}</p>
        </div>

        <div className="min-w-0">
          <p className="text-[11px] text-[var(--text)]">REGION</p>
          <p className="font-semibold truncate">{rider.region || "—"}</p>
        </div>

        <div className="min-w-0">
          <p className="text-[11px] text-[var(--text)]">CONTACT</p>
          <p className="font-semibold truncate">{rider.contact || "—"}</p>
        </div>

        <div className="min-w-0">
          <p className="text-[11px] text-[var(--text)]">NID</p>
          <p className="font-semibold truncate">{rider.nid || "—"}</p>
        </div>
      </div>

      {/* Warehouse */}
      <div className="mt-4 flex items-center gap-2 rounded-xl bg-gray-50 px-3 py-2 text-sm">
        <Truck size={15} className="text-[var(--text)]" />
        <span className="truncate">{rider.warehouse || "—"}</span>
      </div>

      {/* Actions */}
      <div
        className={`
          mt-5 pt-4 border-t border-gray-100
          ${allowHold || allowActivate ? "grid grid-cols-2 gap-2" : ""}
        `}
      >
        <button
          type="button"
          onClick={onView}
          className="
            w-full
            rounded-xl
            border
            border-gray-200
            py-2
            text-sm
            font-semibold
            text-[var(--foreground)]
            flex
            items-center
            justify-center
            gap-2
            hover:bg-gray-100
            transition
          "
        >
          <Eye size={16} />
          View Details
        </button>

        {allowHold && (
          <button
            type="button"
            onClick={onHold}
            disabled={workingId === rider._id}
            className="
              w-full
              rounded-xl
              border
              border-orange-200
              py-2
              text-sm
              font-semibold
              text-orange-600
              flex
              items-center
              justify-center
              gap-2
              hover:bg-orange-50
              transition
              disabled:cursor-not-allowed
              disabled:opacity-60
            "
          >
            {workingId === rider._id ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <PauseCircle size={16} />
            )}
            {workingId === rider._id ? "Holding" : "Hold"}
          </button>
        )}

        {allowActivate && (
          <button
            type="button"
            onClick={onActivate}
            disabled={workingId === rider._id}
            className="
              w-full
              rounded-xl
              border
              border-green-200
              py-2
              text-sm
              font-semibold
              text-green-600
              flex
              items-center
              justify-center
              gap-2
              hover:bg-green-50
              transition
              disabled:cursor-not-allowed
              disabled:opacity-60
            "
          >
            {workingId === rider._id ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <PlayCircle size={16} />
            )}
            {workingId === rider._id ? "Activating" : "Active"}
          </button>
        )}
      </div>
    </div>
  );
};

const RiderModal = ({ rider, onClose, onDone }) => {
  const api = useAxios();
  const [updating, setUpdating] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: { status: rider.status || "pending" },
  });

  const onSubmit = async (data) => {
    setUpdating(true);

    try {
      await api.patch(`/api/rider-applications/${rider._id}`, data);
      toast.success("Rider status updated!");
      onDone();
    } catch (error) {
      toast.error(error.message || "Failed to update rider");
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center px-4">
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={updating ? undefined : onClose}
      />

      <div
        className="
          relative
          w-full
          max-w-lg
          max-h-[85vh]
          overflow-y-auto
          bg-white
          rounded-3xl
          shadow-2xl
        "
      >
        <div className="h-2 bg-[var(--secondary)] rounded-t-3xl" />

        <div className="p-6">
          <button
            type="button"
            onClick={onClose}
            className="
              absolute
              right-4
              top-5
              w-9
              h-9
              rounded-full
              bg-gray-100
              flex
              items-center
              justify-center
              text-gray-500
              hover:bg-gray-200
              transition
            "
          >
            <X size={18} />
          </button>

          <div className="flex items-center gap-3">
            <div
              className="
                w-11 h-11
                rounded-full
                bg-[var(--secondary)]
                text-[var(--foreground)]
                flex items-center justify-center
                font-bold
              "
            >
              {rider.name?.[0]?.toUpperCase() || "R"}
            </div>

            <div className="min-w-0">
              <h2 className="text-xl font-bold text-[var(--foreground)] truncate">
                {rider.name}
              </h2>
              <p className="text-xs text-[var(--text)] truncate">
                {rider.email}
              </p>
            </div>
          </div>

          {/* Rider info */}
          <div className="mt-5 rounded-2xl border border-gray-200 overflow-hidden">
            <div className="flex items-center gap-2 px-4 py-3 bg-gray-100">
              <User size={16} />
              <span className="font-semibold text-sm">Rider Info</span>
            </div>

            <div className="p-4 space-y-3">
              {rider.riderID ? (
                <DetailRow
                  label="Rider ID"
                  value={
                    <span className="flex items-center gap-1 font-mono text-xs font-semibold text-[var(--secondary)]">
                      <Hash size={13} />
                      {rider.riderID}
                    </span>
                  }
                />
              ) : null}

              <DetailRow
                label="UID"
                value={
                  <span className="flex items-center gap-1 font-mono text-xs">
                    <Fingerprint size={13} />
                    {rider.uid || "uid not assigned"}
                  </span>
                }
              />

              <DetailRow
                label="Application ID"
                value={
                  <span className="flex items-center gap-1 font-mono text-xs">
                    <Hash size={13} />
                    {rider._id}
                  </span>
                }
              />

              <DetailRow label="Age" value={rider.age || "—"} />

              <DetailRow label="NID No" value={rider.nid || "—"} />

              <DetailRow
                label="Region"
                value={
                  <span className="flex items-center gap-1">
                    <MapPin size={13} /> {rider.region || "—"}
                  </span>
                }
              />

              <DetailRow
                label="Contact"
                value={
                  <span className="flex items-center gap-1">
                    <Phone size={13} /> {rider.contact || "—"}
                  </span>
                }
              />

              <DetailRow
                label="Warehouse"
                value={
                  <span className="flex items-center gap-1">
                    <Truck size={13} /> {rider.warehouse || "—"}
                  </span>
                }
              />

              <DetailRow
                label="Applied On"
                value={
                  rider.createdAt
                    ? new Date(rider.createdAt).toLocaleString()
                    : rider.created_at || "—"
                }
              />
            </div>
          </div>

          {/* Status control */}
          <form onSubmit={handleSubmit(onSubmit)} className="mt-5">
            <label className="block mb-2 font-medium text-sm">
              Rider Status
            </label>

            <select
              className="w-full border border-gray-300 rounded-lg px-4 py-3 outline-none"
              {...register("status", { required: true })}
            >
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="held">On Hold</option>
              <option value="rejected">Rejected</option>
            </select>

            {errors.status && (
              <p className="mt-1 text-xs text-red-500">{errors.status.message}</p>
            )}

            <div className="mt-5 flex items-center gap-3">
              <button
                type="button"
                onClick={onClose}
                disabled={updating}
                className="
                  flex-1
                  rounded-xl
                  border
                  border-gray-200
                  py-2.5
                  text-sm
                  font-semibold
                  text-[var(--foreground)]
                  hover:bg-gray-100
                  transition
                  disabled:cursor-not-allowed
                  disabled:opacity-60
                "
              >
                Close
              </button>

              <button
                type="submit"
                disabled={updating}
                className="
                  flex-1
                  rounded-xl
                  bg-[var(--secondary)]
                  py-2.5
                  text-sm
                  font-semibold
                  text-[var(--foreground)]
                  hover:bg-[var(--primary)]
                  transition
                  flex
                  items-center
                  justify-center
                  gap-2
                  disabled:cursor-not-allowed
                  disabled:opacity-60
                "
              >
                {updating ? "Saving..." : "Save"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

const DetailRow = ({ label, value }) => (
  <div className="flex items-start justify-between gap-3">
    <span className="text-sm text-[var(--text)] shrink-0">{label}</span>
    <span className="text-sm font-medium text-right">{value}</span>
  </div>
);

export default RiderList;
