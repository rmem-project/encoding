import type { DecodeDocumentOptions } from "./encoding.js";
import type { DecodedDocument } from "./document.js";
import type { EncodingWarning } from "./diagnostics.js";
import type { EncodingDetectionResult } from "./detection.js";
import type { OffsetMap, SourceByteRange, TextRange } from "./source.js";

export interface DecodedChunk {
  readonly text: string;
  readonly byteRange: SourceByteRange;
  readonly charRange: TextRange;
  readonly offsetMap: OffsetMap;
  readonly warnings: readonly EncodingWarning[];
}

export interface DecodingStream {
  readonly detection: EncodingDetectionResult | undefined;
  write(chunk: Uint8Array): readonly DecodedChunk[];
  end(): DecodedDocument;
}

export type CreateDecodingStreamFunction = (options?: DecodeDocumentOptions) => DecodingStream;
