import test from "node:test";
import assert from "node:assert/strict";
import { createRequire } from "node:module";
import { readFileSync } from "node:fs";
import branches from "../src/data/branches.js";

/* the earning rules live on the server, in commonjs, and are loaded the way the
   server loads them so the test exercises the real copy rather than a stand in */
const require = createRequire(import.meta.url);

const {
  EARNING_RULES,
  getEarningTier,
  getEarning,
  getEarningsSummary,
} = require("../../server/earnings.js");

const {
  REGIONS,
  SERVICE_CENTERS: SERVER_CENTERS,
  getServiceCenterByName,
  getServiceCenterRegion,
} = require("../../server/serviceCenters.js");

import {
  SERVICE_CENTERS,
  SERVICE_CENTER_REGIONS,
  getServiceCentersByRegion,
  getRegionForCenter,
} from "../src/data/serviceCenters.js";

/* a rider working out of Mirpur, so another Dhaka center is the same region and
   a Chattogram center is a different one. the tier is decided by where a parcel
   is delivered, so the receiver side is what these parcels vary */
const RIDER = { region: "Dhaka", serviceCenter: "Mirpur" };

const parcel = (over = {}) => ({
  productDeliveryCost: 100,
  senderRegion: "Chattogram",
  senderServiceCenter: "Agrabad",
  receiverRegion: "Dhaka",
  receiverServiceCenter: "Mirpur",
  status: "delivered",
  ...over,
});

test("there are only two tiers and they pay 80 and 65 percent", () => {
  /* a rider carries the final leg inside their own region, so there is no
     further-away case to pay a lower rate for */
  assert.deepEqual(Object.keys(EARNING_RULES).sort(), [
    "same_center",
    "same_region",
  ]);
  assert.equal(EARNING_RULES.same_center.rate, 0.8);
  assert.equal(EARNING_RULES.same_region.rate, 0.65);
  assert.equal(EARNING_RULES.other_region, undefined);
});

test("a parcel delivered to the rider's own center pays 80 percent", () => {
  const earning = getEarning(parcel(), RIDER);

  assert.equal(earning.tier, "same_center");
  assert.equal(earning.amount, 80);
});

test("another center in the same region pays 65 percent", () => {
  const earning = getEarning(
    parcel({ receiverServiceCenter: "Savar" }),
    RIDER
  );

  assert.equal(earning.tier, "same_region");
  assert.equal(earning.amount, 65);
});

test("a parcel going to another region is never the own-center rate", () => {
  /* the truck carries it to the destination center and a rider based there
     takes it the last stretch, so it is paid at the region rate */
  const earning = getEarning(
    parcel({ receiverServiceCenter: "Agrabad" }),
    RIDER
  );

  assert.equal(earning.tier, "same_region");
  assert.equal(earning.amount, 65);
});

test("the delivery center decides the tier, not the pickup center", () => {
  /* the rider's own center is the pickup here, but the parcel is going to
     another region, so it must not be paid as the own-center tier */
  const earning = getEarning(
    parcel({
      senderServiceCenter: "Mirpur",
      senderRegion: "Dhaka",
      receiverServiceCenter: "Agrabad",
      receiverRegion: "Chattogram",
    }),
    RIDER
  );

  assert.equal(earning.tier, "same_region");
  assert.equal(earning.amount, 65);
});

test("the same center beats the region it sits in", () => {
  /* Mirpur and Savar share the Dhaka region, so a naive region check would pay
     the own-center delivery at 65 percent instead of 80 */
  assert.equal(getServiceCenterRegion("Mirpur"), "Dhaka");
  assert.equal(getServiceCenterRegion("Savar"), "Dhaka");
  assert.equal(getEarningTier(parcel(), RIDER), "same_center");
});

test("service center names are matched without regard to case or padding", () => {
  const earning = getEarning(
    parcel({ receiverServiceCenter: "  mirpur " }),
    RIDER
  );

  assert.equal(earning.tier, "same_center");
  assert.equal(earning.amount, 80);
});

test("a rider with a differently cased center is still compared correctly", () => {
  const earning = getEarning(parcel(), {
    region: "Dhaka",
    serviceCenter: "MIRPUR",
  });

  assert.equal(earning.tier, "same_center");
});

test("only the delivery fee is shared, never the service charge", () => {
  const earning = getEarning(
    parcel({ productDeliveryCost: 100, serviceCharge: 10, totalCost: 110 }),
    RIDER
  );

  assert.equal(earning.fee, 100);
  assert.equal(earning.amount, 80);
});

test("a fee that is not a usable number pays nothing rather than NaN", () => {
  for (const value of [undefined, null, "", "free", -50, NaN]) {
    const earning = getEarning(parcel({ productDeliveryCost: value }), RIDER);

    assert.equal(earning.fee, 0, `${value} should not be a fee`);
    assert.equal(earning.amount, 0, `${value} should not be an earning`);
  }
});

test("a fee posted as a string still pays out", () => {
  const earning = getEarning(parcel({ productDeliveryCost: "250" }), RIDER);

  assert.equal(earning.fee, 250);
  assert.equal(earning.amount, 200);
});

test("a fractional fee is paid on whole taka", () => {
  const earning = getEarning(parcel({ productDeliveryCost: 101 }), RIDER);

  assert.equal(Number.isInteger(earning.amount), true);
  assert.equal(earning.amount, 81);
});

test("only a delivered parcel counts as money in hand", () => {
  const open = getEarning(parcel({ status: "in_transit" }), RIDER);

  assert.equal(open.settled, false);
  assert.equal(open.status, "pending");
  assert.equal(open.amount, 80, "an open delivery still shows what it will pay");

  const done = getEarning(parcel({ status: "delivered" }), RIDER);

  assert.equal(done.settled, true);
  assert.equal(done.status, "earned");
});

test("a parcel waiting on the truck is not money in hand yet", () => {
  /* transferred is the company truck leg, the parcel is still on its way and the
     rider has not delivered it */
  const earning = getEarning(parcel({ status: "transferred" }), RIDER);

  assert.equal(earning.settled, false);
  assert.equal(earning.status, "pending");
  assert.equal(earning.amount, 80);
});

test("a parcel booked to a rider is not money in hand yet", () => {
  /* rider_assigned means the rider has been given the job, not that they have
     delivered anything */
  const earning = getEarning(parcel({ status: "rider_assigned" }), RIDER);

  assert.equal(earning.settled, false);
  assert.equal(earning.status, "pending");
});

test("a cancelled delivery is called out and kept out of the money", () => {
  const earning = getEarning(parcel({ status: "cancelled" }), RIDER);

  assert.equal(earning.settled, false);
  assert.equal(earning.status, "cancelled");
});

test("a parcel with no center falls back to the region it is delivered to", () => {
  const earning = getEarning(
    parcel({ receiverServiceCenter: null, receiverRegion: "Dhaka" }),
    RIDER
  );

  assert.equal(earning.tier, "same_region");
  assert.equal(earning.amount, 65);
});

test("a parcel with neither a center nor a region is the region rate", () => {
  /* nothing on the parcel says it is going to the rider's own center, so it is
     never paid the own-center rate */
  const earning = getEarning(
    parcel({ receiverServiceCenter: null, receiverRegion: null }),
    RIDER
  );

  assert.equal(earning.tier, "same_region");
  assert.equal(earning.amount, 65);
});

test("a parcel delivered to a region the rider does not work in is not the own-center tier", () => {
  const earning = getEarning(
    parcel({ receiverServiceCenter: "Agrabad", receiverRegion: "Chattogram" }),
    RIDER
  );

  assert.equal(earning.tier, "same_region");
});

test("a rider with no recorded center is paid the region rate", () => {
  const earning = getEarning(parcel(), null);

  assert.equal(earning.tier, "same_region");
  assert.equal(earning.amount, 65);
});

test("the summary keeps settled money apart from money still to come", () => {
  const summary = getEarningsSummary(
    [
      parcel({ status: "delivered", receiverServiceCenter: "Mirpur" }),
      parcel({ status: "delivered", receiverServiceCenter: "Savar" }),
      parcel({ status: "in_transit", receiverServiceCenter: "Agrabad" }),
      parcel({ status: "cancelled", receiverServiceCenter: "Mirpur" }),
    ],
    RIDER
  );

  assert.equal(summary.deliveryCount, 4);
  assert.equal(summary.settledTotal, 145, "80 + 65 from the delivered parcels");
  assert.equal(summary.pendingTotal, 65, "only the in transit delivery is pending");
  assert.equal(summary.cancelledTotal, 80, "counted apart, never added in");
  assert.equal(summary.total, 210);
});

test("an empty list of deliveries totals nothing", () => {
  const summary = getEarningsSummary([], RIDER);

  assert.equal(summary.settledTotal, 0);
  assert.equal(summary.total, 0);
  assert.deepEqual(summary.earnings, []);
});

test("every declared tier carries a label and a caption for the rider", () => {
  for (const rule of Object.values(EARNING_RULES)) {
    assert.ok(rule.label, "a tier needs a name");
    assert.ok(rule.caption, "a tier needs to say what it pays");
    assert.ok(rule.rate > 0 && rule.rate <= 1, "a share is a fraction of the fee");
  }
});

test("the legend on the deliveries page quotes the real rates", () => {
  /* the legend is written into the page as text so a rider can see the rule set
     at a glance. if a rate is ever changed on the server, this fails until the
     text a rider reads is changed to match what they are actually paid */
  const source = readFileSync(
    new URL("../src/pages/rider/MyDeliveries.jsx", import.meta.url),
    "utf8"
  );

  for (const [tier, rule] of Object.entries(EARNING_RULES)) {
    assert.ok(source.includes(tier), `the legend is missing the ${tier} tier`);
    assert.ok(
      source.includes(`${rule.rate * 100}%`),
      `the legend does not quote the ${rule.rate * 100}% rate`
    );
  }
});

test("the client and the server agree on every service center and its region", () => {
  /* the client copy is only for the booking and signup forms. if the two lists
     drift, a sender picks a center the earning rules have never heard of */
  assert.equal(SERVICE_CENTERS.length, SERVER_CENTERS.length);

  for (const center of SERVICE_CENTERS) {
    const onServer = getServiceCenterByName(center.name);

    assert.ok(onServer, `${center.name} is missing on the server`);
    assert.equal(onServer.region, center.region);
  }
});

test("the client and the server agree on the regions on offer", () => {
  assert.deepEqual(SERVICE_CENTER_REGIONS, REGIONS);
});

test("every service center sits in a region the branch list knows", () => {
  const divisions = new Set(branches.map((branch) => branch.division));

  for (const center of SERVICE_CENTERS) {
    assert.ok(
      divisions.has(center.region),
      `${center.name} is in unknown region ${center.region}`
    );
  }
});

test("every service center name is unique", () => {
  const names = SERVICE_CENTERS.map((center) => center.name);

  assert.equal(new Set(names).size, names.length);
});

test("a rider can only be posted to a center in their own region", () => {
  for (const region of SERVICE_CENTER_REGIONS) {
    for (const name of getServiceCentersByRegion(region)) {
      assert.equal(getServiceCenterByName(name).region, region);
    }
  }
});

test("a region with more than one center makes the 65 percent tier reachable", () => {
  /* the region tier only exists if two centers share a region, otherwise a
     delivery is always either the rider's own center or another region */
  const perRegion = new Map();

  for (const center of SERVICE_CENTERS) {
    perRegion.set(center.region, (perRegion.get(center.region) || 0) + 1);
  }

  const shared = [...perRegion.values()].filter((count) => count > 1);

  assert.ok(shared.length > 0, "no two centers share a region");
});

test("a region lookup on an unknown center finds nothing", () => {
  assert.equal(getRegionForCenter("Atlantis"), "");
  assert.equal(getServiceCenterRegion("Atlantis"), null);
  assert.equal(getServiceCenterRegion(undefined), null);
  assert.equal(getServiceCenterByName(""), null);
  assert.deepEqual(getServiceCentersByRegion("Atlantis"), []);
});
