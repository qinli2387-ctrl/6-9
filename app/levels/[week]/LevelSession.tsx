"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import type { LevelKind } from "@/lib/learning-plan";
import type { LevelLesson } from "@/lib/level-lessons";

type Result = {
  passed: boolean;
  score: number;
  correct: number;
  total: number;
  stars: number;
  bestStars: number;
  xpEarned: number;
  nextWeek: number;
};

type Props = {
  week: number;
  worldName: string;
  title: string;
  focus: string;
  kind: LevelKind;
  lesson: LevelLesson;
  bestStars: number;
  bestScore: number;
};

export function LevelSession({ week, worldName, title, focus, kind, lesson, bestStars, bestScore }: Props) {
  const router = useRouter();
  const startedAt = useRef(Date.now());
  const [mode, setMode] = useState<"briefing" | "questions" | "result">("briefing");
  const [questionIndex, setQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);
  const [selected, setSelected] = useState<number | null>(null);
  const [revealed, setRevealed] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<Result | null>(null);
  const question = lesson.questions[questionIndex];
  const progress = mode === "briefing" ? 5 : mode === "result" ? 100 : Math.round(((questionIndex + (revealed ? 1 : 0)) / lesson.questions.length) * 100);

  async function finish(finalAnswers: number[]) {
    setSaving(true);
    setError("");
    try {
      const response = await fetch("/api/levels/complete", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ week, answers: finalAnswers, durationSeconds: Math.round((Date.now() - startedAt.current) / 1000) }),
      });
      const payload = await response.json() as Result & { error?: string };
      if (!response.ok) throw new Error(payload.error ?? "成绩保存失败");
      setResult(payload);
      setMode("result");
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "成绩保存失败");
    } finally {
      setSaving(false);
    }
  }

  function confirmAnswer() {
    if (selected === null) return;
    setRevealed(true);
  }

  function nextQuestion() {
    if (selected === null) return;
    const nextAnswers = [...answers, selected];
    setAnswers(nextAnswers);
    if (questionIndex === lesson.questions.length - 1) {
      void finish(nextAnswers);
      return;
    }
    setQuestionIndex((current) => current + 1);
    setSelected(null);
    setRevealed(false);
  }

  function retry() {
    startedAt.current = Date.now();
    setMode("briefing");
    setQuestionIndex(0);
    setAnswers([]);
    setSelected(null);
    setRevealed(false);
    setResult(null);
    setError("");
  }

  const kindLabel = kind === "boss" ? "Boss挑战" : kind === "review" ? "复习关" : "训练关";

  return (
    <main className={`level-shell ${kind === "boss" ? "boss-session" : ""}`}>
      <header className="level-topbar">
        <a className="level-exit" href="/dashboard" aria-label="退出关卡返回地图">×</a>
        <div className="level-progress-track" aria-label={`关卡进度 ${progress}%`}><span style={{ width: `${progress}%` }} /></div>
        <span className="level-heart" aria-label="当前可继续挑战">♥</span>
      </header>

      <section className="level-stage">
        <div className="level-meta"><span>{worldName}</span><span>第 {week} 周 · {kindLabel}</span></div>
        {mode === "briefing" && (
          <article className="briefing-card">
            <span className="level-medallion">{kind === "boss" ? "冠" : week}</span>
            <p className="eyebrow">{lesson.estimatedMinutes}分钟关卡</p>
            <h1>{title}</h1>
            <p className="briefing-focus">{focus}</p>
            <h2>{lesson.briefingTitle}</h2>
            <ul>{lesson.briefing.map((item) => <li key={item}>{item}</li>)}</ul>
            {bestScore > 0 && <p className="personal-best">历史最佳：{bestScore}分 · {"★".repeat(bestStars)}{"☆".repeat(3 - bestStars)}</p>}
            <button className="level-primary" onClick={() => { startedAt.current = Date.now(); setMode("questions"); }}>开始挑战</button>
          </article>
        )}

        {mode === "questions" && (
          <article className="question-card">
            <div className="question-head"><span>{question.skill}</span><strong>{questionIndex + 1} / {lesson.questions.length}</strong></div>
            <h1>{question.prompt}</h1>
            {question.context && <p className="question-context">{question.context}</p>}
            <div className="answer-list" role="group" aria-label="选择答案">
              {question.options.map((option, index) => {
                const isCorrect = revealed && index === question.correctIndex;
                const isWrong = revealed && selected === index && index !== question.correctIndex;
                return (
                  <button
                    className={`${selected === index ? "selected" : ""} ${isCorrect ? "correct" : ""} ${isWrong ? "wrong" : ""}`}
                    key={option}
                    onClick={() => !revealed && setSelected(index)}
                    disabled={revealed}
                  >
                    <span>{String.fromCharCode(65 + index)}</span>{option}
                  </button>
                );
              })}
            </div>
            {revealed && (
              <div className={`answer-feedback ${selected === question.correctIndex ? "good" : "needs-work"}`} role="status">
                <strong>{selected === question.correctIndex ? "答对了！" : "再记住这一点"}</strong>
                <p>{question.explanation}</p>
              </div>
            )}
            {error && <p className="form-error" role="alert">{error}</p>}
            <button className="level-primary" onClick={revealed ? nextQuestion : confirmAnswer} disabled={selected === null || saving}>
              {saving ? "正在同步成绩…" : revealed ? (questionIndex === lesson.questions.length - 1 ? "查看结算" : "下一题") : "确认答案"}
            </button>
          </article>
        )}

        {mode === "result" && result && (
          <article className={`result-card ${result.passed ? "passed" : "failed"}`}>
            <div className="result-burst" aria-hidden="true"><span>✦</span><span>•</span><span>✦</span><span>•</span></div>
            <span className="result-badge">{result.passed ? (result.stars === 3 ? "精通" : "过关") : "继续加油"}</span>
            <h1>{result.passed ? "新路线已解锁！" : "差一点就过关了"}</h1>
            <div className="result-stars" aria-label={`${result.stars}颗星`}>{[1, 2, 3].map((star) => <span className={star <= result.stars ? "earned" : ""} key={star}>★</span>)}</div>
            <strong className="result-score">{result.score}<small>分</small></strong>
            <p>答对 {result.correct}/{result.total} 题{result.xpEarned > 0 ? `，获得 ${result.xpEarned} XP` : "，成绩已同步"}。</p>
            <div className="result-actions">
              {result.passed ? <button className="level-primary" onClick={() => { router.push("/dashboard"); router.refresh(); }}>查看新地图</button> : <button className="level-primary" onClick={retry}>重新挑战</button>}
              {result.passed && week < 4 && <a href={`/levels/${week + 1}`}>直接进入下一关</a>}
            </div>
          </article>
        )}
      </section>
    </main>
  );
}

