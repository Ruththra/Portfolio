import { journey } from "@/data/journey";
import { SectionHeading } from "@/components/ui/SectionHeading";
export function Journey() {
  return (
    <section className="section">
      <SectionHeading eyebrow="THE PATH SO FAR" title="Journey" />
      <div className="timeline">
        {journey.map((item) => (
          <article key={item.title}>
            <span>{item.type}</span>
            <div>
              <h3>{item.title}</h3>
              <p>{item.organization}</p>
              <small>{item.detail}</small>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
