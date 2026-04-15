type TransportKind = 'metro' | 'bus' | 'train' | 'tram' | 'transport'

export function parseTransportDetails(value?: string | null) {
  return (value ?? '')
    .split('\n')
    .map((item) => item.trim())
    .filter(Boolean)
    .map((item, index) => {
      const [title, detail] = item.split('|').map((part) => part.trim())
      return {
        id: `${title ?? item}-${index}`,
        title: title || 'Transport',
        detail: detail || item,
      }
    })
}

export function TransportBadge({ title }: { title: string }) {
  const kind = getTransportKind(title)

  if (kind === 'metro') {
    return (
      <span className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-[#1E3A8A] text-base font-black text-white shadow-sm">
        M
      </span>
    )
  }

  if (kind === 'tram') {
    return (
      <span className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-[#0F9D58] text-base font-black text-white shadow-sm">
        T
      </span>
    )
  }

  if (kind === 'bus') {
    return (
      <span className="inline-flex h-11 min-w-11 items-center justify-center rounded-[1rem] bg-[#7AC143] px-3 text-[11px] font-black uppercase tracking-[0.12em] text-white shadow-sm">
        Bus
      </span>
    )
  }

  if (kind === 'train') {
    return (
      <span className="inline-flex h-11 min-w-11 items-center justify-center rounded-full bg-[#D81B60] px-3 text-[10px] font-black uppercase tracking-[0.12em] text-white shadow-sm">
        RER
      </span>
    )
  }

  return (
    <span className="inline-flex h-11 min-w-11 items-center justify-center rounded-full bg-zinc-700 px-3 text-[10px] font-black uppercase tracking-[0.12em] text-white shadow-sm">
      TR
    </span>
  )
}

function getTransportKind(title: string): TransportKind {
  const normalized = title.toLowerCase()

  if (normalized.includes('metro')) {
    return 'metro'
  }

  if (normalized.includes('bus')) {
    return 'bus'
  }

  if (normalized.includes('rer') || normalized.includes('train') || normalized.includes('gare')) {
    return 'train'
  }

  if (normalized.includes('tram')) {
    return 'tram'
  }

  return 'transport'
}
