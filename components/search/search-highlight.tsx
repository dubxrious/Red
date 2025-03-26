interface SearchHighlightProps {
  text: string
  query: string
  className?: string
}

export function SearchHighlight({ text, query, className = "" }: SearchHighlightProps) {
  if (!query.trim()) {
    return <span className={className}>{text}</span>
  }

  const parts = text.split(new RegExp(`(${query})`, "gi"))

  return (
    <span className={className}>
      {parts.map((part, i) =>
        part.toLowerCase() === query.toLowerCase() ? (
          <mark key={i} className="bg-yellow-100 dark:bg-yellow-900/30 px-0.5 rounded">
            {part}
          </mark>
        ) : (
          part
        ),
      )}
    </span>
  )
}

