import * as React from "react";
import { CircleCheck, UserPlus, X } from "lucide-react";
import { loadTurnstile, type TurnstileApi } from "@/lib/turnstile";
import { normalizeUsPhone } from "@/lib/usPhone";

// Footer "Request to Join WhatsApp Group" button. It opens the request form in
// a pop-up styled like Contact Us.
// - US phone numbers only; other countries are rejected here and on the server.
// - City, "how do you know Sajjadia" and comments help the board vet requests.
// - Cloudflare's human check loads only when the pop-up opens.
// It uses the browser's built-in dialog, which handles Esc, keeps keyboard
// focus inside while open, and returns focus to the button when closed.

const SITE_KEY = import.meta.env.PUBLIC_TURNSTILE_SITE_KEY as string | undefined;

// Values must match the "connection" options in the subscriber schema in Sanity
const CONNECTIONS = [
  { value: "attends", label: "I attend Sajjadia programs" },
  { value: "family-friend", label: "A family member or friend attends" },
  { value: "new-to-area", label: "I'm new to the area" },
  { value: "other", label: "Other" },
];

const FIELD =
  "w-full rounded-lg border border-input bg-background px-3 py-2.5 text-sm text-foreground " +
  "placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition";
const LABEL = "text-sm font-medium";

const Required = () => (
  <span className="text-destructive" aria-hidden="true">
    {" "}*
  </span>
);

const SubscribeForm: React.FC = () => {
  const [fullName, setFullName] = React.useState("");
  const [phone, setPhone] = React.useState("");
  const [city, setCity] = React.useState("");
  const [connection, setConnection] = React.useState("");
  const [referredBy, setReferredBy] = React.useState("");
  const [comments, setComments] = React.useState("");
  const [token, setToken] = React.useState("");
  const [status, setStatus] = React.useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = React.useState("");

  const dialogRef = React.useRef<HTMLDialogElement>(null);
  const turnstileRef = React.useRef<HTMLDivElement>(null);
  const widgetIdRef = React.useRef<string | null>(null);
  const turnstileApiRef = React.useRef<TurnstileApi | null>(null);
  const verificationStarted = React.useRef(false);

  const commentsRequired = connection === "other";

  const startVerification = React.useCallback(async () => {
    if (verificationStarted.current || !SITE_KEY) return;
    verificationStarted.current = true;

    try {
      const turnstile = await loadTurnstile();
      turnstileApiRef.current = turnstile;
      if (!turnstileRef.current) return;
      widgetIdRef.current = turnstile.render(turnstileRef.current, {
        sitekey: SITE_KEY,
        theme: "auto",
        callback: (newToken: string) => setToken(newToken),
        // Turnstile fetches a fresh token on its own after this
        "expired-callback": () => setToken(""),
      });
    } catch {
      verificationStarted.current = false;
      setErrorMsg("The verification check couldn't load. Check your connection, then close and reopen this form.");
    }
  }, []);

  const resetVerification = () => {
    setToken("");
    if (turnstileApiRef.current && widgetIdRef.current) {
      turnstileApiRef.current.reset(widgetIdRef.current);
    }
  };

  const openDialog = () => {
    dialogRef.current?.showModal();
    document.body.style.overflow = "hidden";
    startVerification();
  };

  const closeDialog = () => {
    dialogRef.current?.close();
  };

  // Runs however the pop-up closes: the close button, Esc, or a click outside
  const handleClosed = () => {
    document.body.style.overflow = "";
    setErrorMsg("");
    if (status === "success") {
      // Start fresh next time
      setFullName("");
      setPhone("");
      setCity("");
      setConnection("");
      setReferredBy("");
      setComments("");
      setStatus("idle");
      setToken("");
      // The success screen replaced the form, so the old check is gone.
      // Remove it; a new one is drawn the next time the pop-up opens.
      try {
        if (turnstileApiRef.current && widgetIdRef.current) {
          turnstileApiRef.current.remove(widgetIdRef.current);
        }
      } catch {
        // Already gone with the old form; nothing to clean up
      }
      widgetIdRef.current = null;
      verificationStarted.current = false;
    }
  };

  const handleSubmit = async (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrorMsg("");

    if (!fullName.trim() || !phone.trim() || !city.trim() || !connection) {
      setErrorMsg("Please fill in all required fields.");
      return;
    }
    if (!normalizeUsPhone(phone)) {
      setErrorMsg("Please enter a valid US phone number. We can only add US numbers to the group.");
      return;
    }
    if (commentsRequired && !comments.trim()) {
      setErrorMsg("Please tell us a little about how you know Sajjadia.");
      return;
    }
    if (!token) {
      setErrorMsg("Please wait a moment for the verification check to finish, then try again.");
      return;
    }

    setStatus("loading");

    try {
      const res = await fetch("/api/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName: fullName.trim(),
          phone: phone.trim(),
          city: city.trim(),
          connection,
          referredBy: connection === "family-friend" ? referredBy.trim() : "",
          comments: comments.trim(),
          turnstileToken: token,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Something went wrong.");
      setStatus("success");
    } catch (err: any) {
      setErrorMsg(err.message || "Something went wrong. Please try again.");
      setStatus("error");
      // A verification token works only once; get a fresh one for the retry
      resetVerification();
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={openDialog}
        className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-lg bg-sidebar-foreground px-5 text-sm font-semibold text-sidebar transition-colors hover:bg-sidebar-foreground/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-sidebar"
      >
        <UserPlus size={18} aria-hidden="true" />
        Request to Join WhatsApp Group
      </button>

      <dialog
        ref={dialogRef}
        onClose={handleClosed}
        onClick={(e) => {
          // A click on the dimmed area outside the panel closes it
          if (e.target === dialogRef.current) closeDialog();
        }}
        aria-labelledby="whatsapp-dialog-title"
        className="m-auto max-h-[90dvh] w-[calc(100%-2rem)] max-w-lg overflow-hidden rounded-2xl border border-border bg-background p-0 text-foreground shadow-2xl backdrop:bg-black/70 backdrop:backdrop-blur-sm"
      >
        <div className="flex max-h-[90dvh] flex-col">
          {/* Header */}
          <div className="flex items-center justify-between gap-4 bg-sidebar px-6 py-5 text-sidebar-foreground">
            <div>
              <h2 id="whatsapp-dialog-title" className="text-lg font-semibold">
                Join our WhatsApp group
              </h2>
              <p className="mt-0.5 text-sm text-sidebar-foreground/75">A board member reviews every request</p>
            </div>
            <button
              type="button"
              onClick={closeDialog}
              aria-label="Close"
              className="rounded-full p-1 text-sidebar-foreground/75 transition-colors hover:bg-sidebar-foreground/10 hover:text-sidebar-foreground"
            >
              <X size={20} aria-hidden="true" />
            </button>
          </div>

          {status === "success" ? (
            <div className="px-6 py-12 text-center" role="status">
              <CircleCheck size={48} strokeWidth={1.5} aria-hidden="true" className="mx-auto mb-4 text-primary" />
              <h3 className="mb-2 text-xl font-semibold">Request received</h3>
              <p className="mb-6 text-sm text-muted-foreground">
                JazakAllah Khair! A board member will review your request. Once approved, we'll add you to the
                WhatsApp group.
              </p>
              <button
                type="button"
                onClick={closeDialog}
                className="rounded-lg bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
              >
                Close
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4 overflow-y-auto px-6 py-6">
              <div className="flex flex-col gap-1.5">
                <label htmlFor="sub-name" className={LABEL}>
                  Full Name
                  <Required />
                </label>
                <input
                  id="sub-name"
                  type="text"
                  autoComplete="name"
                  maxLength={100}
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className={FIELD}
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label htmlFor="sub-phone" className={LABEL}>
                  WhatsApp Number
                  <Required />
                  <span className="text-xs font-normal text-muted-foreground"> (US numbers only)</span>
                </label>
                <input
                  id="sub-phone"
                  type="tel"
                  inputMode="tel"
                  autoComplete="tel"
                  maxLength={20}
                  placeholder="(951) 555-0123"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className={FIELD}
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label htmlFor="sub-city" className={LABEL}>
                  City You Live In
                  <Required />
                </label>
                <input
                  id="sub-city"
                  type="text"
                  autoComplete="address-level2"
                  maxLength={60}
                  required
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className={FIELD}
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label htmlFor="sub-connection" className={LABEL}>
                  How Do You Know Sajjadia?
                  <Required />
                </label>
                <select
                  id="sub-connection"
                  required
                  value={connection}
                  onChange={(e) => setConnection(e.target.value)}
                  className={FIELD}
                >
                  <option value="" disabled>
                    Choose one
                  </option>
                  {CONNECTIONS.map((c) => (
                    <option key={c.value} value={c.value}>
                      {c.label}
                    </option>
                  ))}
                </select>
              </div>

              {connection === "family-friend" && (
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="sub-referred" className={LABEL}>
                    Who Do You Know at Sajjadia?{" "}
                    <span className="text-xs font-normal text-muted-foreground">(optional)</span>
                  </label>
                  <input
                    id="sub-referred"
                    type="text"
                    maxLength={100}
                    value={referredBy}
                    onChange={(e) => setReferredBy(e.target.value)}
                    className={FIELD}
                  />
                </div>
              )}

              <div className="flex flex-col gap-1.5">
                <label htmlFor="sub-comments" className={LABEL}>
                  Other Comments
                  {commentsRequired ? (
                    <Required />
                  ) : (
                    <span className="text-xs font-normal text-muted-foreground"> (optional)</span>
                  )}
                </label>
                <textarea
                  id="sub-comments"
                  rows={3}
                  maxLength={500}
                  required={commentsRequired}
                  placeholder={commentsRequired ? "Tell us a little about how you know Sajjadia" : undefined}
                  value={comments}
                  onChange={(e) => setComments(e.target.value)}
                  className={`${FIELD} resize-none`}
                />
              </div>

              {/* Cloudflare human check */}
              <div ref={turnstileRef} className="min-h-[65px]" />

              {errorMsg && (
                <p className="text-sm font-medium text-destructive" role="alert">
                  {errorMsg}
                </p>
              )}

              <button
                type="submit"
                disabled={status === "loading"}
                className="w-full rounded-lg bg-primary py-3 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {status === "loading" ? "Sending..." : "Send Request"}
              </button>
            </form>
          )}
        </div>
      </dialog>
    </>
  );
};

export default SubscribeForm;
