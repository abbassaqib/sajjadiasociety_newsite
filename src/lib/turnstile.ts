/**
 * Loads Cloudflare Turnstile (the "verify you're human" check) on demand,
 * once per page. Shared by the contact form and the WhatsApp sign-up so the
 * script is never downloaded twice, even if both forms are used.
 */

export interface TurnstileApi {
  render(container: HTMLElement, options: Record<string, unknown>): string;
  reset(widgetId?: string): void;
  remove(widgetId?: string): void;
}

const READY_CALLBACK = "sajjadiaTurnstileReady";
const SRC = `https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit&onload=${READY_CALLBACK}`;

export function loadTurnstile(): Promise<TurnstileApi> {
  const w = window as any;

  if (w.turnstile) return Promise.resolve(w.turnstile);
  // Stored on window so every part of the page shares one download
  if (w.__sajjadiaTurnstileLoading) return w.__sajjadiaTurnstileLoading;

  const loading = new Promise<TurnstileApi>((resolve, reject) => {
    w[READY_CALLBACK] = () => resolve(w.turnstile);

    const script = document.createElement("script");
    script.src = SRC;
    script.async = true;
    script.onerror = () => {
      script.remove();
      w.__sajjadiaTurnstileLoading = null; // let the next attempt try again
      reject(new Error("Turnstile failed to load"));
    };
    document.head.appendChild(script);
  });

  w.__sajjadiaTurnstileLoading = loading;
  return loading;
}
