"use client";

import { useState } from "react";

export type ReviewCard = { id: number; word: string; meaning: string; example: string };

const ratings = [
  { value: 1, label: "忘记", hint: "很快再见", className: "again" },
  { value: 2, label: "困难", hint: "缩短间隔", className: "hard" },
  { value: 3, label: "记得", hint: "正常安排", className: "good" },
  { value: 4, label: "简单", hint: "延长间隔", className: "easy" },
] as const;

export function VocabReview({ initialCards, demoMode = false }: { initialCards: ReviewCard[]; demoMode?: boolean }) {
  const [cards, setCards] = useState(initialCards);
  const [revealed, setRevealed] = useState(false);
  const [saving, setSaving] = useState(false);
  const [completed, setCompleted] = useState(0);
  const [error, setError] = useState("");
  const card = cards[0];

  async function rate(value: number) {
    if (!card || saving) return;
    setSaving(true);
    setError("");
    try {
      if (demoMode) {
        setCards((current) => current.slice(1));
        setCompleted((value) => value + 1);
        setRevealed(false);
        return;
      }
      const response = await fetch("/api/vocabulary/review", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ cardId: card.id, rating: value }),
      });
      const payload = await response.json() as { error?: string };
      if (!response.ok) throw new Error(payload.error ?? "复习记录保存失败");
      setCards((current) => current.slice(1));
      setCompleted((value) => value + 1);
      setRevealed(false);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "复习记录保存失败");
    } finally {
      setSaving(false);
    }
  }

  if (!card) {
    return (
      <section className="vocab-finished">
        <span aria-hidden="true">✓</span>
        <p className="eyebrow">本轮完成</p>
        <h1>{completed > 0 ? `已复习 ${completed} 个词` : "今天没有到期词卡"}</h1>
        <p>FSRS 已根据你的反馈安排下次复习。复习间隔会随记忆表现自动变化。</p>
        <a className="level-primary" href={demoMode ? "/demo" : "/dashboard"}>返回闯关地图</a>
      </section>
    );
  }

  const total = completed + cards.length;
  const percent = Math.round((completed / total) * 100);

  return (
    <section className="vocab-session" aria-live="polite">
      <header className="vocab-progress">
        <div><span>本轮进度</span><strong>{completed} / {total}</strong></div>
        <div className="level-progress-track" aria-label={`词汇复习进度 ${percent}%`}><span style={{ width: `${percent}%` }} /></div>
      </header>

      <article className={`vocab-card ${revealed ? "is-revealed" : ""}`}>
        <p className="eyebrow">雅思核心词 · 主动回忆</p>
        <h1 lang="en">{card.word}</h1>
        {!revealed ? (
          <>
            <p className="vocab-prompt">先在脑中说出词义和一个使用场景，再查看答案。</p>
            <button className="level-primary" onClick={() => setRevealed(true)}>查看答案</button>
          </>
        ) : (
          <>
            <div className="vocab-answer">
              <strong>{card.meaning}</strong>
              <p lang="en">{card.example}</p>
            </div>
            <fieldset className="rating-grid" disabled={saving}>
              <legend>你刚才回忆得怎么样？</legend>
              {ratings.map((rating) => (
                <button className={rating.className} key={rating.value} onClick={() => void rate(rating.value)}>
                  <strong>{rating.label}</strong><small>{rating.hint}</small>
                </button>
              ))}
            </fieldset>
          </>
        )}
        {error && <p className="form-error" role="alert">{error}</p>}
      </article>
    </section>
  );
}
