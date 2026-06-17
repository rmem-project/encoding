# ENC-041 — Source map і LineIndex tests

## Мета

Довести коректність byte/text mapping і line позиціонування для всіх підтримуваних encoding families.

## Обсяг

- Тестувати `OffsetMap` для UTF-8, UTF-16LE/BE і single-byte encodings.
- Тестувати BOM segments, replacement segments і synthetic segments.
- Тестувати LF, CRLF, CR, mixed endings і trailing newline.
- Тестувати `positionAtByteOffset` і `positionAtTextOffset` з bias.

## Критерії виконання

- Key ranges з fixtures мапляться в обидва боки.
- CRLF рахується як один line break.
- Boundary і collapsed segment behavior зафіксовані тестами.

## Межі

- Не тестувати full detector pipeline, якщо source model можна протестувати із контрольним decoded input.
- Не використовувати snapshots замість явних behavioral assertions для критичних ranges.
