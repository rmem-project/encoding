# ENC-008 — Segment-based OffsetMap

## Мета

Реалізувати `OffsetMap` як segment-based структуру, а не per-character масив, щоб мапінг був точним і масштабувався для великих документів.

## Обсяг

- Реалізувати `OffsetMapSegment` з kinds `identity`, `encoded`, `bom`, `replacement`, `synthetic`.
- Реалізувати lookup APIs: byte/text range conversion і offset conversion з bias.
- Забезпечити stable immutable `segments()`.
- Додати validation неперервності та монотонності segments.

## Критерії виконання

- `OffsetMap` коректно мапить ranges в обидва боки.
- Collapsed і replacement segments мають передбачувану поведінку.
- API не розкриває mutable внутрішні масиви.

## Межі

- Не реалізовувати encoding-specific builders; це задача `ENC-009`.
- Не робити per-character map за замовчуванням.
