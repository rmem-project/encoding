import type { EncodingWarning } from "./diagnostics.js";
import type { EncodingDetectionResult } from "./detection.js";
import type { LineIndex, OffsetMap, SourceBuffer } from "./source.js";

export interface DecodedDocument {
  readonly text: string;
  readonly bytes: Uint8Array;
  readonly detection: EncodingDetectionResult;
  readonly lineIndex: LineIndex;
  readonly offsetMap: OffsetMap;
  readonly warnings: readonly EncodingWarning[];
  readonly source: SourceBuffer;
}
