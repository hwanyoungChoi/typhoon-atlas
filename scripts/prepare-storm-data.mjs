import { execFileSync } from "node:child_process";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

import { getDocument } from "pdfjs-dist/legacy/build/pdf.mjs";

const output = new URL("../public/data/years/", import.meta.url);
const temporary = join(tmpdir(), "cyclone-atlas-data");
const files = {
  jmaZip: join(temporary, "jma.zip"),
  jma: join(temporary, "bst_all.txt"),
  atlantic: join(temporary, "atlantic.txt"),
  pacific: join(temporary, "pacific.txt"),
};
mkdirSync(temporary, { recursive: true });
mkdirSync(output, { recursive: true });
download(
  "https://www.jma.go.jp/jma/jma-eng/jma-center/rsmc-hp-pub-eg/Besttracks/bst_all.zip",
  files.jmaZip,
);
execFileSync("unzip", ["-o", files.jmaZip, "-d", temporary], { stdio: "inherit" });
download(latestHurdatUrl("hurdat2-1851"), files.atlantic);
download(latestHurdatUrl("hurdat2-nepac-1949"), files.pacific);

const jmaStorms = parseJma(readFileSync(files.jma, "utf8"));
const currentYear = new Date().getUTCFullYear();
const provisionalJmaStorms = await loadJmaProvisional(
  currentYear,
  new Set(jmaStorms.filter((storm) => storm.year === currentYear).map((storm) => storm.number)),
);
const storms = [
  ...jmaStorms,
  ...provisionalJmaStorms,
  ...parseHurdat(readFileSync(files.atlantic, "utf8"), "NA"),
  ...parseHurdat(readFileSync(files.pacific, "utf8"), "EP"),
];
const byYear = new Map();
for (const storm of storms) byYear.set(storm.year, [...(byYear.get(storm.year) ?? []), storm]);
const years = [...byYear.keys()].sort((a, b) => b - a);
for (const year of years)
  writeFileSync(
    new URL(`${year}.json`, output),
    JSON.stringify({
      year,
      storms: byYear.get(year).sort((a, b) => stormNumber(b) - stormNumber(a)),
    }),
  );
writeFileSync(
  new URL("index.json", output),
  JSON.stringify({
    years,
    sources: [
      "Japan Meteorological Agency RSMC Tokyo Best Track and provisional position tables",
      "NOAA National Hurricane Center HURDAT2 (Atlantic and Eastern/Central Pacific through 2025)",
    ],
  }),
);
console.log(`Wrote ${storms.length} storms across ${years.length} years.`);

function download(url, destination) {
  execFileSync("curl", ["-L", "--fail", "--silent", "--show-error", "-o", destination, url], {
    stdio: "inherit",
  });
}

function latestHurdatUrl(prefix) {
  const index = execFileSync(
    "curl",
    ["-L", "--fail", "--silent", "--show-error", "https://www.nhc.noaa.gov/data/hurdat/"],
    { encoding: "utf8" },
  );
  const filenames = [...index.matchAll(new RegExp(`${prefix}-\\d{4}-\\d+\\.txt`, "g"))].map(
    (match) => match[0],
  );
  const filename = filenames.sort().at(-1);
  if (!filename) throw new Error(`No HURDAT2 file found for ${prefix}`);
  return `https://www.nhc.noaa.gov/data/hurdat/${filename}`;
}

function parseJma(text) {
  const lines = text.split(/\r?\n/);
  const storms = [];
  for (let index = 0; index < lines.length; index += 1) {
    const header = lines[index];
    if (!header.startsWith("66666")) continue;
    const count = Number(header.slice(12, 15).trim());
    const internationalId = header.slice(6, 10).trim();
    const name = header.slice(30, 50).trim() || "UNNAMED";
    const track = [];
    for (let offset = 1; offset <= count; offset += 1) {
      const match = lines[index + offset]?.match(
        /^(\d{8})\s+002\s+(\d)\s+(\d{3})\s+(\d{4})\s+(\d{3,4})(?:\s+(\d{3}))?/,
      );
      if (!match) continue;
      const [, timestamp, , latitude, longitude, pressure, wind] = match;
      const yy = Number(timestamp.slice(0, 2));
      const year = yy >= 51 ? 1900 + yy : 2000 + yy;
      track.push({
        time: `${year}-${timestamp.slice(2, 4)}-${timestamp.slice(4, 6)} ${timestamp.slice(6, 8)}:00 UTC`,
        lng: Number(longitude) / 10,
        lat: Number(latitude) / 10,
        wind: Number(wind) || null,
        pressure: Number(pressure) || null,
      });
    }
    index += count;
    if (!track.length) continue;
    const year = Number(track[0].time.slice(0, 4));
    storms.push(
      toStorm({
        id: `JMA-${internationalId}-${year}`,
        year,
        basin: "WP",
        number: `${internationalId.slice(2)}호`,
        name,
        track,
      }),
    );
  }
  return storms;
}

function parseHurdat(text, basin) {
  const lines = text.split(/\r?\n/);
  const storms = [];
  for (let index = 0; index < lines.length; index += 1) {
    const header = lines[index];
    if (!/^[A-Z]{2}\d{6},/.test(header)) continue;
    const [id, rawName, rawCount] = header.split(",");
    const count = Number(rawCount.trim());
    const year = Number(id.slice(4, 8));
    const track = [];
    for (let offset = 1; offset <= count; offset += 1) {
      const values = lines[index + offset]?.split(",").map((value) => value.trim());
      if (!values || values.length < 8) continue;
      const lat = coordinate(values[4]);
      const lng = coordinate(values[5]);
      if (lat === null || lng === null) continue;
      const pressure = Number(values[7]);
      track.push({
        time: `${values[0].slice(0, 4)}-${values[0].slice(4, 6)}-${values[0].slice(6, 8)} ${values[1].slice(0, 2)}:${values[1].slice(2, 4)} UTC`,
        lng,
        lat,
        wind: Number(values[6]) || null,
        pressure: pressure > 0 ? pressure : null,
      });
    }
    index += count;
    if (track.length)
      storms.push(
        toStorm({
          id,
          year,
          basin,
          number: `#${Number(id.slice(2, 4))}`,
          name: rawName.trim() || "UNNAMED",
          track,
        }),
      );
  }
  return storms;
}

async function loadJmaProvisional(year, existingNumbers) {
  const yy = String(year).slice(2);
  const table = join(temporary, `jma-table-${year}.html`);
  download(`https://www.data.jma.go.jp/typhoon/position_table/table${year}.html`, table);
  const html = readFileSync(table, "utf8");
  const ids = [...html.matchAll(new RegExp(`T(${yy}\\d{2})\\.pdf`, "g"))]
    .map((match) => match[1])
    .filter((id, index, all) => all.indexOf(id) === index);
  const storms = [];
  for (const id of ids) {
    const number = `${Number(id.slice(2))}호`;
    if (existingNumbers.has(number) || existingNumbers.has(`${id.slice(2)}호`)) continue;
    const pdf = join(temporary, `T${id}.pdf`);
    download(`https://www.data.jma.go.jp/typhoon/data/T${id}.pdf`, pdf);
    const storm = await parseJmaPositionPdf(pdf, year, id);
    if (storm) storms.push(storm);
  }
  return storms;
}

async function parseJmaPositionPdf(file, year, id) {
  const pdf = await getDocument({ data: new Uint8Array(readFileSync(file)) }).promise;
  const track = [];
  let month = null;
  let day = null;
  let name = "UNNAMED";
  for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber += 1) {
    const page = await pdf.getPage(pageNumber);
    const content = await page.getTextContent();
    const title = content.items
      .map((item) => item.str)
      .join(" ")
      .match(/([A-Z][A-Z-]+)\s*\(\d{4}\)/);
    if (title) name = title[1];
    const lines = new Map();
    for (const item of content.items) {
      const y = Math.round(item.transform[5] * 10) / 10;
      lines.set(y, [...(lines.get(y) ?? []), { x: item.transform[4], value: item.str.trim() }]);
    }
    for (const items of [...lines.values()]) {
      const valueAt = (min, max, pattern) =>
        items.find((item) => item.x >= min && item.x < max && pattern.test(item.value))?.value;
      const hour = valueAt(84, 100, /^(00|03|06|09|12|15|18|21)$/);
      const lat = valueAt(100, 126, /^\d{1,2}\.\d$/);
      const lng = valueAt(138, 168, /^\d{2,3}\.\d$/);
      const pressure = valueAt(184, 210, /^\d{3,4}$/);
      if (!hour || !lat || !lng || !pressure) continue;
      month = Number(valueAt(55, 72, /^\d{1,2}$/) ?? month);
      day = Number(valueAt(72, 84, /^\d{1,2}$/) ?? day);
      if (!month || !day) continue;
      const windMs = Number(valueAt(210, 235, /^\d{1,3}$/));
      track.push({
        time: `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")} ${hour}:00 JST`,
        lng: Number(lng),
        lat: Number(lat),
        wind: windMs ? Math.round(windMs * 1.94384) : null,
        pressure: Number(pressure),
        kind: "observed",
      });
    }
  }
  if (!track.length) return null;
  const storm = toStorm({
    id: `JMA-${id}-${year}`,
    year,
    basin: "WP",
    number: `${Number(id.slice(2))}호`,
    name,
    track,
  });
  return { ...storm, status: "provisional" };
}

function coordinate(value) {
  if (!value) return null;
  const direction = value.at(-1);
  const number = Number(value.slice(0, -1));
  return ["S", "W"].includes(direction) ? -number : number;
}
function stormNumber(storm) {
  return Number(storm.number.replace(/\D/g, ""));
}
function toStorm({ id, year, basin, number, name, track }) {
  const wind = track.map((point) => point.wind).filter((value) => value !== null);
  const pressure = track.map((point) => point.pressure).filter((value) => value !== null);
  return {
    id,
    year,
    basin,
    regionalName: basin === "WP" ? "태풍" : "허리케인",
    number,
    name,
    status: "archived",
    peakWind: wind.length ? Math.max(...wind) : null,
    peakPressure: pressure.length ? Math.min(...pressure) : null,
    dates: `${track[0].time.slice(0, 10)} — ${track.at(-1).time.slice(0, 10)}`,
    track,
  };
}
