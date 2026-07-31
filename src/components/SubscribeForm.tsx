import * as React from "react";

const SubscribeForm: React.FC = () => {
  const [fullName, setFullName] = React.useState("");
  const [phone, setPhone] = React.useState("");
  const [status, setStatus] = React.useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = React.useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim() || !phone.trim()) {
      setErrorMsg("Please fill in both fields.");
      return;
    }
    setStatus("loading");
    setErrorMsg("");

    try {
      const res = await fetch("/api/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fullName: fullName.trim(), phone: phone.trim() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Something went wrong.");
      setStatus("success");
    } catch (err: any) {
      setErrorMsg(err.message);
      setStatus("error");
    }
  };

  if (status === "success") {
    return (
      <div className="rounded-xl bg-sidebar-foreground/10 p-4 text-center">
        <p className="text-lg mb-1">✅ Request Received!</p>
        <p className="text-sidebar-foreground/70 text-sm">
          JazakAllah Khair! We'll add you to the WhatsApp group soon.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3">
      <input
        type="text"
        placeholder="Full Name"
        value={fullName}
        onChange={(e) => setFullName(e.target.value)}
        required
        className="rounded-lg bg-sidebar-foreground/10 border border-sidebar-foreground/20 px-3 py-2.5 text-sm text-sidebar-foreground placeholder:text-sidebar-foreground/40 focus:outline-none focus:ring-2 focus:ring-accent"
      />
      <input
        type="tel"
        placeholder="Phone Number"
        value={phone}
        onChange={(e) => setPhone(e.target.value)}
        required
        className="rounded-lg bg-sidebar-foreground/10 border border-sidebar-foreground/20 px-3 py-2.5 text-sm text-sidebar-foreground placeholder:text-sidebar-foreground/40 focus:outline-none focus:ring-2 focus:ring-accent"
      />
      {errorMsg && (
        <p className="text-red-400 text-xs">{errorMsg}</p>
      )}
      <button
        type="submit"
        disabled={status === "loading"}
        className="rounded-lg bg-accent text-accent-foreground font-semibold py-2.5 text-sm hover:bg-accent/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {status === "loading" ? "Submitting..." : "Join WhatsApp Group"}
      </button>
    </form>
  );
};

export default SubscribeForm;
