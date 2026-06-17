# ENC-034 — Metadata для parser integration

## Мета

Надати `@rmem/md-parser` достатньо інформації для вибору native byte-safe або transcode compatibility mode.

## Обсяг

- Expose profile metadata: allowed encodings, ascii-compatible encodings, native byte-safe encodings.
- Забезпечити, що `DecodedDocument.detection` і profile data дозволяють визначити режим parser.
- Документувати contract, що parser залежить від `DecodedDocument`, а не internal classes.
- Додати tests або type-level checks для public metadata shape.

## Критерії виконання

- UTF-8 і ASCII-compatible single-byte encodings визначаються як native byte-safe.
- UTF-16LE/BE позначаються як transcode compatibility path.
- Integration example зі SPEC можна реалізувати без internal imports.

## Межі

- Не реалізовувати `@rmem/md-parser`.
- Не додавати parser-specific hacks у detector core.
