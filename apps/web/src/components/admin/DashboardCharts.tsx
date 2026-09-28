import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { useTheme } from '@/stores/theme-context';
import { useI18n } from '@/i18n/i18n-context';
import { formatMoney } from '@/lib/cn';

const STATUS_COLORS = [
  '#0070c0',
  '#1a8ad4',
  '#005a9e',
  '#38bdf8',
  '#0ea5e9',
  '#64748b',
  '#94a3b8',
  '#475569',
];

type TrendPoint = { date: string; revenue: number; orders: number };
type StatusPoint = { status: string; count: number };

function ChartTooltip({
  active,
  payload,
  label,
  money,
}: {
  active?: boolean;
  payload?: { value?: number; name?: string }[];
  label?: string;
  money?: boolean;
}) {
  const { locale } = useI18n();
  if (!active || !payload?.length) return null;
  const value = payload[0]?.value ?? 0;
  return (
    <div className="border border-line bg-elevated px-3 py-2 text-xs shadow-lg">
      <p className="text-muted">{label}</p>
      <p className="mt-1 font-kpi text-fg">
        {money ? formatMoney(value, 'USD', locale === 'ar' ? 'ar-IQ' : 'en-US') : value}
      </p>
    </div>
  );
}

export function RevenueTrendChart({ data }: { data: TrendPoint[] }) {
  const { theme } = useTheme();
  const { locale } = useI18n();
  const axis = theme === 'dark' ? '#9a9a9a' : '#5c6670';
  const grid = theme === 'dark' ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.06)';

  const series = data.map((d) => ({
    ...d,
    label: new Date(d.date).toLocaleDateString(locale === 'ar' ? 'ar-IQ' : 'en-GB', {
      month: 'short',
      day: 'numeric',
    }),
  }));

  return (
    <div className="h-72 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={series} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="revFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#0070c0" stopOpacity={0.4} />
              <stop offset="100%" stopColor="#0070c0" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid stroke={grid} strokeDasharray="3 3" vertical={false} />
          <XAxis
            dataKey="label"
            tick={{ fill: axis, fontSize: 11 }}
            axisLine={false}
            tickLine={false}
            interval="preserveStartEnd"
            minTickGap={28}
          />
          <YAxis
            tick={{ fill: axis, fontSize: 11 }}
            axisLine={false}
            tickLine={false}
            width={48}
            tickFormatter={(v) => (v >= 1000 ? `${Math.round(v / 1000)}k` : String(v))}
          />
          <Tooltip content={<ChartTooltip money />} />
          <Area
            type="monotone"
            dataKey="revenue"
            stroke="#0070c0"
            strokeWidth={2.5}
            fill="url(#revFill)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

export function OrdersStatusChart({ data }: { data: StatusPoint[] }) {
  const { theme } = useTheme();
  const axis = theme === 'dark' ? '#9a9a9a' : '#5c6670';
  const grid = theme === 'dark' ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.06)';

  return (
    <div className="h-72 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
          <CartesianGrid stroke={grid} strokeDasharray="3 3" vertical={false} />
          <XAxis
            dataKey="status"
            tick={{ fill: axis, fontSize: 10 }}
            axisLine={false}
            tickLine={false}
            interval={0}
            angle={-18}
            textAnchor="end"
            height={64}
          />
          <YAxis
            allowDecimals={false}
            tick={{ fill: axis, fontSize: 11 }}
            axisLine={false}
            tickLine={false}
            width={32}
          />
          <Tooltip content={<ChartTooltip />} />
          <Bar dataKey="count" radius={[3, 3, 0, 0]}>
            {data.map((_, i) => (
              <Cell key={i} fill={STATUS_COLORS[i % STATUS_COLORS.length]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
