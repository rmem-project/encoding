# ENC-004 — Публічні контракти і exports

## Мета

Зафіксувати TypeScript-контракти, через які `@rmem/md-parser` та інші інтегратори будуть використовувати бібліотеку.

## Обсяг

- Описати `EncodingInput`, `DecodeDocumentOptions`, `DetectEncodingOptions`, `DecodedDocument`, `EncodingDetectionResult`.
- Описати ranges, `OffsetMap`, `LineIndex`, `EncodingProfile`, backend info і metadata types.
- Винести публічні типи в стабільні modules і експортувати їх через `src/index.ts`.
- Відокремити public contract від internal detector/backend classes.

## Критерії виконання

- Public API відповідає розділам 6, 7, 8, 11, 14 і 16 `docs/SPEC.md`.
- Немає випадкових exports внутрішніх implementation classes.
- Публічні типи мають explicit readonly contracts там, де результат immutable.

## Межі

- Не реалізовувати behavior за цими контрактами.
- Не змінювати контракт SPEC без окремого архітектурного рішення.
