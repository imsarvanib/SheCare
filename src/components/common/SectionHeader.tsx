interface SectionHeaderProps {
  title: string
  subtitle?: string
}

export const SectionHeader = ({ title, subtitle }: SectionHeaderProps) => {
  return (
    <header className="space-y-2">
      <h1 className="font-delta text-4xl text-rose-700 md:text-5xl">{title}</h1>
      {subtitle ? <p className="shecare-text-muted max-w-3xl text-sm md:text-base">{subtitle}</p> : null}
    </header>
  )
}
