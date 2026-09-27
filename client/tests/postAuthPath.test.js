import test from "node:test";
import assert from "node:assert/strict";
import {
  getPostAuthPath,
  isAdminRole,
  isRiderRole,
  resolvePostAuthDestination,
} from "../src/data/admin.js";

/* what each auth form falls back to when nothing was remembered */
const REGISTER_FALLBACK = "/dashboard";
const LOGIN_FALLBACK = "/";

test("the role decides the landing page, not the requested one", () => {
  assert.equal(getPostAuthPath("admin", "/dashboard"), "/admin");
  assert.equal(getPostAuthPath("rider", "/dashboard"), "/rider");
  assert.equal(getPostAuthPath("user", "/dashboard"), "/dashboard");
});

test("a rider never reaches the customer dashboard", () => {
  assert.equal(getPostAuthPath("rider", "/dashboard/track"), "/rider");
  assert.equal(getPostAuthPath("admin", "/rider"), "/admin");
});

test("role checks are exact, a lookalike role is not a match", () => {
  assert.equal(isAdminRole("admin"), true);
  assert.equal(isAdminRole("rider"), false);
  assert.equal(isRiderRole("rider"), true);
  assert.equal(isRiderRole("user"), false);
  assert.equal(isAdminRole("Admin"), false);
  assert.equal(isRiderRole(undefined), false);
});

test("registering straight from the form lands on the user dashboard", () => {
  assert.equal(
    resolvePostAuthDestination(null, REGISTER_FALLBACK),
    "/dashboard"
  );
  assert.equal(
    resolvePostAuthDestination(undefined, REGISTER_FALLBACK),
    "/dashboard"
  );
});

test("the page the user was bounced off wins", () => {
  assert.equal(
    resolvePostAuthDestination("/dashboard/track", REGISTER_FALLBACK),
    "/dashboard/track"
  );
  assert.equal(
    resolvePostAuthDestination("/dashboard/parcels?page=2", REGISTER_FALLBACK),
    "/dashboard/parcels?page=2"
  );
});

test("a destination inside a role gated panel is never honoured", () => {
  assert.equal(resolvePostAuthDestination("/admin", REGISTER_FALLBACK), "/dashboard");
  assert.equal(
    resolvePostAuthDestination("/admin/manage-users", REGISTER_FALLBACK),
    "/dashboard"
  );
  assert.equal(resolvePostAuthDestination("/rider", LOGIN_FALLBACK), "/");
  assert.equal(
    resolvePostAuthDestination("/rider/deliveries", LOGIN_FALLBACK),
    "/"
  );
});

test("a panel lookalike is still an ordinary page", () => {
  assert.equal(resolvePostAuthDestination("/administrator", LOGIN_FALLBACK), "/administrator");
  assert.equal(resolvePostAuthDestination("/riders", LOGIN_FALLBACK), "/riders");
});

test("a destination that is not a path is refused", () => {
  assert.equal(resolvePostAuthDestination("dashboard", REGISTER_FALLBACK), "/dashboard");
  assert.equal(resolvePostAuthDestination("", REGISTER_FALLBACK), "/dashboard");
  assert.equal(resolvePostAuthDestination(42, LOGIN_FALLBACK), "/");
});
