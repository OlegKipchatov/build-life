# Проверка миграции

- 28 автоматических тестов Vitest: шаги, связи, завершение, идемпотентность, расписания, XP, архивирование, миграция и сериализация.
- TypeScript strict и production-сборка Vite.
- Браузерная проверка выполнена до финального форматирования исходников: desktop 1363px и mobile 390px (iframe).
- Создание/выполнение задачи, начисление XP; характеристика с иконкой; навык с мультиселектом характеристики.
- Веха без шагов, FAB, новый шаг, inline-создание связанной задачи, независимое выполнение задачи и шага, явное завершение вехи.
- После перезагрузки сохранились XP, задачи, выбранные иконки и связи навыка.
- Мобильная форма отображается bottom sheet; вычисленный размер шрифта поля — 16px.

Это не полная end-to-end автоматизация. Реальная клавиатура iOS и Safari не проверялись. Проверки FAB и мобильной компоновки выполнялись вручную, доменные сценарии — автоматически.

## UX scenarios — 2026-11-16

- Calendar creation preselects selected date; weekly repeat exposes weekday controls.
- Paging weeks keeps weekday; calendar and task library are separate modes; Today resets date.
- Unsaved forms offer Save / Keep editing / Discard. Nested editors have Back and whole-stack Close.
- Created milestone opens detail; new step expands immediately.
- Reopening achieved milestone step requires an explanation and confirmation; steps/tasks remain independent.
- Character manager preserves selected tab/filter. Skill detail includes linked tasks and creation with skill preselected.
- Skill mastery status is explicitly described; XP formulas are unchanged.
- Backup import validates before replacement and creates a pre-import recovery snapshot.
- Browser QA: desktop calendar date, weekday selection, navigation, unsaved guard, milestone creation, new step expansion.
- Browser QA at 390px: HeroUI bottom sheet, skill creation/return, linked task creation/completion, 16px input computed style.
- Native iOS keyboard and gesture behavior not tested on hardware.
- Automated validation: 48 tests, TypeScript and production build.
