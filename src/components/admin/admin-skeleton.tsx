export function AdminSkeleton() {
  return (
    <div className="space-y-4" role="status" aria-label="Cargando">
      <div className="h-10 w-full max-w-sm animate-pulse rounded-lg bg-pitch-800" />
      <div className="h-72 animate-pulse rounded-xl bg-pitch-800" />
    </div>
  );
}
