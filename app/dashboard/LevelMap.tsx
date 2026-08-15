import { planWorlds } from "@/lib/learning-plan";

type ProgressRecord = {
  levelKey: string;
  status: string;
  stars: number;
};

function statusLabel(status: string) {
  if (status === "mastered") return "已精通";
  if (status === "passed") return "已通过";
  if (status === "active") return "当前关卡";
  return "未解锁";
}

export function LevelMap({ currentWeek, progress }: { currentWeek: number; progress: ProgressRecord[] }) {
  const saved = new Map(progress.map((item) => [item.levelKey, item]));

  return (
    <section className="map-panel" aria-labelledby="map-title">
      <div className="map-heading">
        <div><p className="eyebrow">24周闯关路线</p><h2 id="map-title">从起点走到六分之巅</h2></div>
        <a href="/onboarding">调整计划</a>
      </div>
      <div className="world-list">
        {planWorlds.map((world) => {
          const completed = world.levels.filter((level) => {
            const status = saved.get(level.key)?.status;
            return status === "passed" || status === "mastered";
          }).length;
          return (
            <section className={`map-world ${world.className}`} key={world.number} aria-labelledby={`world-${world.number}`}>
              <header className="world-header">
                <span className="world-number">世界 {world.number}</span>
                <div><h3 id={`world-${world.number}`}>{world.name}</h3><p>{world.subtitle}</p></div>
                <span className="world-count">{completed}/4</span>
              </header>
              <ol className="level-path">
                {world.levels.map((level) => {
                  const record = saved.get(level.key);
                  const inferred = level.week < currentWeek ? "passed" : level.week === currentWeek ? "active" : "locked";
                  const status = record?.status ?? inferred;
                  const content = (
                    <>
                      <span className="level-orbit" aria-hidden="true">
                        <span className="level-node">{level.kind === "boss" ? "冠" : level.week}</span>
                      </span>
                      <span className="level-copy">
                        <small>第 {level.week} 周 · {level.kind === "boss" ? "Boss挑战" : level.kind === "review" ? "复习关" : "训练关"}</small>
                        <strong>{level.title}</strong>
                        <span>{level.focus}</span>
                      </span>
                      <span className="level-result" aria-label={`${record?.stars ?? 0}颗星`}>
                        {status === "locked" ? "锁" : status === "active" ? "开始" : `${"★".repeat(record?.stars || 1)}${"☆".repeat(3 - (record?.stars || 1))}`}
                      </span>
                    </>
                  );
                  return (
                    <li className={`level-row ${status} ${level.kind}`} key={level.key}>
                      {status === "active" ? <a href="#today" aria-current="step" aria-label={`当前关卡：第${level.week}周 ${level.title}`}>{content}</a> : <div aria-label={`第${level.week}周 ${level.title}，${statusLabel(status)}`}>{content}</div>}
                    </li>
                  );
                })}
              </ol>
            </section>
          );
        })}
      </div>
    </section>
  );
}

