# ENC-009 — Exact OffsetMap builders

## Мета

Реалізувати побудову exact source maps для UTF-8, UTF-16LE/BE і single-byte legacy encodings.

## Обсяг

- Додати builder для identity/ascii-compatible single-byte mappings.
- Додати builder для UTF-8 з урахуванням multibyte code units і invalid sequence policy.
- Додати builder для UTF-16LE/BE з урахуванням surrogate pairs.
- Додати BOM і replacement segment generation.

## Критерії виконання

- Exact map будується для всіх canonical encodings v1.
- Replacement policy створює `replacement` segments із original invalid byte ranges.
- Fatal policy не повертає часткову successful map після invalid sequence.

## Межі

- Не реалізовувати сам decoder backend.
- Не підтримувати encoding поза v1 canonical set.
