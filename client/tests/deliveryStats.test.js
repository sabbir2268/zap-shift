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

test("only the steps that matter are charted", () => {
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
    ["Assigned", "Picked Up", "In Transit", "Delivered", "Cancelled"]
  );

  /* the quiet statuses are still counted in the total, they just get no bar */
  assert.equal(getDeliveryTotal({ total: 7 }), 7);
});

test("a step with nothing in it still gets a bar", () => {
  const rows = getDeliveryChartRows({ pickedUp: 2, delivered: 5, cancelled: 0 });

  assert.equal(rows.length, 5);

  assert.deepEqual(
    rows.map((row) => row.label),
    ["Assigned", "Picked Up", "In Transit", "Delivered", "Cancelled"]
  );

  assert.equal(rows.find((row) => row.label === "Cancelled").value, 0);
  assert.equal(rows.find((row) => row.label === "Picked Up").value, 2);
});

test("a rider with nothing assigned still has the whole journey to look at", () => {
  const rows = getDeliveryChartRows({});

  assert.equal(rows.length, 5);

  for (const row of rows) {
    assert.equal(row.value, 0);
  }
});

test("every bar carries a value and a colour the chart can paint with", () => {
  const rows = getDeliveryChartRows({ inTransit: 3, delivered: 4 });

  for (const row of rows) {
    assert.equal(typeof row.value, "number");
    assert.ok(row.value >= 0);
    assert.match(row.color, /^#[0-9a-f]{6}$/i);
    assert.ok(row.caption);
  }
});