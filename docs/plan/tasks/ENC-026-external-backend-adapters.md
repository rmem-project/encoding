# ENC-026 — Optional external backend adapters

## Мета

Додати адаптери до external backends тільки там, де вони не порушують source map contract.

## Обсяг

- Оцінити і підключити `TextDecoder`, `iconv-lite` або `@exodus/bytes` як optional backends.
- Позначати `exactSourceMap` чесно для кожного backend.
- Дозволити використання non-exact backend лише при `sourceMap: "none"` або explicit opt-in.
- Додати tests для backend substitution і unsupported capability.

## Критерії виконання

- External backend не може тихо замінити exact backend у `rmem` profile.
- Package не ламається без optional dependency, якщо вона справді optional.
- Backend info містить name і version, коли це доступно.

## Межі

- Не робити external backend обов'язковим для core v1, якщо власні exact backends покривають SPEC.
- Не втрачати byte/text mapping за замовчуванням.
