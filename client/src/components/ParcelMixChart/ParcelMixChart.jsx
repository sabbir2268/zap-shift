import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import { PieChart as PieIcon, Send } from "lucide-react";
import { getParcelMix, getParcelShare, getParcelTotal } from "../../utils/parcelStats";

/*
 * A sender's parcels, as a ring rather than the rider's bars.
 *
 * A rider cares which step of the road a parcel is on and counts them, so the
 * rider chart is a bar per step. A sender only wants to know whether the parcels
 * they paid for have arrived, so this is one ring split three ways, with the
 * total in the middle. Every figure is written out beside it, so nothing here
 * depends on reading a colour or judging an angle.
 */
const ParcelMixChart = ({ parcels }) => {
  const rows = getParcelMix(parcels);
  const total = getParcelTotal(parcels);

  return (
    <div className="mt-6 rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-5 shadow-sm md:p-6">
      <div className="mb-4">
        <h2 className="text-lg font-bold text-[var(--foreground)]">
          Where your parcels are
        </h2>

        <p className="text-xs text-[var(--text)]/70">
          Every parcel you have sent, and how far it has got
        </p>
      </div>

      {total === 0 ? (
        <div className="rounded-2xl bg-[var(--surface-muted)] p-10 text-center">
          <PieIcon size={36} className="mx-auto text-[var(--text)]/40" />

          <p className="mt-3 font-semibold text-[var(--text)]">
            Nothing to show yet
          </p>

          <p className="mt-1 text-sm text-[var(--text)]/60">
            Send a parcel and this fills in as it travels.
          </p>
        </div>
      ) : (
        <div className="grid items-center gap-6 md:grid-cols-2">
          <div className="relative mx-auto h-56 w-56">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={rows}
                  dataKey="value"
                  nameKey="label"
                  innerRadius="58%"
                  outerRadius="92%"
                  paddingAngle={2}
                  strokeWidth={0}
                  startAngle={90}
                  endAngle={-270}
                >
                  {rows.map((row) => (
                    <Cell key={row.key} fill={row.color} />
                  ))}
                </Pie>

                <Tooltip content={<MixTooltip total={total} />} />
              </PieChart>
            </ResponsiveContainer>

            {/* the total sits in the hole, which is the one number a sender
                looks for first */}
            <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
              <p className="text-3xl font-bold leading-none text-[var(--foreground)]">
                {total}
              </p>

              <p className="mt-1 text-xs text-[var(--text)]/60">
                parcel{total === 1 ? "" : "s"}
              </p>
            </div>
          </div>

          <ul className="space-y-3">
            {rows.map((row) => (
              <li
                key={row.key}
                className="flex items-center gap-3 rounded-2xl border border-[var(--border)] px-4 py-3"
              >
                <span
                  className="h-3 w-3 shrink-0 rounded-full"
                  style={{ backgroundColor: row.color }}
                />

                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-[var(--foreground)]">
                    {row.label}
                  </p>

                  <p className="truncate text-xs text-[var(--text)]/70">
                    {row.caption}
                  </p>
                </div>

                <div className="ml-auto text-right">
                  <p className="text-lg font-bold leading-none text-[var(--foreground)]">
                    {row.value}
                  </p>

                  <p className="mt-1 text-xs text-[var(--text)]/60">
                    {getParcelShare(row.value, parcels)}%
                  </p>
                </div>
              </li>
            ))}

            <li className="flex items-center gap-3 rounded-2xl border border-dashed border-[var(--border)] px-4 py-3">
              <Send size={16} className="shrink-0 text-[var(--text)]/50" />

              <p className="text-xs text-[var(--text)]/70">
                Open My Parcels for the full list, with tracking and payment.
              </p>
            </li>
          </ul>
        </div>
      )}
    </div>
  );
};

/* recharts hands the tooltip the slice it is over, so the caption travels with
   the slice rather than being looked up again by name */
const MixTooltip = ({ active, payload, total }) => {
  const row = payload?.[0]?.payload;

  if (!active || !row) return null;

  return (
    <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] px-3 py-2 shadow-sm">
      <p className="font-semibold text-[var(--foreground)]">{row.label}</p>

      <p className="text-xs text-[var(--text)]">{row.caption}</p>

      <p className="mt-1 text-sm font-bold text-[var(--foreground)]">
        {row.value} of {total} parcel{total === 1 ? "" : "s"}
      </p>
    </div>
  );
};

export default ParcelMixChart;