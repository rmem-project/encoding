# ENC-019 — UTF-16 detector

## Мета

Реалізувати UTF-16LE/BE detection з BOM і обережною heuristic підтримкою згідно з profile policy.

## Обсяг

- Визначати UTF-16LE/BE через BOM.
- Додати heuristic на NUL distribution, printable ratio і парність bytes.
- Враховувати profile flag `utf16Heuristics`.
- Формувати candidates і warnings для слабких або конфліктних сигналів.

## Критерії виконання

- UTF-16 BOM визначається до heuristic detection.
- `strictUtf8` приймає UTF-16 тільки за правилами профілю.
- Heuristic не перекриває explicit encoding або BOM.

## Межі

- Не підтримувати UTF-32.
- Не декодувати текст у detector.
