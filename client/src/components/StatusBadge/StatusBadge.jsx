import { getStatus } from "../../data/statuses";

/*
 * The only status pill in the project.
 *
 * By default it names the kind alongside the value, so a status reads the same
 * on a card, in a table without a usable header, or on its own. Pass bare where
 * the surrounding row or column already names the kind, such as a detail row
 * labelled "Delivery Status", to avoid saying it twice.
 */
const StatusBadge = ({ kind, value, bare = false, className = "" }) => {
  const status = getStatus(kind, value);

  return (
    <span
      title={`${status.caption}: ${status.label}`}
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium whitespace-nowrap ${status.className} ${className}`}
    >
      {bare ? null : (
        <>
          <span className="opacity-70">{status.name}</span>
          <span aria-hidden="true" className="opacity-40">
            &middot;
          </span>
        </>
      )}

      <span className="font-semibold">{status.label}</span>
    </span>
  );
};

export default StatusBadge;
