/** Límite de Suspense por página del admin: navegación instantánea entre pestañas. */
export default function AdminLoading() {
  return (
    <div className="space-y-4" role="status" aria-label="Cargando">
      <div className="grid grid-cols-2 gap-3 md:grid-cols-5">
        {[0, 1, 2, 3, 4].map((i) => (
          <div key={i} className="h-24 animate-pulse rounded-xl bg-pitch-800" />
        ))}
      </div>
      <div className="h-64 animate-pulse rounded-xl bg-pitch-800" />
    </div>
  );
}
