# ENC-014 — Built-in encoding profiles

## Мета

Реалізувати профілі як політики detection/decoding, а не як прості aliases.

## Обсяг

- Реалізувати `strictUtf8`, `rmem`, `legacyCyrillic`, `webCompat`.
- Зафіксувати allowed encodings, native byte-safe encodings, default encoding, minConfidence і feature flags.
- Забезпечити можливість custom `EncodingProfile`.
- Врахувати профільні defaults для legacy heuristics, UTF-16 heuristics і metadata sniffing.

## Критерії виконання

- `rmem` є default profile для CLI/import сценарію.
- `strictUtf8` не робить silent fallback до legacy encoding.
- `legacyCyrillic` фокусується на Cyrillic candidates.
- `webCompat` підтримує WHATWG label behavior і metadata sniffing.

## Межі

- Не реалізовувати самі detectors.
- Не створювати universal auto-detect everything profile як default.
