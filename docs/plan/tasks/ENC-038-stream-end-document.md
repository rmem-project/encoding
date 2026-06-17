# ENC-038 — DecodingStream.end

## Мета

Реалізувати завершення stream і повернення повного `DecodedDocument`, еквівалентного high-level decode result для тих самих bytes.

## Обсяг

- Фіналізувати pending decoder state.
- Об'єднати accumulated chunks у final text, source buffer, offset map, line index і warnings.
- Перевірити stream invariants і immutable result.
- Забезпечити коректний split CRLF handling між chunks.

## Критерії виконання

- `end()` повертає повний `DecodedDocument`.
- Result узгоджується з `decodeDocument` для того самого byte sequence.
- Split CRLF між chunks дає один line break у `LineIndex`.

## Межі

- Не дозволяти `write` після `end` без контрольованої помилки.
- Не повертати partial document після fatal finalization error.
