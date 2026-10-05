import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Package,
  RefreshCw,
  Search,
  X,
  User,
  MapPin,
  Phone,
  Truck,
  Scale,
  Hash,
  Ban,
  Eye,
  Clock,
  Bike,
  Loader2,
  Wallet,
  Banknote,
  Hourglass,
  CircleSlash,
  Building2,
  CheckCheck,
} from "lucide-react";
import useRiderDeliveries, {
  canCancel,
  getEarning,
  getEarningTier,
} from "../../hooks/useRiderDeliveries";
import StatusBadge from "../../components/StatusBadge/StatusBadge";
import PageLoader from "../../components/PageLoader/PageLoader";
import { getDeliveredAt, formatDateTime } from "../../data/deliveryTimes";

/* money is in taka and is stored as a whole number, so it is formatted once here
   rather than with a currency symbol typed at every call site */
const taka = (amount) => `৳ ${Number(amount || 0).toLocaleString("en-US")}`;

/* The two earning tiers, shown above the table so a rider can read the whole
   rule set on one screen instead of working it out from a single row. A rider
   only carries the final leg inside their own region, so there is no lower tier
   for a delivery further away than that. The rates here are the same numbers the
   server pays out with, a test in client/tests/earnings.test.js holds the two to
   each other. */
const EARNING_LEGEND = [
  { tier: "same_center", label: "Same service center", rate: "80%" },
  { tier: "same_region", label: "Same region", rate: "65%" },
];

/* one of the summary cards above the table */
const EarningCard = ({ icon, label, amount, hint, tone }) => {
  const toneClass = {
    green: "border-green-200 dark:border-green-400/40 bg-green-50",
    amber: "border-amber-200 dark:border-amber-400/40 bg-amber-50",
    plain: "border-[var(--border)] bg-[var(--surface)]",
  }[tone];

  return (
    <div className={`rounded-2xl border p-4 ${toneClass}`}>
      <div className="flex items-center gap-2 text-[var(--text)]">
        {icon}
        <span className="text-xs font-semibold uppercase tracking-wide">
          {label}
        </span>
      </div>

      <p className="mt-2 text-2xl font-bold text-[var(--foreground)]">
        {amount}
      </p>

      <p className="mt-1 text-[11px] text-[var(--text)]">{hint}</p>
    </div>
  );
};

/* the earning on one delivery, with the tier that decided it. a parcel booked
   before earnings existed, or cancelled, has nothing to show and says so rather
   than rendering a zero that reads like a real payout */
const EarningCell = ({ parcel }) => {
  const earning = getEarning(parcel);

  if (!earning || !earning.amount) {
    return <span className="text-xs text-[var(--text)]">—</span>;
  }

  const tier = getEarningTier(earning.tier);
  const isCancelled = earning.status === "cancelled";

  if (isCancelled) {
    return (
      <div className="flex items-center gap-2">
        <CircleSlash size={14} className="text-red-400 shrink-0" />
        <div>
          <p className="font-semibold text-[var(--text)] line-through">
            {taka(earning.amount)}
          </p>
          <p className="text-[11px] text-[var(--text)]">Cancelled</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <p
        className={`font-semibold ${
          earning.settled
            ? "text-green-700 dark:text-green-300"
            : "text-[var(--foreground)]"
        }`}
      >
        {taka(earning.amount)}
        {!earning.settled && (
          <span className="ml-1.5 text-[10px] font-medium uppercase tracking-wide text-amber-600 dark:text-amber-400">
            Pending
          </span>
        )}
      </p>

      <p className="text-[11px] text-[var(--text)]">
        {tier.label} · {earning.rate * 100}% of {taka(earning.fee)}
      </p>
    </div>
  );
};

const MyDeliveries = () => {
  const {
    parcels,
    loading,
    workingId,
    earnings,
    loadDeliveries,
    setStatus,
    nextStep,
  } = useRiderDeliveries();

  const navigate = useNavigate();

  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState(null);
  const [cancelTarget, setCancelTarget] = useState(null);

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
      ]
        .filter(Boolean)
        .some((value) => value.toLowerCase().includes(term))
    );
  }, [parcels, query]);

  return (
    <section className="w-full bg-[var(--background)] py-6 md:py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-[var(--foreground)]">
              My Deliveries
            </h1>
            <p className="mt-3 text-[var(--text)] leading-7">
              Every parcel an admin has assigned to you, and the steps you can
              take on it.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={loadDeliveries}
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

            {/* jumps to the earnings page, which is where the money the rider has
                actually earned is kept and drawn down */}
            <button
              type="button"
              onClick={() => navigate("/rider/earnings")}
              className="
                px-6 py-3
                rounded-full
                border border-[var(--foreground)]
                bg-transparent
                text-[var(--foreground)]
                font-semibold
                hover:bg-[var(--ink)]
                hover:text-[var(--secondary)]
                transition-all duration-300
                flex items-center gap-2
              "
            >
              <Banknote size={16} />
              My Earnings
            </button>
          </div>
        </div>

        {/* Search */}
        <div className="relative mb-6">
          <Search
            size={18}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text)]/50"
          />

          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by parcel, id, sender, receiver or region"
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

        {/* What the rider has made so far, and what the open deliveries are
            still worth. Settled and pending are shown apart on purpose, only a
            delivered parcel counts as money in hand */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <EarningCard
            icon={<Banknote size={18} />}
            label="Earned"
            amount={taka(earnings.settled)}
            hint="From delivered parcels"
            tone="green"
          />

          <EarningCard
            icon={<Hourglass size={18} />}
            label="Pending"
            amount={taka(earnings.pending)}
            hint="From deliveries still open"
            tone="amber"
          />

          <EarningCard
            icon={<Wallet size={18} />}
            label="Total"
            amount={taka(earnings.total)}
            hint="Earned plus pending, all deliveries"
            tone="plain"
          />
        </div>

        {loading ? (
          <PageLoader className="min-h-[60vh]" />
        ) : filtered.length === 0 ? (
          <div className="bg-[var(--surface)] rounded-3xl border border-[var(--border)] p-16 text-center">
            <Package size={48} className="mx-auto text-[var(--text)]" />
            <h2 className="mt-4 text-xl font-bold text-[var(--foreground)]">
              No deliveries found
            </h2>
            <p className="mt-2 text-sm text-[var(--text)]">
              {query
                ? "No deliveries match your search."
                : "Parcels an admin assigns to you will appear here."}
            </p>
          </div>
        ) : (
          <DeliveryTable
            parcels={filtered}
            workingId={workingId}
            nextStep={nextStep}
            onView={(parcel) => setSelected(parcel)}
            onAdvance={(parcel, step) => setStatus(parcel, step.status, step.label)}
            onCancel={(parcel) => setCancelTarget(parcel)}
          />
        )}
      </div>

      {selected && (
        <DeliveryModal parcel={selected} onClose={() => setSelected(null)} />
      )}

      {cancelTarget && (
        <ConfirmCancelModal
          parcel={cancelTarget}
          busy={workingId === cancelTarget._id}
          onConfirm={() =>
            setStatus(cancelTarget, "cancelled", "Delivery cancelled!")
          }
          onClose={() => setCancelTarget(null)}
        />
      )}
    </section>
  );
};

const DeliveryTable = ({
  parcels,
  workingId,
  nextStep,
  onView,
  onAdvance,
  onCancel,
}) => {
  return (
    <div className="bg-[var(--surface)] rounded-3xl border border-[var(--border)] overflow-hidden">
      {/* Legend */}
      <div className="flex flex-wrap items-center gap-3 border-b border-[var(--border)] px-5 py-3">
        <span className="text-xs font-semibold text-[var(--text)]">
          {parcels.length} deliver{parcels.length === 1 ? "y" : "ies"}
        </span>

        <span className="flex items-center gap-1.5 text-xs text-[var(--text)]">
          <Bike size={13} />
          Assigned to you
        </span>

        <span className="flex items-center gap-1.5 text-xs text-[var(--text)]">
          <Building2 size={13} />
          {EARNING_LEGEND.map((entry) => (
            <span key={entry.tier} className="flex items-center gap-1">
              {entry.label} {entry.rate}
            </span>
          ))}
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-[var(--border)] text-xs uppercase tracking-wide text-[var(--text)]/50">
              <th className="px-4 py-3 font-semibold">Parcel</th>
              <th className="hidden px-4 py-3 font-semibold lg:table-cell">
                Pickup
              </th>
              <th className="hidden px-4 py-3 font-semibold lg:table-cell">
                Delivery
              </th>
              <th className="hidden px-4 py-3 font-semibold xl:table-cell">
                Weight
              </th>
              <th className="hidden px-4 py-3 font-semibold lg:table-cell">
                Delivery Charge
              </th>
              <th className="hidden px-4 py-3 font-semibold lg:table-cell">
                Earning
              </th>
              <th className="px-4 py-3 font-semibold">Payment</th>
              <th className="px-4 py-3 font-semibold">Delivery Status</th>
              <th className="px-4 py-3 font-semibold">Delivered</th>
              <th className="px-4 py-3 font-semibold text-right">Action</th>
            </tr>
          </thead>

          <tbody>
            {parcels.map((parcel) => {
              const step = nextStep(parcel);
              const busy = workingId === parcel._id;
              /* the earning carries the fee already worked out, so it is the
                 safer of the two when the parcel has no charge of its own */
              const deliveryCharge =
                Number(parcel.productDeliveryCost) ||
                Number(getEarning(parcel)?.fee) ||
                0;
              const deliveredAt = getDeliveredAt(parcel);

              return (
                <tr
                  key={parcel._id}
                  className="border-b border-[var(--border)] last:border-0 hover:bg-[var(--surface-hover)]/60 transition-colors"
                >
                  {/* Parcel */}
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-9 h-9 rounded-xl bg-[var(--secondary)] text-[var(--text-on-secondary)] flex items-center justify-center shrink-0">
                        <Package size={17} />
                      </div>

                      <div className="min-w-0">
                        <p className="font-semibold text-[var(--foreground)] truncate max-w-[200px]">
                          {parcel.parcelTitle || "Untitled"}
                        </p>

                        {/* who is getting this parcel, kept next to the parcel
                            name so it stays visible on small screens where the
                            delivery column is hidden */}
                        <p className="text-xs text-[var(--text)] truncate max-w-[200px] flex items-center gap-1">
                          <User size={11} className="shrink-0" />
                          {parcel.receiverName || "—"}
                        </p>

                        <p className="text-[11px] text-[var(--text)] font-mono truncate flex items-center gap-1">
                          <Hash size={10} />
                          {parcel._id}
                        </p>
                      </div>
                    </div>
                  </td>

                  {/* Pickup */}
                  <td className="hidden px-4 py-3 lg:table-cell">
                    <p className="font-medium truncate max-w-[160px]">
                      {parcel.senderName || "—"}
                    </p>
                    <p className="text-[11px] text-[var(--text)] truncate max-w-[160px]">
                      {parcel.senderRegion || "—"}
                    </p>
                  </td>

                  {/* Delivery */}
                  <td className="hidden px-4 py-3 lg:table-cell">
                    <p className="font-medium truncate max-w-[160px]">
                      {parcel.receiverName || "—"}
                    </p>
                    <p className="text-[11px] text-[var(--text)] truncate max-w-[160px]">
                      {parcel.receiverRegion || "—"}
                    </p>
                  </td>

                  {/* Weight */}
                  <td className="hidden px-4 py-3 xl:table-cell">
                    <span className="flex items-center gap-1 whitespace-nowrap">
                      <Scale size={14} />
                      {parcel.weight ? `${parcel.weight} KG` : "—"}
                    </span>
                  </td>

                  {/* Delivery charge, the fee the rider's share is worked out from. it is
                      shipped on the parcel and echoed back on the earning, so the
                      number here is the one the server used */}
                  <td className="hidden px-4 py-3 lg:table-cell">
                    {deliveryCharge ? (
                      <span className="flex items-center gap-1 whitespace-nowrap font-medium">
                        <Banknote size={14} />
                        {taka(deliveryCharge)}
                      </span>
                    ) : (
                      <span className="text-[var(--text)]">—</span>
                    )}
                  </td>

                  {/* Earning, worked out server side against the rider's own
                      service center */}
                  <td className="hidden px-4 py-3 lg:table-cell">
                    <EarningCell parcel={parcel} />
                  </td>

                  {/* Payment, so a rider can see the parcel has been paid for before
                      they carry it */}
                  <td className="px-4 py-3">
                    <StatusBadge
                      kind="payment"
                      value={parcel.paymentStatus}
                      bare
                    />
                  </td>

                  {/* Status */}
                  <td className="px-4 py-3">
                    <StatusBadge kind="delivery" value={parcel.status} />
                  </td>

                  {/* when the parcel actually reached the receiver. a parcel that
                      has not been delivered yet has no time to show */}
                  <td className="px-4 py-3">
                    <span className="flex items-center gap-1 whitespace-nowrap text-[var(--text)]">
                      {deliveredAt ? (
                        <>
                          <CheckCheck size={14} />
                          {formatDateTime(deliveredAt)}
                        </>
                      ) : (
                        "—"
                      )}
                    </span>
                  </td>

                  {/* Actions */}
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => onView(parcel)}
                        title="View Details"
                        className="
                          w-9 h-9
                          rounded-lg
                          border border-[var(--border)]
                          flex items-center justify-center
                          text-[var(--foreground)]
                          hover:bg-[var(--surface-muted)]
                          transition
                        "
                      >
                        <Eye size={15} />
                      </button>

                      {step && (
                        <button
                          type="button"
                          onClick={() => onAdvance(parcel, step)}
                          disabled={busy}
                          title={step.label}
                          className="
                            w-9 h-9
                            rounded-lg
                            border border-blue-200 dark:border-blue-400/40
                            flex items-center justify-center
                            text-blue-600 dark:text-blue-400
                            hover:bg-blue-50 dark:hover:bg-blue-400/20
                            transition
                            disabled:cursor-not-allowed
                            disabled:opacity-60
                          "
                        >
                          {busy ? (
                            <Loader2 size={15} className="animate-spin" />
                          ) : (
                            <Clock size={15} />
                          )}
                        </button>
                      )}

                      {canCancel(parcel.status) && (
                        <button
                          type="button"
                          onClick={() => onCancel(parcel)}
                          disabled={busy}
                          title="Cancel Delivery"
                          className="
                            w-9 h-9
                            rounded-lg
                            border border-red-200 dark:border-red-400/40
                            flex items-center justify-center
                            text-red-500 dark:text-red-400
                            hover:bg-red-50 dark:hover:bg-red-400/20
                            transition
                            disabled:cursor-not-allowed
                            disabled:opacity-60
                          "
                        >
                          <Ban size={15} />
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

const DeliveryModal = ({ parcel, onClose }) => (
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
        overflow-y-auto
        bg-[var(--surface)]
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
          <div className="w-11 h-11 rounded-xl bg-[var(--secondary)] text-[var(--text-on-secondary)] flex items-center justify-center shrink-0">
            <Package size={21} />
          </div>

          <div className="min-w-0">
            <h2 className="text-xl font-bold text-[var(--foreground)] truncate">
              {parcel.parcelTitle}
            </h2>
            <p className="text-xs text-[var(--text)]">
              {parcel.createdAt
                ? new Date(parcel.createdAt).toLocaleString()
                : "—"}
            </p>
          </div>
        </div>

        {/* Parcel info */}
        <div className="mt-5 rounded-2xl border border-[var(--border)] overflow-hidden">
          <div className="flex items-center gap-2 px-4 py-3 bg-[var(--surface-muted)]">
            <Package size={16} />
            <span className="font-semibold text-sm">Parcel Info</span>
          </div>

          <div className="p-4 space-y-3">
            <DetailRow
              label="Parcel Type"
              value={
                parcel.parcelType === "document" ? "Document" : "Non-document"
              }
            />

            <DetailRow
              label="Weight"
              value={parcel.weight ? `${parcel.weight} KG` : "—"}
            />

            <DetailRow
              label="Delivery Status"
              value={<StatusBadge kind="delivery" value={parcel.status} bare />}
            />

            <DetailRow
              label="Payment Status"
              value={<StatusBadge kind="payment" value={parcel.paymentStatus} bare />}
            />
          </div>
        </div>

        {/* Earning, so the rider can see what the delivery pays and which tier
            decided it rather than taking the figure on trust */}
        {getEarning(parcel) && (
          <div className="mt-4 rounded-2xl border border-[var(--border)] overflow-hidden">
            <div className="flex items-center gap-2 px-4 py-3 bg-[var(--surface-muted)]">
              <Wallet size={16} />
              <span className="font-semibold text-sm">Your Earning</span>
            </div>

            <div className="p-4 space-y-3">
              <DetailRow
                label="Delivery Fee"
                value={taka(getEarning(parcel).fee)}
              />

              <DetailRow
                label="Earning Tier"
                value={
                  <span
                    className={`inline-block px-2 py-0.5 rounded-full text-xs font-semibold ${
                      getEarningTier(getEarning(parcel).tier).className
                    }`}
                  >
                    {getEarningTier(getEarning(parcel).tier).label}
                  </span>
                }
              />

              <DetailRow
                label="Your Share"
                value={
                  <span className="font-semibold">
                    {getEarning(parcel).rate * 100}% of the delivery fee
                  </span>
                }
              />

              <DetailRow
                label="You Earn"
                value={
                  <span
                    className={`text-base font-bold ${
                      getEarning(parcel).settled
                        ? "text-green-700 dark:text-green-300"
                        : "text-[var(--foreground)]"
                    }`}
                  >
                    {taka(getEarning(parcel).amount)}
                    {!getEarning(parcel).settled &&
                      getEarning(parcel).status !== "cancelled" && (
                        <span className="ml-1.5 text-[10px] font-medium uppercase tracking-wide text-amber-600 dark:text-amber-400">
                          Pending
                        </span>
                      )}
                    {getEarning(parcel).status === "cancelled" && (
                      <span className="ml-1.5 text-[10px] font-medium uppercase tracking-wide text-red-500 dark:text-red-400">
                        Cancelled
                      </span>
                    )}
                  </span>
                }
              />
            </div>
          </div>
        )}

        {/* Pickup */}
        <div className="mt-4 rounded-2xl border border-[var(--border)] overflow-hidden">
          <div className="flex items-center gap-2 px-4 py-3 bg-[var(--surface-muted)]">
            <User size={16} />
            <span className="font-semibold text-sm">Pickup Info</span>
          </div>

          <div className="p-4 space-y-3">
            <DetailRow label="Name" value={parcel.senderName || "—"} />
            <DetailRow label="Contact" value={parcel.senderContact || "—"} />
            <DetailRow label="Region" value={parcel.senderRegion || "—"} />
            {/* the center the parcel is collected from */}
            <DetailRow
              label="Pickup Center"
              value={
                <span className="flex items-center justify-end gap-1">
                  <Building2 size={13} /> {parcel.senderServiceCenter || "—"}
                </span>
              }
            />
            <DetailRow label="Address" value={parcel.senderAddress || "—"} />
            <DetailRow
              label="Pickup Instruction"
              value={parcel.pickupInstruction || "—"}
            />
          </div>
        </div>

        {/* Receiver */}
        <div className="mt-4 rounded-2xl border border-[var(--border)] overflow-hidden">
          <div className="flex items-center gap-2 px-4 py-3 bg-[var(--surface-muted)]">
            <Truck size={16} />
            <span className="font-semibold text-sm">Receiver Info</span>
          </div>

          <div className="p-4 space-y-3">
            <DetailRow label="Name" value={parcel.receiverName || "—"} />
            <DetailRow label="Contact" value={parcel.receiverContact || "—"} />
            <DetailRow label="Region" value={parcel.receiverRegion || "—"} />
            {/* the center the parcel is delivered to. it decides the earning
                tier on this row */}
            <DetailRow
              label="Service Center"
              value={parcel.receiverServiceCenter || "—"}
            />
            <DetailRow label="Address" value={parcel.receiverAddress || "—"} />
            <DetailRow
              label="Delivery Instruction"
              value={parcel.deliveryInstruction || "—"}
            />
            <DetailRow
              label="Contact on arrival"
              value={
                <span className="flex items-center gap-1">
                  <Phone size={13} /> {parcel.receiverContact || "—"}
                </span>
              }
            />
          </div>
        </div>
      </div>
    </div>
  </div>
);

const ConfirmCancelModal = ({ parcel, busy, onConfirm, onClose }) => (
  <div className="fixed inset-0 z-[999] flex items-center justify-center px-4">
    <div
      className="absolute inset-0 bg-black/60 backdrop-blur-sm"
      onClick={busy ? undefined : onClose}
    />

    <div className="relative w-full max-w-md bg-[var(--surface)] rounded-3xl shadow-2xl">
      <div className="h-2 bg-red-500 rounded-t-3xl" />

      <div className="p-6">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-red-100 text-red-500 dark:text-red-400 flex items-center justify-center shrink-0">
            <Ban size={21} />
          </div>

          <div className="min-w-0">
            <h2 className="text-lg font-bold text-[var(--foreground)]">
              Cancel Delivery?
            </h2>
            <p className="text-xs text-[var(--text)] truncate">
              {parcel.parcelTitle}
            </p>
          </div>
        </div>

        <p className="mt-4 text-sm text-[var(--text)] leading-6">
          The parcel will be marked as cancelled and an admin will see the
          status change. This cannot be undone from here.
        </p>

        <div className="mt-6 flex items-center gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={busy}
            className="
              flex-1
              rounded-xl
              border
              border-[var(--border)]
              py-2.5
              text-sm
              font-semibold
              text-[var(--foreground)]
              hover:bg-[var(--surface-muted)]
              transition
              disabled:cursor-not-allowed
              disabled:opacity-60
            "
          >
            Keep Delivering
          </button>

          <button
            type="button"
            onClick={onConfirm}
            disabled={busy}
            className="
              flex-1
              rounded-xl
              bg-red-500
              py-2.5
              text-sm
              font-semibold
              text-white
              hover:bg-red-600
              transition
              flex items-center justify-center gap-2
              disabled:cursor-not-allowed
              disabled:opacity-60
            "
          >
            {busy ? <Loader2 size={16} className="animate-spin" /> : <Ban size={16} />}
            {busy ? "Cancelling..." : "Confirm Cancel"}
          </button>
        </div>
      </div>
    </div>
  </div>
);

const DetailRow = ({ label, value }) => (
  <div className="flex items-start justify-between gap-3">
    <span className="text-sm text-[var(--text)] shrink-0">{label}</span>
    <span className="text-sm font-medium text-right">{value}</span>
  </div>
);

export default MyDeliveries;
