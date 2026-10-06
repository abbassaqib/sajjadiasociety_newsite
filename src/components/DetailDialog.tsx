import * as React from "react";
import DetailView from "./DetailView";
import type { DetailItem } from "@/lib/detailItems";

/**
 * One per page. Any element with data-detail-id="<item id>" opens that item.
 * Cards should be <a href={item.path} data-detail-id={item.id}> so they still
 * work as plain links without JavaScript, and Cmd/Ctrl-click opens a new tab.
 *
 * - Close: X button, Esc, click outside, or the phone's back gesture
 * - Previous / Next (or arrow keys) move between items of the same kind
 * - The URL gets ?item=<id> so the open item survives a refresh
 */
interface DetailDialogProps {
  items: DetailItem[];
}

export default function DetailDialog({ items }: DetailDialogProps) {
  const dialogRef = React.useRef<HTMLDialogElement>(null);
  const pushedRef = React.useRef(false);
  const [openId, setOpenId] = React.useState<string | null>(null);

  const item = openId ? items.find((i) => i.id === openId) ?? null : null;
  const group = item ? items.filter((i) => i.kind === item.kind) : [];
  const index = item ? group.findIndex((i) => i.id === item.id) : -1;

  const setParam = (id: string | null, how: "push" | "replace") => {
    const url = new URL(window.location.href);
    if (id) url.searchParams.set("item", id);
    else url.searchParams.delete("item");
    if (how === "push") window.history.pushState({ detailItem: id }, "", url);
    else window.history.replaceState(window.history.state, "", url);
  };

  const open = React.useCallback((id: string) => {
    setOpenId(id);
    setParam(id, "push");
    pushedRef.current = true;
  }, []);

  const close = React.useCallback(() => {
    if (pushedRef.current) {
      pushedRef.current = false;
      window.history.back(); // popstate below clears the item
    } else {
      setParam(null, "replace");
      setOpenId(null);
    }
  }, []);

  const go = (delta: number) => {
    const next = group[index + delta];
    if (!next) return;
    setOpenId(next.id);
    setParam(next.id, "replace");
  };

  // Open from a shared/refreshed URL (?item=...)
  React.useEffect(() => {
    const id = new URL(window.location.href).searchParams.get("item");
    if (id && items.some((i) => i.id === id)) setOpenId(id);
  }, [items]);

  // Back / forward buttons
  React.useEffect(() => {
    const onPop = () => {
      const id = new URL(window.location.href).searchParams.get("item");
      if (id && items.some((i) => i.id === id)) {
        setOpenId(id);
      } else {
        pushedRef.current = false;
        setOpenId(null);
      }
    };
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, [items]);

  // Clicks on any card with data-detail-id
  React.useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      const trigger = (e.target as Element | null)?.closest?.("[data-detail-id]") as HTMLElement | null;
      const id = trigger?.dataset.detailId;
      if (!id || !items.some((i) => i.id === id)) return;
      e.preventDefault();
      open(id);
    };
    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, [items, open]);

  // Show / hide the native dialog and lock page scroll
  React.useEffect(() => {
    const dlg = dialogRef.current;
    if (!dlg) return;
    if (item && !dlg.open) {
      dlg.showModal();
      document.documentElement.style.overflow = "hidden";
    } else if (!item && dlg.open) {
      dlg.close();
      document.documentElement.style.overflow = "";
    }
  }, [item]);

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby="detail-title"
      onCancel={(e) => {
        e.preventDefault(); // Esc
        close();
      }}
      onKeyDown={(e) => {
        const target = e.target as HTMLElement;
        if (target.closest("dialog") !== dialogRef.current) return; // ignore keys from the full-size viewer
        if (target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement) return;
        if (e.key === "ArrowRight") go(1);
        if (e.key === "ArrowLeft") go(-1);
      }}
      className="m-0 h-dvh max-h-none w-screen max-w-none overflow-hidden bg-transparent p-0 text-foreground backdrop:bg-[rgb(10_14_28/0.62)] backdrop:backdrop-blur-[2px]"
    >
      <div
        className="flex h-full w-full items-end justify-center md:items-center md:p-6"
        onClick={(e) => {
          if (e.target === e.currentTarget) close();
        }}
      >
        {item && (
          <DetailView
            key={item.id}
            item={item}
            mode="dialog"
            onClose={close}
            position={
              group.length > 1
                ? { index, total: group.length, onPrev: () => go(-1), onNext: () => go(1) }
                : undefined
            }
          />
        )}
      </div>
    </dialog>
  );
}
