# ENC-023 — DecoderBackend contract і registry

## Мета

Створити контрольований backend layer, щоб decoding не залежав напряму від конкретної third-party бібліотеки.

## Обсяг

- Реалізувати `DecoderBackend`, `DecoderBackendInfo`, `BackendDecodeOptions`, `BackendDecodeResult`.
- Реалізувати `DecoderRegistry` з backend preference і capability checks.
- Перевіряти `exactSourceMap` вимоги перед вибором backend.
- Створювати `ENCODING_BACKEND_SUBSTITUTION` або fatal error, якщо requested backend непридатний.

## Критерії виконання

- Backend selection deterministic і залежить від profile/options.
- `rmem` profile не використовує backend без exact source map без explicit opt-in.
- Registry не приховує unsupported encoding.

## Межі

- Не реалізовувати конкретні codecs у цій задачі.
- Не робити backend function-only abstraction.
