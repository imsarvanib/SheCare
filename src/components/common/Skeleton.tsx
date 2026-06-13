export const SkeletonCard = () => {
  return <div className="h-36 animate-pulse rounded-3xl bg-rose-100/60" />
}

export const SkeletonRows = () => {
  return (
    <div className="space-y-3">
      <div className="h-4 w-1/2 animate-pulse rounded-full bg-rose-100/60" />
      <div className="h-4 w-full animate-pulse rounded-full bg-rose-100/60" />
      <div className="h-4 w-5/6 animate-pulse rounded-full bg-rose-100/60" />
    </div>
  )
}
