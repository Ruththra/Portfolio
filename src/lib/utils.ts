export const hasUrl = (value: string | undefined): value is string =>
  Boolean(value?.trim());

export function typingFrame(elapsed: number, text = "Ruththra") {
  const typeDuration = text.length * 120;
  const holdUntil = typeDuration + 1500;
  const eraseUntil = holdUntil + text.length * 70;
  const cycle = eraseUntil + 500;
  const time = elapsed % cycle;
  if (time <= typeDuration) return text.slice(0, Math.floor(time / 120));
  if (time <= holdUntil) return text;
  if (time <= eraseUntil)
    return text.slice(
      0,
      Math.max(0, text.length - Math.floor((time - holdUntil) / 70)),
    );
  return "";
}
