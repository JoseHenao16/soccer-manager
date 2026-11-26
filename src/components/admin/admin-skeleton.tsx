export function AdminSkeleton() {
  return (
    <div className="space-y-4" role="status" aria-label="Cargando">
      <div className="h-10 w-full max-w-sm skeleton rounded-lg" />
      <div className="h-72 skeleton rounded-2xl" />
    </div>
  );
}
