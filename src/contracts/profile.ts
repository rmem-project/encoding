import type { RmemEncodingName } from "./encoding.js";

export interface EncodingProfile {
  readonly name: string;
  readonly allowedEncodings: readonly RmemEncodingName[];
  readonly asciiCompatibleEncodings: readonly RmemEncodingName[];
  readonly nativeByteSafeEncodings: readonly RmemEncodingName[];
  readonly defaultEncoding: RmemEncodingName;
  readonly minConfidence: number;
  readonly legacyHeuristics: boolean;
  readonly utf16Heuristics: boolean;
  readonly metadataSniffing: boolean;
}
