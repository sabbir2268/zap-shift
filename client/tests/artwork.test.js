import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import zlib from "node:zlib";
import { fileURLToPath } from "node:url";

/*
 * A png has no background of its own.
 *
 * Artwork drawn in dark ink for a white page therefore disappears the moment
 * the card behind it goes dark, which is not something reading the jsx can tell
 * you. This reads the actual pixels instead: how much of each picture is painted
 * at all, and how much of that paint cannot reach the 3:1 that a meaningful
 * graphic needs against a dark card. A picture in that state has to be painted
 * in the brand lime through its own alpha, which is what .artwork-lime does.
 */

const here = path.dirname(fileURLToPath(import.meta.url));
const clientRoot = path.join(here, "..");
const assetsDir = path.join(clientRoot, "src", "assets");
const srcRoot = path.join(clientRoot, "src");

const readChunks = (buffer) => {
  const found = [];
  let offset = 8;

  while (offset < buffer.length) {
    const length = buffer.readUInt32BE(offset);
    const type = buffer.toString("ascii", offset + 4, offset + 8);

    found.push({ type, data: buffer.subarray(offset + 8, offset + 8 + length) });
    offset += 12 + length;
  }

  return found;
};

const unfilter = (raw, width, height, channels) => {
  const stride = width * channels;
  const out = Buffer.alloc(stride * height);

  let source = 0;

  for (let row = 0; row < height; row += 1) {
    const filter = raw[source];
    source += 1;

    const rowStart = row * stride;
    const previousStart = (row - 1) * stride;

    for (let i = 0; i < stride; i += 1) {
      const value = raw[source + i];

      const left = i >= channels ? out[rowStart + i - channels] : 0;
      const up = row > 0 ? out[previousStart + i] : 0;
      const upLeft = row > 0 && i >= channels ? out[previousStart + i - channels] : 0;

      let result;

      if (filter === 0) result = value;
      else if (filter === 1) result = value + left;
      else if (filter === 2) result = value + up;
      else if (filter === 3) result = value + Math.floor((left + up) / 2);
      else if (filter === 4) {
        const p = left + up - upLeft;
        const pa = Math.abs(p - left);
        const pb = Math.abs(p - up);
        const pc = Math.abs(p - upLeft);

        const predictor = pa <= pb && pa <= pc ? left : pb <= pc ? up : upLeft;

        result = value + predictor;
      } else throw new Error(`unknown png filter ${filter}`);

      out[rowStart + i] = result & 0xff;
    }

    source += stride;
  }

  return out;
};

const decode = (buffer) => {
  const parts = readChunks(buffer);
  const header = parts.find((part) => part.type === "IHDR").data;

  const width = header.readUInt32BE(0);
  const height = header.readUInt32BE(4);
  const bitDepth = header[8];
  const colorType = header[9];

  assert.equal(bitDepth, 8, "only 8 bit pngs are measured here");
  assert.equal(header[12], 0, "interlaced pngs are not measured here");

  const palette = parts.find((part) => part.type === "PLTE")?.data;
  const transparency = parts.find((part) => part.type === "tRNS")?.data;
  const channels = { 0: 1, 2: 3, 3: 1, 4: 2, 6: 4 }[colorType];

  assert.ok(channels, `png colour type ${colorType} is not measured here`);

  const raw = zlib.inflateSync(
    Buffer.concat(parts.filter((part) => part.type === "IDAT").map((part) => part.data))
  );

  const pixels = unfilter(raw, width, height, channels);

  return (x, y) => {
    const i = (y * width + x) * channels;

    if (colorType === 3) {
      const index = pixels[i];

      return {
        r: palette[index * 3],
        g: palette[index * 3 + 1],
        b: palette[index * 3 + 2],
        a: transparency && index < transparency.length ? transparency[index] : 255,
      };
    }

    if (colorType === 0) return { r: pixels[i], g: pixels[i], b: pixels[i], a: 255 };
    if (colorType === 4) return { r: pixels[i], g: pixels[i], b: pixels[i], a: pixels[i + 1] };
    if (colorType === 2) return { r: pixels[i], g: pixels[i + 1], b: pixels[i + 2], a: 255 };

    return { r: pixels[i], g: pixels[i + 1], b: pixels[i + 2], a: pixels[i + 3] };
  };
};

const channel = (value) => {
  const ratio = value / 255;

  return ratio <= 0.03928 ? ratio / 12.92 : ((ratio + 0.055) / 1.055) ** 2.4;
};

const luminance = ({ r, g, b }) => 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b);

const contrast = (a, b) => (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);

/* the darkest card in the dark theme, which is the hardest thing to be seen on */
const darkCard = luminance({ r: 0x16, g: 0x27, b: 0x2a });

/* a picture counts as unreadable once this much of its paint cannot reach the
   3:1 that WCAG asks of a meaningful graphic against a dark card */
const LOST = 0.8;

const assetNames = fs
  .readdirSync(assetsDir)
  .filter((name) => name.endsWith(".png"))
  .sort();

const artwork = new Map(
  assetNames.map((name) => {
    const at = decode(fs.readFileSync(path.join(assetsDir, name)));

    const header = fs.readFileSync(path.join(assetsDir, name)).subarray(16, 24);

    const width = header.readUInt32BE(0);
    const height = header.readUInt32BE(4);

    let painted = 0;
    let lost = 0;

    for (let y = 0; y < height; y += 1) {
      for (let x = 0; x < width; x += 1) {
        const pixel = at(x, y);
        if (pixel.a < 32) continue;

        painted += 1;

        if (contrast(luminance(pixel), darkCard) < 3) lost += 1;
      }
    }

    return [name, { coverage: painted / (width * height), lost: painted ? lost / painted : 0 }];
  })
);

const jsxFiles = [];
const walk = (dir) => {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);

    if (entry.isDirectory()) walk(full);
    else if (/\.jsx$/.test(entry.name)) jsxFiles.push(full);
  }
};
walk(srcRoot);

/* the markup around one reference to an asset, wide enough to hold the class and
   the custom property that decide how it is painted */
const usageOf = (asset) => {
  const found = [];

  for (const file of jsxFiles) {
    const body = fs.readFileSync(file, "utf8");

    for (const [match] of body.matchAll(new RegExp(asset.replace(/\./g, "\\."), "g"))) {
      const start = Math.max(
        body.lastIndexOf("<img", match.index),
        body.lastIndexOf("<span", match.index)
      );

      const end = body.indexOf("/>", match.index);

      if (start !== -1 && end !== -1 && end - start < 1200 && end - start > 0) {
        found.push({ file: path.relative(clientRoot, file), markup: body.slice(start, end) });
      }
    }
  }

  return found;
};

test("every asset can be measured", () => {
  assert.ok(assetNames.length > 0, "no png assets were found to measure");
});

test("no picture is unreadable on a dark card unless it is painted", () => {
  const problems = [];

  for (const [name, measurement] of artwork) {
    if (measurement.lost < LOST) continue;

    for (const usage of usageOf(name)) {
      if (!usage.markup.includes("artwork-lime")) {
        problems.push(
          `${name} has ${Math.round(measurement.lost * 100)}% of its paint under 3:1 on a dark card and is shown in ${usage.file} without artwork-lime`
        );
      }
    }
  }

  assert.deepEqual(problems, []);
});

/* the paint only works if the element is handed the file it is standing in for,
   so the class and the custom property have to travel together */
test("every painted picture is given its own file", () => {
  const problems = [];

  for (const file of jsxFiles) {
    const body = fs.readFileSync(file, "utf8");

    for (const [markup] of body.matchAll(/<(?:span|img)[^>]*artwork-lime[^>]*>/g)) {
      if (!/--art/.test(markup)) {
        problems.push(`${path.relative(clientRoot, file)} paints a picture with no file behind it`);
      }
    }
  }

  assert.deepEqual(problems, []);
});

/* a picture that is already bright enough to read on a dark card keeps the
   colours it was drawn in, and only the dark ink ones are painted */
test("only the Why Choose Us pictures with no colour of their own are painted", () => {
  const source = fs.readFileSync(path.join(srcRoot, "pages", "home", "WhyUs.jsx"), "utf8");

  const cards = [...source.matchAll(/image:\s*"([^"]+)"[\s\S]*?keepColours:\s*(true|false)/g)];

  assert.equal(cards.length, 3, "the three Why Choose Us cards were not all found");

  for (const [, image, flag] of cards) {
    const name = path.basename(image);
    const measurement = artwork.get(name);

    assert.ok(measurement, `${name} is not in assets`);

    assert.equal(
      flag === "true",
      measurement.lost < LOST,
      `${name} is marked keepColours ${flag}, and ${Math.round(measurement.lost * 100)}% of its paint sits under 3:1 on a dark card`
    );
  }

  assert.match(source, /keepColours \? \(/);
  assert.match(source, /artwork-lime/);
});

/* the review mark clears 3:1, so it is not invisible, but it was drawn in a flat
   dark grey and reads as mud on a dark card, which is why it is painted too */
test("the customer review mark is painted even though it only reads as mud", () => {
  const source = fs.readFileSync(path.join(srcRoot, "pages", "home", "CustomerReviews.jsx"), "utf8");

  const measurement = artwork.get("customer-top.png");

  assert.ok(measurement, "customer-top.png is not in assets");
  assert.ok(measurement.lost < LOST, "the mark now fails on its own, so this note is out of date");
  assert.match(source, /customer-top\.png/);
  assert.match(source, /artwork-lime[\s\S]{0,200}--art[\s\S]{0,80}customer-top\.png/);
});

/* the paint has to be the brand lime itself rather than a filter that lands
   somewhere near it, and the picture has to survive being a mask */
test("the dark theme paints the brand lime through the picture's own alpha", () => {
  const css = fs.readFileSync(path.join(srcRoot, "index.css"), "utf8");

  const light = css.match(/\.artwork-lime \{[^}]*\}/)[0];
  const dark = css.match(/\.dark \.artwork-lime \{[^}]*\}/)[0];

  assert.match(light, /background-image: var\(--art\)/);
  assert.match(light, /background-size: contain/);

  assert.match(dark, /background-color: var\(--secondary\)/);
  assert.match(dark, /mask-image: var\(--art\)/);
  assert.match(dark, /mask-size: contain/);
  assert.match(dark, /background-image: none/);

  assert.doesNotMatch(dark, /invert/, "the paint is the lime itself, not a filter that approximates it");
});

/* the lime on a dark card has to be legible as a picture, and the mark it is
   painted with is the same lime every button uses */
test("the lime the pictures are painted with is the brand lime", () => {
  const css = fs.readFileSync(path.join(srcRoot, "index.css"), "utf8");

  const dark = css.slice(css.indexOf(".dark {"), css.indexOf("}", css.indexOf(".dark {")));
  const lime = dark.match(/--secondary:\s*(#[0-9a-f]{6})/i)[1];

  const toRgb = (hex) => ({
    r: parseInt(hex.slice(1, 3), 16),
    g: parseInt(hex.slice(3, 5), 16),
    b: parseInt(hex.slice(5, 7), 16),
  });

  assert.equal(lime.toLowerCase(), "#caeb66");
  assert.ok(
    contrast(luminance(toRgb(lime)), luminance(toRgb("#0a2226"))) >= 4.5,
    "the brand lime does not stand off the darkest card in the dark theme"
  );
});
