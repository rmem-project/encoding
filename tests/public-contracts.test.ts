import { describe, expectTypeOf, it } from "vitest";

import type {
  DecodeDocumentOptions,
  DecodedDocument,
  EncodingDetectionResult,
  EncodingInput,
  EncodingProfile,
  LineIndex,
  OffsetMap,
  SourceByteRange,
} from "../src/index.js";

describe("public contracts", () => {
  it("exports core source, detection and profile contracts from the package root", () => {
    expectTypeOf<DecodeDocumentOptions>().toExtend<{
      readonly profile?: string | EncodingProfile;
      readonly explicitEncoding?: string;
      readonly allowedEncodings?: readonly string[];
    }>();

    expectTypeOf<DecodedDocument>().toExtend<{
      readonly text: string;
      readonly detection: EncodingDetectionResult;
      readonly lineIndex: LineIndex;
      readonly offsetMap: OffsetMap;
      readonly warnings: readonly unknown[];
    }>();

    expectTypeOf<string>().toExtend<EncodingInput>();
    expectTypeOf<Uint8Array>().toExtend<EncodingInput>();
    expectTypeOf<ArrayBuffer>().toExtend<EncodingInput>();
    expectTypeOf<Iterable<Uint8Array>>().toExtend<EncodingInput>();
    expectTypeOf<AsyncIterable<Uint8Array>>().toExtend<EncodingInput>();
    expectTypeOf<ReadableStream<Uint8Array>>().toExtend<EncodingInput>();

    expectTypeOf<OffsetMap["byteRangeForTextRange"]>().returns.toExtend<SourceByteRange>();
  });
});
