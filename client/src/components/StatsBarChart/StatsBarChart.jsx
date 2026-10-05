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

/*
 * One bar per row, with every figure written out underneath.
 *
 * The rider dashboard and the admin dashboard both want the same shape: a card, a
 * row of figures worth reading out, a bar chart, and a legend that names each bar
 * in words. Keeping it here means the two dashboards cannot drift apart, and a
 * colour is never the only thing carrying the meaning.
 *
 * The rows come from outside already worked out, so this only has to draw them.
 */
const StatsBarChart = ({
  title,
  subtitle,
  rows,
  figures = [],
  empty,
  isEmpty = false,
  unit = "parcel",
}) => {
  return (
    <div className="rounded-3xl border border-gray-200 bg-white p-5 shadow-sm md:p-6">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-[var(--foreground)]">{title}</h2>

          {subtitle ? (
            <p className="text-xs text-[var(--text)]/70">{subtitle}</p>
          ) : null}
        </div>

        {figures.length > 0 ? (
          <div className="flex items-center gap-3">
            {figures.map((figure, index) => (
              <Figure key={figure.label} figure={figure} lead={index > 0} />
            ))}
          </div>
        ) : null}
      </div>

      {isEmpty ? (
        empty
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
                  content={<ChartTooltip unit={unit} />}
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

/* the divider only goes between figures, so a lone figure has nothing beside it */
const Figure = ({ figure, lead }) => (
  <div className="flex items-center gap-3">
    {lead ? <span className="h-9 w-px bg-gray-200" /> : null}

    <div className="text-right">
      <p className="text-xs font-medium text-[var(--text)]/60">{figure.label}</p>

      <p className="text-2xl font-bold leading-none text-[var(--foreground)]">
        {figure.value}
      </p>
    </div>
  </div>
);

/* recharts hands the tooltip the row it is over, so the caption travels with the
   bar rather than being looked up again by name */
const ChartTooltip = ({ active, payload, unit }) => {
  const row = payload?.[0]?.payload;

  if (!active || !row) return null;

  return (
    <div className="rounded-xl border border-gray-200 bg-white px-3 py-2 shadow-sm">
      <p className="font-semibold text-[var(--foreground)]">{row.label}</p>

      {row.caption ? (
        <p className="text-xs text-[var(--text)]">{row.caption}</p>
      ) : null}

      <p className="mt-1 text-sm font-bold text-[var(--foreground)]">
        {row.value} {unit}
        {row.value === 1 ? "" : "s"}
      </p>
    </div>
  );
};

export default StatsBarChart;