# ENC-039 — Мінімальний fixture corpus

## Мета

Створити fixtures зі SPEC, які будуть основою acceptance coverage для v1.

## Обсяг

- Додати fixtures: `utf8-no-bom.md`, `utf8-bom.md`, `utf8-invalid-sequence.md`, `utf16le-bom.md`, `utf16be-bom.md`.
- Додати legacy fixtures: `windows1251-uk.md`, `windows1252-latin.md`, `koi8r-cyrillic.md`, `cp866-cyrillic.md`, `iso8859-5-cyrillic.md`.
- Додати edge fixtures: `ambiguous-ascii.md`, `html-meta-windows1251.md`, `stream-split-utf8.md`, `stream-split-crlf.md`.
- Для кожного fixture описати expected text, detection, confidence, BOM length, warnings, line index і key offset ranges.

## Критерії виконання

- Fixtures зберігаються як bytes без автоматичного перекодування.
- Кожен fixture має metadata expectations.
- Corpus покриває всі acceptance bullets зі SPEC на мінімальному рівні.

## Межі

- Не писати всі tests у цій задачі.
- Не додавати великі documents, якщо малий focused fixture достатній.
