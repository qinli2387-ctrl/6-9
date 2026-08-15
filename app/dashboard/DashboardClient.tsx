"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export type DailyTask = {
  id: number;
  skill: string;
  title: string;
  detail: string;
  minutes: number;
  status: string;
};

const skillMeta: Record<string, { label: string; className: string }> = {
  listening: { label: "听", className: "listen" },
  vocabulary: { label: "词", className: "vocab" },
  reading: { label: "读", className: "read" },
  writing: { label: "写", className: "write" },
  speaking: { label: "说", className: "speak" },
};

export function DashboardClient({ tasks }: { tasks: DailyTask[] }) {
  const router = useRouter();
  const [savingId, setSavingId] = useState<number | null>(null);

  async function toggleTask(task: DailyTask) {
    setSavingId(task.id);
    try {
      const response = await fetch("/api/tasks/complete", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ taskId: task.id, completed: task.status !== "done" }),
      });
      if (!response.ok) throw new Error("保存失败");
      router.refresh();
    } finally {
      setSavingId(null);
    }
  }

  return (
    <div className="live-task-list">
      {tasks.map((task) => {
        const meta = skillMeta[task.skill] ?? { label: "练", className: "read" };
        const done = task.status === "done";
        return (
          <article className={`live-task ${done ? "is-done" : ""}`} key={task.id}>
            <span className={`task-icon ${meta.className}`}>{meta.label}</span>
            <div className="live-task-copy"><strong>{task.title}</strong><small>{task.detail}</small></div>
            <span className="live-minutes">{task.minutes} 分钟</span>
            {task.skill === "vocabulary" && !done ? (
              <a className="task-toggle task-start" href="/vocabulary" aria-label={`开始${task.title}`}>开始</a>
            ) : (
              <button className="task-toggle" onClick={() => toggleTask(task)} disabled={savingId === task.id} aria-label={done ? `将${task.title}标记为未完成` : `完成${task.title}`}>
                {savingId === task.id ? "…" : done ? "✓" : "完成"}
              </button>
            )}
          </article>
        );
      })}
    </div>
  );
}
