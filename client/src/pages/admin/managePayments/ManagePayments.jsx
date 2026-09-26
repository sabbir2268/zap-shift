import React, { useCallback, useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import {
  CreditCard,
  RefreshCw,
  Hash,
  CheckCircle2,
  Search,
  Banknote,
  Wallet,
} from "lucide-react";
import usePayments from "../../../api/payments";

const ManagePayments = () => {
  const { getPayments } = usePayments();

  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");

  const loadPayments = useCallback(async () => {
    setLoading(true);

    try {
      const data = await getPayments();
      setPayments(Array.isArray(data) ? data : []);
    } catch (error) {
      toast.error(error.message || "Failed to load payments");
    } finally {
      setLoading(false);
    }
  }, [getPayments]);

  useEffect(() => {
    loadPayments();
  }, [loadPayments]);

  const filtered = useMemo(() => {
    const term = query.trim().toLowerCase();

    if (!term) return payments;

    return payments.filter((payment) =>
      [payment.parcelTitle, payment.userEmail, payment.transactionId]
        .filter(Boolean)
        .some((value) => value.toLowerCase().includes(term))
    );
  }, [payments, query]);

  const total = payments.reduce(
    (sum, payment) => sum + (Number(payment.amount) || 0),
    0
  );

  const stats = [
    {
      label: "Total Payments",
      value: payments.length,
      icon: CreditCard,
      className: "bg-indigo-100 text-indigo-600",
    },
    {
      label: "Total Payment",
      value: `৳${total}`,
      icon: Banknote,
      className: "bg-green-100 text-green-600",
    },
    {
      label: "Paying Users",
      value: new Set(payments.map((payment) => payment.userEmail)).size,
      icon: Wallet,
      className: "bg-purple-100 text-purple-600",
    },
  ];

  const formatDate = (value) => {
    if (!value) return "—";
    return new Date(value).toLocaleString();
  };

  const shortId = (value) => {
    if (!value) return "—";
    return value.length > 24 ? `${value.slice(0, 12)}...` : value;
  };

  return (
    <section className="w-full bg-[var(--background)] py-6 md:py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-[var(--foreground)]">
              Manage Payment
            </h1>
            <p className="mt-3 text-[var(--text)] leading-7">
              Track every payment made across the platform.
            </p>
          </div>

          <button
            type="button"
            onClick={loadPayments}
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

        {/* Stats */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-6">
          {stats.map((stat) => (
            <div
              key={stat.label}
              className="flex items-center gap-4 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm"
            >
              <div
                className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${stat.className}`}
              >
                <stat.icon size={22} />
              </div>

              <div>
                <p className="text-xs font-medium text-[var(--text)]/60">
                  {stat.label}
                </p>

                <p className="text-2xl font-bold text-[var(--foreground)]">
                  {stat.value}
                </p>
              </div>
            </div>
          ))}
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
            placeholder="Search by parcel title, user email or transaction id"
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
            <CreditCard size={48} className="mx-auto text-[var(--text)]" />
            <h2 className="mt-4 text-xl font-bold text-[var(--foreground)]">
              No payments found
            </h2>
            <p className="mt-2 text-sm text-[var(--text)]">
              {query
                ? "No payments match your search."
                : "Payments made by users will appear here."}
            </p>
          </div>
        ) : (
          <div className="bg-white rounded-3xl border border-gray-200 overflow-hidden divide-y divide-gray-100">
            {filtered.map((payment) => (
              <div
                key={payment._id}
                className="p-5 md:p-6 last:rounded-b-3xl first:rounded-t-3xl"
              >
                {/* Header */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className="
                        w-11 h-11
                        rounded-xl
                        bg-[var(--secondary)]
                        text-[var(--foreground)]
                        flex items-center justify-center shrink-0
                      "
                    >
                      <CreditCard size={21} />
                    </div>

                    <div className="min-w-0">
                      <p className="font-semibold text-[var(--foreground)] truncate flex items-center gap-1.5">
                        <span className="truncate">
                          {payment.parcelTitle || "Parcel Payment"}
                        </span>
                        <span className="text-[10px] font-normal text-[var(--text)] bg-gray-100 rounded px-1.5 py-0.5 shrink-0 flex items-center gap-0.5">
                          <Hash size={10} />
                          {shortId(payment.transactionId)}
                        </span>
                      </p>

                      <p className="text-xs text-[var(--text)]">
                        {formatDate(payment.createdAt)}
                      </p>
                    </div>
                  </div>

                  <span className="shrink-0 text-xs font-medium px-3 py-1.5 rounded-full bg-green-100 text-green-800 flex items-center gap-1">
                    <CheckCircle2 size={12} />
                    Success
                  </span>
                </div>

                {/* Details */}
                <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
                  <div>
                    <p className="text-[11px] text-[var(--text)]">AMOUNT</p>
                    <p className="font-semibold text-[var(--foreground)]">
                      ৳ {payment.amount}
                    </p>
                  </div>

                  <div className="min-w-0">
                    <p className="text-[11px] text-[var(--text)]">METHOD</p>
                    <p className="font-medium text-[var(--foreground)] capitalize truncate">
                      {payment.paymentMethod || "Card"}
                    </p>
                  </div>

                  <div className="min-w-0">
                    <p className="text-[11px] text-[var(--text)]">USER</p>
                    <p className="font-medium text-[var(--foreground)] truncate">
                      {payment.userEmail || "—"}
                    </p>
                  </div>

                  <div className="min-w-0">
                    <p className="text-[11px] text-[var(--text)]">
                      TRANSACTION ID
                    </p>
                    <p className="font-medium text-[var(--foreground)] truncate">
                      {payment.transactionId || "—"}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default ManagePayments;
