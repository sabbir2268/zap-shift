import React, { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  Wallet,
  Banknote,
  Hourglass,
  ArrowLeft,
  Receipt,
  Loader2,
  CalendarDays,
  TrendingUp,
  History,
  Info,
} from "lucide-react";
import useAuth from "../../hooks/useAuth";
import useRiderEarnings from "../../hooks/useRiderEarnings";
import PageLoader from "../../components/PageLoader/PageLoader";
import { getRiderServiceCenter } from "../../data/rider";

/* money is in taka, whole units only */
const taka = (amount) => `৳ ${Number(amount || 0).toLocaleString("en-US")}`;

/*
 * A rider's earnings.
 *
 * Every figure on this page comes from delivered parcels, because a delivery is
 * what earns. The three big cards are the whole story: what has been earned in
 * total, what the open deliveries are still worth, and what is left in the wallet
 * after everything already cashed out. Underneath them the same earned money is
 * split by the day, week, month and year it was earned on.
 */
const MyEarnings = () => {
  const { profile, user } = useAuth();
  const {
    records,
    loading,
    submitting,
    minCashout,
    totals,
    periods,
    reload,
    cashOut,
  } = useRiderEarnings();

  const rider = profile?.riderInfo || {};

  const [amount, setAmount] = useState("");

  const parsed = Number(amount) || 0;

  /* the form says the same thing the server will say, so a rider is told what is
     wrong before they send it */
  const error = useMemo(() => {
    if (!amount) return "";
    if (parsed <= 0) return "Enter an amount greater than zero";
    if (!Number.isInteger(parsed)) return "Cashout must be a whole number";
    if (parsed < minCashout) {
      return `The smallest cashout is ${minCashout} taka`;
    }
    if (parsed > totals.wallet) {
      return `That is more than you have in your wallet`;
    }

    return "";
  }, [amount, parsed, minCashout, totals.wallet]);

  const canCashOut = !loading && totals.wallet >= minCashout;

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (error || !amount || !canCashOut) return;

    const done = await cashOut(parsed);

    if (done) setAmount("");
  };

  return (
    <section className="w-full bg-[var(--background)] py-6 md:py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <Link
          to="/rider/deliveries"
          className="inline-flex items-center gap-2 text-sm font-semibold text-[var(--text)] hover:text-[var(--foreground)] transition mb-6"
        >
          <ArrowLeft size={16} />
          Back to My Deliveries
        </Link>

        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-[var(--foreground)]">
              My Earnings
            </h1>
            <p className="mt-3 text-[var(--text)] leading-7">
              What you have earned from deliveries, what is still pending, and
              what is in your wallet.
            </p>
          </div>

          <button
            type="button"
            onClick={reload}
            disabled={loading}
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
              disabled:opacity-60
              disabled:cursor-not-allowed
            "
          >
            {loading ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <Receipt size={16} />
            )}
            Refresh
          </button>
        </div>

        {loading ? (
          <PageLoader className="min-h-[60vh]" />
        ) : (
          <>
            {/* ============ THE THREE FIGURES ============ */}
            <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <MoneyCard
                icon={<TrendingUp size={22} />}
                tone="bg-green-100 dark:bg-green-400/15 text-green-600 dark:text-green-400"
                label="Total Earning"
                value={totals.total}
                caption="From delivered parcels"
              />

              <MoneyCard
                icon={<Hourglass size={22} />}
                tone="bg-amber-100 dark:bg-amber-400/15 text-amber-600 dark:text-amber-400"
                label="Pending"
                value={totals.pending}
                caption="Deliveries still open"
              />

              <MoneyCard
                icon={<Wallet size={22} />}
                tone="bg-blue-100 dark:bg-blue-400/15 text-blue-600 dark:text-blue-400"
                label="In Wallet"
                value={totals.wallet}
                caption="Ready to cash out"
              />

              <MoneyCard
                icon={<Banknote size={22} />}
                tone="bg-purple-100 dark:bg-purple-400/15 text-purple-600 dark:text-purple-400"
                label="Cashed Out"
                value={totals.cashedOut}
                caption="Already taken out"
              />
            </div>

            <div className="mt-8 grid grid-cols-1 gap-5 lg:grid-cols-2">
              {/* ============ CASHOUT ============ */}
              <form
                onSubmit={handleSubmit}
                className="rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-6 shadow-sm"
              >
                <div className="flex items-center gap-2">
                  <Banknote size={18} className="text-[var(--foreground)]" />
                  <h2 className="text-lg font-bold text-[var(--foreground)]">
                    Cash out
                  </h2>
                </div>

                <p className="mt-1 text-sm text-[var(--text)]">
                  You need at least {taka(minCashout)} in your wallet to cash
                  out.
                </p>

                <div className="mt-5">
                  <label className="block text-sm font-semibold text-[var(--foreground)] mb-2">
                    Amount (৳)
                  </label>

                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text)]">
                      ৳
                    </span>

                    <input
                      type="number"
                      min={minCashout}
                      max={totals.wallet}
                      step="1"
                      value={amount}
                      onChange={(event) => setAmount(event.target.value)}
                      placeholder="Enter amount"
                      disabled={!canCashOut}
                      className={`
                        w-full rounded-xl border bg-[var(--surface)] py-3 pl-9 pr-4 outline-none transition
                        focus:ring-2 focus:ring-[var(--secondary)]
                        disabled:bg-[var(--surface-muted)] disabled:cursor-not-allowed
                        ${
                          error
                            ? "border-red-400"
                            : "border-[var(--border)] focus:border-[var(--foreground)]"
                        }
                      `}
                    />
                  </div>

                  <div className="mt-1.5 flex items-center justify-between gap-3">
                    {error ? (
                      <p className="text-xs text-red-500 dark:text-red-400">{error}</p>
                    ) : (
                      <span />
                    )}

                    {canCashOut && (
                      <button
                        type="button"
                        onClick={() => setAmount(String(totals.wallet))}
                        className="text-xs font-semibold text-[var(--foreground)] underline"
                      >
                        Cash out all {taka(totals.wallet)}
                      </button>
                    )}
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={
                    submitting || !canCashOut || !amount || Boolean(error)
                  }
                  className="
                    mt-5 w-full rounded-xl bg-[var(--ink)] py-3
                    font-semibold text-[var(--secondary)]
                    transition hover:bg-[var(--surface)] hover:text-[var(--foreground)]
                    disabled:cursor-not-allowed disabled:opacity-60
                    flex items-center justify-center gap-2
                  "
                >
                  {submitting ? (
                    <Loader2 size={16} className="animate-spin" />
                  ) : (
                    <Banknote size={16} />
                  )}
                  {submitting ? "Cashing out..." : "Cash Out"}
                </button>

                {!canCashOut && (
                  <p className="mt-3 text-center text-xs text-[var(--text)]">
                    Your wallet holds {taka(totals.wallet)}. Deliver more parcels
                    to reach {taka(minCashout)}.
                  </p>
                )}

                {/* ============ PAYOUT DETAILS ============ */}
                <div className="mt-6 border-t border-[var(--border)] pt-5">
                  <h3 className="text-sm font-bold text-[var(--foreground)]">
                    Payout details
                  </h3>

                  <div className="mt-3 space-y-3 text-sm">
                    <DetailRow
                      label="Rider ID"
                      value={profile?.riderID || "—"}
                    />
                    <DetailRow
                      label="Service Center"
                      value={getRiderServiceCenter(rider) || "—"}
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
              </form>

              {/* ============ PERIODS ============ */}
              <div className="rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-6 shadow-sm">
                <div className="flex items-center gap-2">
                  <CalendarDays size={18} className="text-[var(--foreground)]" />
                  <h2 className="text-lg font-bold text-[var(--foreground)]">
                    Earning over time
                  </h2>
                </div>

                <p className="mt-1 text-sm text-[var(--text)]">
                  Earned money, placed in the day, week, month and year it was
                  earned on.
                </p>

                <div className="mt-5 grid grid-cols-2 gap-3">
                  {periods.map((period) => (
                    <div
                      key={period.key}
                      className="rounded-2xl border border-[var(--border)] bg-[var(--surface-muted)] p-4"
                    >
                      <p className="text-[11px] font-semibold uppercase tracking-wide text-[var(--text)]/60">
                        {period.label}
                      </p>

                      <p className="mt-1.5 text-xl font-bold text-[var(--foreground)]">
                        {taka(period.amount)}
                      </p>

                      <p className="mt-0.5 text-[11px] text-[var(--text)]">
                        {period.caption} · {period.deliveries} deliver
                        {period.deliveries === 1 ? "y" : "ies"}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* ============ CASHOUT HISTORY ============ */}
            <div className="mt-5 rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-6 shadow-sm">
              <div className="flex items-center gap-2">
                <History size={18} className="text-[var(--foreground)]" />
                <h2 className="text-lg font-bold text-[var(--foreground)]">
                  Cashout history
                </h2>
              </div>

              {records.length === 0 ? (
                <p className="mt-4 rounded-2xl bg-[var(--surface-muted)] p-6 text-center text-sm text-[var(--text)]">
                  You have not cashed out yet.
                </p>
              ) : (
                <div className="mt-4 overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead>
                      <tr className="border-b border-[var(--border)] text-xs uppercase tracking-wide text-[var(--text)]/50">
                        <th className="px-3 py-2 font-semibold">Amount</th>
                        <th className="px-3 py-2 font-semibold">Date</th>
                        <th className="px-3 py-2 font-semibold text-right">
                          Left in wallet
                        </th>
                      </tr>
                    </thead>

                    <tbody>
                      {records.map((record, index) => (
                        <CashoutRow
                          key={record._id}
                          record={record}
                          wallet={
                            totals.wallet + recordsToCome(records, index)
                          }
                        />
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            <div className="mt-5 flex items-start gap-3 rounded-2xl border border-amber-200 dark:border-amber-400/40 bg-amber-50/60 p-5">
              <Info size={18} className="mt-0.5 shrink-0 text-amber-600 dark:text-amber-400" />

              <div className="text-sm leading-6 text-[var(--text)]">
                <p className="font-semibold text-[var(--foreground)]">
                  Cashouts are recorded here only
                </p>
                <p className="mt-1">
                  A cashout leaves your wallet and is listed in your history, but
                  sending the money to a mobile wallet or bank account is not
                  switched on yet.
                </p>
              </div>
            </div>
          </>
        )}
      </div>
    </section>
  );
};

/* the wallet figure as it stood just after a given cashout, so the history reads
   as a running balance rather than a list of numbers with no meaning */
const recordsToCome = (records, index) =>
  records
    .slice(index + 1)
    .reduce((sum, record) => sum + (Number(record.amount) || 0), 0);

const CashoutRow = ({ record, wallet }) => (
  <tr className="border-b border-[var(--border)] last:border-0">
    <td className="px-3 py-3 font-semibold text-[var(--foreground)]">
      {taka(record.amount)}
    </td>

    <td className="px-3 py-3 text-[var(--text)]">
      {record.createdAt ? new Date(record.createdAt).toLocaleString() : "—"}
    </td>

    <td className="px-3 py-3 text-right font-medium text-[var(--foreground)]">
      {taka(wallet)}
    </td>
  </tr>
);

const MoneyCard = ({ icon, tone, label, value, caption }) => (
  <div className="flex items-center gap-4 rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-5 shadow-sm">
    <div
      className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${tone}`}
    >
      {icon}
    </div>

    <div className="min-w-0">
      <p className="text-xs font-medium text-[var(--text)]/60">{label}</p>

      <p className="truncate text-xl font-bold text-[var(--foreground)]">
        {taka(value)}
      </p>

      <p className="text-[11px] text-[var(--text)]">{caption}</p>
    </div>
  </div>
);

const DetailRow = ({ label, value }) => (
  <div className="flex items-center justify-between gap-3 border-b border-[var(--border)] pb-3 last:border-0 last:pb-0">
    <span className="text-[var(--text)]">{label}</span>
    <span className="font-medium text-right text-[var(--foreground)]">
      {value}
    </span>
  </div>
);

export default MyEarnings;