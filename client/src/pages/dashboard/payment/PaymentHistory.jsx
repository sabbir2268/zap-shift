import React, { useCallback, useEffect, useState } from "react";
import {
  History,
  RefreshCw,
  CreditCard,
  Hash,
  CheckCircle2,
} from "lucide-react";
import toast from "react-hot-toast";
import usePayments from "../../../api/payments";
import useAuth from "../../../hooks/useAuth";

const PaymentHistory = () => {
  const { getPayments } = usePayments();
  const { user } = useAuth();

  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadPayments = useCallback(async () => {
    setLoading(true);

    try {
      const data = await getPayments(user?.email);
      setPayments(data);
    } catch (error) {
      toast.error(error.message || "Failed to load payment history");
    } finally {
      setLoading(false);
    }
  }, [getPayments, user?.email]);

  useEffect(() => {
    loadPayments();
  }, [loadPayments]);

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
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between mb-10">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-[var(--foreground)]">
              Payment History
            </h1>
            <p className="mt-3 text-[var(--text)] leading-7">
              View all your completed parcel payments in one place.
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

        {loading ? (
          <div className="flex justify-center py-24">
            <span className="loading loading-spinner loading-xl"></span>
          </div>
        ) : payments.length === 0 ? (
          <div className="bg-white rounded-3xl border border-gray-200 p-16 text-center">
            <History size={48} className="mx-auto text-[var(--text)]" />
            <h2 className="mt-4 text-xl font-bold text-[var(--foreground)]">
              No payments yet
            </h2>
            <p className="mt-2 text-sm text-[var(--text)]">
              Payments made from the Payment page will appear here.
            </p>
          </div>
        ) : (
          <div className="bg-white rounded-3xl border border-gray-200 overflow-hidden divide-y divide-gray-100">
            {payments.map((payment) => (
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
                <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 gap-4 text-sm">
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

                  <div className="min-w-0 col-span-2 sm:col-span-1">
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

export default PaymentHistory;