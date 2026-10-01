/*
 * The service centers a parcel is collected from, and the region each one sits
 * in.
 *
 * A rider's pay is decided by how far a parcel's pickup sits from the center the
 * rider works out of, so the earning rules need this list and the copy used by
 * the booking and signup forms must not drift apart.
 *
 * A center carries its region rather than the form asking for a region
 * separately. Asking twice invites a pickup in one region and a center in
 * another, which would quietly pay the rider the wrong tier.
 */

/* the regions a center can sit in, in the order the form lists them. these are
   the same eight divisions the branch list uses */
const REGIONS = [
  "Dhaka",
  "Chattogram",
  "Rajshahi",
  "Khulna",
  "Barishal",
  "Sylhet",
  "Rangpur",
  "Mymensingh",
];

/* every service center, with the region it sits in. the region names match the
   ones the branch list uses, so a center's region and a branch's division are
   always spelled the same way.

   Most regions carry several centers on purpose. a rider is paid more for a
   parcel collected from another center in their own region than for one from
   their own center, and that tier can only ever be reached if a region holds
   more than one center. */
const SERVICE_CENTERS = [
  { name: "Dhaka Central", region: "Dhaka" },
  { name: "Mirpur", region: "Dhaka" },
  { name: "Uttara", region: "Dhaka" },
  { name: "Dhanmondi", region: "Dhaka" },
  { name: "Savar", region: "Dhaka" },
  { name: "Gazipur", region: "Dhaka" },

  { name: "Chattogram Central", region: "Chattogram" },
  { name: "Agrabad", region: "Chattogram" },
  { name: "Pahartali", region: "Chattogram" },
  { name: "Cox's Bazar", region: "Chattogram" },

  { name: "Rajshahi Central", region: "Rajshahi" },
  { name: "Boalia", region: "Rajshahi" },
  { name: "Motihar", region: "Rajshahi" },

  { name: "Khulna Central", region: "Khulna" },
  { name: "Sonadanga", region: "Khulna" },
  { name: "Khalishpur", region: "Khulna" },
  { name: "Jashore", region: "Khulna" },

  { name: "Barishal Central", region: "Barishal" },
  { name: "Kotwali", region: "Barishal" },

  { name: "Sylhet Central", region: "Sylhet" },
  { name: "Zindabazar", region: "Sylhet" },
  { name: "Moulvibazar", region: "Sylhet" },

  { name: "Rangpur Central", region: "Rangpur" },
  { name: "Mahiganj", region: "Rangpur" },

  { name: "Mymensingh Central", region: "Mymensingh" },
  { name: "Sadar", region: "Mymensingh" },
];

const BY_NAME = new Map(
  SERVICE_CENTERS.map((center) => [center.name.toLowerCase(), center])
);

const byName = (name) =>
  BY_NAME.get(String(name || "").trim().toLowerCase()) || null;

/* the centers inside a region, in list order. an unknown region yields an empty
   list rather than every center, so a form never offers a center from a region
   the rider did not pick */
const getServiceCentersByRegion = (region) =>
  SERVICE_CENTERS.filter((center) => center.region === region).map(
    (center) => center.name
  );

/* the whole record for a center, or null when the name is not one of ours */
const getServiceCenterByName = (name) => byName(name);

/* the region a center sits in. null when the center is unknown, so a missing
   name never quietly reads as a region of its own */
const getServiceCenterRegion = (name) => byName(name)?.region || null;

module.exports = {
  REGIONS,
  SERVICE_CENTERS,
  getServiceCentersByRegion,
  getServiceCenterByName,
  getServiceCenterRegion,
};
