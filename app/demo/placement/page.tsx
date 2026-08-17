import { PlacementFlow } from "@/app/placement/PlacementFlow";

export default function DemoPlacementPage() {
  return (
    <main className="level-shell placement-shell">
      <header className="placement-topbar">
        <a className="level-exit" href="/demo" aria-label="退出摸底返回体验地图">×</a>
        <a className="brand" href="/demo"><span className="brand-mark">6</span><span>六分计划</span></a>
        <span className="sync-pill">体验模式</span>
      </header>
      <PlacementFlow demoMode />
    </main>
  );
}
