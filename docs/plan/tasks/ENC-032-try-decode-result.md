# ENC-032 — tryDecodeDocument

## Мета

Надати API без throw, щоб вищі шари могли перетворювати encoding failures у власні diagnostics.

## Обсяг

- Реалізувати `tryDecodeDocument(input, options)`.
- Обгорнути successful result і fatal `EncodingError` у `EncodingResult<DecodedDocument>`.
- Зберігати warnings і details у failure branch.
- Додати tests, що fatal errors не викидаються назовні.

## Критерії виконання

- API не кидає `EncodingError` для очікуваних fatal decoding states.
- Failure result містить code, message, ranges, details і warnings.
- Не-encoding programming errors не маскуються як successful result.

## Межі

- Не змінювати behavior `decodeDocument`.
- Не втрачати stack/error identity там, де це важливо для debugging.
