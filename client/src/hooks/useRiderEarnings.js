import { useCallback, useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import useRider from "../api/rider";
import useRiderDeliveries from "./useRiderDeliveries";
import { getDeliveredAt } from "../data/deliveryTimes";

/* The smallest cashout the server allows. The server sends the figure back on
   every response and enforces it there, so this is only what the form shows in
   the moment before the first response lands. */
export const MIN_CASHOUT = 110;

/* When a parcel was actually handed over, which is the day its money was earned.
   The same rule the deliveries table reads, so an earning is always filed under
   the date the rider sees on the parcel. */
const getEarnedAt = (parcel) => getDeliveredAt(parcel);

const startOfDay = (date) =>
  new Date(date.getFullYear(), date.getMonth(), date.getDate());

/* The four windows a rider reads their money in. A week starts on Sunday, which is
   how the calendar here counts it. */
const PERIODS = [
  {
    key: "daily",
    label: "Today",
    caption: "Earned today",
    start: (now) => startOfDay(now),
  },
  {
    key: "weekly",
    label: "This week",
    caption: "Since Sunday",
    start: (now) => {
      const day = startOfDay(now);

      day.setDate(day.getDate() - day.getDay());

      return day;
    },
  },
  {
    key: "monthly",
    label: "This month",
    caption: "Since the 1st",
    start: (now) => new Date(now.getFullYear(), now.getMonth(), 1),
  },
  {
    key: "yearly",
    label: "This year",
    caption: "Since January",
    start: (now) => new Date(now.getFullYear(), 0, 1),
  },
];

/*
 * A rider's earnings page, in one place.
 *
 * Three sets of numbers live here and they are deliberately kept apart:
 *   total    everything ever earned, delivered deliveries only
 *   pending  what the deliveries still open are worth, not money in hand
 *   wallet   earned money that has not been cashed out yet
 *
 * The wallet is the server's figure. Cashouts leave it, so the balance is earned
 * minus every cashout on the rider's record rather than a number held anywhere
 * that can drift away from the deliveries behind it.
 */
const useRiderEarnings = () => {
  const { parcels, loading, earnings, loadDeliveries } = useRiderDeliveries();
  const { getCashouts, requestCashout } = useRider();

  const [records, setRecords] = useState([]);
  const [balance, setBalance] = useState({
    cashedOut: 0,
    wallet: 0,
    minCashout: MIN_CASHOUT,
  });
  const [loadingCashouts, setLoadingCashouts] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const applyBalance = useCallback((data) => {
    setRecords(Array.isArray(data?.records) ? data.records : []);
    setBalance({
      cashedOut: Number(data?.cashedOut) || 0,
      wallet: Math.max(0, Number(data?.wallet) || 0),
      minCashout: Number(data?.minCashout) || MIN_CASHOUT,
    });
  }, []);

  const loadCashouts = useCallback(async () => {
    setLoadingCashouts(true);

    try {
      applyBalance(await getCashouts());
    } catch (error) {
      toast.error(error.message || "Failed to load your cashout history");
    } finally {
      setLoadingCashouts(false);
    }
  }, [getCashouts, applyBalance]);

  useEffect(() => {
    loadCashouts();
  }, [loadCashouts]);

  const reload = useCallback(async () => {
    await Promise.all([loadDeliveries(), loadCashouts()]);
  }, [loadDeliveries, loadCashouts]);

  /* earned money grouped into the day, week, month and year it was earned on.
     only settled earnings are counted, so an open delivery never fills a window */
  const periods = useMemo(() => {
    const now = new Date();

    const earned = parcels
      .filter((parcel) => parcel.earning?.settled)
      .map((parcel) => ({
        amount: Number(parcel.earning?.amount) || 0,
        at: getEarnedAt(parcel),
      }))
      /* a delivered parcel with no usable date cannot be placed in a window, so it
         counts towards the lifetime total and nothing else */
      .filter((entry) => entry.at && !Number.isNaN(entry.at.getTime()));

    return PERIODS.map((period) => {
      const from = period.start(now);

      return {
        key: period.key,
        label: period.label,
        caption: period.caption,
        amount: earned
          .filter((entry) => entry.at >= from)
          .reduce((sum, entry) => sum + entry.amount, 0),
        deliveries: earned.filter(
          (entry) => entry.at >= from && Number(entry.amount) > 0
        ).length,
      };
    });
  }, [parcels]);

  const cashOut = useCallback(
    async (amount) => {
      setSubmitting(true);

      try {
        const data = await requestCashout(amount);

        applyBalance(data);
        toast.success(`৳ ${Number(amount).toLocaleString("en-US")} cashed out!`);

        return true;
      } catch (error) {
        toast.error(error.message || "Failed to cash out");

        return false;
      } finally {
        setSubmitting(false);
      }
    },
    [requestCashout, applyBalance]
  );

  return {
    parcels,
    records,
    loading: loading || loadingCashouts,
    submitting,
    minCashout: balance.minCashout,
    /* what the rider has earned in total, what the open deliveries are worth, and
       what is still in the wallet after everything already cashed out */
    totals: {
      total: earnings.settled,
      pending: earnings.pending,
      cashedOut: balance.cashedOut,
      wallet: balance.wallet,
    },
    periods,
    reload,
    cashOut,
  };
};

export default useRiderEarnings;