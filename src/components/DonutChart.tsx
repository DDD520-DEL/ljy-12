import { useMemo } from 'react';

export interface DonutChartItem {
  label: string;
  value: number;
  color: string;
}

interface DonutChartProps {
  data: DonutChartItem[];
  size?: number;
  thickness?: number;
  centerLabel?: string;
  centerValue?: string | number;
}

export default function DonutChart({
  data,
  size = 240,
  thickness = 36,
  centerLabel,
  centerValue,
}: DonutChartProps) {
  const { segments, total } = useMemo(() => {
    const t = data.reduce((sum, d) => sum + d.value, 0);
    if (t === 0) return { segments: [], total: 0 };

    let acc = 0;
    const segs = data.map((d) => {
      const startAngle = (acc / t) * Math.PI * 2 - Math.PI / 2;
      acc += d.value;
      const endAngle = (acc / t) * Math.PI * 2 - Math.PI / 2;
      return { ...d, startAngle, endAngle };
    });
    return { segments: segs, total: t };
  }, [data]);

  const radius = size / 2 - thickness / 2;
  const innerRadius = radius - thickness / 2;
  const cx = size / 2;
  const cy = size / 2;

  const describeArc = (startAngle: number, endAngle: number) => {
    const largeArc = endAngle - startAngle > Math.PI ? 1 : 0;
    const x1 = cx + radius * Math.cos(startAngle);
    const y1 = cy + radius * Math.sin(startAngle);
    const x2 = cx + radius * Math.cos(endAngle);
    const y2 = cy + radius * Math.sin(endAngle);
    const x3 = cx + innerRadius * Math.cos(endAngle);
    const y3 = cy + innerRadius * Math.sin(endAngle);
    const x4 = cx + innerRadius * Math.cos(startAngle);
    const y4 = cy + innerRadius * Math.sin(startAngle);
    return [
      `M ${x1} ${y1}`,
      `A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2}`,
      `L ${x3} ${y3}`,
      `A ${innerRadius} ${innerRadius} 0 ${largeArc} 0 ${x4} ${y4}`,
      'Z',
    ].join(' ');
  };

  if (total === 0) {
    return (
      <div className="flex flex-col items-center justify-center">
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
          <circle cx={cx} cy={cy} r={radius} fill="none" stroke="#e2e8f0" strokeWidth={thickness} />
        </svg>
        <p className="text-gray-400 mt-2">暂无数据</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col md:flex-row items-center gap-6">
      <div className="relative">
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
          {segments.map((seg, i) => (
            <path
              key={i}
              d={describeArc(seg.startAngle, seg.endAngle)}
              fill={seg.color}
              className="hover:opacity-90 transition-opacity cursor-pointer"
            >
              <title>{`${seg.label}: ${seg.value} (${((seg.value / total) * 100).toFixed(1)}%)`}</title>
            </path>
          ))}
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          {centerValue !== undefined && (
            <p className="text-3xl font-bold text-gray-800">{centerValue}</p>
          )}
          {centerLabel && (
            <p className="text-sm text-gray-500">{centerLabel}</p>
          )}
        </div>
      </div>
      <div className="flex flex-col gap-2 min-w-[180px]">
        {data.map((d, i) => (
          <div key={i} className="flex items-center gap-2 text-sm">
            <span
              className="w-3 h-3 rounded-full flex-shrink-0"
              style={{ backgroundColor: d.color }}
            />
            <span className="text-gray-700 flex-1 truncate">{d.label}</span>
            <span className="text-gray-500 font-mono text-xs">
              {d.value} ({((d.value / total) * 100).toFixed(0)}%)
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
