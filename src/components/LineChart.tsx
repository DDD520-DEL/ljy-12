import { useMemo } from 'react';

export interface LineChartPoint {
  label: string;
  value: number;
}

interface LineChartProps {
  data: LineChartPoint[];
  height?: number;
  color?: string;
  showGrid?: boolean;
  showDots?: boolean;
}

const PADDING = { top: 20, right: 20, bottom: 36, left: 44 };
const CHART_WIDTH = 600;

export default function LineChart({
  data,
  height = 220,
  color = '#0ea5e9',
  showGrid = true,
  showDots = true,
}: LineChartProps) {
  const { pathD, areaD, points, yTicks, xLabels } = useMemo(() => {
    if (data.length === 0) {
      return { pathD: '', areaD: '', points: [] as { x: number; y: number; v: number }[], yTicks: [] as number[], xLabels: [] as string[] };
    }

    const chartWidth = CHART_WIDTH - PADDING.left - PADDING.right;
    const chartHeight = height - PADDING.top - PADDING.bottom;
    const maxValue = Math.max(...data.map((d) => d.value), 1);
    const minValue = 0;
    const valueRange = maxValue - minValue || 1;

    const xStep = data.length > 1 ? chartWidth / (data.length - 1) : 0;

    const pts = data.map((d, i) => ({
      x: PADDING.left + i * xStep,
      y: PADDING.top + chartHeight - ((d.value - minValue) / valueRange) * chartHeight,
      v: d.value,
    }));

    const pd = pts.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
    const ad =
      `M ${PADDING.left} ${PADDING.top + chartHeight} ` +
      pts.map((p) => `L ${p.x} ${p.y}`).join(' ') +
      ` L ${PADDING.left + chartWidth} ${PADDING.top + chartHeight} Z`;

    const tickCount = 4;
    const yt = Array.from({ length: tickCount + 1 }, (_, i) =>
      Math.round(minValue + (valueRange * i) / tickCount)
    );
    const xl = data.map((d) => d.label);

    return { pathD: pd, areaD: ad, points: pts, yTicks: yt, xLabels: xl };
  }, [data, height]);

  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center text-gray-400 h-48">
        暂无数据
      </div>
    );
  }

  const chartHeight = height - PADDING.top - PADDING.bottom;

  return (
    <svg viewBox={`0 0 ${CHART_WIDTH} ${height}`} className="w-full h-auto" preserveAspectRatio="xMidYMid meet">
      <defs>
        <linearGradient id="lineGradient" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.25" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>

      {showGrid &&
        yTicks.map((tick, i) => {
          const y = PADDING.top + chartHeight - (i / (yTicks.length - 1)) * chartHeight;
          return (
            <g key={i}>
              <line
                x1={PADDING.left}
                y1={y}
                x2={CHART_WIDTH - PADDING.right}
                y2={y}
                stroke="#f1f5f9"
                strokeWidth="1"
              />
              <text
                x={PADDING.left - 8}
                y={y + 4}
                textAnchor="end"
                fontSize="11"
                fill="#94a3b8"
              >
                {tick}
              </text>
            </g>
          );
        })}

      <path d={areaD} fill="url(#lineGradient)" />
      <path d={pathD} fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />

      {showDots &&
        points.map((p, i) => (
          <g key={i}>
            <circle cx={p.x} cy={p.y} r="5" fill="white" stroke={color} strokeWidth="2.5" />
            <title>{`${xLabels[i]}: ${p.v} 次`}</title>
          </g>
        ))}

      {xLabels.map((label, i) => {
        const xStep = data.length > 1 ? (CHART_WIDTH - PADDING.left - PADDING.right) / (data.length - 1) : 0;
        const showLabel = data.length <= 15 || i % Math.ceil(data.length / 10) === 0 || i === data.length - 1;
        if (!showLabel) return null;
        return (
          <text
            key={i}
            x={PADDING.left + i * xStep}
            y={height - 14}
            textAnchor="middle"
            fontSize="11"
            fill="#64748b"
          >
            {label}
          </text>
        );
      })}
    </svg>
  );
}
