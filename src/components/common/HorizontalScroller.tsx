import type { ReactNode } from 'react'

export const HorizontalScroller = ({ children }: { children: ReactNode }) => {
  return (
    <div className="-mx-4 overflow-x-auto px-4 pb-2">
      <div className="flex min-w-max gap-4">{children}</div>
    </div>
  )
}
