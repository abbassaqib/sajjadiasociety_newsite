import * as React from "react";
import { ArrowUpRight, Check, Copy, FileText, X } from "lucide-react";

interface KhumsGuideProps {
  orgName: string;
  validThrough?: string;
  khumsUrl: string;
  guideImageUrl?: string;
  guideImageAlt?: string;
  ijazaUrl?: string;
}

const GIVE_BTN =
  "inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-lg bg-give px-5 text-base font-semibold " +
  "text-give-foreground transition-colors hover:bg-give/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring";

function Step({ n, title, children }: { n: number; title: string; children: React.ReactNode }) {
  return (
    <li className="flex gap-4">
      <span
        className="flex h-8 w-8 flex-none items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground"
        aria-hidden="true"
      >
        {n}
      </span>
      <div className="min-w-0 flex-1 pt-0.5">
        <p className="font-semibold text-foreground">{title}</p>
        {children}
      </div>
    </li>
  );
}

export default function KhumsGuide({
  orgName,
  validThrough,
  khumsUrl,
  guideImageUrl,
  guideImageAlt,
  ijazaUrl,
}: KhumsGuideProps) {
  const ref = React.useRef<HTMLDialogElement>(null);
  const [copied, setCopied] = React.useState(false);

  const open = () => {
    ref.current?.showModal();
    document.documentElement.style.overflow = "hidden";
  };
  const close = () => ref.current?.close();

  const copyName = async () => {
    try {
      await navigator.clipboard.writeText(orgName);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      window.prompt("Copy this name:", orgName);
    }
  };

  return (
    <>
      <button type="button" onClick={open} className={GIVE_BTN} aria-haspopup="dialog">
        Give Khums
      </button>

      <dialog
        ref={ref}
        aria-labelledby="khums-guide-title"
        onClose={() => {
          document.documentElement.style.overflow = "";
          setCopied(false);
        }}
        className="m-0 h-dvh max-h-none w-screen max-w-none overflow-hidden bg-transparent p-0 text-foreground backdrop:bg-[rgb(10_14_28/0.62)] backdrop:backdrop-blur-[2px]"
      >
        <div
          className="flex h-full w-full items-end justify-center md:items-center md:p-6"
          onClick={(e) => {
            if (e.target === e.currentTarget) close();
          }}
        >
          <div className="relative flex max-h-[92dvh] w-full flex-col overflow-hidden rounded-t-2xl bg-card shadow-2xl md:max-h-[88vh] md:max-w-xl md:rounded-2xl">
            <div className="mx-auto mb-1 mt-2.5 h-1.5 w-10 flex-none rounded-full bg-border md:hidden" aria-hidden="true" />
            <button
              type="button"
              onClick={close}
              aria-label="Close"
              className="absolute right-3 top-3 z-10 inline-flex h-11 w-11 items-center justify-center rounded-full bg-card text-foreground ring-1 ring-border hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <X size={20} aria-hidden="true" />
            </button>

            <div className="overflow-y-auto overscroll-contain p-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] md:p-8">
              <h2 id="khums-guide-title" className="pr-12 font-serif text-3xl leading-tight text-foreground">
                Giving Khums through I.M.A.M.
              </h2>
              <p className="mt-3 text-[17px] text-muted-foreground">
                Sajjadia holds a Khums Ijaza{validThrough ? ` valid through ${validThrough}` : ""}, so Khums you
                allocate to us supports the Sajjadia Islamic Center. Payment is completed on the I.M.A.M. website.
              </p>

              <ol className="mt-6 flex flex-col gap-6">
                <Step n={1} title="Open the I.M.A.M. Khums page">
                  <a href={khumsUrl} target="_blank" rel="noopener noreferrer" className={`${GIVE_BTN} mt-3`}>
                    Go to I.M.A.M.
                    <ArrowUpRight size={18} aria-hidden="true" />
                    <span className="sr-only"> (opens in a new tab)</span>
                  </a>
                </Step>

                <Step n={2} title="Enter your amount">
                  <p className="mt-1 text-[15px] text-muted-foreground">
                    If you pay by card, I.M.A.M. asks donors to add 3.5% to cover processing fees. You can also mail a
                    check or arrange ACH with their office.
                  </p>
                </Step>

                <Step n={3} title="Select Sajjadia from the list">
                  <p className="mt-1 text-[15px] text-muted-foreground">
                    Below the amount, find us in the list of Khums authorized organizations (Corona, CA).
                  </p>
                  <div className="mt-3 flex flex-wrap items-center gap-2">
                    <span className="rounded-lg bg-muted px-3 py-2 font-semibold text-foreground">{orgName}</span>
                    <button
                      type="button"
                      onClick={copyName}
                      aria-live="polite"
                      className="inline-flex min-h-11 items-center gap-1.5 rounded-lg border border-border px-3 text-[15px] font-semibold text-foreground hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    >
                      {copied ? <Check size={16} aria-hidden="true" /> : <Copy size={16} aria-hidden="true" />}
                      {copied ? "Copied" : "Copy name"}
                    </button>
                  </div>
                  {guideImageUrl && (
                    <img
                      src={guideImageUrl}
                      alt={guideImageAlt || "Where to find Sajjadia Islamic Society in the I.M.A.M. organization list"}
                      loading="lazy"
                      className="mt-3 w-full rounded-lg border border-border"
                    />
                  )}
                </Step>
              </ol>

              <div className="mt-7 rounded-xl bg-muted p-4 text-[15px] text-foreground">
                <p>Your official Khums receipt is issued by I.M.A.M.</p>
                {ijazaUrl && (
                  <a
                    href={ijazaUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-2 inline-flex items-center gap-1.5 font-semibold text-secondary underline-offset-4 hover:underline"
                  >
                    <FileText size={16} aria-hidden="true" />
                    View our Ijaza (PDF)
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      </dialog>
    </>
  );
}
