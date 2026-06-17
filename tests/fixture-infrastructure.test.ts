import { describe, expect, it } from "vitest";

import { fixtureIds, loadFixture, readFixtureManifest } from "./support/fixtures.js";

describe("fixture infrastructure", () => {
  it("loads fixture bytes without text decoding", async () => {
    const fixture = await loadFixture("infrastructure-invalid-utf8");

    expect([...fixture.bytes]).toEqual([0x61, 0xc3, 0x28, 0x62]);
    expect(fixture.metadata.expected.detection?.warnings ?? []).toContain(
      "ENCODING_INVALID_SEQUENCE_REPLACED",
    );
  });

  it("exposes stable fixture ids from the manifest", async () => {
    const manifest = await readFixtureManifest();

    expect(fixtureIds(manifest)).toEqual(["infrastructure-invalid-utf8"]);
  });
});
