export const errorTaxonomy = {
  listening: {
    lost_position: "跟丢题号",
    distractor: "干扰信息",
    detail: "细节辨认",
    spelling_format: "拼写与格式",
    prediction: "审题与预测",
  },
  reading: {
    location: "定位失误",
    paraphrase: "同义替换",
    vocabulary: "词义判断",
    inference: "推断过度",
    time_management: "时间管理",
  },
} as const;

export type ErrorSkill = keyof typeof errorTaxonomy;
export type ListeningErrorCategory = keyof typeof errorTaxonomy.listening;
export type ReadingErrorCategory = keyof typeof errorTaxonomy.reading;
export type ErrorCategory = ListeningErrorCategory | ReadingErrorCategory;

export function getErrorCategoryLabel(skill: ErrorSkill, category: string) {
  const labels = errorTaxonomy[skill] as Record<string, string>;
  return labels[category] ?? "需要复习";
}

export function isErrorCategoryForSkill(skill: string, category: string): skill is ErrorSkill {
  return skill in errorTaxonomy && category in errorTaxonomy[skill as ErrorSkill];
}
