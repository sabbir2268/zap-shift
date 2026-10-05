import test from "node:test";
import assert from "node:assert/strict";
import {
  getParcelRows,
  getPeopleRows,
} from "../src/utils/platformStats.js";

const parcel = (status, userEmail = "a@b.com") => ({
  _id: status + Math.random(),
  status,
  userEmail,
});

const application = (status) => ({ _id: status + Math.random(), status });

const valueOf = (rows, key) => rows.find((row) => row.key === key).value;

test("each admin chart carries exactly five figures", () => {
  assert.equal(getPeopleRows([], []).length, 5);
  assert.equal(getParcelRows([]).length, 5);
});

test("users are the accounts behind the parcels, counted once each", () => {
  const rows = getPeopleRows(
    [parcel("pending", "a@b.com"), parcel("pending", "a@b.com"), parcel("pending", "c@d.com")],
    []
  );

  assert.equal(valueOf(rows, "users"), 2);
});

test("a user with no email is not counted as a blank account", () => {
  const rows = getPeopleRows([{ status: "pending" }, parcel("pending")], []);

  assert.equal(valueOf(rows, "users"), 1);
});

test("a paused rider is still a rider, just not an active one", () => {
  const rows = getPeopleRows([], [
    application("approved"),
    application("approved"),
    application("held"),
  ]);

  assert.equal(valueOf(rows, "riders"), 3);
  assert.equal(valueOf(rows, "active"), 2);
  assert.equal(valueOf(rows, "held"), 1);
});

test("an application saved with no status waits for review", () => {
  const rows = getPeopleRows([], [application(undefined), application("pending")]);

  assert.equal(valueOf(rows, "pending"), 2);
  assert.equal(valueOf(rows, "riders"), 0);
});

test("total riders is active plus held, so nobody vanishes from the total", () => {
  const rows = getPeopleRows([], [
    application("approved"),
    application("held"),
    application("pending"),
    application("rejected"),
  ]);

  assert.equal(valueOf(rows, "riders"), valueOf(rows, "active") + valueOf(rows, "held"));
  assert.equal(valueOf(rows, "pending"), 1);
});

test("every parcel lands in exactly one delivery bar", () => {
  const parcels = [
    parcel("delivered"),
    parcel("delivered"),
    parcel("in_transit"),
    parcel("cancelled"),
    parcel("pending"),
    parcel("rider_assigned"),
  ];

  const rows = getParcelRows(parcels);

  assert.equal(valueOf(rows, "total"), parcels.length);
  assert.equal(valueOf(rows, "delivered"), 2);
  assert.equal(valueOf(rows, "inTransit"), 1);
  assert.equal(valueOf(rows, "cancelled"), 1);
  assert.equal(valueOf(rows, "waiting"), 2);
});

test("the four delivery bars add up to the total, so nothing is counted twice", () => {
  const parcels = [
    parcel("delivered"),
    parcel("in_transit"),
    parcel("cancelled"),
    parcel("picked_up"),
  ];

  const rows = getParcelRows(parcels);

  const summed = rows
    .filter((row) => row.key !== "total")
    .reduce((sum, row) => sum + row.value, 0);

  assert.equal(summed, valueOf(rows, "total"));
});

test("a parcel with an unknown status is still counted, not lost", () => {
  const rows = getParcelRows([{ status: "something_new" }]);

  assert.equal(valueOf(rows, "total"), 1);
  assert.equal(valueOf(rows, "waiting"), 1);
});

test("an empty platform is zeroes rather than an error", () => {
  for (const row of [...getPeopleRows([], []), ...getParcelRows([])]) {
    assert.equal(row.value, 0);
    assert.match(row.color, /^#[0-9a-f]{6}$/i);
    assert.ok(row.caption);
  }
});

test("a missing list is treated as an empty one", () => {
  assert.equal(valueOf(getPeopleRows(undefined, undefined), "users"), 0);
  assert.equal(valueOf(getParcelRows(undefined), "total"), 0);
});