"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { LevelMap } from "@/app/dashboard/LevelMap";

type DemoProgress = { levelKey: string; status: string; stars: number };
type DemoState = { currentWeek: number; totalXp: number; progress: DemoProgress[] };

const initialState: DemoState = { currentWeek: 1, totalXp: 0, progress: [] };
const storageKey = "band-six-demo-progress";

export function DemoDashboard() {
  const [demo, setDemo] = useState<DemoState>(initialState);

  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      try {
        const saved = JSON.parse(localStorage.getItem(storageKey) ?? "null") as DemoState | null;
        if (saved) setDemo(saved);
      } catch {
        localStorage.removeItem(storageKey);
      }
    });
    return () => cancelAnimationFrame(frame);
  }, []);

  function resetDemo() {
    localStorage.removeItem(storageKey);
    setDemo(initialState);
  }

  return (
    <main className="app-shell demo-app-shell">
      <aside className="sidebar">
        <Link className="brand" href="/"><span className="brand-mark">6</span><span>六分计划</span></Link>
        <nav className="side-nav" aria-label="体验导航"><a className="active" href="/demo">闯关地图</a><a href="#demo-help">体验说明</a><Link href="/">返回首页</Link></nav>
        <button className="demo-reset" onClick={resetDemo}>重置体验进度</button>
      </aside>
      <section className="dashboard-main">
        <div className="demo-banner"><strong>本机体验版</strong><span>无需登录 · 数据只保存在当前浏览器</span></div>
        <header className="dashboard-header journey-header"><div><p>启航岛 · 第 {demo.currentWeek} 周</p><h1>亲自走一遍闯关流程。</h1></div><span className="sync-pill">体验模式</span></header>
        <section className="journey-stats" aria-label="体验进度概览">
          <div><span>当前关卡</span><strong>第 {demo.currentWeek} 周</strong></div>
          <div><span>累计经验</span><strong>{demo.totalXp} XP</strong></div>
          <div><span>已获星星</span><strong>{demo.progress.reduce((sum, item) => sum + item.stars, 0)} 颗</strong></div>
          <div><span>可体验内容</span><strong>前4周</strong></div>
        </section>
        <div className="journey-grid demo-journey-grid">
          <LevelMap currentWeek={demo.currentWeek} progress={demo.progress} demoMode />
          <aside className="journey-rail" id="demo-help">
            <section className="today-panel demo-help-card"><p className="eyebrow">怎么玩</p><h2>点击地图中的“开始”</h2><ol><li>先看本关学习提示</li><li>完成5道互动题</li><li>根据成绩获得星级和XP</li><li>返回地图查看下一关解锁</li></ol><a className="level-primary" href={`/demo/levels/${Math.min(demo.currentWeek, 4)}`}>进入当前关卡</a></section>
            <section className="insight-panel"><p className="eyebrow">正式版区别</p><strong className="band-number">云</strong><p>正式版会按登录账号保存到云端，并在手机和电脑间同步。</p><div className="coach-note"><span>提示</span><p>体验版刷新不会丢失，但清除浏览器数据后会重置。</p></div></section>
          </aside>
        </div>
      </section>
    </main>
  );
}
