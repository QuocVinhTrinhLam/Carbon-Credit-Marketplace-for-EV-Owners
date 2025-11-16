import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts";

type LineChartProps<T extends string> = {
  title?: string;
  data: Array<Record<T, number | string>>;
  dataKey: T;
  xKey: keyof Record<T, number | string>;
  color?: string;
};

export function GradientAreaChart<T extends string>({
  data,
  dataKey,
  xKey,
  color = "#2BA84A"
}: LineChartProps<T>) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart data={data}>
        <defs>
          <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor={color} stopOpacity={0.8} />
            <stop offset="95%" stopColor={color} stopOpacity={0.1} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey={xKey as string} />
        <YAxis />
        <Tooltip />
        <Area
          type="monotone"
          dataKey={dataKey}
          stroke={color}
          fill="url(#chartGradient)"
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}

