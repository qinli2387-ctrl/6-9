import { VocabReview, type ReviewCard } from "@/app/vocabulary/VocabReview";

const demoCards: ReviewCard[] = [
  { id: 1, word: "allocate", meaning: "分配；拨出", example: "The city allocated more funds to public transport." },
  { id: 2, word: "significant", meaning: "显著的；重要的", example: "There was a significant rise in online learning." },
  { id: 3, word: "whereas", meaning: "然而；而", example: "Urban populations grew, whereas rural populations fell." },
];

export default function DemoVocabularyPage() {
  return (
    <main className="level-shell vocab-shell">
      <header className="vocab-topbar">
        <a className="level-exit" href="/demo" aria-label="退出词汇复习返回地图">×</a>
        <a className="brand" href="/demo"><span className="brand-mark">6</span><span>六分计划</span></a>
        <span className="sync-pill">体验模式</span>
      </header>
      <VocabReview initialCards={demoCards} demoMode />
    </main>
  );
}
