import { describe, expect, it } from "vitest";

import { decodeDocumentSync } from "../src/index.js";
import type {
  DecodedDocument,
  DecodeDocumentOptions,
  EncodingWarning,
  OffsetMapSegment,
} from "../src/index.js";
import type {
  FixtureExpectedLineIndex,
  FixtureExpectedOffsetMap,
  FixtureExpectedOffsetRange,
  LoadedFixture,
} from "./support/fixtures.js";
import { loadFixture } from "./support/fixtures.js";

const SOURCE_MAP_FIXTURE_IDS = Object.freeze([
  "infrastructure-invalid-utf8",
  "utf8-no-bom",
  "utf8-bom",
  "utf8-invalid-sequence",
  "utf16le-bom",
  "utf16be-bom",
  "windows1251-uk",
  "windows1252-latin",
  "koi8r-cyrillic",
  "cp866-cyrillic",
  "iso8859-5-cyrillic",
  "ambiguous-ascii",
  "html-meta-windows1251",
  "stream-split-utf8",
  "stream-split-crlf",
] as const);

const utf8Encoder = new TextEncoder();

describe("source map and line behavior", () => {
  it.each(SOURCE_MAP_FIXTURE_IDS)(
    "maps fixture key ranges and lines for %s through the public decode API",
    async (fixtureId) => {
      const fixture = await loadFixture(fixtureId);
      const document = decodeFixtureWithExplicitEncoding(fixture);
      const { expected } = fixture.metadata;

      expect(document.text).toBe(expected.text);
      expect(document.detection.encoding).toBe(expected.detection?.encoding);
      assertFixtureLineIndex(document, requireLineIndex(expected.lineIndex, fixtureId));
      assertFixtureOffsetMap(document, requireOffsetMap(expected.offsetMap, fixtureId));

      const expectedWarningCodes = expected.detection?.warnings ?? [];
      for (const code of expectedWarningCodes) {
        expect(warningCodes(document.warnings)).toContain(code);
      }
    },
  );

  it("keeps collapsed BOM bytes reachable through segments and boundary bias", async () => {
    const fixture = await loadFixture("utf8-bom");
    const document = decodeFixtureWithExplicitEncoding(fixture);

    expect(document.offsetMap.segments()[0]).toEqual({
      byteRange: { start: 0, end: 3 },
      textRange: { start: 0, end: 0 },
      kind: "bom",
    });
    expect(document.offsetMap.textRangeForByteRange({ start: 0, end: 3 })).toEqual({
      start: 0,
      end: 0,
    });
    expect(document.offsetMap.byteOffsetForTextOffset(0, "start")).toBe(0);
    expect(document.offsetMap.byteOffsetForTextOffset(0, "end")).toBe(3);
    expect(document.offsetMap.byteOffsetForTextOffset(0, "nearest")).toBe(3);
    expect(document.lineIndex.positionAtTextOffset(0)).toEqual({
      byteOffset: 3,
      characterOffset: 0,
      line: 1,
      column: 1,
    });
  });

  it("maps replacement text spans back to invalid bytes with explicit bias behavior", () => {
    const document = decodeDocumentSync(new Uint8Array([0x41, 0xc3, 0x42]), {
      explicitEncoding: "utf-8",
      replacementPolicy: "replace",
      replacementCharacter: "??",
      sourceMap: "exact",
    });

    expect(document.text).toBe("A??B");
    expect(document.offsetMap.segments()).toEqual([
      {
        byteRange: { start: 0, end: 1 },
        textRange: { start: 0, end: 1 },
        kind: "identity",
      },
      {
        byteRange: { start: 1, end: 2 },
        textRange: { start: 1, end: 3 },
        kind: "replacement",
      },
      {
        byteRange: { start: 2, end: 3 },
        textRange: { start: 3, end: 4 },
        kind: "identity",
      },
    ]);
    expect(document.offsetMap.byteRangeForTextRange({ start: 1, end: 3 })).toEqual({
      start: 1,
      end: 2,
    });
    expect(document.offsetMap.textRangeForByteRange({ start: 1, end: 2 })).toEqual({
      start: 1,
      end: 3,
    });
    expect(document.offsetMap.byteOffsetForTextOffset(2, "start")).toBe(1);
    expect(document.offsetMap.byteOffsetForTextOffset(2, "end")).toBe(2);
    expect(document.offsetMap.byteOffsetForTextOffset(2, "nearest")).toBe(2);
    expect(document.lineIndex.positionAtTextOffset(2)).toEqual({
      byteOffset: 2,
      characterOffset: 2,
      line: 1,
      column: 3,
    });
    expect(warningCodes(document.warnings)).toContain("ENCODING_INVALID_SEQUENCE_REPLACED");
  });

  it("maps synthetic string input bytes without pretending they are original source bytes", () => {
    const document = decodeDocumentSync("AЖ\n😀", {
      sourceMap: "exact",
    });

    expect(document.source.bytes).toEqual(
      new Uint8Array([0x41, 0xd0, 0x96, 0x0a, 0xf0, 0x9f, 0x98, 0x80]),
    );
    expect(document.offsetMap.segments()).toEqual([
      {
        byteRange: { start: 0, end: 1 },
        textRange: { start: 0, end: 1 },
        kind: "synthetic",
      },
      {
        byteRange: { start: 1, end: 3 },
        textRange: { start: 1, end: 2 },
        kind: "synthetic",
      },
      {
        byteRange: { start: 3, end: 4 },
        textRange: { start: 2, end: 3 },
        kind: "synthetic",
      },
      {
        byteRange: { start: 4, end: 8 },
        textRange: { start: 3, end: 5 },
        kind: "synthetic",
      },
    ]);
    expect(document.offsetMap.byteRangeForTextRange({ start: 3, end: 5 })).toEqual({
      start: 4,
      end: 8,
    });
    expect(document.offsetMap.textRangeForByteRange({ start: 4, end: 8 })).toEqual({
      start: 3,
      end: 5,
    });
    expect(document.lineIndex.lineByteRange(2)).toEqual({ start: 4, end: 8 });
    expect(document.lineIndex.positionAtByteOffset(6, "start")).toEqual({
      byteOffset: 6,
      characterOffset: 3,
      line: 2,
      column: 1,
    });
    expect(document.lineIndex.positionAtByteOffset(6, "end")).toEqual({
      byteOffset: 6,
      characterOffset: 5,
      line: 2,
      column: 3,
    });
    expect(warningCodes(document.warnings)).toContain("ENCODING_TEXT_INPUT_SYNTHETIC_BYTES");
  });

  it("counts LF, CRLF, CR, mixed endings and trailing newline through decoded documents", () => {
    const text = "lf\ncrlf\r\ncr\rtail\n";
    const document = decodeDocumentSync(utf8Encoder.encode(text), {
      explicitEncoding: "utf-8",
      sourceMap: "exact",
    });

    expect(document.text).toBe(text);
    expect(document.lineIndex.lineCount).toBe(5);
    expect(document.lineIndex.lineTextRange(1)).toEqual({ start: 0, end: 2 });
    expect(document.lineIndex.lineTextRange(1, true)).toEqual({ start: 0, end: 3 });
    expect(document.lineIndex.lineTextRange(2)).toEqual({ start: 3, end: 7 });
    expect(document.lineIndex.lineTextRange(2, true)).toEqual({ start: 3, end: 9 });
    expect(document.lineIndex.lineTextRange(3)).toEqual({ start: 9, end: 11 });
    expect(document.lineIndex.lineTextRange(3, true)).toEqual({ start: 9, end: 12 });
    expect(document.lineIndex.lineTextRange(4)).toEqual({ start: 12, end: 16 });
    expect(document.lineIndex.lineTextRange(4, true)).toEqual({ start: 12, end: 17 });
    expect(document.lineIndex.lineTextRange(5)).toEqual({ start: 17, end: 17 });
    expect(document.lineIndex.lineByteRange(2, true)).toEqual({ start: 3, end: 9 });
    expect(document.lineIndex.positionAtTextOffset(8)).toEqual({
      byteOffset: 8,
      characterOffset: 8,
      line: 2,
      column: 5,
    });
    expect(document.lineIndex.positionAtTextOffset(9)).toEqual({
      byteOffset: 9,
      characterOffset: 9,
      line: 3,
      column: 1,
    });
  });

  it("projects byte positions inside UTF-8 encoded spans according to bias", () => {
    const document = decodeDocumentSync(new Uint8Array([0x41, 0xd0, 0x96, 0x0a]), {
      explicitEncoding: "utf-8",
      sourceMap: "exact",
    });

    expect(document.text).toBe("AЖ\n");
    expect(document.offsetMap.byteRangeForTextRange({ start: 1, end: 2 })).toEqual({
      start: 1,
      end: 3,
    });
    expect(document.lineIndex.positionAtByteOffset(2, "start")).toEqual({
      byteOffset: 2,
      characterOffset: 1,
      line: 1,
      column: 2,
    });
    expect(document.lineIndex.positionAtByteOffset(2, "end")).toEqual({
      byteOffset: 2,
      characterOffset: 2,
      line: 1,
      column: 3,
    });
    expect(document.lineIndex.positionAtByteOffset(2, "nearest")).toEqual({
      byteOffset: 2,
      characterOffset: 2,
      line: 1,
      column: 3,
    });
    expect(document.lineIndex.positionAtTextOffset(2)).toEqual({
      byteOffset: 3,
      characterOffset: 2,
      line: 1,
      column: 3,
    });
  });
});

function decodeFixtureWithExplicitEncoding(fixture: LoadedFixture): DecodedDocument {
  const encoding = fixture.metadata.expected.detection?.encoding;

  if (encoding === undefined) {
    throw new Error(`Fixture "${fixture.metadata.id}" does not define an expected encoding.`);
  }

  const options: DecodeDocumentOptions = {
    explicitEncoding: encoding,
    sourceMap: "exact",
    replacementPolicy: expectsReplacement(fixture) ? "replace" : "fatal",
  };

  return decodeDocumentSync(fixture.bytes, options);
}

function expectsReplacement(fixture: LoadedFixture): boolean {
  return (
    fixture.metadata.expected.detection?.warnings?.includes("ENCODING_INVALID_SEQUENCE_REPLACED") ??
    false
  );
}

function requireLineIndex(
  expected: FixtureExpectedLineIndex | undefined,
  fixtureId: string,
): FixtureExpectedLineIndex {
  if (expected === undefined) {
    throw new Error(`Fixture "${fixtureId}" does not define line index expectations.`);
  }

  return expected;
}

function requireOffsetMap(
  expected: FixtureExpectedOffsetMap | undefined,
  fixtureId: string,
): FixtureExpectedOffsetMap {
  if (expected === undefined) {
    throw new Error(`Fixture "${fixtureId}" does not define offset map expectations.`);
  }

  return expected;
}

function assertFixtureLineIndex(
  document: DecodedDocument,
  expected: FixtureExpectedLineIndex,
): void {
  if (expected.lineCount !== undefined) {
    expect(document.lineIndex.lineCount).toBe(expected.lineCount);
  }

  for (const line of expected.lines ?? []) {
    if (line.textRange !== undefined) {
      expect(document.lineIndex.lineTextRange(line.line)).toEqual(line.textRange);
    }

    if (line.byteRange !== undefined) {
      expect(document.lineIndex.lineByteRange(line.line)).toEqual(line.byteRange);
    }
  }
}

function assertFixtureOffsetMap(
  document: DecodedDocument,
  expected: FixtureExpectedOffsetMap,
): void {
  for (const range of expected.ranges ?? []) {
    if (isCollapsed(range.textRange) || isCollapsed(range.byteRange)) {
      assertSegmentExists(document.offsetMap.segments(), range);
    }

    expect(document.offsetMap.textRangeForByteRange(range.byteRange)).toEqual(range.textRange);

    if (!isCollapsed(range.textRange)) {
      expect(document.offsetMap.byteRangeForTextRange(range.textRange)).toEqual(range.byteRange);
    }
  }
}

function assertSegmentExists(
  segments: readonly OffsetMapSegment[],
  range: FixtureExpectedOffsetRange,
): void {
  expect(
    segments.some(
      (segment) =>
        sameRange(segment.byteRange, range.byteRange) &&
        sameRange(segment.textRange, range.textRange),
    ),
  ).toBe(true);
}

function sameRange(left: { readonly start: number; readonly end: number }, right: typeof left) {
  return left.start === right.start && left.end === right.end;
}

function isCollapsed(range: { readonly start: number; readonly end: number }): boolean {
  return range.start === range.end;
}

function warningCodes(warnings: readonly EncodingWarning[]): readonly string[] {
  return warnings.map((warning) => warning.code);
}
