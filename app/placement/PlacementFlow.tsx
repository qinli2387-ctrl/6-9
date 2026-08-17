"use client";

import { useEffect, useRef, useState, type Dispatch, type SetStateAction } from "react";
import {
  listeningQuestions,
  placementStepLabels,
  readingPassage,
  readingQuestions,
  speakingPrompt,
  speakingRubrics,
  writingPrompt,
} from "@/lib/placement-content";
import type { PlacementResult, SpeakingRatings } from "@/lib/placement";
import { countEnglishWords } from "@/lib/placement-utils";

type Props = {
  demoMode?: boolean;
  initialResult?: PlacementResult | null;
};

type ApiResponse = { error?: string; result?: PlacementResult };

const emptyRatings: SpeakingRatings = { fluency: 0, vocabulary: 0, grammar: 0, pronunciation: 0 };
const skillMeta = {
  listening: { label: "听力", short: "听" },
  reading: { label: "阅读", short: "读" },
  writing: { label: "写作", short: "写" },
  speaking: { label: "口语", short: "说" },
} as const;

function ObjectiveQuestions({
  questions,
  answers,
  onAnswer,
}: {
  questions: typeof listeningQuestions;
  answers: number[];
  onAnswer: (questionIndex: number, answerIndex: number) => void;
}) {
  return (
    <div className="placement-question-list">
      {questions.map((question, questionIndex) => (
        <fieldset className="placement-question" key={question.id}>
          <legend>{questionIndex + 1}. {question.prompt}</legend>
          <div className="placement-options">
            {question.options.map((option, answerIndex) => (
              <label className={answers[questionIndex] === answerIndex ? "selected" : ""} key={option}>
                <input
                  type="radio"
                  name={question.id}
                  checked={answers[questionIndex] === answerIndex}
                  onChange={() => onAnswer(questionIndex, answerIndex)}
                />
                <span>{String.fromCharCode(65 + answerIndex)}</span>
                <strong>{option}</strong>
              </label>
            ))}
          </div>
        </fieldset>
      ))}
    </div>
  );
}

export function PlacementFlow({ demoMode = false, initialResult = null }: Props) {
  const startedAt = useRef(0);
  const [step, setStep] = useState(initialResult ? 5 : 0);
  const [listeningAnswers, setListeningAnswers] = useState([-1, -1, -1]);
  const [readingAnswers, setReadingAnswers] = useState([-1, -1, -1]);
  const [writingResponse, setWritingResponse] = useState("");
  const [speakingSeconds, setSpeakingSeconds] = useState(0);
  const [speakingRunning, setSpeakingRunning] = useState(false);
  const [speakingRatings, setSpeakingRatings] = useState<SpeakingRatings>(emptyRatings);
  const [result, setResult] = useState<PlacementResult | null>(initialResult);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!speakingRunning) return;
    const timer = window.setInterval(() => {
      setSpeakingSeconds((current) => {
        if (current >= 59) {
          setSpeakingRunning(false);
          return 60;
        }
        return current + 1;
      });
    }, 1000);
    return () => window.clearInterval(timer);
  }, [speakingRunning]);

  function updateAnswer(setter: Dispatch<SetStateAction<number[]>>, questionIndex: number, answerIndex: number) {
    setter((current) => current.map((answer, index) => index === questionIndex ? answerIndex : answer));
  }

  function continueFrom(currentStep: number) {
    setError("");
    if (currentStep === 1 && listeningAnswers.some((answer) => answer < 0)) {
      setError("请完成全部听力题目");
      return;
    }
    if (currentStep === 2 && readingAnswers.some((answer) => answer < 0)) {
      setError("请完成全部阅读题目");
      return;
    }
    if (currentStep === 3 && countEnglishWords(writingResponse) < 20) {
      setError("请至少写 20 个英文单词，建议完成 80–120 词");
      return;
    }
    setStep(currentStep + 1);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function submit() {
    if (speakingSeconds < 15) {
      setError("请先完成至少 15 秒的口头回答");
      return;
    }
    if (Object.values(speakingRatings).some((rating) => rating < 1)) {
      setError("请完成四项口语自评");
      return;
    }

    setSaving(true);
    setError("");
    try {
      const response = await fetch(demoMode ? "/api/demo/placement" : "/api/placement/complete", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          listeningAnswers,
          readingAnswers,
          writingResponse,
          speakingSeconds,
          speakingRatings,
          durationSeconds: Math.round((Date.now() - startedAt.current) / 1000),
        }),
      });
      const payload = await response.json() as ApiResponse;
      if (!response.ok || !payload.result) throw new Error(payload.error ?? "摸底结果保存失败");
      setResult(payload.result);
      setStep(5);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "摸底结果保存失败");
    } finally {
      setSaving(false);
    }
  }

  function restart() {
    startedAt.current = Date.now();
    setStep(0);
    setListeningAnswers([-1, -1, -1]);
    setReadingAnswers([-1, -1, -1]);
    setWritingResponse("");
    setSpeakingSeconds(0);
    setSpeakingRunning(false);
    setSpeakingRatings(emptyRatings);
    setResult(null);
    setError("");
  }

  const wordCount = countEnglishWords(writingResponse);
  const progress = step >= 5 ? 100 : Math.round((step / 4) * 100);

  return (
    <section className="placement-stage">
      {step < 5 && (
        <div className="placement-progress" aria-label={`摸底进度 ${progress}%`}>
          <div><strong>{placementStepLabels[step]}</strong><span>{Math.max(0, step)}/4 科</span></div>
          <span><i style={{ width: `${progress}%` }} /></span>
        </div>
      )}

      {step === 0 && (
        <article className="placement-intro">
          <p className="eyebrow">10–15 分钟 · 四科摸底</p>
          <h1>先找到真实起点，<br />再分配每天的训练时间。</h1>
          <p>听力和阅读使用短题，写作依据可观察的语言特征给出初步估计，口语由计时回答和自评组成。结果只用于安排训练，不是官方雅思成绩。</p>
          <div className="placement-skill-preview" aria-label="摸底包含四科">
            {Object.values(skillMeta).map((skill, index) => <div key={skill.label}><span>{skill.short}</span><strong>{skill.label}</strong><small>{["听一段短对话", "读一篇短文", "写 80–120 词", "说 60 秒"][index]}</small></div>)}
          </div>
          <button className="level-primary" onClick={() => { startedAt.current = Date.now(); setStep(1); }}>开始摸底</button>
        </article>
      )}

      {step === 1 && (
        <article className="placement-card">
          <header><span className="placement-step-mark">听</span><div><p className="eyebrow">第 1 科</p><h1>听力定位</h1></div></header>
          <p className="placement-instruction">先浏览题目，再播放原创英语音频。建议最多听两遍，音频不会离开当前页面。</p>
          <audio className="placement-audio" controls preload="metadata" src="/audio/placement-listening.wav">
            <track kind="captions" src="/audio/placement-listening.vtt" srcLang="en" label="English" />
            你的浏览器暂不支持音频播放。
          </audio>
          <ObjectiveQuestions questions={listeningQuestions} answers={listeningAnswers} onAnswer={(question, answer) => updateAnswer(setListeningAnswers, question, answer)} />
          {error && <p className="form-error" role="alert">{error}</p>}
          <div className="placement-actions"><button className="placement-back" onClick={() => setStep(0)}>返回</button><button className="level-primary" onClick={() => continueFrom(1)}>进入阅读</button></div>
        </article>
      )}

      {step === 2 && (
        <article className="placement-card">
          <header><span className="placement-step-mark">读</span><div><p className="eyebrow">第 2 科</p><h1>阅读理解</h1></div></header>
          <div className="placement-passage">{readingPassage.split("\n\n").map((paragraph) => <p key={paragraph}>{paragraph}</p>)}</div>
          <ObjectiveQuestions questions={readingQuestions} answers={readingAnswers} onAnswer={(question, answer) => updateAnswer(setReadingAnswers, question, answer)} />
          {error && <p className="form-error" role="alert">{error}</p>}
          <div className="placement-actions"><button className="placement-back" onClick={() => setStep(1)}>返回</button><button className="level-primary" onClick={() => continueFrom(2)}>进入写作</button></div>
        </article>
      )}

      {step === 3 && (
        <article className="placement-card placement-writing">
          <header><span className="placement-step-mark">写</span><div><p className="eyebrow">第 3 科</p><h1>{writingPrompt.title}</h1></div></header>
          <blockquote>{writingPrompt.prompt}</blockquote>
          <p className="placement-instruction">{writingPrompt.guidance}</p>
          <label htmlFor="placement-writing">你的回答</label>
          <textarea id="placement-writing" value={writingResponse} onChange={(event) => setWritingResponse(event.target.value)} maxLength={2000} rows={10} placeholder="I prefer studying..." />
          <div className="placement-word-count"><span className={wordCount >= 80 && wordCount <= 120 ? "ready" : ""}>{wordCount} 词</span><small>最低 20 词 · 建议 80–120 词</small></div>
          {error && <p className="form-error" role="alert">{error}</p>}
          <div className="placement-actions"><button className="placement-back" onClick={() => setStep(2)}>返回</button><button className="level-primary" onClick={() => continueFrom(3)}>进入口语</button></div>
        </article>
      )}

      {step === 4 && (
        <article className="placement-card placement-speaking">
          <header><span className="placement-step-mark">说</span><div><p className="eyebrow">第 4 科</p><h1>{speakingPrompt.title}</h1></div></header>
          <blockquote>{speakingPrompt.prompt}</blockquote>
          <p className="placement-instruction">{speakingPrompt.guidance}</p>
          <div className={`speaking-timer ${speakingRunning ? "running" : ""}`}>
            <strong>0:{String(speakingSeconds).padStart(2, "0")}</strong>
            <span>{speakingSeconds >= 60 ? "计时完成" : speakingRunning ? "正在计时，请继续回答" : speakingSeconds >= 15 ? "已达到最低时长" : "准备好后开始"}</span>
            {!speakingRunning
              ? <button type="button" onClick={() => { if (speakingSeconds >= 60) setSpeakingSeconds(0); setSpeakingRunning(true); }}>{speakingSeconds > 0 ? "重新计时" : "开始 60 秒计时"}</button>
              : <button type="button" onClick={() => setSpeakingRunning(false)} disabled={speakingSeconds < 15}>结束回答</button>}
          </div>
          <div className="speaking-rubrics">
            <h2>根据刚才的真实表现自评</h2>
            {speakingRubrics.map((rubric) => (
              <fieldset key={rubric.key}>
                <legend>{rubric.label}</legend>
                <div>
                  {rubric.options.map((option, index) => {
                    const value = index + 1;
                    return (
                      <label className={speakingRatings[rubric.key] === value ? "selected" : ""} key={option}>
                        <input
                          type="radio"
                          name={`speaking-${rubric.key}`}
                          checked={speakingRatings[rubric.key] === value}
                          onChange={() => setSpeakingRatings((current) => ({ ...current, [rubric.key]: value }))}
                        />
                        <strong>{value}</strong><span>{option}</span>
                      </label>
                    );
                  })}
                </div>
              </fieldset>
            ))}
          </div>
          {error && <p className="form-error" role="alert">{error}</p>}
          <div className="placement-actions"><button className="placement-back" onClick={() => setStep(3)} disabled={saving}>返回</button><button className="level-primary" onClick={submit} disabled={saving || speakingRunning}>{saving ? "正在计算并保存…" : "查看摸底结果"}</button></div>
        </article>
      )}

      {step === 5 && result && (
        <article className="placement-result">
          <p className="eyebrow">四科起点已生成</p>
          <div className="placement-result-head"><div><h1>先补最薄弱的一科。</h1><p>系统已把较多训练时间分给当前弱项。写作和口语为短测初步估计，后续会用真实练习持续校准。</p></div><div className="placement-overall"><span>综合起点</span><strong>{result.overallBand.toFixed(1)}</strong><small>估计 Band</small></div></div>
          <div className="placement-results-grid">
            {(Object.keys(skillMeta) as Array<keyof typeof skillMeta>).map((skill) => (
              <section key={skill}>
                <div className="placement-result-title"><span>{skillMeta[skill].short}</span><strong>{skillMeta[skill].label}</strong><b>{result.skills[skill].band.toFixed(1)}</b></div>
                <p>本次表现 {result.skills[skill].score}/100</p>
                <div className="weight-bar"><span style={{ width: `${result.skills[skill].weight}%` }} /></div>
                <small>初始训练权重 {result.skills[skill].weight}%</small>
              </section>
            ))}
          </div>
          <p className="placement-disclaimer">本结果用于个性化训练安排，不是官方雅思成绩或成绩保证。</p>
          <div className="placement-result-actions"><a className="level-primary" href={demoMode ? "/demo" : "/dashboard"}>{demoMode ? "返回体验地图" : "按新权重开始学习"}</a><button className="placement-back" onClick={restart}>重新摸底</button></div>
        </article>
      )}
    </section>
  );
}
