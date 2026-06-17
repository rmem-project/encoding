import type {
  ByteOffset,
  CharacterOffset,
  OffsetBias,
  OffsetMap,
  OffsetMapSegment,
  OffsetMapSegmentKind,
  SourceByteRange,
  TextRange,
} from "../contracts/source.js";
import {
  isCollapsedRange,
  normalizeOffsetBias,
  rangeLength,
  resolveOffsetByBias,
  validateSourceByteRange,
  validateTextRange,
} from "./ranges.js";

const OFFSET_MAP_SEGMENT_KINDS = Object.freeze([
  "identity",
  "encoded",
  "bom",
  "replacement",
  "synthetic",
] as const);

type OffsetSpace = "byte" | "text";

export function createOffsetMap(segments: readonly OffsetMapSegment[]): OffsetMap {
  return new SegmentOffsetMap(normalizeSegments(segments));
}

class SegmentOffsetMap implements OffsetMap {
  private readonly segmentList: readonly OffsetMapSegment[];

  private readonly byteLength: number;

  private readonly textLength: number;

  constructor(segments: readonly OffsetMapSegment[]) {
    this.segmentList = segments;
    this.byteLength = segments.at(-1)?.byteRange.end ?? 0;
    this.textLength = segments.at(-1)?.textRange.end ?? 0;
    Object.freeze(this);
  }

  byteRangeForTextRange(range: TextRange): SourceByteRange {
    const normalizedRange = validateTextRange(range, this.textLength);
    const start = this.byteOffsetForTextOffset(normalizedRange.start, "end");
    const end =
      normalizedRange.start === normalizedRange.end
        ? start
        : this.byteOffsetForTextOffset(normalizedRange.end, "start");

    return validateSourceByteRange({ start, end }, this.byteLength);
  }

  textRangeForByteRange(range: SourceByteRange): TextRange {
    const normalizedRange = validateSourceByteRange(range, this.byteLength);
    const start = this.textOffsetForByteOffset(normalizedRange.start, "end");
    const end =
      normalizedRange.start === normalizedRange.end
        ? start
        : this.textOffsetForByteOffset(normalizedRange.end, "start");

    return validateTextRange({ start, end }, this.textLength);
  }

  byteOffsetForTextOffset(offset: CharacterOffset, bias?: OffsetBias): ByteOffset {
    if (this.segmentList.length === 0) {
      return resolveEmptyMapOffset(offset);
    }

    validateTextOffset(offset, this.textLength);

    const normalizedBias = normalizeOffsetBias(bias);
    const segment = findSegmentForOffset(this.segmentList, "text", offset, normalizedBias);

    return projectOffset({
      segment,
      offset,
      bias: normalizedBias,
      fromRange: segment.textRange,
      toRange: segment.byteRange,
      fromSpace: "text",
    });
  }

  textOffsetForByteOffset(offset: ByteOffset, bias?: OffsetBias): CharacterOffset {
    if (this.segmentList.length === 0) {
      return resolveEmptyMapOffset(offset);
    }

    validateByteOffset(offset, this.byteLength);

    const normalizedBias = normalizeOffsetBias(bias);
    const segment = findSegmentForOffset(this.segmentList, "byte", offset, normalizedBias);

    return projectOffset({
      segment,
      offset,
      bias: normalizedBias,
      fromRange: segment.byteRange,
      toRange: segment.textRange,
      fromSpace: "byte",
    });
  }

  segments(): readonly OffsetMapSegment[] {
    return this.segmentList;
  }
}

function normalizeSegments(segments: unknown): readonly OffsetMapSegment[] {
  if (!isReadonlyArray(segments)) {
    throw new TypeError("OffsetMap segments must be an array.");
  }

  const normalizedSegments: OffsetMapSegment[] = [];
  let previousByteEnd = 0;
  let previousTextEnd = 0;

  for (const [index, segment] of segments.entries()) {
    const normalizedSegment = normalizeSegment(segment, index);

    if (normalizedSegment.byteRange.start !== previousByteEnd) {
      throw new RangeError("OffsetMap byte segments must be continuous from byte offset 0.");
    }

    if (normalizedSegment.textRange.start !== previousTextEnd) {
      throw new RangeError("OffsetMap text segments must be continuous from text offset 0.");
    }

    normalizedSegments.push(normalizedSegment);
    previousByteEnd = normalizedSegment.byteRange.end;
    previousTextEnd = normalizedSegment.textRange.end;
  }

  return Object.freeze(normalizedSegments);
}

function normalizeSegment(segment: unknown, index: number): OffsetMapSegment {
  assertSegmentRecord(segment, index);

  const kind = normalizeSegmentKind(segment.kind, index);
  const byteRange = validateSourceByteRange(segment.byteRange);
  const textRange = validateTextRange(segment.textRange);

  if (isCollapsedRange(byteRange) && isCollapsedRange(textRange)) {
    throw new RangeError("OffsetMap segments must map at least one byte or text unit.");
  }

  if (kind === "identity" && rangeLength(byteRange) !== rangeLength(textRange)) {
    throw new RangeError("Identity OffsetMap segments must have equal byte and text lengths.");
  }

  return Object.freeze({
    byteRange,
    textRange,
    kind,
  });
}

interface OffsetMapSegmentRecord {
  readonly byteRange: SourceByteRange;
  readonly textRange: TextRange;
  readonly kind: unknown;
}

function assertSegmentRecord(
  segment: unknown,
  index: number,
): asserts segment is OffsetMapSegmentRecord {
  const indexLabel = index.toString();

  if (typeof segment !== "object" || segment === null) {
    throw new TypeError(`OffsetMap segment at index ${indexLabel} must be an object.`);
  }

  if (
    !("byteRange" in segment) ||
    typeof segment.byteRange !== "object" ||
    segment.byteRange === null
  ) {
    throw new TypeError(
      `OffsetMap segment at index ${indexLabel} must include a byteRange object.`,
    );
  }

  if (
    !("textRange" in segment) ||
    typeof segment.textRange !== "object" ||
    segment.textRange === null
  ) {
    throw new TypeError(
      `OffsetMap segment at index ${indexLabel} must include a textRange object.`,
    );
  }
}

function normalizeSegmentKind(kind: unknown, index: number): OffsetMapSegmentKind {
  if (typeof kind !== "string" || !isOffsetMapSegmentKind(kind)) {
    throw new RangeError(`OffsetMap segment at index ${index.toString()} has an unsupported kind.`);
  }

  return kind;
}

function isOffsetMapSegmentKind(kind: string): kind is OffsetMapSegmentKind {
  return OFFSET_MAP_SEGMENT_KINDS.includes(kind as OffsetMapSegmentKind);
}

function findSegmentForOffset(
  segments: readonly OffsetMapSegment[],
  space: OffsetSpace,
  offset: number,
  bias: OffsetBias,
): OffsetMapSegment {
  const matches = segments.filter((segment) => {
    const range = space === "byte" ? segment.byteRange : segment.textRange;
    return containsOffset(range, offset);
  });

  if (matches.length === 0) {
    throw new RangeError("Offset must be covered by an OffsetMap segment.");
  }

  const firstMatch = matches[0];
  if (firstMatch === undefined) {
    throw new RangeError("Offset must be covered by an OffsetMap segment.");
  }

  if (bias === "start") {
    return firstMatch;
  }

  const lastMatch = matches[matches.length - 1];
  if (lastMatch === undefined) {
    throw new RangeError("Offset must be covered by an OffsetMap segment.");
  }

  return lastMatch;
}

function isReadonlyArray(value: unknown): value is readonly unknown[] {
  return Array.isArray(value);
}

function containsOffset(range: SourceByteRange | TextRange, offset: number): boolean {
  if (isCollapsedRange(range)) {
    return offset === range.start;
  }

  return offset >= range.start && offset <= range.end;
}

interface ProjectOffsetOptions {
  readonly segment: OffsetMapSegment;
  readonly offset: number;
  readonly bias: OffsetBias;
  readonly fromRange: SourceByteRange | TextRange;
  readonly toRange: SourceByteRange | TextRange;
  readonly fromSpace: OffsetSpace;
}

function projectOffset(options: ProjectOffsetOptions): number {
  if (isIdentityProjection(options)) {
    return options.toRange.start + (options.offset - options.fromRange.start);
  }

  return resolveOffsetByBias({
    offset: options.offset,
    fromRange: options.fromRange,
    toRange: options.toRange,
    bias: options.bias,
  });
}

function isIdentityProjection(options: ProjectOffsetOptions): boolean {
  if (options.segment.kind !== "identity") {
    return false;
  }

  if (isCollapsedRange(options.fromRange) || isCollapsedRange(options.toRange)) {
    return false;
  }

  const byteLength = rangeLength(options.segment.byteRange);
  const textLength = rangeLength(options.segment.textRange);

  if (byteLength !== textLength) {
    return false;
  }

  const byteRange = options.segment.byteRange;
  const textRange = options.segment.textRange;

  if (options.fromSpace === "text") {
    return options.offset >= textRange.start && options.offset <= textRange.end;
  }

  return options.offset >= byteRange.start && options.offset <= byteRange.end;
}

function resolveEmptyMapOffset(offset: number): number {
  if (offset !== 0) {
    throw new RangeError("Offset must be 0 for an empty OffsetMap.");
  }

  return 0;
}

function validateTextOffset(offset: CharacterOffset, textLength: number): void {
  validateTextRange({ start: offset, end: offset }, textLength);
}

function validateByteOffset(offset: ByteOffset, byteLength: number): void {
  validateSourceByteRange({ start: offset, end: offset }, byteLength);
}
