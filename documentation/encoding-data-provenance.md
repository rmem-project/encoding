# Encoding Data Provenance

This package embeds a small amount of encoding support data so the native backend can decode and
encode the v1 supported encodings without runtime dependencies.

Embedded data currently lives in:

- `src/encoding/EncodingRegistry.ts` - canonical encoding names, accepted labels, aliases, and
  web-compatible label remapping;
- `src/encoding/SingleByteEncoding.ts` - high-byte mapping tables for `windows-1251`,
  `windows-1252`, `iso-8859-1`, `iso-8859-5`, `koi8-r`, and `cp866`;
- UTF-8 and UTF-16 validators/decoders - behavior for scalar values, surrogate handling, BOM
  handling, and replacement semantics.

## Sources

The current embedded data was audited on 2026-06-20 against these sources:

- WHATWG Encoding Standard: <https://encoding.spec.whatwg.org/>
- WHATWG encoding repository: <https://github.com/whatwg/encoding>
- WHATWG data files used for table verification: `encodings.json`, `index-windows-1251.txt`,
  `index-windows-1252.txt`, `index-iso-8859-5.txt`, `index-koi8-r.txt`, and `index-ibm866.txt`
- Unicode License v3 and Unicode materials: <https://www.unicode.org/license.txt>
- IANA Character Sets registry: <https://www.iana.org/assignments/character-sets/character-sets.xhtml>

The IANA registry is reference-only for this package. Runtime mapping tables, label tables, and
heuristics do not copy IANA registry rows, contact data, or registry text.

## Current Process

The project does not currently use a generator script for encoding tables. The checked-in tables are
manual source snapshots with explicit review steps:

- Compare every supported label and alias against the WHATWG `encodings.json` data and include only
  labels supported by the package's v1 public contract.
- Keep strict label behavior separate from `webCompat` remapping. In `webCompat`, labels such as
  `iso-8859-1`, `latin1`, and `us-ascii` resolve to `windows-1252` by policy.
- Compare each `0x80` through `0xFF` high-byte slot in the supported WHATWG index files against
  `SingleByteEncoding.ts`.
- Represent unsupported single-byte slots as the package-local `UNMAPPED_CODE_POINT` sentinel.
- Generate reverse encode maps at runtime from the reviewed decode tables, not from a second copied
  source table.
- Keep `iso-8859-1` as a formulaic linear table from `0x80` through `0xFF`; it is not copied from a
  registry file.
- Record the source URLs and audit date in `NOTICE` whenever embedded encoding data changes.

If a future change introduces generated tables, the generator must be checked in with documented
inputs, source URLs, snapshot date or commit, transform rules, and verification tests. Generated
output must preserve the third-party notice requirements in `NOTICE`.
