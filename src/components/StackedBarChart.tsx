import { useMemo } from 'react';

export interface StackedBarSeries {
  name: string;
  color: string;
}

export interface StackedBarDataPoint {
  label: string;
  values: number[];
}

interface StackedBarChartProps {
  data: StackedBarDataPoint[];
  series: StackedBarSeries[];
  height?: number;
  showGrid?: boolean;
  valueFormatter?: (value: number) => string;
  yAxisLabel?: string;
}

const PADDING = { top: 20, right: 20, bottom: 48, left: 56 };
const CHART_WIDTH = 720;

export default function StackedBarChart({
  data,
  series,
  height = 320,
  showGrid = true,
  valueFormatter = (v) => v.toString(),
  yAxisLabel,
}: StackedBarChartProps) {
  const { bars, yTicks, maxValue } = useMemo(() => {
    if (data.length === 0) {
      return { bars: [] as any[], yTicks: [] as number[], maxValue: 0 };
    }

    const chartWidth = CHART_WIDTH - PADDING.left - PADDING.right;
    const chartHeight = height - PADDING.top - PADDING.bottom;

    const totals = data.map((d) => d.values.reduce((sum, v) => sum + v, 0));
    const max = Math.max(...totals, 1);
    const roundedMax = Math.ceil(max / 10) * 10 || max;

    const barGap = 24;
    const barGroupWidth = data.length > 0 ? (chartWidth - barGap * (data.length - 1)) / data.length : 0;

    const tickCount = 5;
    const yt = Array.from({ length: tickCount + 1 }, (_, i) =>
      Math.round((roundedMax * i) / tickCount)
    );

    const bs = data.map((d, di) => {
      const groupX = PADDING.left + di * (barGroupWidth + barGap);
      let cumulativeY = 0;

      const segments = d.values.map((v, si) => {
        const segHeight = (v / roundedMax) * chartHeight;
        const y = PADDING.top + chartHeight - cumulativeY - segHeight;
        cumulativeY += segHeight;
        return {
          value: v,
          y,
          height: segHeight,
          color: series[si]?.color || '#94a3b8',
          seriesName: series[si]?.name || `系列${si + 1}`,
        };
      });

      return {
        x: groupX,
        width: barGroupWidth,
        label: d.label,
        total: d.values.reduce((sum, v) => sum + v, 0),
        segments,
      };
    });

    return { bars: bs, yTicks: yt, maxValue: roundedMax };
  }, [data, series, height]);

  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center text-gray-400 h-48">
        暂无数据
      </div>
    );
  }

  const chartHeight = height - PADDING.top - PADDING.bottom;

  return (
    <div className="w-full">
      <svg
        viewBox={`0 0 ${CHART_WIDTH} ${height}`}
        className="w-full h-auto"
        preserveAspectRatio="xMidYMid meet"
      >
        {yAxisLabel && (
          <text
            x={12}
            y={PADDING.top + chartHeight / 2}
            textAnchor="middle"
            fontSize="11"
            fill="#64748b"
            transform={`rotate(-90, 12, ${PADDING.top + chartHeight / 2})`}
          >
            {yAxisLabel}
          </text>
        )}

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
                  {valueFormatter(tick)}
                </text>
              </g>
            );
          })}

        {bars.map((bar, bi) => (
          <g key={bi}>
            {bar.segments.map((seg, si) => (
              <g key={si}>
                <rect
                  x={bar.x}
                  y={seg.y}
                  width={bar.width}
                  height={Math.max(seg.height, 0)}
                  fill={seg.color}
                  rx="4"
                  className="hover:opacity-90 transition-opacity cursor-pointer"
                >
                  <title>{`${bar.label} - ${seg.seriesName}: ${valueFormatter(seg.value)}`}</title>
                </rect>
                {seg.height > 16 && (
                  <text
                    x={bar.x + bar.width / 2}
                    y={seg.y + seg.height / 2 + 4}
                    textAnchor="middle"
                    fontSize="10"
                    fill="white"
                    fontWeight="500"
                  >
                    {seg.value > 0 ? valueFormatter(seg.value) : ''}
                  </text>
                )}
              </g>
            ))}
            <text
              x={bar.x + bar.width / 2}
              y={height - 26}
              textAnchor="middle"
              fontSize="11"
              fill="#64748b"
            >
              {bar.label}
            </text>
            <text
              x={bar.x + bar.width / 2}
              y={height - 10}
              textAnchor="middle"
              fontSize="10"
              fill="#94a3b8"
            >
              合计：{valueFormatter(bar.total)}
            </text>
          </g>
        ))}
      </svg>

      <div className="flex flex-wrap items-center justify-center gap-4 mt-4">
        {series.map((s, i) => (
          <div key={i} className="flex items-center gap-2 text-sm">
            <span
              className="w-3 h-3 rounded-sm flex-shrink-0"
              style={{ backgroundColor: s.color }}
            />
            <span className="text-gray-700">{s.name}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
