export function Mark({
  state,
  label,
}: {
  state: "pass" | "fail" | "pending";
  label: string;
}) {
  return (
    <div className="flex items-start gap-3 text-[15px] leading-6">
      <span className="mt-0.5 inline-flex h-5 w-5 shrink-0 items-center justify-center" aria-hidden>
        {state === "pass" ? <CheckIcon /> : null}
        {state === "fail" ? <CrossIcon /> : null}
        {state === "pending" ? <PendingIcon /> : null}
      </span>
      <span className={state === "fail" ? "text-ink" : "text-ink"}>{label}</span>
    </div>
  );
}

function CheckIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
      <path
        d="M3.5 9.2 7.1 12.7 14.5 5.2"
        stroke="var(--color-accent)"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function CrossIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
      <path
        d="M5 5 13 13M13 5 5 13"
        stroke="var(--color-danger)"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
    </svg>
  );
}

function PendingIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
      <circle cx="9" cy="9" r="5.25" stroke="var(--color-line)" strokeWidth="1.4" />
    </svg>
  );
}
