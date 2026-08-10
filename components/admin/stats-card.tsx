import { LucideIcon, TrendingUp, TrendingDown } from 'lucide-react'
import { cn } from '@/lib/utils'

interface StatsCardProps {
  title: string
  value: string | number
  icon: LucideIcon
  trend?: string
  trendUp?: boolean
  subtitle?: string
  className?: string
  gradient?: string
}

export function StatsCard({
  title,
  value,
  icon: Icon,
  trend,
  trendUp,
  subtitle,
  className,
  gradient,
}: StatsCardProps) {
  return (
    <div className={cn('relative group', className)}>
      {/* Background glow */}
      <div
        className="absolute -inset-0.5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-xl"
        style={{
          background: gradient || 'linear-gradient(135deg, rgba(255,106,0,0.3), rgba(255,60,0,0.2))',
        }}
      />

      <div className="phoenix-card relative p-5 md:p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <p className="text-xs font-medium uppercase tracking-wider text-[#71717A]">{title}</p>
            <p className="text-2xl md:text-3xl font-bold text-white mt-2 tracking-tight">
              {typeof value === 'number' ? value.toLocaleString() : value}
            </p>
            {subtitle && (
              <p className="mt-1 text-xs text-[#71717A]">{subtitle}</p>
            )}
          </div>
          <div className="phoenix-icon-box h-12 w-12">
            <Icon className="h-6 w-6" />
          </div>
        </div>

        {trend && (
          <div className="flex items-center gap-2">
            <div
              className={cn(
                'flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium',
                trendUp ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'
              )}
            >
              {trendUp ? (
                <TrendingUp className="w-3 h-3" />
              ) : (
                <TrendingDown className="w-3 h-3" />
              )}
              <span>{trend}</span>
            </div>
            <span className="text-xs text-gray-500">vs last period</span>
          </div>
        )}
      </div>
    </div>
  )
}
