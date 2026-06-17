# ENC-027 — Controlled decoding policy

## Мета

Реалізувати політики `fatal` і `replace` однаково для всіх backend families.

## Обсяг

- Застосовувати default `replacementPolicy: "fatal"` для `rmem` і `strictUtf8`.
- Реалізувати `replacementCharacter`, default `"\uFFFD"`.
- Знижувати confidence або додавати warnings при replacement decoding.
- Гарантувати, що fatal policy не повертає partially decoded successful result.

## Критерії виконання

- Invalid bytes при fatal policy дають `ENCODING_INVALID_SEQUENCE`.
- Replace policy дає `ENCODING_INVALID_SEQUENCE_REPLACED` з byte/text ranges.
- Policy behavior однаковий для sync, async і stream APIs.

## Межі

- Не змінювати detection decision post factum без structured warning.
- Не робити automatic repair пошкоджених файлів.
