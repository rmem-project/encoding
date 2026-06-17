import type {
  ByteOffset,
  CharacterOffset,
  LineIndex,
  OffsetBias,
  OffsetMap,
  SourceByteRange,
  SourcePosition,
  TextRange,
} from "../contracts/source.js";
import { validateTextRange } from "./ranges.js";

interface LineRecord {
  readonly start: CharacterOffset;
  readonly end: CharacterOffset;
  readonly endIncludingLineEnding: CharacterOffset;
}

const LF = 0x0a;
const CR = 0x0d;

export function createLineIndex(text: string, offsetMap: OffsetMap): LineIndex {
  return new ImmutableLineIndex(text, offsetMap);
}

class ImmutableLineIndex implements LineIndex {
  private readonly records: readonly LineRecord[];

  private readonly textLength: number;

  private readonly offsetMap: OffsetMap;

  constructor(text: string, offsetMap: OffsetMap) {
    assertTextInput(text);

    this.records = buildLineRecords(text);
    this.textLength = text.length;
    this.offsetMap = offsetMap;
    Object.freeze(this);
  }

  get lineCount(): number {
    return this.records.length;
  }

  lineStartOffset(line: number): CharacterOffset {
    return this.getLineRecord(line).start;
  }

  lineEndOffset(line: number): CharacterOffset {
    return this.getLineRecord(line).end;
  }

  lineTextRange(line: number, includeLineEnding = false): TextRange {
    const record = this.getLineRecord(line);
    const end = includeLineEnding ? record.endIncludingLineEnding : record.end;

    return validateTextRange({ start: record.start, end }, this.textLength);
  }

  lineByteRange(line: number, includeLineEnding = false): SourceByteRange {
    return this.offsetMap.byteRangeForTextRange(this.lineTextRange(line, includeLineEnding));
  }

  positionAtTextOffset(offset: CharacterOffset): SourcePosition {
    validateTextRange({ start: offset, end: offset }, this.textLength);

    const lineIndex = this.findLineIndexForOffset(offset);
    const record = this.getLineRecordByIndex(lineIndex);
    const byteOffset = this.offsetMap.byteOffsetForTextOffset(offset);

    return Object.freeze({
      byteOffset,
      characterOffset: offset,
      line: lineIndex + 1,
      column: columnForOffset(offset, record),
    });
  }

  positionAtByteOffset(offset: ByteOffset, bias?: OffsetBias): SourcePosition {
    const characterOffset = this.offsetMap.textOffsetForByteOffset(offset, bias);
    const textPosition = this.positionAtTextOffset(characterOffset);

    return Object.freeze({
      byteOffset: offset,
      characterOffset,
      line: textPosition.line,
      column: textPosition.column,
    });
  }

  private getLineRecord(line: number): LineRecord {
    validateLineNumber(line, this.records.length);
    return this.getLineRecordByIndex(line - 1);
  }

  private getLineRecordByIndex(index: number): LineRecord {
    const record = this.records[index];

    if (record === undefined) {
      throw new RangeError("Line index is outside the indexed line bounds.");
    }

    return record;
  }

  private findLineIndexForOffset(offset: CharacterOffset): number {
    let low = 0;
    let high = this.records.length - 1;
    let found = 0;

    while (low <= high) {
      const middle = Math.floor((low + high) / 2);
      const record = this.getLineRecordByIndex(middle);

      if (record.start <= offset) {
        found = middle;
        low = middle + 1;
      } else {
        high = middle - 1;
      }
    }

    return found;
  }
}

function buildLineRecords(text: string): readonly LineRecord[] {
  const records: LineRecord[] = [];
  let lineStart = 0;
  let offset = 0;

  while (offset < text.length) {
    const codeUnit = text.charCodeAt(offset);
    const lineEndingLength = lineEndingLengthAt(text, offset, codeUnit);

    if (lineEndingLength === 0) {
      offset += 1;
      continue;
    }

    const endIncludingLineEnding = offset + lineEndingLength;
    records.push(createLineRecord(lineStart, offset, endIncludingLineEnding));
    lineStart = endIncludingLineEnding;
    offset = endIncludingLineEnding;
  }

  records.push(createLineRecord(lineStart, text.length, text.length));
  return Object.freeze(records);
}

function lineEndingLengthAt(text: string, offset: number, codeUnit: number): number {
  if (codeUnit === LF) {
    return 1;
  }

  if (codeUnit !== CR) {
    return 0;
  }

  return text.charCodeAt(offset + 1) === LF ? 2 : 1;
}

function createLineRecord(
  start: CharacterOffset,
  end: CharacterOffset,
  endIncludingLineEnding: CharacterOffset,
): LineRecord {
  return Object.freeze({ start, end, endIncludingLineEnding });
}

function columnForOffset(offset: CharacterOffset, record: LineRecord): number {
  const clampedOffset = offset <= record.end ? offset : record.end;
  return clampedOffset - record.start + 1;
}

function validateLineNumber(line: number, lineCount: number): void {
  if (!Number.isSafeInteger(line)) {
    throw new RangeError("Line number must be a safe integer.");
  }

  if (line < 1 || line > lineCount) {
    throw new RangeError("Line number must be within indexed line bounds.");
  }
}

function assertTextInput(text: string): void {
  if (typeof text !== "string") {
    throw new TypeError("LineIndex text input must be a string.");
  }
}
