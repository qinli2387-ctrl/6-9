import { redirect } from "next/navigation";
import { LevelSession } from "@/app/levels/[week]/LevelSession";
import { getLevelLesson } from "@/lib/level-lessons";
import { planWorlds } from "@/lib/learning-plan";

type PageProps = { params: Promise<{ week: string }> };

export default async function DemoLevelPage({ params }: PageProps) {
  const { week: weekValue } = await params;
  const week = Number(weekValue);
  const lesson = Number.isInteger(week) ? getLevelLesson(week) : null;
  if (!lesson) redirect("/demo");
  const level = planWorlds.flatMap((world) => world.levels).find((item) => item.week === week)!;
  const world = planWorlds.find((item) => item.levels.some((worldLevel) => worldLevel.week === week))!;
  return <LevelSession week={week} worldName={world.name} title={level.title} focus={level.focus} kind={level.kind} lesson={lesson} bestStars={0} bestScore={0} demoMode />;
}

