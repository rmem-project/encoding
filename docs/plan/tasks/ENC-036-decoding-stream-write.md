# ENC-036 — DecodingStream.write

## Мета

Реалізувати incremental stream decoding після фіксації detection.

## Обсяг

- Реалізувати `createDecodingStream(options)` і `write(chunk)`.
- Після detection декодувати chunks інкрементально.
- Повертати `DecodedChunk` з text, byteRange, charRange, offsetMap і warnings.
- Підтримувати stable accumulated char offsets.

## Критерії виконання

- До detection `write` може повертати `[]`.
- Після detection chunks мають коректні byte і char ranges.
- Chunk offset maps сумісні з фінальним document offset map.

## Межі

- Не завершувати stream у `write`.
- Не ламати multibyte sequences на межах chunks; pending state обробляється в `ENC-037`.
