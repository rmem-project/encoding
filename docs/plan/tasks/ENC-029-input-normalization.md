# ENC-029 — Input normalization

## Мета

Реалізувати прийом усіх типів `EncodingInput` і привести їх до внутрішнього source representation.

## Обсяг

- Підтримати `Uint8Array`, `ArrayBuffer`, `Iterable<Uint8Array>`, `AsyncIterable<Uint8Array>`, `ReadableStream<Uint8Array>` і `string`.
- Для sync API заборонити async-only inputs.
- Зберігати chunk boundaries для stream sampling там, де це потрібно.
- Перевіряти некоректні chunk types і порожні inputs.

## Критерії виконання

- Однакові bytes з різних input forms дають однаковий decoded result.
- Async inputs не приймаються `decodeDocumentSync`.
- Input normalization не декодує текст до detection decision, окрім string input mode.

## Межі

- Не реалізовувати high-level pipeline.
- Не втрачати original byte order і chunk boundaries.
