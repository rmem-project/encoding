import type { SourceBuffer as SourceBufferContract, SourceByteRange } from "../contracts/source.js";
import { normalizeSourceByteRange } from "./ranges.js";

export type SourceBufferInput = ArrayBuffer | Uint8Array;

export function createSourceBuffer(input: SourceBufferInput): SourceBufferContract {
  return new ImmutableSourceBuffer(copyInputBytes(input));
}

export function createSourceBufferFromChunks(chunks: Iterable<Uint8Array>): SourceBufferContract {
  return new ImmutableSourceBuffer(concatenateChunks(chunks));
}

class ImmutableSourceBuffer implements SourceBufferContract {
  private readonly storage: Uint8Array;

  constructor(ownedBytes: Uint8Array) {
    this.storage = ownedBytes;
    Object.freeze(this);
  }

  get byteLength(): number {
    return this.storage.byteLength;
  }

  get bytes(): Uint8Array {
    return copyBytes(this.storage);
  }

  slice(range?: SourceByteRange): Uint8Array {
    const normalizedRange = normalizeSourceByteRange(range, this.storage.byteLength);
    return copyBytes(this.storage.subarray(normalizedRange.start, normalizedRange.end));
  }
}

function copyInputBytes(input: SourceBufferInput): Uint8Array {
  if (input instanceof Uint8Array) {
    return copyBytes(input);
  }

  if (input instanceof ArrayBuffer) {
    return copyBytes(new Uint8Array(input));
  }

  throw new TypeError("SourceBuffer input must be a Uint8Array or ArrayBuffer.");
}

function concatenateChunks(chunks: Iterable<Uint8Array>): Uint8Array {
  const chunkList: Uint8Array[] = [];
  let byteLength = 0;

  for (const chunk of chunks) {
    if (!(chunk instanceof Uint8Array)) {
      throw new TypeError("SourceBuffer chunks must be Uint8Array instances.");
    }

    if (byteLength > Number.MAX_SAFE_INTEGER - chunk.byteLength) {
      throw new RangeError("SourceBuffer byte length exceeds the maximum safe integer.");
    }

    chunkList.push(chunk);
    byteLength += chunk.byteLength;
  }

  const bytes = new Uint8Array(byteLength);
  let offset = 0;

  for (const chunk of chunkList) {
    bytes.set(chunk, offset);
    offset += chunk.byteLength;
  }

  return bytes;
}

function copyBytes(bytes: Uint8Array): Uint8Array {
  return new Uint8Array(bytes);
}
