import type { OffsetBias, SourceByteRange, TextRange } from "../contracts/source.js";

export interface OffsetProjectionOptions {
  readonly offset: number;
  readonly fromRange: SourceByteRange | TextRange;
  readonly toRange: SourceByteRange | TextRange;
  readonly bias?: OffsetBias;
}

type RangeLabel = "source byte range" | "text range";

const OFFSET_BIASES = Object.freeze(["start", "end", "nearest"] as const);

export function normalizeSourceByteRange(
  range: SourceByteRange | undefined,
  byteLength: number,
): SourceByteRange {
  assertRangeBound("source byte length", byteLength);

  if (range === undefined) {
    return freezeRange({ start: 0, end: byteLength });
  }

  return validateRange(range, "source byte range", byteLength);
}

export function normalizeTextRange(range: TextRange | undefined, textLength: number): TextRange {
  assertRangeBound("text length", textLength);

  if (range === undefined) {
    return freezeRange({ start: 0, end: textLength });
  }

  return validateRange(range, "text range", textLength);
}

export function validateSourceByteRange(
  range: SourceByteRange,
  byteLength?: number,
): SourceByteRange {
  return validateRange(range, "source byte range", byteLength);
}

export function validateTextRange(range: TextRange, textLength?: number): TextRange {
  return validateRange(range, "text range", textLength);
}

export function normalizeOffsetBias(bias: OffsetBias | undefined): OffsetBias {
  if (bias === undefined) {
    return "nearest";
  }

  assertOffsetBias(bias);
  return bias;
}

export function assertOffsetBias(value: unknown): asserts value is OffsetBias {
  if (typeof value !== "string" || !OFFSET_BIASES.includes(value as OffsetBias)) {
    throw new RangeError("Offset bias must be one of: start, end, nearest.");
  }
}

export function isCollapsedRange(range: SourceByteRange | TextRange): boolean {
  return range.start === range.end;
}

export function rangeLength(range: SourceByteRange | TextRange): number {
  return range.end - range.start;
}

export function resolveOffsetByBias(options: OffsetProjectionOptions): number {
  const bias = normalizeOffsetBias(options.bias);
  const fromRange = validateRange(options.fromRange, "source range");
  const toRange = validateRange(options.toRange, "target range");
  const { offset } = options;

  assertOffset("offset", offset);

  if (offset < fromRange.start || offset > fromRange.end) {
    throw new RangeError("Offset must be within range bounds.");
  }

  if (offset === fromRange.start && offset === fromRange.end) {
    return resolveTargetBoundary(toRange, bias);
  }

  if (offset === fromRange.start) {
    return toRange.start;
  }

  if (offset === fromRange.end) {
    return toRange.end;
  }

  if (isCollapsedRange(toRange)) {
    return toRange.start;
  }

  switch (bias) {
    case "start":
      return toRange.start;
    case "end":
      return toRange.end;
    case "nearest":
      return nearestBoundary(offset, fromRange) === "start" ? toRange.start : toRange.end;
  }
}

function validateRange<TRange extends SourceByteRange | TextRange>(
  range: TRange,
  label: RangeLabel | "source range" | "target range",
  length?: number,
): TRange {
  assertOffset(`${label} start`, range.start);
  assertOffset(`${label} end`, range.end);

  if (range.start > range.end) {
    throw new RangeError(`${capitalize(label)} end must be greater than or equal to start.`);
  }

  if (length !== undefined) {
    assertRangeBound(`${label} length`, length);

    if (range.end > length) {
      throw new RangeError(`${capitalize(label)} end must be within bounds.`);
    }
  }

  return freezeRange(range);
}

function assertOffset(name: string, offset: number): void {
  if (!Number.isSafeInteger(offset)) {
    throw new RangeError(`${capitalize(name)} must be a safe integer.`);
  }

  if (offset < 0) {
    throw new RangeError(`${capitalize(name)} must be greater than or equal to 0.`);
  }
}

function assertRangeBound(name: string, length: number): void {
  if (!Number.isSafeInteger(length)) {
    throw new RangeError(`${capitalize(name)} must be a safe integer.`);
  }

  if (length < 0) {
    throw new RangeError(`${capitalize(name)} must be greater than or equal to 0.`);
  }
}

function resolveTargetBoundary(range: SourceByteRange | TextRange, bias: OffsetBias): number {
  if (bias === "start") {
    return range.start;
  }

  return range.end;
}

function nearestBoundary(offset: number, range: SourceByteRange | TextRange): "start" | "end" {
  const distanceToStart = offset - range.start;
  const distanceToEnd = range.end - offset;

  return distanceToStart < distanceToEnd ? "start" : "end";
}

function freezeRange<TRange extends SourceByteRange | TextRange>(range: TRange): TRange {
  return Object.freeze({
    start: range.start,
    end: range.end,
  }) as TRange;
}

function capitalize(value: string): string {
  return `${value.charAt(0).toUpperCase()}${value.slice(1)}`;
}
