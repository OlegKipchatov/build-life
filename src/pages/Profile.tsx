import { useStore } from "../store";
import { useUI } from "../ui";
import { durationText, journeyDays, level, progression } from "../model";
import {
  Header,
  Action,
  Progress,
  EntityLevel,
  Empty,
} from "../components/Common";
import { Icon } from "../components/Icon";
import s from "../App.module.css";
export const Profile = () => {
  const { data, ui } = useStore();
  const { open } = useUI();
  const attributes = data.attributes.filter((x) => x.status !== "archived"),
    skills = data.skills.filter((x) => x.status !== "archived");
  const count = data.tasks.reduce(
    (n, t) =>
      n +
      (t.completions || []).length +
      (t.repeat === "once" &&
      (t.status === "done" || (t.status === "archived" && t.wasDone))
        ? 1
        : 0),
    0,
  );
  return (
    <>
      <Header title={ui("Профиль", "Profile")}>
        <Action
          icon="settings"
          label={ui("Настройки персонажа", "Character settings")}
          onPress={() => open({ kind: "manager" })}
        />
      </Header>
      <section className={s.character}>
        <div className={s.identity}>
          <div className={s.avatar}>{data.name.slice(0, 1).toUpperCase()}</div>
          <div className={s.name}>
            <h2>{data.name}</h2>
            <span>
              {ui("В пути", "Journey")} ·{" "}
              {durationText(data.startedAt, data.language === "en")}
            </span>
          </div>
          <div className={s.characterLevel}>
            <strong>{level(data.xp)}</strong>
            <span>{ui("уровень", "level")}</span>
          </div>
        </div>
        <div className={s.xpLabels}>
          <span>XP</span>
          <span>{data.xp % 100} / 100</span>
        </div>
        <Progress value={data.xp % 100} />
      </section>
      <div className={s.stats}>
        {[
          [count, ui("задач выполнено", "tasks completed")],
          [journeyDays(data.startedAt), ui("дней в пути", "journey days")],
          [data.xp, ui("всего XP", "total XP")],
        ].map(([n, l]) => (
          <div key={l}>
            <strong>{n}</strong>
            <span>{l}</span>
          </div>
        ))}
      </div>
      <div className={s.profileColumns}>
        <section>
          <h2>{ui("Характеристики", "Attributes")}</h2>
          {attributes.length ? (
            <div className={s.attributes}>
              {attributes.map((a) => (
                <div className={s.attribute} key={a.id}>
                  <span className={s.symbol}>
                    <Icon name={a.icon || "shield"} />
                  </span>
                  <div className={s.attributeBody}>
                    <div className={s.attributeHeading}>
                      <strong>{a.name}</strong>
                      <EntityLevel entity={a} />
                    </div>
                    <Progress value={progression(a)?.current ?? null} />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <Empty>
              {ui(
                "Добавь характеристики в настройках персонажа.",
                "Add attributes in character settings.",
              )}
            </Empty>
          )}
        </section>
        <section>
          <h2>{ui("Навыки", "Skills")}</h2>
          {skills.length ? (
            <div className={s.skills}>
              {skills.map((skill) => (
                <button
                  className={s.skill}
                  key={skill.id}
                  onClick={() => open({ kind: "skill", id: skill.id })}
                >
                  <span className={s.skillTop}>
                    <span className={s.symbol}>
                      <Icon name={skill.icon || "star"} />
                    </span>
                    <span className={s.skillBody}>
                      <strong>{skill.name}</strong>
                      <span className={s.skillMeta}>
                        <EntityLevel entity={skill} />
                        <span>
                          {data.attributes
                            .filter((a) =>
                              (skill.attributes || [skill.attribute]).includes(
                                a.id,
                              ),
                            )
                            .map((a) => a.name)
                            .join(" · ")}
                        </span>
                      </span>
                    </span>
                    <Icon name="chevron" />
                  </span>
                  <span className={s.skillProgress}>
                    <Progress value={progression(skill)?.current ?? null} />
                    <small>
                      {progression(skill)
                        ? `${progression(skill)!.current} / 100 XP`
                        : ui("Нет данных XP", "XP unavailable")}
                    </small>
                  </span>
                  {skill.status === "completed" && (
                    <small>{ui("Завершён", "Completed")}</small>
                  )}
                </button>
              ))}
            </div>
          ) : (
            <Empty>
              {ui(
                "Добавь навыки в настройках персонажа.",
                "Add skills in character settings.",
              )}
            </Empty>
          )}
        </section>
      </div>
    </>
  );
};
