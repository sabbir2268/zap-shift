/*
 * The service centers a parcel can be collected from, mirroring
 * server/serviceCenters.js.
 *
 * The server owns the real list, because a rider's earnings are decided against
 * it and that has to be the copy nobody can edit from the browser. The booking
 * and signup forms need the same names to offer them, so they are kept here as
 * well and a test in client/tests/earnings.test.js fails if the two ever drift
 * apart.
 *
 * A center carries its region rather than a form asking for a region
 * separately. Asking twice invites a pickup in one region and a center in
 * another, which would quietly pay the rider the wrong tier.
 */

export const SERVICE_CENTER_REGIONS = [
  "Dhaka",
  "Chattogram",
  "Rajshahi",
  "Khulna",
  "Barishal",
  "Sylhet",
  "Rangpur",
  "Mymensingh",
];

export const SERVICE_CENTERS = [
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

/* the centers inside a region, in list order. an unknown region yields an empty
   list rather than every center, so a form never offers a center from a region
   that was not picked */
export const getServiceCentersByRegion = (region) =>
  SERVICE_CENTERS.filter((center) => center.region === region).map(
    (center) => center.name
  );

/* the region a named center sits in, or an empty string when the name is not one
   of ours. the forms use it to record the region without asking for it */
export const getRegionForCenter = (name) =>
  SERVICE_CENTERS.find(
    (center) =>
      center.name.toLowerCase() === String(name || "").trim().toLowerCase()
  )?.region || "";
