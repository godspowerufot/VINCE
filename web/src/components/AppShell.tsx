import Link from "next/link";
import { WalletButton } from "@/components/WalletButton";

const LINKS = [
  { href: "/", label: "Home", id: "home" },
  { href: "/gate", label: "Gate", id: "gate" },
  { href: "/vault", label: "Vault", id: "vault" },
  { href: "/markets", label: "Markets", id: "markets" },
  { href: "/activity", label: "Activity", id: "activity" },
] as const;

export function AppShell({
  active,
  children,
}: {
  active?: "gate" | "vault" | "activity" | "home" | "markets";
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-dvh flex-col lg:flex-row">
      <aside className="flex shrink-0 flex-col border-b border-line bg-rail py-5 pl-10 pr-6 lg:w-72 lg:border-b-0 lg:border-r lg:py-8 lg:pl-14 lg:pr-8">
        <Link
          href="/"
          className="font-display text-[15px] font-medium tracking-[0.08em] text-ink"
        >
          VINCE
        </Link>
        <nav className="mt-5 flex flex-wrap gap-x-6 gap-y-2 text-[13px] lg:mt-12 lg:flex-col lg:gap-3">
          {LINKS.map((link) => {
            const isActive = active === link.id;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={
                  isActive
                    ? "text-ink"
                    : "text-mute transition-colors duration-200 hover:text-ink"
                }
              >
                {link.label}
              </Link>
            );
          })}
        </nav>
        <div className="mt-6 space-y-3 lg:mt-auto">
          <WalletButton />
          <p className="hidden text-[12px] leading-5 text-mute lg:block">
            Ethereum source.
            <br />
            Sepolia policy.
          </p>
        </div>
      </aside>
      <div className="min-h-0 min-w-0 flex-1 lg:min-h-dvh">{children}</div>
    </div>
  );
}

export function Split({
  left,
  right,
}: {
  left: React.ReactNode;
  right: React.ReactNode;
}) {
  return (
    <div className="grid min-h-full lg:min-h-dvh lg:grid-cols-2 lg:items-stretch">
      <section className="py-10 pl-10 pr-6 md:pl-14 md:pr-10 lg:py-14 lg:pl-16 lg:pr-12">{left}</section>
      <section className="border-t border-line py-10 pl-10 pr-6 md:pl-14 md:pr-10 lg:border-t-0 lg:border-l lg:py-14 lg:pl-16 lg:pr-12">
        {right}
      </section>
    </div>
  );
}
