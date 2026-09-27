import test from "node:test";
import assert from "node:assert/strict";
import {
  DELIVERY_STATUS,
  PAYMENT_STATUS,
  RIDER_STATUS,
  STATUS_KINDS,
  getStatus,
  getStatusOptions,
} from "../src/data/statuses.js";

test("every kind names what it describes", () => {
  assert.deepEqual(STATUS_KINDS, {
    delivery: "Delivery",
    payment: "Payment",
    rider: "Rider",
  });
});

test("a status is never a bare word, it carries its kind", () => {
  assert.equal(getStatus("delivery", "in_transit").caption, "Delivery Status");
  assert.equal(getStatus("payment", "paid").caption, "Payment Status");
  assert.equal(getStatus("rider", "held").caption, "Rider Status");
});

test("the same word in two kinds stays distinguishable", () => {
  const delivery = getStatus("delivery", "pending");
  const rider = getStatus("rider", "pending");

  assert.equal(delivery.label, "Pending");
  assert.equal(rider.label, "Pending");
  assert.notEqual(delivery.caption, rider.caption);
});

test("a known value resolves to its own label and colours", () => {
  assert.equal(getStatus("delivery", "picked_up").label, "Picked Up");
  assert.equal(getStatus("delivery", "delivered").label, "Delivered");
  assert.equal(getStatus("payment", "unpaid").label, "Unpaid");
  assert.equal(getStatus("rider", "held").label, "On Hold");
  assert.ok(getStatus("delivery", "delivered").className);
});

test("a missing value falls back to the kind's resting state", () => {
  assert.equal(getStatus("delivery", undefined).label, "Pending");
  assert.equal(getStatus("payment", null).label, "Unpaid");
  assert.equal(getStatus("rider", "").label, "Pending");
  assert.equal(getStatus("delivery", "not_a_status").label, "Pending");
});

test("an unknown kind still returns a renderable status", () => {
  const status = getStatus("mystery", "whatever");

  assert.equal(status.label, "Unknown");
  assert.ok(status.className);
  assert.equal(status.caption, "Status");
});

test("the delivery and payment kinds never leak into each other", () => {
  assert.equal(getStatus("delivery", "paid").label, "Pending");
  assert.equal(getStatus("payment", "in_transit").label, "Unpaid");
});

test("select options come from the same source as the badge", () => {
  assert.deepEqual(
    getStatusOptions("delivery").map((option) => option.value),
    Object.keys(DELIVERY_STATUS)
  );
  assert.deepEqual(
    getStatusOptions("payment").map((option) => option.label),
    ["Paid", "Unpaid"]
  );
  assert.deepEqual(getStatusOptions("rider").length, Object.keys(RIDER_STATUS).length);
  assert.deepEqual(getStatusOptions("mystery"), []);
});

test("every declared value has a label and colours", () => {
  for (const values of [DELIVERY_STATUS, PAYMENT_STATUS, RIDER_STATUS]) {
    for (const [value, status] of Object.entries(values)) {
      assert.ok(status.label, `${value} has no label`);
      assert.ok(status.className, `${value} has no colours`);
    }
  }
});
