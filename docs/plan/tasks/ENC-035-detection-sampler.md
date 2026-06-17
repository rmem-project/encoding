# ENC-035 — DetectionSampler

## Мета

Реалізувати stream sampling без втрати original chunk boundaries і без передчасного decoding.

## Обсяг

- Збирати sample до `sampleSizeBytes` або до достатнього detection decision.
- Зберігати buffered chunks для подальшого decoding після detection.
- Підтримати BOM і multibyte sequence edge cases на межах chunks.
- Забезпечити deterministic behavior для однакового stream input.

## Критерії виконання

- `write` може повертати порожній результат до завершення sampling.
- Sampling не втрачає bytes і не змінює order chunks.
- Sample size policy узгоджена з options/profile.

## Межі

- Не реалізовувати `DecodingStream.write` output.
- Не будувати повний `DecodedDocument` у sampler.
