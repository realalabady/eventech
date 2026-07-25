import { CalendarDays, MapPin, Users } from "lucide-react";
import Image from "next/image";

type EventPreviewCardProps = {
  title: string;
  date: string;
  venue: string;
  attending: string;
  imageSeed: string;
  priority?: boolean;
};

/**
 * Event card as it appears in the real product (Luma-style: cover, title,
 * date/venue/attendance rows). This is a real component, not a mock screenshot,
 * so the marketing page and the app stay visually identical.
 */
export function EventPreviewCard({
  title,
  date,
  venue,
  attending,
  imageSeed,
  priority = false,
}: EventPreviewCardProps) {
  return (
    <article className="group overflow-hidden rounded-xl border border-border bg-card transition-[transform,border-color] duration-150 ease-out hover:-translate-y-0.5 hover:border-foreground/20">
      <div className="relative aspect-[16/10] overflow-hidden">
        <Image
          src={`https://picsum.photos/seed/${imageSeed}/800/500`}
          alt={title}
          fill
          priority={priority}
          sizes="(min-width: 1024px) 24rem, (min-width: 640px) 50vw, 100vw"
          className="object-cover transition-transform duration-400 ease-out group-hover:scale-[1.03]"
        />
      </div>

      <div className="space-y-3 p-5">
        <h3 className="text-base font-medium tracking-tight">{title}</h3>

        <dl className="space-y-1.5 text-sm text-foreground/65">
          <div className="flex items-center gap-2">
            <CalendarDays className="size-4 shrink-0 text-foreground/45" />
            <dd>{date}</dd>
          </div>
          <div className="flex items-center gap-2">
            <MapPin className="size-4 shrink-0 text-foreground/45" />
            <dd>{venue}</dd>
          </div>
          <div className="flex items-center gap-2">
            <Users className="size-4 shrink-0 text-foreground/45" />
            <dd>{attending}</dd>
          </div>
        </dl>
      </div>
    </article>
  );
}
