export default function GamePage() {
  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-semibold">Game</h1>
      <p className="text-foreground/80">Game screen placeholder.</p>
      <nav className="flex flex-wrap gap-3">
        <a
          href="/"
          className="min-h-[44px] min-w-[44px] inline-flex items-center justify-center rounded-lg bg-foreground/10 px-4 py-2 font-medium cursor-pointer transition-colors hover:bg-foreground/20"
        >
          Back to Setup
        </a>
      </nav>
    </div>
  );
}
