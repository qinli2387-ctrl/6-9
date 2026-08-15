export default function Home() {
  return (
    <main className="landing-shell">
      <nav className="topbar" aria-label="主导航">
        <a className="brand" href="#top" aria-label="六分计划首页">
          <span className="brand-mark">6</span>
          <span>六分计划</span>
        </a>
        <a className="nav-login" href="/signin-with-chatgpt?return_to=%2Fdashboard">登录学习空间</a>
      </nav>

      <section className="hero" id="top">
        <div className="hero-copy">
          <p className="eyebrow">雅思 6 分 · 24 周自适应计划</p>
          <h1>把半年的目标，<br />变成今天这 60 分钟。</h1>
          <p className="hero-lead">每天只看最该做的任务。系统根据你的正确率、用时和错因，自动安排下一次训练。</p>
          <div className="hero-actions">
            <a className="primary-button" href="/signin-with-chatgpt?return_to=%2Fdashboard">开始我的计划 <span aria-hidden="true">→</span></a>
            <a className="text-link" href="#how-it-works">看看怎么学</a>
          </div>
          <div className="cloud-note"><span className="status-dot" aria-hidden="true" />云端自动同步 · 换手机或电脑也能继续</div>
        </div>

        <div className="dashboard-preview" aria-label="今日学习计划预览">
          <div className="preview-head">
            <div><p>8月15日 · 第2周</p><h2>今天，稳稳前进一点</h2></div>
            <span className="streak">🔥 7 天</span>
          </div>
          <div className="progress-row">
            <div className="progress-ring"><strong>35</strong><span>/ 60 分钟</span></div>
            <div className="progress-copy"><strong>今日完成 58%</strong><span>再完成一项，保持学习节奏</span></div>
          </div>
          <div className="task-list">
            <article className="task-card done"><span className="task-icon listen">听</span><div><strong>听力精听</strong><small>Section 1 · 地址与数字</small></div><span className="task-time">20 分钟</span></article>
            <article className="task-card"><span className="task-icon vocab">词</span><div><strong>到期词汇复习</strong><small>18 个单词等待复习</small></div><span className="task-time">15 分钟</span></article>
            <article className="task-card"><span className="task-icon write">写</span><div><strong>Task 2 审题训练</strong><small>观点类作文 · 只写提纲</small></div><span className="task-time">25 分钟</span></article>
          </div>
        </div>
      </section>

      <section className="method" id="how-it-works">
        <div className="section-heading"><p className="eyebrow">不是堆课程，是形成闭环</p><h2>每一次错误，都变成下一次任务</h2></div>
        <div className="method-grid">
          <article><span>01</span><h3>先摸底</h3><p>用四科小测找到真实起点，不凭感觉安排课程。</p></article>
          <article><span>02</span><h3>每天练</h3><p>系统把目标拆成 45–90 分钟、可以真正完成的任务。</p></article>
          <article><span>03</span><h3>错了再练</h3><p>记录错因与遗忘情况，把薄弱项排进后续计划。</p></article>
          <article><span>04</span><h3>每周调整</h3><p>根据小测结果重新分配听说读写的训练时间。</p></article>
        </div>
      </section>

      <footer><span>六分计划</span><p>你的学习记录只属于你，并安全保存在云端。</p></footer>
    </main>
  );
}
