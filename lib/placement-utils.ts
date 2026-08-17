export function countEnglishWords(value: string) {
  return value.trim().match(/[A-Za-z]+(?:['’-][A-Za-z]+)*/g)?.length ?? 0;
}
