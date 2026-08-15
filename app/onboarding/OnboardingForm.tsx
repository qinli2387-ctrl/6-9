"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

type Props = {
  initialExamType: string;
  initialExamDate: string;
  initialDailyMinutes: number;
  editing: boolean;
  minimumExamDate: string;
};

const minuteChoices = [30, 45, 60, 90];

export function OnboardingForm({ initialExamType, initialExamDate, initialDailyMinutes, editing, minimumExamDate }: Props) {
  const router = useRouter();
  const [examType, setExamType] = useState(initialExamType);
  const [examDate, setExamDate] = useState(initialExamDate);
  const [dailyMinutes, setDailyMinutes] = useState(initialDailyMinutes);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setError("");
    try {
      const response = await fetch("/api/profile/setup", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ examType, examDate, dailyMinutes }),
      });
      const result = await response.json() as { error?: string };
      if (!response.ok) throw new Error(result.error ?? "保存失败，请稍后再试");
      router.replace("/dashboard");
      router.refresh();
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "保存失败，请稍后再试");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form className="setup-form" onSubmit={submit}>
      <fieldset>
        <legend>你准备参加哪种雅思？</legend>
        <div className="choice-grid two-choices">
          <label className={examType === "academic" ? "selected" : ""}>
            <input type="radio" name="examType" value="academic" checked={examType === "academic"} onChange={() => setExamType("academic")} />
            <strong>学术类</strong><small>留学与学术申请</small>
          </label>
          <label className={examType === "general" ? "selected" : ""}>
            <input type="radio" name="examType" value="general" checked={examType === "general"} onChange={() => setExamType("general")} />
            <strong>培训类</strong><small>移民、工作与生活</small>
          </label>
        </div>
      </fieldset>

      <label className="field-label" htmlFor="exam-date">预计考试日期</label>
      <input className="date-input" id="exam-date" type="date" value={examDate} min={minimumExamDate} onChange={(event) => setExamDate(event.target.value)} required />
      <p className="field-help">还没报名也没关系，先填一个预计日期，以后可以修改。</p>

      <fieldset>
        <legend>每天大约能学多久？</legend>
        <div className="choice-grid minute-choices">
          {minuteChoices.map((minutes) => (
            <label className={dailyMinutes === minutes ? "selected" : ""} key={minutes}>
              <input type="radio" name="dailyMinutes" value={minutes} checked={dailyMinutes === minutes} onChange={() => setDailyMinutes(minutes)} />
              <strong>{minutes}</strong><small>分钟</small>
            </label>
          ))}
        </div>
      </fieldset>

      <div className="target-summary"><span>目标分数</span><strong>IELTS 6.0</strong><small>24周训练计划</small></div>
      {error && <p className="form-error" role="alert">{error}</p>}
      <button className="setup-submit" type="submit" disabled={saving}>{saving ? "正在同步…" : editing ? "保存并返回地图" : "生成我的闯关地图"}</button>
    </form>
  );
}
