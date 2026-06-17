# ENC-045 — Release readiness

## Мета

Перевірити, що пакет готовий до v1 delivery відповідно до технічного завдання.

## Обсяг

- Перевірити package exports, type declarations і build artifacts.
- Запустити повний test suite, typecheck, lint/format quality gates.
- Перевірити dependency footprint і optional backend behavior.
- Підготувати release notes з compatibility і known limitations.

## Критерії виконання

- Усі acceptance criteria з розділу 18 SPEC мають тестове або документальне підтвердження.
- Public API не експортує internal modules.
- Package можна встановити і використати як TypeScript-бібліотеку.

## Межі

- Не додавати новий scope v1 під час release hardening.
- Не приховувати known limitations, якщо вони випливають зі SPEC non-goals.
