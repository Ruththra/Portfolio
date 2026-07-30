import { Blocks } from "lucide-react";

export function EmptyState({ title, copy }: { title: string; copy: string }) {
  return (
    <div className="empty-state">
      <Blocks aria-hidden="true" />
      <h3>{title}</h3>
      <p>{copy}</p>
    </div>
  );
}
