# ENC-031 — decodeDocument

## Мета

Реалізувати асинхронний high-level API для всіх `EncodingInput`, включно зі stream-like inputs.

## Обсяг

- Приймати всі input forms зі SPEC.
- Акуратно збирати або семплювати bytes без втрати source buffer.
- Повторно використовувати спільний decode core із sync pipeline.
- Кидати `EncodingError` для fatal states.

## Критерії виконання

- `decodeDocument` повертає `Promise<DecodedDocument>`.
- Async iterable і `ReadableStream` сценарії декодуються коректно.
- Результат для повністю зібраного async input збігається з sync result для тих самих bytes.

## Межі

- Не реалізовувати incremental chunk output; це `DecodingStream`.
- Не приховувати stream read errors.
