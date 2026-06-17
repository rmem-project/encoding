export type ByteOffset = number;

export type CharacterOffset = number;

export type OffsetBias = "start" | "end" | "nearest";

export type OffsetMapSegmentKind = "identity" | "encoded" | "bom" | "replacement" | "synthetic";

export interface SourceByteRange {
  readonly start: ByteOffset;
  readonly end: ByteOffset;
}

export interface TextRange {
  readonly start: CharacterOffset;
  readonly end: CharacterOffset;
}

export interface SourceBuffer {
  readonly byteLength: number;
  readonly bytes: Uint8Array;
  slice(range?: SourceByteRange): Uint8Array;
}

export interface OffsetMapSegment {
  readonly byteRange: SourceByteRange;
  readonly textRange: TextRange;
  readonly kind: OffsetMapSegmentKind;
}

export interface OffsetMap {
  byteRangeForTextRange(range: TextRange): SourceByteRange;
  textRangeForByteRange(range: SourceByteRange): TextRange;
  byteOffsetForTextOffset(offset: CharacterOffset, bias?: OffsetBias): ByteOffset;
  textOffsetForByteOffset(offset: ByteOffset, bias?: OffsetBias): CharacterOffset;
  segments(): readonly OffsetMapSegment[];
}

export interface SourcePosition {
  readonly byteOffset: ByteOffset;
  readonly characterOffset: CharacterOffset;
  readonly line: number;
  readonly column: number;
}

export interface LineIndex {
  readonly lineCount: number;
  lineStartOffset(line: number): CharacterOffset;
  lineEndOffset(line: number): CharacterOffset;
  lineTextRange(line: number, includeLineEnding?: boolean): TextRange;
  lineByteRange(line: number, includeLineEnding?: boolean): SourceByteRange;
  positionAtTextOffset(offset: CharacterOffset): SourcePosition;
  positionAtByteOffset(offset: ByteOffset, bias?: OffsetBias): SourcePosition;
}
