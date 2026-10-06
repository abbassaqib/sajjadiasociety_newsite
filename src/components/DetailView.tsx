import * as React from "react";
import {
  CalendarDays,
  CalendarPlus,
  Check,
  ChevronLeft,
  ChevronRight,
  Clock,
  MapPin,
  Maximize2,
  Megaphone,
  Mic,
  Pin,
  Repeat,
  Share2,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { DetailItem } from "@/lib/detailItems";

interface Position {
  index: number;
  total: number;
  onPrev: () => void;
  onNext: () => void;
}

interface DetailViewProps {
  item: DetailItem;
  mode: "dialog" | "page";
  onClose?: () => void;
  position?: Position;
}

const BTN =
  "inline-flex min-h-12 items-center justify-center gap-2 rounded-lg px-5 text-base font-semibold transition-colors " +
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-40";
const BTN_PRIMARY = `${BTN} bg-primary text-primary-foreground hover:bg-primary/90`;
const BTN_OUTLINE = `${BTN} border border-border bg-card text-foreground hover:bg-accent`;
const BTN_GHOST = `${BTN} px-3 text-foreground hover:bg-accent`;
const CHIP = "inline-flex items-center gap-1 rounded-full bg-muted px-3 py-1 text-sm font-semibold text-foreground";

// ── Calendar helpers ──────────────────────────────────
function calStamp(iso: string) {
  return new Date(iso).toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
}

function icsEscape(s: string) {
  return s.replace(/\\/g, "\\\\").replace(/\n/g, "\\n").replace(/,/g, "\\,").replace(/;/g, "\\;");
}

function icsFold(line: string) {
  if (line.length <= 73) return line;
  const parts: string[] = [];
  for (let i = 0; i < line.length; i += 73) parts.push((i ? " " : "") + line.slice(i, i + 73));
  return parts.join("\r\n");
}

function whereText(item: DetailItem) {
  return [item.location, item.locationAddress].filter(Boolean).join(", ");
}

function buildIcs(item: DetailItem, url: string) {
  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Sajjadia Islamic Society//Website//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "BEGIN:VEVENT",
    `UID:${item.id}@sajjadiamosque.org`,
    `DTSTAMP:${calStamp(new Date().toISOString())}`,
    `DTSTART:${calStamp(item.startISO!)}`,
    `DTEND:${calStamp(item.endISO ?? item.startISO!)}`,
    `SUMMARY:${icsEscape(item.title)}`,
  ];
  if (whereText(item)) lines.push(`LOCATION:${icsEscape(whereText(item))}`);
  lines.push(`DESCRIPTION:${icsEscape([item.plainText, url].filter(Boolean).join("\n\n"))}`);
  lines.push(`URL:${url}`, "END:VEVENT", "END:VCALENDAR");
  return lines.map(icsFold).join("\r\n");
}

function googleCalendarUrl(item: DetailItem, url: string) {
  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: item.title,
    dates: `${calStamp(item.startISO!)}/${calStamp(item.endISO ?? item.startISO!)}`,
    details: [item.plainText, url].filter(Boolean).join("\n\n"),
    location: whereText(item),
  });
  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

// ── Small pieces ──────────────────────────────────────
function Row({ icon: Icon, label, children }: { icon: any; label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-start gap-3.5">
      <dt className="sr-only">{label}</dt>
      <Icon size={20} strokeWidth={1.75} aria-hidden="true" className="mt-0.5 flex-none text-muted-foreground" />
      <dd className="m-0 min-w-0">{children}</dd>
    </div>
  );
}

// ── Main view ─────────────────────────────────────────
export default function DetailView({ item, mode, onClose, position }: DetailViewProps) {
  const isEvent = item.kind === "event";
  const isDialog = mode === "dialog";
  const Heading = (isDialog ? "h2" : "h1") as "h1";

  const viewerRef = React.useRef<HTMLDialogElement>(null);
  const [zoomed, setZoomed] = React.useState(false);
  const [copied, setCopied] = React.useState(false);

  const itemUrl = () => new URL(item.path, window.location.origin).toString();

  const openViewer = () => {
    setZoomed(false);
    viewerRef.current?.showModal();
  };
  const closeViewer = () => {
    viewerRef.current?.close();
    setZoomed(false);
  };

  const addToCalendar = () => {
    if (!item.startISO) return;
    const url = itemUrl();
    const ua = navigator.userAgent;
    if (/android/i.test(ua)) {
      window.open(googleCalendarUrl(item, url), "_blank", "noopener");
      return;
    }
    const ics = buildIcs(item, url);
    if (/iphone|ipod/i.test(ua)) {
      window.location.href = `data:text/calendar;charset=utf-8,${encodeURIComponent(ics)}`;
      return;
    }
    const blob = new Blob([ics], { type: "text/calendar;charset=utf-8" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `${item.path.split("/").pop() || "event"}.ics`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(a.href), 1000);
  };

  const share = async () => {
    const url = itemUrl();
    if (navigator.share) {
      try {
        await navigator.share({ title: item.title, text: item.summary || item.title, url });
      } catch {
        /* share sheet dismissed */
      }
      return;
    }
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      window.prompt("Copy this link:", url);
    }
  };

  const canAddToCalendar = isEvent && item.startISO && !item.isPast;

  return (
    <article
      className={cn(
        "relative flex w-full flex-col bg-card text-card-foreground",
        isDialog
          ? "max-h-[92dvh] overflow-hidden rounded-t-2xl shadow-2xl md:max-h-[88vh] md:max-w-5xl md:rounded-2xl"
          : "overflow-hidden rounded-2xl border border-border"
      )}
    >
      {isDialog && (
        <>
          <div className="mx-auto mb-1 mt-2.5 h-1.5 w-10 flex-none rounded-full bg-border md:hidden" aria-hidden="true" />
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="absolute right-3 top-3 z-20 inline-flex h-11 w-11 items-center justify-center rounded-full bg-card/90 text-foreground shadow-sm ring-1 ring-border backdrop-blur hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <X size={20} aria-hidden="true" />
          </button>
        </>
      )}

      <div className={cn("md:grid md:grid-cols-2", isDialog && "min-h-0 flex-1 overflow-y-auto overscroll-contain")}>

        {/* ── Flyer ── */}
        <div
          className={cn(
            "bg-muted p-4 md:self-start md:p-6",
            isDialog ? "md:sticky md:top-0" : "md:sticky md:top-6",
            !item.imageFull && "hidden md:block"
          )}
        >
          {item.imageFull ? (
            <button
              type="button"
              onClick={openViewer}
              aria-label="View flyer full size"
              className="group relative block w-full overflow-hidden rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <img
                src={item.imageFull}
                alt={item.imageAlt}
                decoding="async"
                className="mx-auto block max-h-[46dvh] w-auto max-w-full object-contain md:max-h-[72vh]"
              />
              <span className="absolute bottom-2 right-2 inline-flex items-center gap-1.5 rounded-full bg-[rgb(15_21_38/0.72)] px-3 py-1.5 text-sm font-semibold text-white">
                <Maximize2 size={15} aria-hidden="true" />
                Full size
              </span>
            </button>
          ) : (
            <div className="flex aspect-[4/5] w-full flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-border text-muted-foreground">
              {isEvent ? (
                <CalendarDays size={40} strokeWidth={1.5} aria-hidden="true" />
              ) : (
                <Megaphone size={40} strokeWidth={1.5} aria-hidden="true" />
              )}
              <span className="text-sm">No flyer for this {isEvent ? "event" : "announcement"}</span>
            </div>
          )}
        </div>

        {/* ── Details ── */}
        <div className="flex min-w-0 flex-col p-5 md:p-8">
          <div className="flex flex-wrap items-center gap-2 pr-12">
            <span className={CHIP}>{item.category}</span>
            {item.isPinned && (
              <span className={CHIP}>
                <Pin size={13} aria-hidden="true" />
                Pinned
              </span>
            )}
            {isEvent && item.isPast && (
              <span className="inline-flex rounded-full border border-border px-3 py-1 text-sm font-semibold text-muted-foreground">
                Past event
              </span>
            )}
          </div>

          <Heading
            id={isDialog ? "detail-title" : undefined}
            className="mt-3 font-serif text-3xl leading-tight text-foreground md:text-[2.15rem]"
          >
            {item.title}
          </Heading>

          <dl className="mt-5 flex flex-col gap-3.5 text-[17px]">
            {isEvent && item.dateLabel && (
              <Row icon={CalendarDays} label="Date">
                <span className="font-semibold text-foreground">{item.dateLabel}</span>
              </Row>
            )}
            {isEvent && item.timeLabel && (
              <Row icon={Clock} label="Time">
                <span className="font-semibold text-foreground">{item.timeLabel}</span>
              </Row>
            )}
            {item.recurrence && (
              <Row icon={Repeat} label="Repeats">
                {item.recurrence}
              </Row>
            )}
            {item.location && (
              <Row icon={MapPin} label="Location">
                <span className="block font-semibold text-foreground">{item.location}</span>
                {item.locationAddress && <span className="block text-muted-foreground">{item.locationAddress}</span>}
                {item.mapsUrl && (
                  <a
                    href={item.mapsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[15px] font-semibold text-secondary underline-offset-4 hover:underline"
                  >
                    Get directions
                  </a>
                )}
              </Row>
            )}
            {item.speaker && (
              <Row icon={Mic} label="Speaker">
                <span className="font-semibold text-foreground">{item.speaker}</span>
              </Row>
            )}
            {!isEvent && item.postedLabel && (
              <Row icon={CalendarDays} label="Posted">
                Posted {item.postedLabel}
              </Row>
            )}
          </dl>

          {item.bodyHtml && (
            <div
              className="mt-6 border-t border-border pt-5 text-[17px] leading-relaxed text-foreground [&_a]:font-semibold [&_a]:text-secondary [&_a]:underline [&_blockquote]:border-l-2 [&_blockquote]:border-border [&_blockquote]:pl-4 [&_h3]:mb-2 [&_h3]:mt-5 [&_h3]:text-lg [&_h3]:font-semibold [&_li]:mb-1 [&_ol]:mb-3 [&_ol]:list-decimal [&_ol]:pl-6 [&_p]:mb-3 [&_ul]:mb-3 [&_ul]:list-disc [&_ul]:pl-6"
              dangerouslySetInnerHTML={{ __html: item.bodyHtml }}
            />
          )}

          {item.registrationLink && (
            <a
              href={item.registrationLink}
              target="_blank"
              rel="noopener noreferrer"
              className={cn(BTN_OUTLINE, "mt-4 w-fit")}
            >
              Register for this event
            </a>
          )}

          {isDialog && position && position.total > 1 && (
            <nav aria-label="Browse items" className="mt-6 flex items-center justify-between gap-3 border-t border-border pt-4">
              <button type="button" onClick={position.onPrev} disabled={position.index === 0} className={BTN_GHOST}>
                <ChevronLeft size={20} aria-hidden="true" />
                Previous
              </button>
              <span className="text-sm text-muted-foreground">
                {position.index + 1} of {position.total}
              </span>
              <button
                type="button"
                onClick={position.onNext}
                disabled={position.index === position.total - 1}
                className={BTN_GHOST}
              >
                Next
                <ChevronRight size={20} aria-hidden="true" />
              </button>
            </nav>
          )}

          {/* Actions — sticky at the bottom of the sheet on phones */}
          <div
            className={cn(
              "mt-6 flex flex-wrap items-center gap-2.5",
              isDialog &&
                "sticky bottom-0 -mx-5 -mb-5 border-t border-border bg-card px-5 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] md:static md:m-0 md:mt-6 md:border-0 md:bg-transparent md:p-0"
            )}
          >
            {canAddToCalendar && (
              <>
                <button type="button" onClick={addToCalendar} className={cn(BTN_PRIMARY, "flex-1 md:flex-none")}>
                  <CalendarPlus size={19} aria-hidden="true" />
                  Add to calendar
                </button>
                <a
                  href={googleCalendarUrl(item, `https://sajjadiamosque.org${item.path}`)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hidden text-[15px] font-semibold text-secondary underline-offset-4 hover:underline md:inline"
                >
                  Google Calendar
                </a>
              </>
            )}
            <button
              type="button"
              onClick={share}
              className={cn(BTN_OUTLINE, canAddToCalendar ? "md:ml-auto" : "")}
              aria-live="polite"
            >
              {copied ? <Check size={18} aria-hidden="true" /> : <Share2 size={18} aria-hidden="true" />}
              {copied ? "Link copied" : "Share"}
            </button>
          </div>
        </div>
      </div>

      {/* ── Full-size flyer viewer (tap image to zoom, Esc or X to close) ── */}
      {item.imageFull && (
        <dialog
          ref={viewerRef}
          aria-label={`${item.imageAlt}, full size`}
          onClose={() => setZoomed(false)}
          className="m-0 h-dvh max-h-none w-screen max-w-none bg-transparent p-0 backdrop:bg-black/90"
        >
          <div
            className="flex h-full w-full overflow-auto"
            onClick={(e) => {
              if (e.target === e.currentTarget) closeViewer();
            }}
          >
            <button
              type="button"
              onClick={closeViewer}
              aria-label="Close full size view"
              className="fixed right-4 top-4 z-10 inline-flex h-11 w-11 items-center justify-center rounded-full bg-white/15 text-white hover:bg-white/25 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
            >
              <X size={22} aria-hidden="true" />
            </button>
            <img
              src={item.imageFull}
              alt={item.imageAlt}
              onClick={() => setZoomed((z) => !z)}
              className={cn(
                "m-auto",
                zoomed ? "max-h-none max-w-none cursor-zoom-out" : "max-h-full max-w-full cursor-zoom-in object-contain"
              )}
            />
          </div>
        </dialog>
      )}
    </article>
  );
}
