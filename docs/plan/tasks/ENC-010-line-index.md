# ENC-010 — LineIndex без нормалізації line endings

## Мета

Реалізувати `LineIndex`, який працює з decoded text і `OffsetMap`, не змінюючи line endings документа.

## Обсяг

- Реалізувати line counting для LF, CRLF і CR.
- Реалізувати `lineStartOffset`, `lineEndOffset`, `lineTextRange`, `lineByteRange`.
- Реалізувати `positionAtTextOffset` і `positionAtByteOffset`.
- Забезпечити 1-based line і column numbering.

## Критерії виконання

- CRLF рахується як один line break.
- `lineByteRange` використовує `OffsetMap` і повертає original byte ranges.
- Empty files, trailing newline і mixed line endings покриті тестами.

## Межі

- Не нормалізувати line endings.
- Не переводити `CharacterOffset` у code points; v1 використовує UTF-16 code units.
