import { BarChart3 } from "lucide-react";
import StatsBarChart from "../StatsBarChart/StatsBarChart";
import {
  getDeliveryChartRows,
  getDeliveryRate,
  getDeliveryTotal,
} from "../../utils/deliveryStats";

/*
 * Where a rider's parcels have got to.
 *
 * The five steps a delivery passes through are charted, the empty ones included,
 * so the rider sees the whole journey rather than only the part they happen to be
 * standing on. The total and the completed share are stated in words, because a
 * rider reads those two numbers rather than measuring them off a bar, and every
 * figure is written out underneath so a colour is never the only thing carrying
 * the meaning.
 */
const DeliveryChart = ({ counts }) => {
  const rows = getDeliveryChartRows(counts);
  const total = getDeliveryTotal(counts);
  const rate = getDeliveryRate(counts);

  return (
    <div className="mt-6">
      <StatsBarChart
        title="Delivery Breakdown"
        subtitle={`Where your ${total} assigned parcel${total === 1 ? "" : "s"} have got to`}
        rows={rows}
        figures={[
          { label: "Total", value: total },
          { label: "Completed", value: `${rate}%` },
        ]}
        isEmpty={total === 0}
        empty={
          <div className="rounded-2xl bg-[var(--surface-muted)] p-10 text-center">
            <BarChart3 size={36} className="mx-auto text-[var(--text)]/40" />

            <p className="mt-3 font-semibold text-[var(--text)]">
              Nothing to chart yet
            </p>

            <p className="mt-1 text-sm text-[var(--text)]/60">
              The chart fills in as soon as a parcel is assigned to you.
            </p>
          </div>
        }
      />
    </div>
  );
};

export default DeliveryChart;