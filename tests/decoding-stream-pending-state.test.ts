import { describe, expect, it } from "vitest";

import { EncodingError, createDecodingStream } from "../src/index.js";
import type { DecodedChunk } from "../src/index.js";

describe("DecodingStream pending state", () => {
  it("carries pending UTF-8 bytes across chunk boundaries", () => {
    const stream = createDecodingStream({
      explicitEncoding: "utf-8",
      sampleSizeBytes: 1,
    });

    expect(stream.write(new Uint8Array([0xd0]))).toEqual([]);

    const chunk = onlyChunk(stream.write(new Uint8Array([0x96, 0x21])));

    expect(chunk.text).toBe("Ж!");
    expect(chunk.byteRange).toEqual({ start: 0, end: 3 });
    expect(chunk.charRange).toEqual({ start: 0, end: 2 });
    expect(chunk.offsetMap.segments()).toEqual([
      {
        byteRange: { start: 0, end: 2 },
        textRange: { start: 0, end: 1 },
        kind: "encoded",
      },
      {
        byteRange: { start: 2, end: 3 },
        textRange: { start: 1, end: 2 },
        kind: "identity",
      },
    ]);
  });

  it("carries pending UTF-16 code-unit bytes across chunk boundaries", () => {
    const stream = createDecodingStream({
      explicitEncoding: "utf-16le",
      sampleSizeBytes: 1,
    });

    expect(stream.write(new Uint8Array([0x16]))).toEqual([]);

    const chunk = onlyChunk(stream.write(new Uint8Array([0x04, 0x21, 0x00])));

    expect(chunk.text).toBe("Ж!");
    expect(chunk.byteRange).toEqual({ start: 0, end: 4 });
    expect(chunk.charRange).toEqual({ start: 0, end: 2 });
    expect(chunk.offsetMap.segments()).toEqual([
      {
        byteRange: { start: 0, end: 2 },
        textRange: { start: 0, end: 1 },
        kind: "encoded",
      },
      {
        byteRange: { start: 2, end: 4 },
        textRange: { start: 1, end: 2 },
        kind: "encoded",
      },
    ]);
  });

  it("carries pending UTF-16 surrogate pairs across chunk boundaries", () => {
    const stream = createDecodingStream({
      explicitEncoding: "utf-16le",
      sampleSizeBytes: 1,
    });

    expect(stream.write(new Uint8Array([0x3d, 0xd8]))).toEqual([]);

    const chunk = onlyChunk(stream.write(new Uint8Array([0x00, 0xde, 0x21, 0x00])));

    expect(chunk.text).toBe("😀!");
    expect(chunk.byteRange).toEqual({ start: 0, end: 6 });
    expect(chunk.charRange).toEqual({ start: 0, end: 3 });
    expect(chunk.offsetMap.segments()).toEqual([
      {
        byteRange: { start: 0, end: 4 },
        textRange: { start: 0, end: 2 },
        kind: "encoded",
      },
      {
        byteRange: { start: 4, end: 6 },
        textRange: { start: 2, end: 3 },
        kind: "encoded",
      },
    ]);
  });

  it("throws an incomplete stream sequence error for fatal finalization", () => {
    const stream = createDecodingStream({
      explicitEncoding: "utf-8",
      sampleSizeBytes: 1,
    });

    expect(stream.write(new Uint8Array([0xe2, 0x82]))).toEqual([]);

    try {
      stream.end();
      throw new Error("Expected stream finalization to fail.");
    } catch (error) {
      expect(error).toBeInstanceOf(EncodingError);
      expect((error as EncodingError).code).toBe("ENCODING_INCOMPLETE_STREAM_SEQUENCE");
      expect((error as EncodingError).byteRange).toEqual({ start: 0, end: 2 });
      expect((error as EncodingError).details).toMatchObject({
        backend: "native",
        encoding: "utf-8",
        reason: "Incomplete UTF-8 sequence.",
      });
    }
  });

  it("replaces an incomplete final sequence with a warning and replacement segment", () => {
    const stream = createDecodingStream({
      explicitEncoding: "utf-16le",
      replacementPolicy: "replace",
      sampleSizeBytes: 1,
    });

    expect(stream.write(new Uint8Array([0x3d, 0xd8]))).toEqual([]);

    const document = stream.end();

    expect(document.text).toBe("\uFFFD");
    expect(document.offsetMap.segments()).toEqual([
      {
        byteRange: { start: 0, end: 2 },
        textRange: { start: 0, end: 1 },
        kind: "replacement",
      },
    ]);
    expect(document.warnings).toHaveLength(1);
    expect(document.warnings[0]).toMatchObject({
      code: "ENCODING_INCOMPLETE_STREAM_SEQUENCE",
      byteRange: { start: 0, end: 2 },
      textRange: { start: 0, end: 1 },
      details: {
        backend: "native",
        encoding: "utf-16le",
        reason: "Incomplete UTF-16 surrogate pair.",
        replacementCharacter: "\uFFFD",
      },
    });
  });

  it("keeps pending state isolated between stream instances", () => {
    const first = createDecodingStream({
      explicitEncoding: "utf-8",
      sampleSizeBytes: 1,
    });
    const second = createDecodingStream({
      explicitEncoding: "utf-8",
      sampleSizeBytes: 1,
    });

    expect(first.write(new Uint8Array([0xd0]))).toEqual([]);
    expect(onlyChunk(second.write(new Uint8Array([0x41]))).text).toBe("A");
    expect(onlyChunk(first.write(new Uint8Array([0x96]))).text).toBe("Ж");
  });
});

function onlyChunk(chunks: readonly DecodedChunk[]): DecodedChunk {
  expect(chunks).toHaveLength(1);

  const chunk = chunks[0];
  if (chunk === undefined) {
    throw new Error("Expected one decoded chunk.");
  }

  return chunk;
}
