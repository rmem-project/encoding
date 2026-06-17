# ENC-042 — Decoder policy, warnings і errors tests

## Мета

Покрити controlled decoding, errors і warnings так, щоб fatal/replace behavior був незмінним.

## Обсяг

- Тестувати invalid UTF-8 і UTF-16 при fatal policy.
- Тестувати replace policy, replacement character і confidence/warning changes.
- Тестувати backend selection, unsupported encoding і source map unavailable.
- Тестувати, що runtime messages англійською мовою.

## Критерії виконання

- Fatal policy не повертає частково успішний document.
- Replace policy має `ENCODING_INVALID_SEQUENCE_REPLACED` з ranges.
- `ENCODING_SOURCE_MAP_UNAVAILABLE` виникає, коли exact map required, але backend не може його дати.

## Межі

- Не тестувати third-party backend internals.
- Не прив'язуватися до повного тексту error message, якщо code/details достатні для контракту.
