import { readFile } from "node:fs/promises";
import { dirname, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";

export type FixtureEncodingName =
  | "utf-8"
  | "utf-16le"
  | "utf-16be"
  | "windows-1251"
  | "windows-1252"
  | "iso-8859-1"
  | "iso-8859-5"
  | "koi8-r"
  | "cp866";

export interface FixtureRange {
  readonly start: number;
  readonly end: number;
}

export interface FixtureExpectedDetection {
  readonly encoding?: FixtureEncodingName;
  readonly source?: string;
  readonly confidence?: number;
  readonly bomLength?: number;
  readonly warnings?: readonly string[];
}

export interface FixtureExpectedLine {
  readonly line: number;
  readonly textRange?: FixtureRange;
  readonly byteRange?: FixtureRange;
}

export interface FixtureExpectedLineIndex {
  readonly lineCount?: number;
  readonly lines?: readonly FixtureExpectedLine[];
}

export interface FixtureExpectedOffsetRange {
  readonly label: string;
  readonly textRange: FixtureRange;
  readonly byteRange: FixtureRange;
}

export interface FixtureExpectedOffsetMap {
  readonly ranges?: readonly FixtureExpectedOffsetRange[];
}

export interface FixtureExpectations {
  readonly text?: string;
  readonly detection?: FixtureExpectedDetection;
  readonly lineIndex?: FixtureExpectedLineIndex;
  readonly offsetMap?: FixtureExpectedOffsetMap;
}

export interface FixtureMetadata {
  readonly id: string;
  readonly description: string;
  readonly bytesPath?: string;
  readonly bytesHex?: string;
  readonly tags?: readonly string[];
  readonly expected: FixtureExpectations;
}

export interface FixtureManifest {
  readonly fixtures: readonly FixtureMetadata[];
}

export interface LoadedFixture {
  readonly metadata: FixtureMetadata;
  readonly bytes: Uint8Array;
}

const repositoryRoot = dirname(dirname(dirname(fileURLToPath(import.meta.url))));

export const fixturesRoot = resolve(repositoryRoot, "fixtures");
export const defaultFixtureManifestPath = resolve(fixturesRoot, "manifest.json");

export async function readFixtureManifest(
  manifestPath = defaultFixtureManifestPath,
): Promise<FixtureManifest> {
  const manifestText = await readFile(manifestPath, "utf8");
  const parsed: unknown = JSON.parse(manifestText);

  return parseFixtureManifest(parsed);
}

export function fixtureIds(manifest: FixtureManifest): readonly string[] {
  return manifest.fixtures.map((fixture) => fixture.id);
}

export async function loadFixture(
  id: string,
  manifestPath = defaultFixtureManifestPath,
): Promise<LoadedFixture> {
  const manifest = await readFixtureManifest(manifestPath);
  const metadata = manifest.fixtures.find((fixture) => fixture.id === id);

  if (metadata === undefined) {
    throw new Error(`Unknown fixture "${id}".`);
  }

  return {
    metadata,
    bytes: await readFixtureBytes(metadata),
  };
}

export async function readFixtureBytes(metadata: FixtureMetadata): Promise<Uint8Array> {
  if (metadata.bytesHex !== undefined) {
    return bytesFromHex(metadata.bytesHex, metadata.id);
  }

  if (metadata.bytesPath === undefined) {
    throw new Error(`Fixture "${metadata.id}" does not define a byte source.`);
  }

  const bytePath = resolveFixturePath(metadata.bytesPath);
  const bytes = await readFile(bytePath);

  return new Uint8Array(bytes);
}

export function bytesFromHex(hex: string, fixtureId = "inline"): Uint8Array {
  const compact = hex.replaceAll(/0x|[\s_-]/gi, "");

  if (compact.length === 0) {
    return new Uint8Array();
  }

  if (compact.length % 2 !== 0) {
    throw new Error(`Fixture "${fixtureId}" has an odd-length hex byte string.`);
  }

  if (!/^[\da-f]+$/i.test(compact)) {
    throw new Error(`Fixture "${fixtureId}" contains a non-hex byte.`);
  }

  const bytes = new Uint8Array(compact.length / 2);

  for (let index = 0; index < bytes.length; index += 1) {
    bytes[index] = Number.parseInt(compact.slice(index * 2, index * 2 + 2), 16);
  }

  return bytes;
}

function resolveFixturePath(bytesPath: string): string {
  const resolvedPath = resolve(fixturesRoot, bytesPath);
  const relativePath = relative(fixturesRoot, resolvedPath);

  if (relativePath.length === 0 || relativePath.startsWith("..")) {
    throw new Error(`Fixture byte path "${bytesPath}" must stay inside fixtures/.`);
  }

  return resolvedPath;
}

function parseFixtureManifest(value: unknown): FixtureManifest {
  const record = asRecord(value, "manifest");
  const fixturesValue = record.fixtures;

  if (!Array.isArray(fixturesValue)) {
    throw new Error("Fixture manifest must contain a fixtures array.");
  }

  const fixtures = fixturesValue.map((fixture, index) =>
    parseFixtureMetadata(fixture, `fixtures[${String(index)}]`),
  );
  const ids = new Set<string>();

  for (const fixture of fixtures) {
    if (ids.has(fixture.id)) {
      throw new Error(`Duplicate fixture id "${fixture.id}".`);
    }

    ids.add(fixture.id);
  }

  return { fixtures };
}

function parseFixtureMetadata(value: unknown, path: string): FixtureMetadata {
  const record = asRecord(value, path);
  const id = readRequiredString(record, "id", path);
  const description = readRequiredString(record, "description", path);
  const bytesPath = readOptionalString(record, "bytesPath", path);
  const bytesHex = readOptionalString(record, "bytesHex", path);
  const tags = readOptionalStringArray(record.tags, `${path}.tags`);
  const expected = parseExpectations(record.expected, `${path}.expected`);

  if ((bytesPath === undefined) === (bytesHex === undefined)) {
    throw new Error(`Fixture "${id}" must define exactly one of bytesPath or bytesHex.`);
  }

  return {
    id,
    description,
    ...(bytesPath === undefined ? {} : { bytesPath }),
    ...(bytesHex === undefined ? {} : { bytesHex }),
    ...(tags === undefined ? {} : { tags }),
    expected,
  };
}

function parseExpectations(value: unknown, path: string): FixtureExpectations {
  const record = asRecord(value, path);
  const text = readOptionalString(record, "text", path);
  const detection = parseOptionalDetection(record.detection, `${path}.detection`);
  const lineIndex = parseOptionalLineIndex(record.lineIndex, `${path}.lineIndex`);
  const offsetMap = parseOptionalOffsetMap(record.offsetMap, `${path}.offsetMap`);

  return {
    ...(text === undefined ? {} : { text }),
    ...(detection === undefined ? {} : { detection }),
    ...(lineIndex === undefined ? {} : { lineIndex }),
    ...(offsetMap === undefined ? {} : { offsetMap }),
  };
}

function parseOptionalDetection(
  value: unknown,
  path: string,
): FixtureExpectedDetection | undefined {
  if (value === undefined) {
    return undefined;
  }

  const record = asRecord(value, path);
  const encoding = readOptionalEncoding(record, "encoding", path);
  const source = readOptionalString(record, "source", path);
  const confidence = readOptionalNumber(record, "confidence", path);
  const bomLength = readOptionalInteger(record, "bomLength", path);
  const warnings = readOptionalStringArray(record.warnings, `${path}.warnings`);

  if (confidence !== undefined && (confidence < 0 || confidence > 1)) {
    throw new Error(`${path}.confidence must be between 0 and 1.`);
  }

  return {
    ...(encoding === undefined ? {} : { encoding }),
    ...(source === undefined ? {} : { source }),
    ...(confidence === undefined ? {} : { confidence }),
    ...(bomLength === undefined ? {} : { bomLength }),
    ...(warnings === undefined ? {} : { warnings }),
  };
}

function parseOptionalLineIndex(
  value: unknown,
  path: string,
): FixtureExpectedLineIndex | undefined {
  if (value === undefined) {
    return undefined;
  }

  const record = asRecord(value, path);
  const lineCount = readOptionalInteger(record, "lineCount", path);
  const lines = parseOptionalArray(record.lines, `${path}.lines`, parseExpectedLine);

  return {
    ...(lineCount === undefined ? {} : { lineCount }),
    ...(lines === undefined ? {} : { lines }),
  };
}

function parseExpectedLine(value: unknown, path: string): FixtureExpectedLine {
  const record = asRecord(value, path);
  const line = readRequiredInteger(record, "line", path);
  const textRange = parseOptionalRange(record.textRange, `${path}.textRange`);
  const byteRange = parseOptionalRange(record.byteRange, `${path}.byteRange`);

  if (line < 1) {
    throw new Error(`${path}.line must be at least 1.`);
  }

  return {
    line,
    ...(textRange === undefined ? {} : { textRange }),
    ...(byteRange === undefined ? {} : { byteRange }),
  };
}

function parseOptionalOffsetMap(
  value: unknown,
  path: string,
): FixtureExpectedOffsetMap | undefined {
  if (value === undefined) {
    return undefined;
  }

  const record = asRecord(value, path);
  const ranges = parseOptionalArray(record.ranges, `${path}.ranges`, parseOffsetRange);

  return {
    ...(ranges === undefined ? {} : { ranges }),
  };
}

function parseOffsetRange(value: unknown, path: string): FixtureExpectedOffsetRange {
  const record = asRecord(value, path);

  return {
    label: readRequiredString(record, "label", path),
    textRange: parseRequiredRange(record.textRange, `${path}.textRange`),
    byteRange: parseRequiredRange(record.byteRange, `${path}.byteRange`),
  };
}

function parseOptionalRange(value: unknown, path: string): FixtureRange | undefined {
  if (value === undefined) {
    return undefined;
  }

  return parseRequiredRange(value, path);
}

function parseRequiredRange(value: unknown, path: string): FixtureRange {
  const record = asRecord(value, path);
  const start = readRequiredInteger(record, "start", path);
  const end = readRequiredInteger(record, "end", path);

  if (end < start) {
    throw new Error(`${path}.end must be greater than or equal to ${path}.start.`);
  }

  return { start, end };
}

function parseOptionalArray<T>(
  value: unknown,
  path: string,
  parseItem: (value: unknown, path: string) => T,
): readonly T[] | undefined {
  if (value === undefined) {
    return undefined;
  }

  if (!Array.isArray(value)) {
    throw new Error(`${path} must be an array.`);
  }

  return value.map((item, index) => parseItem(item, `${path}[${String(index)}]`));
}

function readRequiredString(
  record: Readonly<Record<string, unknown>>,
  key: string,
  path: string,
): string {
  const value = record[key];

  if (typeof value !== "string" || value.length === 0) {
    throw new Error(`${path}.${key} must be a non-empty string.`);
  }

  return value;
}

function readOptionalString(
  record: Readonly<Record<string, unknown>>,
  key: string,
  path: string,
): string | undefined {
  const value = record[key];

  if (value === undefined) {
    return undefined;
  }

  if (typeof value !== "string" || value.length === 0) {
    throw new Error(`${path}.${key} must be a non-empty string.`);
  }

  return value;
}

function readOptionalStringArray(value: unknown, path: string): readonly string[] | undefined {
  if (value === undefined) {
    return undefined;
  }

  if (!Array.isArray(value)) {
    throw new Error(`${path} must be an array.`);
  }

  return value.map((item, index) => {
    if (typeof item !== "string" || item.length === 0) {
      throw new Error(`${path}[${String(index)}] must be a non-empty string.`);
    }

    return item;
  });
}

function readOptionalEncoding(
  record: Readonly<Record<string, unknown>>,
  key: string,
  path: string,
): FixtureEncodingName | undefined {
  const value = readOptionalString(record, key, path);

  if (value === undefined) {
    return undefined;
  }

  if (!isFixtureEncodingName(value)) {
    throw new Error(`${path}.${key} has unsupported fixture encoding "${value}".`);
  }

  return value;
}

function readRequiredInteger(
  record: Readonly<Record<string, unknown>>,
  key: string,
  path: string,
): number {
  const value = record[key];

  if (typeof value !== "number" || !Number.isInteger(value)) {
    throw new Error(`${path}.${key} must be an integer.`);
  }

  return value;
}

function readOptionalInteger(
  record: Readonly<Record<string, unknown>>,
  key: string,
  path: string,
): number | undefined {
  const value = record[key];

  if (value === undefined) {
    return undefined;
  }

  if (typeof value !== "number" || !Number.isInteger(value)) {
    throw new Error(`${path}.${key} must be an integer.`);
  }

  return value;
}

function readOptionalNumber(
  record: Readonly<Record<string, unknown>>,
  key: string,
  path: string,
): number | undefined {
  const value = record[key];

  if (value === undefined) {
    return undefined;
  }

  if (typeof value !== "number" || !Number.isFinite(value)) {
    throw new Error(`${path}.${key} must be a finite number.`);
  }

  return value;
}

function asRecord(value: unknown, path: string): Readonly<Record<string, unknown>> {
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    throw new Error(`${path} must be an object.`);
  }

  return value as Readonly<Record<string, unknown>>;
}

function isFixtureEncodingName(value: string): value is FixtureEncodingName {
  return (
    value === "utf-8" ||
    value === "utf-16le" ||
    value === "utf-16be" ||
    value === "windows-1251" ||
    value === "windows-1252" ||
    value === "iso-8859-1" ||
    value === "iso-8859-5" ||
    value === "koi8-r" ||
    value === "cp866"
  );
}
