import test from "node:test";
import assert from "node:assert/strict";
import {
  getParcelMix,
  getParcelShare,
  getParcelTotal,
} from "../src/utils/parcelStats.js";

const parcel = (status) => ({ _id: status + Math.random(), status });

test("a sender's list is every parcel they have on file", () => {
  assert.equal(getParcelTotal([parcel("pending"), parcel("delivered")]), 2);
  assert.equal(getParcelTotal([]), 0);
  assert.equal(getParcelTotal(undefined), 0);
});

test("the ring is split three ways", () => {
  const rows = getParcelMix([
    parcel("delivered"),
    parcel("in_transit"),
    parcel("pending"),
    parcel("cancelled"),
  ]);

  assert.deepEqual(
    rows.map((row) => row.label),
    ["Delivered", "On the way", "Cancelled"]
  );
});

test("every road status counts as still on the way", () => {
  const rows = getParcelMix([
    parcel("rider_assigned"),
    parcel("picked_up"),
    parcel("in_transit"),
    parcel("transferred"),
  ]);

  assert.equal(rows.find((row) => row.label === "On the way").value, 4);
});

test("the three groups add up to the whole list, so the ring is the truth", () => {
  const parcels = [
    parcel("delivered"),
    parcel("delivered"),
    parcel("picked_up"),
    parcel("cancelled"),
    parcel("transferred"),
  ];

  const summed = getParcelMix(parcels).reduce((sum, row) => sum + row.value, 0);

  assert.equal(summed, parcels.length);
});

test("a parcel with no status at all is not quietly dropped", () => {
  const rows = getParcelMix([{ _id: "no-status" }, parcel("delivered")]);

  assert.equal(rows.find((row) => row.label === "On the way").value, 1);
});

test("a share is a share of everything on file", () => {
  const parcels = [parcel("delivered"), parcel("delivered"), parcel("pending")];

  assert.equal(getParcelShare(2, parcels), 67);
  assert.equal(getParcelShare(0, parcels), 0);
});

test("an empty list is zero percent rather than a division by nothing", () => {
  assert.equal(getParcelShare(0, []), 0);
});

test("every slice carries a colour the chart can paint with", () => {
  for (const row of getParcelMix([parcel("delivered")])) {
    assert.match(row.color, /^#[0-9a-f]{6}$/i);
    assert.ok(row.caption);
    assert.equal(typeof row.value, "number");
  }
});