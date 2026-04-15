const Skeleton = ({ className = '', variant = 'text' }) => {
  const variants = {
    text: 'h-4 w-full',
    title: 'h-6 w-3/4',
    card: 'h-32 w-full',
    circle: 'h-10 w-10 rounded-full',
    stat: 'h-20 w-full',
    chart: 'h-64 w-full',
  };

  return (
    <div
      className={`skeleton ${variants[variant] || variants.text} ${className}`}
    />
  );
};

export const DashboardSkeleton = () => (
  <div className="space-y-6">
    {/* Stats row */}
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {[...Array(4)].map((_, i) => (
        <Skeleton key={i} variant="stat" className="rounded-2xl" />
      ))}
    </div>
    {/* Revisions */}
    <Skeleton variant="title" />
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {[...Array(2)].map((_, i) => (
        <Skeleton key={i} variant="card" className="rounded-2xl" />
      ))}
    </div>
    {/* Recent */}
    <Skeleton variant="title" />
    <div className="space-y-3">
      {[...Array(3)].map((_, i) => (
        <Skeleton key={i} variant="text" className="h-12 rounded-xl" />
      ))}
    </div>
  </div>
);

export const ListSkeleton = () => (
  <div className="space-y-4">
    <div className="flex gap-4">
      <Skeleton className="h-10 w-64 rounded-xl" />
      <Skeleton className="h-10 w-32 rounded-xl" />
      <Skeleton className="h-10 w-32 rounded-xl" />
    </div>
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {[...Array(6)].map((_, i) => (
        <Skeleton key={i} variant="card" className="rounded-2xl" />
      ))}
    </div>
  </div>
);

export default Skeleton;
