import React, { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  Wallet,
  Banknote,
  Hourglass,
  ArrowLeft,
  ShieldCheck,
  Info,
  Loader2,
  CircleSlash,
} from "lucide-react";
import toast from "react-hot-toast";
import useAuth from "../../hooks/useAuth";
import useRiderDeliveries from "../../hooks/useRiderDeliveries";

/* money is in taka, whole units only */
const taka = (amount) => `৳ ${Number(amount || 0).toLocaleString("en-US")}`;

/*
 * Where a rider draws down the money they have earned.
 *
 * The two figures this page shows are real: they come from the earnings the
 * server stamps on every delivered delivery. Paying the money out is not wired
 * up yet, so the form below stops short of moving anything and says so plainly
 * rather than showing a success that did not happen.
 */
const Cashout = () => {
  const { profile, user } = useAuth();
  const { earnings, loading, loadDeliveries } = useRiderDeliveries();

  const rider = profile?.riderInfo || {};

  const [amount, setAmount] = useState("");
  const [submitting, setSubmitting] = useState(false);

  /* the most a rider can ask for is what they have actually earned. pending
     money is deliberately not spendable, a parcel that has not been delivered
     has not been paid for */
  const available = earnings.settled;

  const parsed = Number(amount) || 0;

  const error = useMemo(() => {
    if (!amount) return "";
    if (parsed <= 0) return "Enter an amount greater than zero";
    if (parsed > available) return "That is more than you have available";

    return "";
  }, [amount, parsed, available]);

  const handleSubmit = (event) => {
    event.preventDefault();

    if (error || !amount || available <= 0) return;

    setSubmitting(true);

    /* no payout provider is connected yet, so the request is acknowledged and
       then stopped here. pretending it went through would be worse than saying
       so, a rider would wait on money that was never sent */
    setTimeout(() => {
      setSubmitting(false);
      toast("Payouts are not enabled yet");
    }, 400);
  };

  return (
    <section className="w-full bg-[var(--background)] py-6 md:py-8">
      <div className="max-w-3xl mx-auto px-1 sm:px-0">
        <Link
          to="/rider/deliveries"
          className="inline-flex items-center gap-2 text-sm font-semibold text-[var(--text)] hover:text-[var(--foreground)] transition mb-6"
        >
          <ArrowLeft size={16} />
          Back to My Deliveries
        </Link>

        <div>
          <h1 className="text-3xl md:text-4xl font-bold text-[var(--foreground)]">
            Cashout
          </h1>
          <p className="mt-3 text-[var(--text)] leading-7">
            Draw down the money you have earned from delivered parcels.
          </p>
        </div>

        {/* ============ BALANCE ============ */}
        {loading ? (
          <div className="flex justify-center py-20">
            <span className="loading loading-spinner loading-xl"></span>
          </div>
        ) : (
          <>
            <div className="mt-8 rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[var(--secondary)] text-[var(--foreground)]">
                  <Wallet size={22} />
                </div>

                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-[var(--text)]/60">
                    Available to cash out
                  </p>
                  <p className="text-3xl font-bold text-[var(--foreground)]">
                    {taka(available)}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={loadDeliveries}
                  className="ml-auto rounded-full border border-gray-200 px-4 py-2 text-xs font-semibold text-[var(--foreground)] hover:bg-gray-100 transition"
                >
                  Refresh
                </button>
              </div>

              <div className="mt-5 grid grid-cols-2 gap-3">
                <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4">
                  <div className="flex items-center gap-2 text-amber-700">
                    <Hourglass size={15} />
                    <span className="text-[11px] font-semibold uppercase tracking-wide">
                      Pending
                    </span>
                  </div>
                  <p className="mt-1.5 text-xl font-bold text-[var(--foreground)]">
                    {taka(earnings.pending)}
                  </p>
                  <p className="mt-0.5 text-[11px] text-[var(--text)]">
                    From deliveries still open
                  </p>
                </div>

                <div className="rounded-2xl border border-gray-200 bg-gray-50 p-4">
                  <div className="flex items-center gap-2 text-[var(--text)]">
                    <Banknote size={15} />
                    <span className="text-[11px] font-semibold uppercase tracking-wide">
                      Lifetime
                    </span>
                  </div>
                  <p className="mt-1.5 text-xl font-bold text-[var(--foreground)]">
                    {taka(earnings.total)}
                  </p>
                  <p className="mt-0.5 text-[11px] text-[var(--text)]">
                    Earned plus pending
                  </p>
                </div>
              </div>
            </div>

            {/* ============ PAYOUT DETAILS ============ */}
            <div className="mt-5 rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
              <h2 className="text-lg font-bold text-[var(--foreground)]">
                Payout details
              </h2>

              <div className="mt-4 space-y-3 text-sm">
                <DetailRow
                  label="Rider ID"
                  value={profile?.riderID || "—"}
                />
                <DetailRow
                  label="Service Center"
                  value={rider.serviceCenter || "—"}
                />
                <DetailRow
                  label="Region"
                  value={rider.region || "—"}
                />
                <DetailRow
                  label="Contact"
                  value={rider.contact || user?.phoneNumber || "—"}
                />
              </div>
            </div>

            {/* ============ CASHOUT FORM ============ */}
            <form
              onSubmit={handleSubmit}
              className="mt-5 rounded-3xl border border-gray-200 bg-white p-6 shadow-sm"
            >
              <div className="flex items-center gap-2">
                <Banknote size={18} className="text-[var(--foreground)]" />
                <h2 className="text-lg font-bold text-[var(--foreground)]">
                  Request a cashout
                </h2>
              </div>

              <div className="mt-4">
                <label className="block text-sm font-semibold text-[var(--foreground)] mb-2">
                  Amount (৳)
                </label>

                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text)]">
                    ৳
                  </span>

                  <input
                    type="number"
                    min="1"
                    max={available}
                    value={amount}
                    onChange={(event) => setAmount(event.target.value)}
                    placeholder="Enter amount"
                    disabled={available <= 0}
                    className={`
                      w-full rounded-xl border bg-white py-3 pl-9 pr-4 outline-none transition
                      focus:ring-2 focus:ring-[var(--secondary)]
                      disabled:bg-gray-100 disabled:cursor-not-allowed
                      ${error ? "border-red-400" : "border-gray-200 focus:border-[var(--foreground)]"}
                    `}
                  />
                </div>

                <div className="mt-1.5 flex items-center justify-between">
                  {error ? (
                    <p className="text-xs text-red-500">{error}</p>
                  ) : (
                    <span />
                  )}

                  {available > 0 && (
                    <button
                      type="button"
                      onClick={() => setAmount(String(available))}
                      className="text-xs font-semibold text-[var(--foreground)] underline"
                    >
                      Cash out all {taka(available)}
                    </button>
                  )}
                </div>
              </div>

              <button
                type="submit"
                disabled={
                  submitting || available <= 0 || !amount || Boolean(error)
                }
                className="
                  mt-5 w-full rounded-xl bg-[var(--foreground)] py-3
                  font-semibold text-[var(--secondary)]
                  transition hover:bg-[var(--primary)] hover:text-[var(--foreground)]
                  disabled:cursor-not-allowed disabled:opacity-60
                  flex items-center justify-center gap-2
                "
              >
                {submitting ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  <Banknote size={16} />
                )}
                {submitting ? "Requesting..." : "Request Cashout"}
              </button>

              {available <= 0 && (
                <p className="mt-3 flex items-center justify-center gap-2 text-center text-xs text-[var(--text)]">
                  <CircleSlash size={13} />
                  Deliver a parcel to build up an available balance.
                </p>
              )}
            </form>

            {/* ============ PAYOUT STATUS ============ */}
            <div className="mt-5 flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50/60 p-5">
              <Info size={18} className="mt-0.5 shrink-0 text-amber-600" />

              <div className="text-sm leading-6 text-[var(--text)]">
                <p className="font-semibold text-[var(--foreground)]">
                  Payouts are not live yet
                </p>
                <p className="mt-1">
                  Your earned balance is tracked from every delivered parcel, but
                  sending the money to a mobile wallet or bank account is not
                  switched on. When it is, approved riders will be able to cash
                  out from this page.
                </p>
              </div>
            </div>
          </>
        )}
      </div>
    </section>
  );
};

const DetailRow = ({ label, value }) => (
  <div className="flex items-center justify-between gap-3 border-b border-gray-100 pb-3 last:border-0 last:pb-0">
    <span className="text-[var(--text)]">{label}</span>
    <span className="font-medium text-right text-[var(--foreground)]">
      {value}
    </span>
  </div>
);

export default Cashout;
