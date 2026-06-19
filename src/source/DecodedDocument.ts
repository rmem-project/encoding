import type { DecoderBackendInfo } from "../contracts/backend.js";
import type {
  EncodingCandidate,
  EncodingDetectionResult,
  NormalizedEncodingLabel,
} from "../contracts/detection.js";
import { createEncodingError, freezeEncodingWarnings } from "../contracts/diagnostics.js";
import type { EncodingWarning } from "../contracts/diagnostics.js";
import type { DecodedDocument } from "../contracts/document.js";
import type { OffsetMap, SourceBuffer } from "../contracts/source.js";
import { createLineIndex } from "./LineIndex.js";
import { createOffsetMap } from "./OffsetMap.js";

export interface DecodedDocumentWarningGroups {
  readonly backend?: readonly EncodingWarning[];
  readonly sourceMap?: readonly EncodingWarning[];
  readonly streamFinalization?: readonly EncodingWarning[];
}

export interface CreateDecodedDocumentOptions {
  readonly text: string;
  readonly source: SourceBuffer;
  readonly detection: EncodingDetectionResult;
  readonly offsetMap: OffsetMap;
  readonly backend?: DecoderBackendInfo;
  readonly warnings?: DecodedDocumentWarningGroups;
}

export function createDecodedDocument(options: CreateDecodedDocumentOptions): DecodedDocument {
  assertDocumentText(options.text);
  assertDocumentSource(options.source);

  const offsetMap = normalizeDocumentOffsetMap(options.offsetMap);
  assertOffsetMapCoversDocument(offsetMap, {
    backend: options.backend ?? options.detection.backend,
    byteLength: options.source.byteLength,
    textLength: options.text.length,
  });

  const detection = freezeDetectionResult(options.detection, options.backend);
  const warnings = mergeDecodedDocumentWarnings(
    detection.warnings,
    options.warnings?.backend,
    options.warnings?.sourceMap,
    options.warnings?.streamFinalization,
  );
  const lineIndex = createLineIndex(options.text, offsetMap);

  return Object.freeze({
    text: options.text,
    get bytes(): Uint8Array {
      return options.source.bytes;
    },
    detection,
    lineIndex,
    offsetMap,
    warnings,
    source: options.source,
  });
}

function assertDocumentText(text: string): void {
  if (typeof text !== "string") {
    throw new TypeError("DecodedDocument text must be a string.");
  }
}

function assertDocumentSource(source: SourceBuffer): void {
  assertSafeLength("SourceBuffer byteLength", source.byteLength);

  const bytes = source.bytes;
  if (!(bytes instanceof Uint8Array)) {
    throw new TypeError("SourceBuffer bytes must be a Uint8Array.");
  }

  if (bytes.byteLength !== source.byteLength) {
    throw createEncodingError({
      code: "ENCODING_SOURCE_MAP_UNAVAILABLE",
      message: "DecodedDocument source byte length does not match exposed bytes.",
      details: {
        byteLength: source.byteLength,
        exposedByteLength: bytes.byteLength,
      },
    });
  }
}

function normalizeDocumentOffsetMap(offsetMap: OffsetMap): OffsetMap {
  if (typeof offsetMap.segments !== "function") {
    throw new TypeError("DecodedDocument offsetMap must expose segments().");
  }

  return createOffsetMap(offsetMap.segments());
}

function assertOffsetMapCoversDocument(
  offsetMap: OffsetMap,
  options: {
    readonly backend: DecoderBackendInfo;
    readonly byteLength: number;
    readonly textLength: number;
  },
): void {
  const segments = offsetMap.segments();
  const lastSegment = segments.at(-1);
  const mappedByteLength = lastSegment?.byteRange.end ?? 0;
  const mappedTextLength = lastSegment?.textRange.end ?? 0;

  if (mappedByteLength === options.byteLength && mappedTextLength === options.textLength) {
    return;
  }

  throw createEncodingError({
    code: "ENCODING_SOURCE_MAP_UNAVAILABLE",
    message: "DecodedDocument source map does not cover the decoded document.",
    details: {
      backend: options.backend.name,
      byteLength: options.byteLength,
      textLength: options.textLength,
      mappedByteLength,
      mappedTextLength,
    },
  });
}

function assertSafeLength(name: string, value: number): void {
  if (!Number.isSafeInteger(value) || value < 0) {
    throw new RangeError(`${name} must be a non-negative safe integer.`);
  }
}

function freezeDetectionResult(
  detection: EncodingDetectionResult,
  backend: DecoderBackendInfo | undefined,
): EncodingDetectionResult {
  const selectedBackend = backend ?? detection.backend;

  return Object.freeze({
    encoding: detection.encoding,
    confidence: detection.confidence,
    source: detection.source,
    bomLength: detection.bomLength,
    candidates: Object.freeze(detection.candidates.map((candidate) => freezeCandidate(candidate))),
    warnings: freezeEncodingWarnings(detection.warnings),
    label: freezeNormalizedEncodingLabel(detection.label),
    backend: freezeDecoderBackendInfo(selectedBackend),
  });
}

function freezeCandidate(candidate: EncodingCandidate): EncodingCandidate {
  return Object.freeze({
    encoding: candidate.encoding,
    confidence: candidate.confidence,
    source: candidate.source,
    reason: candidate.reason,
    bomLength: candidate.bomLength,
  });
}

function freezeNormalizedEncodingLabel(label: NormalizedEncodingLabel): NormalizedEncodingLabel {
  return Object.freeze({
    ...optionalProperty("inputLabel", label.inputLabel),
    canonical: label.canonical,
    aliases: Object.freeze([...label.aliases]),
    source: label.source,
  });
}

function freezeDecoderBackendInfo(info: DecoderBackendInfo): DecoderBackendInfo {
  return Object.freeze({
    name: info.name,
    ...optionalProperty("version", info.version),
    exactSourceMap: info.exactSourceMap,
  });
}

function mergeDecodedDocumentWarnings(
  ...warningGroups: readonly (readonly EncodingWarning[] | undefined)[]
): readonly EncodingWarning[] {
  const warnings: EncodingWarning[] = [];
  const seenKeys = new Set<string>();

  for (const warningGroup of warningGroups) {
    if (warningGroup === undefined) {
      continue;
    }

    for (const warning of warningGroup) {
      const normalizedWarning = freezeEncodingWarnings([warning])[0];

      if (normalizedWarning === undefined) {
        continue;
      }

      const key = warningKey(normalizedWarning);
      if (seenKeys.has(key)) {
        continue;
      }

      seenKeys.add(key);
      warnings.push(normalizedWarning);
    }
  }

  return Object.freeze(warnings);
}

function warningKey(warning: EncodingWarning): string {
  return [
    warning.code,
    warning.severity,
    warning.message,
    rangeKey(warning.byteRange),
    rangeKey(warning.textRange),
    stableValueKey(warning.details, new WeakSet()),
  ].join("\u0000");
}

function rangeKey(range: { readonly start: number; readonly end: number } | undefined): string {
  return range === undefined ? "undefined" : `${range.start.toString()}:${range.end.toString()}`;
}

function stableValueKey(value: unknown, seen: WeakSet<object>): string {
  if (value === null) {
    return "null";
  }

  switch (typeof value) {
    case "undefined":
      return "undefined:undefined";
    case "boolean":
      return `boolean:${String(value)}`;
    case "number":
      return `number:${String(value)}`;
    case "bigint":
      return `bigint:${String(value)}`;
    case "string":
      return `string:${value}`;
    case "symbol":
      return `symbol:${String(value)}`;
    case "function":
      return `function:${String(value)}`;
    case "object":
      return objectValueKey(value, seen);
  }

  return "unknown";
}

function objectValueKey(value: object, seen: WeakSet<object>): string {
  if (seen.has(value)) {
    return "circular";
  }

  seen.add(value);

  if (Array.isArray(value)) {
    const key = `array:[${value.map((item) => stableValueKey(item, seen)).join(",")}]`;
    seen.delete(value);
    return key;
  }

  const record = value as Readonly<Record<string, unknown>>;
  const key = `object:{${Object.keys(record)
    .sort()
    .map((recordKey) => `${JSON.stringify(recordKey)}:${stableValueKey(record[recordKey], seen)}`)
    .join(",")}}`;

  seen.delete(value);
  return key;
}

function optionalProperty<TKey extends string, TValue>(
  key: TKey,
  value: TValue | undefined,
): Partial<Record<TKey, TValue>> {
  return value === undefined ? {} : ({ [key]: value } as Partial<Record<TKey, TValue>>);
}
