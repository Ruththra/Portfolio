export function hasUrl(value: string | undefined): value is string {
  if (!value?.trim()) return false;
  if (value.startsWith("/")) return true;
  try {
    const url = new URL(value);
    return ["http:", "https:", "mailto:"].includes(url.protocol);
  } catch {
    return false;
  }
}

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
