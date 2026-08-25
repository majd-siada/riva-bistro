export function Footer() {
  return (
    <footer className="border-t border-riva-ivory/10 bg-riva-black px-6 py-12 text-riva-ivory/70">
      <div className="mx-auto flex max-w-6xl flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="font-display text-2xl tracking-[0.18em] text-riva-ivory">
            RIVA
          </p>
          <p className="mt-2 max-w-sm text-sm leading-relaxed">
            Svensk gastronomi i en stillsam, cinematisk miljö.
          </p>
        </div>
        <p className="text-xs tracking-wide text-riva-ivory/50">
          © {new Date().getFullYear()} Riva Bistro
        </p>
      </div>
    </footer>
  );
}
