import Link from "next/link";

export default function SetupPage() {
  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-semibold">Setup</h1>
      <p className="text-foreground/80">Setup screen placeholder.</p>
      <nav className="flex flex-wrap gap-3">
        <Link
          href="/game"
          className="min-h-[44px] min-w-[44px] inline-flex items-center justify-center rounded-lg bg-foreground text-background px-4 py-2 font-medium transition-colors hover:opacity-90"
        >
          Go to Game
        </Link>
      </nav>
    </div>
  );
}
