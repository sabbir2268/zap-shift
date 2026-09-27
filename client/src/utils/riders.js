/*
 * Helpers for reading a rider application record for display.
 */

/*
 * A rider application carries no name of its own, it borrows the one from the
 * account. Older records were saved before the fallback below existed and some
 * are stored with an empty name, so an admin has to be able to tell who a
 * blank row belongs to. The address is the only thing such a record still has,
 * so the part before the @ stands in for the name.
 *
 * Returns a name string, never empty, so a table cell is never blank.
 */
export const getRiderName = (rider) =>
  rider?.name?.trim() || rider?.email?.split("@")[0]?.trim() || "—";

/*
 * The application form posts the age from a number input, so what lands in the
 * database is whatever the browser sent: "24" as often as 24. Anything that is
 * not a plausible age reads as missing rather than as NaN, so a table never
 * shows NaN and a card never shows a zero.
 *
 * Returns the age as a number, or null when the record does not carry one.
 */
export const getRiderAge = (rider) => {
  const age = Number(rider?.age);

  return Number.isInteger(age) && age > 0 && age < 120 ? age : null;
};
