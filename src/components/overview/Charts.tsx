import { motion } from 'framer-motion'
import { useId, useState } from 'react'

/** Gráfica de área minimalista con tooltip al pasar el cursor. */
export function AreaChart({ data, secondary, labels, height = 160 }: { data: number[]; secondary?: number[]; labels: string[]; height?: number }) {
  const id = useId()
  const [hover, setHover] = useState<number | null>(null)
  const w = 600
  const h = height
  const pad = 8
  const max = Math.max(...data) * 1.15
  const x = (i: number) => pad + (i / (data.length - 1)) * (w - pad * 2)
  const y = (v: number) => h - pad - (v / max) * (h - pad * 2)
  const line = (series: number[]) => series.map((v, i) => `${i ? 'L' : 'M'}${x(i).toFixed(1)},${y(v).toFixed(1)}`).join(' ')
  const area = `${line(data)} L${x(data.length - 1)},${h} L${x(0)},${h} Z`

  return (
    <div className="relative">
      <svg viewBox={`0 0 ${w} ${h}`} className="w-full overflow-visible" style={{ height }} preserveAspectRatio="none" onMouseLeave={() => setHover(null)}>
        <defs>
          <linearGradient id={`g-${id}`} x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="var(--brand-500)" stopOpacity="0.18" />
            <stop offset="100%" stopColor="var(--brand-500)" stopOpacity="0" />
          </linearGradient>
        </defs>
        {[0.25, 0.5, 0.75].map((t) => (
          <line key={t} x1={0} x2={w} y1={h * t} y2={h * t} stroke="#f4f4f5" strokeWidth={1} vectorEffect="non-scaling-stroke" />
        ))}
        <motion.path d={area} fill={`url(#g-${id})`} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.8 }} />
        <motion.path d={line(data)} fill="none" stroke="var(--brand-600)" strokeWidth={2} vectorEffect="non-scaling-stroke" strokeLinejoin="round" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.6 }} />
        {secondary && (
          <motion.path d={line(secondary)} fill="none" stroke="#a1a1aa" strokeWidth={1.5} strokeDasharray="4 4" vectorEffect="non-scaling-stroke" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }} />
        )}
        {data.map((_, i) => (
          <rect key={i} x={x(i) - w / data.length / 2} y={0} width={w / data.length} height={h} fill="transparent" onMouseEnter={() => setHover(i)} />
        ))}
        {hover !== null && <line x1={x(hover)} x2={x(hover)} y1={0} y2={h} stroke="#d4d4d8" strokeWidth={1} vectorEffect="non-scaling-stroke" />}
      </svg>
      {hover !== null && (
        <div className="pointer-events-none absolute top-0 -translate-x-1/2 rounded-lg bg-zinc-900 px-2.5 py-1.5 text-[11.5px] whitespace-nowrap text-white shadow-lg" style={{ left: `${(x(hover) / w) * 100}%` }}>
          <p className="text-zinc-400">{labels[hover]}</p>
          <p>
            <b className="font-semibold tabular-nums">{data[hover]}</b> conversaciones
            {secondary && <> · <b className="font-semibold tabular-nums">{secondary[hover]}</b> citas</>}
          </p>
        </div>
      )}
    </div>
  )
}

export function Donut({ value, size = 132 }: { value: number; size?: number }) {
  const r = size / 2 - 10
  const c = 2 * Math.PI * r
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="-rotate-90">
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#fde68a" strokeWidth={12} />
      <motion.circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        fill="none"
        stroke="var(--brand-600)"
        strokeWidth={12}
        strokeLinecap="round"
        strokeDasharray={c}
        initial={{ strokeDashoffset: c }}
        animate={{ strokeDashoffset: c * (1 - value / 100) + 4 }}
        transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
      />
    </svg>
  )
}

export function BarList({ items }: { items: { label: string; value: number }[] }) {
  const max = Math.max(...items.map((i) => i.value))
  return (
    <ul className="space-y-3">
      {items.map((item, i) => (
        <li key={item.label}>
          <div className="mb-1.5 flex justify-between text-[13px]">
            <span className="text-zinc-600">{item.label}</span>
            <span className="font-mono text-zinc-500 tabular-nums">{item.value}%</span>
          </div>
          <div className="h-1.5 overflow-hidden rounded-full bg-zinc-100">
            <motion.div className="h-full rounded-full bg-brand-500" initial={{ width: 0 }} animate={{ width: `${(item.value / max) * 100}%` }} transition={{ duration: 0.9, delay: 0.1 + i * 0.06, ease: [0.22, 1, 0.36, 1] }} />
          </div>
        </li>
      ))}
    </ul>
  )
}

export function HourBars({ data }: { data: number[] }) {
  const max = Math.max(...data)
  const now = new Date().getHours()
  return (
    <div>
      <div className="flex h-24 items-end gap-[3px]">
        {data.map((v, i) => (
          <motion.div
            key={i}
            title={`${i}:00 · ${v} conversaciones`}
            className={i >= 20 || i < 8 ? 'flex-1 rounded-sm bg-brand-500' : 'flex-1 rounded-sm bg-zinc-200'}
            style={{ outline: i === now ? '1.5px solid var(--brand-700)' : undefined, outlineOffset: 1 }}
            initial={{ height: 0 }}
            animate={{ height: `${Math.max(4, (v / max) * 100)}%` }}
            transition={{ duration: 0.7, delay: i * 0.02, ease: [0.22, 1, 0.36, 1] }}
          />
        ))}
      </div>
      <div className="mt-1.5 flex justify-between font-mono text-[10.5px] text-zinc-400">
        <span>00</span>
        <span>06</span>
        <span>12</span>
        <span>18</span>
        <span>23</span>
      </div>
    </div>
  )
}
