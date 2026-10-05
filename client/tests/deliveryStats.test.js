import test from "node:test";
import assert from "node:assert/strict";
import {
  getDeliveryChartRows,
  getDeliveryRate,
  getDeliveryTotal,
} from "../src/utils/deliveryStats.js";

test("the headline is every parcel the rider was given", () => {
  assert.equal(getDeliveryTotal({ total: 9 }), 9);
  assert.equal(getDeliveryTotal({}), 0);
  assert.equal(getDeliveryTotal(undefined), 0);
});

test("the completed share is the delivered count over the whole queue", () => {
  assert.equal(getDeliveryRate({ delivered: 3, total: 4 }), 75);
  assert.equal(getDeliveryRate({ delivered: 1, total: 3 }), 33);
});

test("a rider with nothing assigned is at zero, not at a made up hundred", () => {
  assert.equal(getDeliveryRate({ delivered: 0, total: 0 }), 0);
});

test("every step of a delivery gets a bar", () => {
  const rows = getDeliveryChartRows({
    assigned: 1,
    pending: 1,
    pickedUp: 1,
    inTransit: 1,
    transferred: 1,
    delivered: 1,
    cancelled: 1,
  });

  assert.deepEqual(
    rows.map((row) => row.label),
    [
      "Assigned",
      "Pending",
      "Picked Up",
      "In Transit",
      "At Center",
      "Delivered",
      "Cancelled",
    ]
  );
});

test("a bucket nothing sits in is left out of the chart", () => {
  const rows = getDeliveryChartRows({ pickedUp: 2, delivered: 5, cancelled: 0 });

  assert.deepEqual(
    rows.map((row) => row.label),
    ["Picked Up", "Delivered"]
  );
});

test("no counts at all means no bars rather than a broken chart", () => {
  assert.deepEqual(getDeliveryChartRows({}), []);
  assert.deepEqual(getDeliveryChartRows(undefined), []);
});

test("every bar carries a value and a colour the chart can paint with", () => {
  const rows = getDeliveryChartRows({ inTransit: 3, delivered: 4 });

  for (const row of rows) {
    assert.equal(typeof row.value, "number");
    assert.ok(row.value > 0);
    assert.match(row.color, /^#[0-9a-f]{6}$/i);
    assert.ok(row.caption);
  }
});