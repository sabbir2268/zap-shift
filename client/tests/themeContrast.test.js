import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

/*
 * The dark theme is only as good as the numbers behind it.
 *
 * Every pair in the stylesheet that puts text on a fill is listed below with the
 * ratio WCAG asks for. A colour that drifts, a token renamed in one theme and
 * forgotten in the other, or a pair dropped onto a background it was never
 * measured against, fails here rather than on a screen a visitor is reading.
 */

const here = path.dirname(fileURLToPath(import.meta.url));
const clientRoot = path.join(here, "..");
const cssPath = path.join(clientRoot, "src", "index.css");
const css = fs.readFileSync(cssPath, "utf8");

const hexToRgb = (hex) => {
  const clean = hex.trim().replace("#", "");

  const full =
    clean.length === 3
      ? clean
          .split("")
          .map((c) => c + c)
          .join("")
      : clean;

  return {
    r: parseInt(full.slice(0, 2), 16),
    g: parseInt(full.slice(2, 4), 16),
    b: parseInt(full.slice(4, 6), 16),
  };
};

const channelLuminance = (value) => {
  const ratio = value / 255;

  return ratio <= 0.03928 ? ratio / 12.92 : ((ratio + 0.055) / 1.055) ** 2.4;
};

const luminance = (hex) => {
  const { r, g, b } = hexToRgb(hex);

  return (
    0.2126 * channelLuminance(r) +
    0.7152 * channelLuminance(g) +
    0.0722 * channelLuminance(b)
  );
};

const contrast = (a, b) => {
  const first = luminance(a);
  const second = luminance(b);

  const lighter = Math.max(first, second);
  const darker = Math.min(first, second);

  return (lighter + 0.05) / (darker + 0.05);
};

/* the token values as written, one object per theme block */
const readBlock = (selector) => {
  const start = css.indexOf(selector);
  assert.notEqual(start, -1, `${selector} is missing from index.css`);

  const end = css.indexOf("}", start);
  const body = css.slice(start, end);

  const tokens = {};

  for (const [, name, value] of body.matchAll(/(--[a-z-]+)\s*:\s*([^;]+);/g)) {
    tokens[name] = value.trim();
  }

  return tokens;
};

const light = readBlock(":root {");
const dark = readBlock(".dark {");

const ratio = (theme, foreground, background) => {
  const tokens = theme === "dark" ? dark : light;

  assert.ok(tokens[foreground], `${foreground} is not defined in ${theme} theme`);
  assert.ok(tokens[background], `${background} is not defined in ${theme} theme`);

  return contrast(tokens[foreground], tokens[background]);
};

/* WCAG AA: 4.5 for body copy, 3 for large text and for the edges and focus
   rings a pointer has to find */
const AA_TEXT = 4.5;
const AA_LARGE_OR_UI = 3;

const textPairs = [
  /* what a visitor reads most of all */
  ["body copy on the page", "--text", "--background", AA_TEXT],
  ["body copy on a card", "--text", "--surface", AA_TEXT],
  ["supporting copy on a card", "--text-muted", "--surface", AA_TEXT],
  ["supporting copy on the page", "--text-muted", "--background", AA_TEXT],
  ["supporting copy on a muted panel", "--text-muted", "--surface-muted", AA_TEXT],
  ["supporting copy on a hovered card", "--text-muted", "--surface-hover", AA_TEXT],

  /* headings, which are the first thing read on every page */
  ["a heading on a card", "--foreground", "--surface", AA_TEXT],
  ["a heading on the page", "--foreground", "--background", AA_TEXT],
  ["a heading on a muted panel", "--foreground", "--surface-muted", AA_TEXT],
  ["a heading on a hovered card", "--foreground", "--surface-hover", AA_TEXT],

  /* the brand lime as a fill, and as the text colour that wants the brand */
  ["the lime button label", "--text-on-secondary", "--secondary", AA_TEXT],
  ["brand coloured text on a card", "--accent-text", "--surface", AA_TEXT],
  ["brand coloured text on the page", "--accent-text", "--background", AA_TEXT],

  /* the always dark fill: sidebars, top bars, the footer band */
  ["white text on the dark fill", "--text-on-ink", "--ink", AA_TEXT],

  /* a pointer has to be able to see where it is */
  ["the focus ring on a card", "--focus", "--surface", AA_LARGE_OR_UI],
  ["the focus ring on the page", "--focus", "--background", AA_LARGE_OR_UI],
];

for (const [label, foreground, background, minimum] of textPairs) {
  test(`light theme: ${label}`, () => {
    assert.ok(
      ratio("light", foreground, background) >= minimum,
      `${foreground} on ${background} is ${ratio("light", foreground, background).toFixed(2)}:1 in the light theme, under ${minimum}:1`
    );
  });

  test(`dark theme: ${label}`, () => {
    assert.ok(
      ratio("dark", foreground, background) >= minimum,
      `${foreground} on ${background} is ${ratio("dark", foreground, background).toFixed(2)}:1 in the dark theme, under ${minimum}:1`
    );
  });
}

test("every token is defined for both themes", () => {
  assert.deepEqual(
    Object.keys(light).filter((name) => !(name in dark)).sort(),
    [],
    "these tokens exist only in the light theme"
  );

  assert.deepEqual(
    Object.keys(dark).filter((name) => !(name in light)).sort(),
    [],
    "these tokens exist only in the dark theme"
  );
});

test("the two themes describe the same set of roles", () => {
  assert.deepEqual(Object.keys(dark).sort(), Object.keys(light).sort());
});

/* A token that nothing defines resolves to nothing at all, which in css means
   the browser quietly keeps the inherited value. every var() the app asks for
   has to exist, in both themes, or a page loses a colour without any warning.

   A theme token is one of the palette. A property handed to a single element,
   such as the file a painted picture is standing in for, is set on that element
   instead, so a property counts as provided if the app sets it anywhere. */
test("every custom property the app asks for is defined in both themes", () => {
  const srcRoot = path.join(clientRoot, "src");

  const walk = (dir) =>
    fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
      const full = path.join(dir, entry.name);

      if (entry.isDirectory()) return walk(full);
      if (!/\.(jsx?|css)$/.test(entry.name)) return [];

      return full;
    });

  const files = [cssPath, ...walk(srcRoot)];
  const bodies = files.map((file) => fs.readFileSync(file, "utf8"));

  const provided = new Set([
    ...Object.keys(light),
    ...Object.keys(dark),
    /* style={{ "--name": ... }} and --name: in a stylesheet */
    ...bodies.flatMap((body) => [...body.matchAll(/["'`]?(--[a-z-]+)["'`]?\s*:/g)].map(([, name]) => name)),
  ]);

  const missing = [];

  files.forEach((file, index) => {
    for (const [, name] of bodies[index].matchAll(/var\(\s*(--[a-z-]+)/g)) {
      if (!provided.has(name)) {
        missing.push(`${path.relative(clientRoot, file)} asks for ${name}`);
      }
    }
  });

  assert.deepEqual([...new Set(missing)], []);
});

/* a property that is handed to an element has to actually reach it, or the rule
   that reads it has nothing to work with */
test("a painted picture is given the file the rule paints it from", () => {
  const whyUs = fs.readFileSync(path.join(clientRoot, "src", "pages", "home", "WhyUs.jsx"), "utf8");

  assert.match(whyUs, /artwork-lime[\s\S]*?"--art":\s*`url\(\$\{item\.image\}\)`/);
});

test("the lime fill is the same lime in both themes", () => {
  assert.equal(light["--secondary"], dark["--secondary"]);
  assert.equal(light["--text-on-secondary"], dark["--text-on-secondary"]);
});

test("dark mode is driven by the class on html, not by the system", () => {
  assert.match(css, /@custom-variant dark \(&:where\(\.dark, \.dark \*\)\)/);
  assert.match(css, /color-scheme: light/);
  assert.match(css, /color-scheme: dark/);
});
