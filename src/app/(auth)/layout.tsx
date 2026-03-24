export const dynamic = "force-dynamic";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[var(--muted)] flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="font-heading text-3xl text-[var(--foreground)]">PiattoSolidale</h1>
          <p className="text-sm text-[var(--muted-foreground)] mt-1">Solidarietà a tavola</p>
        </div>
        {children}
      </div>
    </div>
  );
}
