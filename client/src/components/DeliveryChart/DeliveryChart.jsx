import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { BarChart3 } from "lucide-react";
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
    <div className="mt-6 rounded-3xl border border-gray-200 bg-white p-5 shadow-sm md:p-6">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-[var(--foreground)]">
            Delivery Breakdown
          </h2>

          <p className="text-xs text-[var(--text)]/70">
            Where your {total} assigned parcel{total === 1 ? "" : "s"} have got to
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Figure label="Total" value={total} />

          <span className="h-9 w-px bg-gray-200" />

          <Figure label="Completed" value={`${rate}%`} />
        </div>
      </div>

      {total === 0 ? (
        <div className="rounded-2xl bg-gray-50 p-10 text-center">
          <BarChart3 size={36} className="mx-auto text-[var(--text)]/40" />

          <p className="mt-3 font-semibold text-[var(--text)]">
            Nothing to chart yet
          </p>

          <p className="mt-1 text-sm text-[var(--text)]/60">
            The chart fills in as soon as a parcel is assigned to you.
          </p>
        </div>
      ) : (
        <>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={rows}
                margin={{ top: 8, right: 8, bottom: 8, left: -20 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="var(--foreground)"
                  strokeOpacity={0.12}
                />

                {/* five labels sit side by side without colliding, so they stay horizontal
                    and readable rather than tilted */}
                <XAxis
                  dataKey="label"
                  tickLine={false}
                  axisLine={false}
                  interval={0}
                  height={40}
                  tick={{ fontSize: 11, fill: "var(--text)" }}
                />

                <YAxis
                  allowDecimals={false}
                  tickLine={false}
                  axisLine={false}
                  width={44}
                  tick={{ fontSize: 12, fill: "var(--text)" }}
                />

                <Tooltip
                  cursor={{ fill: "var(--foreground)", fillOpacity: 0.05 }}
                  content={<ChartTooltip />}
                />

                <Bar dataKey="value" radius={[8, 8, 0, 0]} maxBarSize={64}>
                  {rows.map((row) => (
                    <Cell key={row.key} fill={row.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          <ul className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
            {rows.map((row) => (
              <li key={row.key} className="flex items-center gap-2 text-sm">
                <span
                  className="h-3 w-3 shrink-0 rounded-full"
                  style={{ backgroundColor: row.color }}
                />

                <span className="truncate text-[var(--text)]">{row.label}</span>

                <span className="ml-auto font-bold text-[var(--foreground)]">
                  {row.value}
                </span>
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
};

const Figure = ({ label, value }) => (
  <div className="text-right">
    <p className="text-xs font-medium text-[var(--text)]/60">{label}</p>

    <p className="text-2xl font-bold leading-none text-[var(--foreground)]">
      {value}
    </p>
  </div>
);

/* recharts hands the tooltip the row it is over, so the caption travels with the
   bar rather than being looked up again by name */
const ChartTooltip = ({ active, payload }) => {
  const row = payload?.[0]?.payload;

  if (!active || !row) return null;

  return (
    <div className="rounded-xl border border-gray-200 bg-white px-3 py-2 shadow-sm">
      <p className="font-semibold text-[var(--foreground)]">{row.label}</p>

      <p className="text-xs text-[var(--text)]">{row.caption}</p>

      <p className="mt-1 text-sm font-bold text-[var(--foreground)]">
        {row.value} parcel{row.value === 1 ? "" : "s"}
      </p>
    </div>
  );
};

export default DeliveryChart;