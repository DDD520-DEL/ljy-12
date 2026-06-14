import { useState, useMemo } from 'react';
import {
  FolderKanban,
  TrendingUp,
  Users,
  ShieldCheck,
  PieChart,
  BarChart3,
  Calendar,
  CalendarClock,
  ChevronDown,
  CheckCircle2,
  Clock,
  AlertCircle,
  Wallet,
  Cloud,
  Mail,
  Share2,
  Repeat,
  Folder,
  Info,
} from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import { ASSET_TYPE_LABELS } from '@/constants';
import DonutChart, { DonutChartItem } from '@/components/DonutChart';
import StackedBarChart, { StackedBarSeries, StackedBarDataPoint } from '@/components/StackedBarChart';
import { cn } from '@/lib/utils';
import type { AssetType } from '@/types';

type TimeRange = 'quarterly' | 'yearly';

const ASSET_TYPE_COLORS: Record<AssetType, string> = {
  social_media: '#6366f1',
  cloud_storage: '#06b6d4',
  crypto_wallet: '#f59e0b',
  subscription: '#10b981',
  email: '#ef4444',
  other: '#8b5cf6',
};

const ASSET_TYPE_ICONS: Record<AssetType, typeof Wallet> = {
  social_media: Share2,
  cloud_storage: Cloud,
  crypto_wallet: Wallet,
  subscription: Repeat,
  email: Mail,
  other: Folder,
};

export default function AssetCategoryStats() {
  const assets = useAppStore((state) => state.assets);
  const heirs = useAppStore((state) => state.heirs);

  const [timeRange, setTimeRange] = useState<TimeRange>('quarterly');
  const [showTimeDropdown, setShowTimeDropdown] = useState(false);

  const now = new Date();
  const currentYear = now.getFullYear();

  const quarterLabels = ['Q1', 'Q2', 'Q3', 'Q4'];
  const yearLabels = useMemo(() => {
    const years = [];
    for (let y = currentYear - 2; y <= currentYear; y++) {
      years.push(`${y}`);
    }
    return years;
  }, [currentYear]);

  const timeLabels = timeRange === 'quarterly' ? quarterLabels : yearLabels;

  const getAssetQuarter = (dateStr: string) => {
    const d = new Date(dateStr);
    return Math.floor(d.getMonth() / 3);
  };

  const getAssetYear = (dateStr: string) => {
    return new Date(dateStr).getFullYear();
  };

  const isAssetInTimeRange = (dateStr: string, label: string) => {
    if (timeRange === 'quarterly') {
      const idx = quarterLabels.indexOf(label);
      return getAssetYear(dateStr) === currentYear && getAssetQuarter(dateStr) === idx;
    } else {
      return getAssetYear(dateStr) === parseInt(label, 10);
    }
  };

  const totalAssets = assets.length;
  const totalValue = assets.reduce((sum, a) => sum + (a.value || 0), 0);
  const assignedAssets = assets.filter((a) => a.heirId).length;
  const coverageRate = totalAssets > 0 ? Math.round((assignedAssets / totalAssets) * 100) : 0;

  const assetsWithFallback = assets.filter((a) => a.heirChain.length > 1).length;
  const verifiedHeirs = heirs.filter((h) => h.isVerified).length;

  const typeCountData = useMemo(() => {
    const result: DonutChartItem[] = [];
    (Object.keys(ASSET_TYPE_LABELS) as AssetType[]).forEach((type) => {
      const count = assets.filter((a) => a.type === type).length;
      if (count > 0) {
        result.push({
          label: ASSET_TYPE_LABELS[type],
          value: count,
          color: ASSET_TYPE_COLORS[type],
        });
      }
    });
    return result;
  }, [assets]);

  const typeValueData = useMemo(() => {
    const result: DonutChartItem[] = [];
    (Object.keys(ASSET_TYPE_LABELS) as AssetType[]).forEach((type) => {
      const value = assets
        .filter((a) => a.type === type)
        .reduce((sum, a) => sum + (a.value || 0), 0);
      if (value > 0) {
        result.push({
          label: ASSET_TYPE_LABELS[type],
          value,
          color: ASSET_TYPE_COLORS[type],
        });
      }
    });
    return result;
  }, [assets]);

  const stackedValueSeries: StackedBarSeries[] = useMemo(() => {
    return (Object.keys(ASSET_TYPE_LABELS) as AssetType[]).map((type) => ({
      name: ASSET_TYPE_LABELS[type],
      color: ASSET_TYPE_COLORS[type],
    }));
  }, []);

  const stackedValueData = useMemo((): StackedBarDataPoint[] => {
    return timeLabels.map((label) => {
      const values = (Object.keys(ASSET_TYPE_LABELS) as AssetType[]).map((type) => {
        return assets
          .filter((a) => a.type === type && isAssetInTimeRange(a.createdAt, label))
          .reduce((sum, a) => sum + (a.value || 0), 0);
      });
      return { label, values };
    });
  }, [assets, timeLabels, timeRange]);

  const stackedCoverageSeries: StackedBarSeries[] = [
    { name: '已分配并验证', color: '#10b981' },
    { name: '已分配待验证', color: '#f59e0b' },
    { name: '未分配', color: '#ef4444' },
  ];

  const stackedCoverageData = useMemo((): StackedBarDataPoint[] => {
    return timeLabels.map((label) => {
      const periodAssets = assets.filter((a) => isAssetInTimeRange(a.createdAt, label));
      const verifiedAssigned = periodAssets.filter(
        (a) => a.heirId && heirs.find((h) => h.id === a.heirId)?.isVerified
      ).length;
      const pendingAssigned = periodAssets.filter(
        (a) => a.heirId && !heirs.find((h) => h.id === a.heirId)?.isVerified
      ).length;
      const unassigned = periodAssets.filter((a) => !a.heirId).length;
      return {
        label,
        values: [verifiedAssigned, pendingAssigned, unassigned],
      };
    });
  }, [assets, heirs, timeLabels, timeRange]);

  const typeBreakdown = useMemo(() => {
    return (Object.keys(ASSET_TYPE_LABELS) as AssetType[]).map((type) => {
      const typeAssets = assets.filter((a) => a.type === type);
      const count = typeAssets.length;
      const value = typeAssets.reduce((sum, a) => sum + (a.value || 0), 0);
      const assigned = typeAssets.filter((a) => a.heirId).length;
      const countPercent = totalAssets > 0 ? Math.round((count / totalAssets) * 100) : 0;
      const valuePercent = totalValue > 0 ? Math.round((value / totalValue) * 100) : 0;
      const coverage = count > 0 ? Math.round((assigned / count) * 100) : 0;
      return {
        type,
        count,
        value,
        assigned,
        countPercent,
        valuePercent,
        coverage,
      };
    }).filter((t) => t.count > 0);
  }, [assets, totalAssets, totalValue]);

  const statCards = [
    {
      title: '资产总数',
      value: totalAssets,
      icon: FolderKanban,
      color: 'from-blue-500 to-indigo-600',
      subtitle: `${Object.keys(ASSET_TYPE_LABELS).filter(
        (t) => assets.some((a) => a.type === t)
      ).length} 个分类`,
      trend: '+12%',
      trendUp: true,
    },
    {
      title: '资产估值',
      value: `¥${totalValue.toLocaleString()}`,
      icon: TrendingUp,
      color: 'from-emerald-500 to-teal-600',
      subtitle: `平均 ¥${totalAssets > 0 ? Math.round(totalValue / totalAssets).toLocaleString() : 0}/项`,
      trend: '+8.5%',
      trendUp: true,
    },
    {
      title: '分配覆盖率',
      value: `${coverageRate}%`,
      icon: ShieldCheck,
      color: coverageRate >= 80 ? 'from-green-500 to-emerald-600' : coverageRate >= 50 ? 'from-amber-500 to-orange-600' : 'from-red-500 to-rose-600',
      subtitle: `${assignedAssets}/${totalAssets} 项已分配`,
      trend: assignedAssets > 0 ? `+${assetsWithFallback}项兜底` : '待完善',
      trendUp: coverageRate >= 50,
    },
    {
      title: '继承人验证',
      value: `${verifiedHeirs}/${heirs.length}`,
      icon: Users,
      color: 'from-violet-500 to-purple-600',
      subtitle: heirs.length > 0 ? `${Math.round((verifiedHeirs / heirs.length) * 100)}% 已验证` : '暂无继承人',
      trend: verifiedHeirs === heirs.length && heirs.length > 0 ? '全部完成' : `${heirs.length - verifiedHeirs}人待验证`,
      trendUp: verifiedHeirs === heirs.length,
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">资产分类统计</h1>
          <p className="text-gray-500 mt-1">
            多维度展示数字资产在不同分类下的数量分布、价值占比与继承分配覆盖率
          </p>
        </div>
        <div className="relative">
          <button
            onClick={() => setShowTimeDropdown(!showTimeDropdown)}
            className="flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors shadow-sm"
          >
            {timeRange === 'quarterly' ? (
              <Calendar className="w-4 h-4 text-indigo-600" />
            ) : (
              <CalendarClock className="w-4 h-4 text-violet-600" />
            )}
            <span className="font-medium text-gray-700">
              {timeRange === 'quarterly' ? '季度视图' : '年度视图'}
            </span>
            <ChevronDown
              className={cn(
                'w-4 h-4 text-gray-400 transition-transform',
                showTimeDropdown && 'rotate-180'
              )}
            />
          </button>
          {showTimeDropdown && (
            <>
              <div
                className="fixed inset-0 z-10"
                onClick={() => setShowTimeDropdown(false)}
              />
              <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden z-20">
                <button
                  onClick={() => {
                    setTimeRange('quarterly');
                    setShowTimeDropdown(false);
                  }}
                  className={cn(
                    'w-full flex items-center gap-2 px-4 py-3 text-left hover:bg-indigo-50 transition-colors',
                    timeRange === 'quarterly' && 'bg-indigo-50 text-indigo-700'
                  )}
                >
                  <Calendar className="w-4 h-4" />
                  <span className="font-medium">季度视图</span>
                  {timeRange === 'quarterly' && (
                    <CheckCircle2 className="w-4 h-4 ml-auto text-indigo-600" />
                  )}
                </button>
                <button
                  onClick={() => {
                    setTimeRange('yearly');
                    setShowTimeDropdown(false);
                  }}
                  className={cn(
                    'w-full flex items-center gap-2 px-4 py-3 text-left hover:bg-violet-50 transition-colors',
                    timeRange === 'yearly' && 'bg-violet-50 text-violet-700'
                  )}
                >
                  <CalendarClock className="w-4 h-4" />
                  <span className="font-medium">年度视图</span>
                  {timeRange === 'yearly' && (
                    <CheckCircle2 className="w-4 h-4 ml-auto text-violet-600" />
                  )}
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        {statCards.map((card, idx) => {
          const Icon = card.icon;
          return (
            <div
              key={idx}
              className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between mb-4">
                <div
                  className={cn(
                    'w-12 h-12 rounded-xl bg-gradient-to-br flex items-center justify-center',
                    card.color
                  )}
                >
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <div
                  className={cn(
                    'flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium',
                    card.trendUp
                      ? 'bg-emerald-50 text-emerald-600'
                      : 'bg-amber-50 text-amber-600'
                  )}
                >
                  {card.trendUp ? <TrendingUp className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
                  {card.trend}
                </div>
              </div>
              <div>
                <p className="text-3xl font-bold text-gray-900">{card.value}</p>
                <p className="text-sm font-medium text-gray-700 mt-1">{card.title}</p>
                <p className="text-xs text-gray-400 mt-1">{card.subtitle}</p>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-100 flex items-center justify-center">
                <PieChart className="w-5 h-5 text-indigo-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">数量分布</h3>
                <p className="text-sm text-gray-500">各分类资产数量占比</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-gray-900">{totalAssets}</p>
              <p className="text-xs text-gray-400">资产总数（项）</p>
            </div>
          </div>
          <DonutChart
            data={typeCountData}
            size={240}
            thickness={36}
            centerLabel="总资产数"
            centerValue={totalAssets}
          />
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-emerald-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">价值占比</h3>
                <p className="text-sm text-gray-500">各分类资产估值占比</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-emerald-600">
                ¥{totalValue.toLocaleString()}
              </p>
              <p className="text-xs text-gray-400">总估值（元）</p>
            </div>
          </div>
          <DonutChart
            data={typeValueData}
            size={240}
            thickness={36}
            centerLabel="总估值"
            centerValue={`¥${(totalValue / 10000).toFixed(1)}万`}
          />
        </div>
      </div>

      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-100 flex items-center justify-center">
              <BarChart3 className="w-5 h-5 text-cyan-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">价值趋势分析</h3>
              <p className="text-sm text-gray-500">
                {timeRange === 'quarterly' ? `${currentYear}年各季度` : '近3年'} 各分类资产价值分布
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-xs text-gray-500 bg-gray-50 px-3 py-2 rounded-lg">
            <Info className="w-3.5 h-3.5" />
            <span>单位：人民币（元）</span>
          </div>
        </div>
        <StackedBarChart
          data={stackedValueData}
          series={stackedValueSeries}
          height={320}
          valueFormatter={(v) =>
            v >= 10000 ? `${(v / 10000).toFixed(1)}万` : v.toString()
          }
          yAxisLabel="资产价值"
        />
      </div>

      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-violet-100 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5 text-violet-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">继承分配覆盖率</h3>
              <p className="text-sm text-gray-500">
                {timeRange === 'quarterly' ? `${currentYear}年各季度` : '近3年'} 资产分配与验证状态
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 rounded-lg">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span className="text-sm font-medium text-emerald-700">
                整体覆盖率 {coverageRate}%
              </span>
            </div>
          </div>
        </div>
        <StackedBarChart
          data={stackedCoverageData}
          series={stackedCoverageSeries}
          height={300}
          valueFormatter={(v) => `${v}项`}
          yAxisLabel="资产数量"
        />
      </div>

      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center">
              <FolderKanban className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">分类明细</h3>
              <p className="text-sm text-gray-500">各分类资产详细数据对比</p>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">分类</th>
                <th className="text-right py-3 px-4 text-sm font-medium text-gray-500">数量</th>
                <th className="text-right py-3 px-4 text-sm font-medium text-gray-500">数量占比</th>
                <th className="text-right py-3 px-4 text-sm font-medium text-gray-500">估值</th>
                <th className="text-right py-3 px-4 text-sm font-medium text-gray-500">价值占比</th>
                <th className="text-right py-3 px-4 text-sm font-medium text-gray-500">已分配</th>
                <th className="text-center py-3 px-4 text-sm font-medium text-gray-500">覆盖率</th>
              </tr>
            </thead>
            <tbody>
              {typeBreakdown.map((item) => {
                const TypeIcon = ASSET_TYPE_ICONS[item.type];
                return (
                  <tr
                    key={item.type}
                    className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors"
                  >
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-3">
                        <div
                          className="w-9 h-9 rounded-lg flex items-center justify-center"
                          style={{ backgroundColor: `${ASSET_TYPE_COLORS[item.type]}20` }}
                        >
                          <TypeIcon
                            className="w-4.5 h-4.5"
                            style={{ color: ASSET_TYPE_COLORS[item.type] }}
                          />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">
                            {ASSET_TYPE_LABELS[item.type]}
                          </p>
                          <p className="text-xs text-gray-400">{item.type}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-4 text-right">
                      <span className="font-semibold text-gray-900">{item.count}</span>
                      <span className="text-xs text-gray-400 ml-1">项</span>
                    </td>
                    <td className="py-4 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <div className="w-24 h-2 bg-gray-100 rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full transition-all"
                            style={{
                              width: `${item.countPercent}%`,
                              backgroundColor: ASSET_TYPE_COLORS[item.type],
                            }}
                          />
                        </div>
                        <span className="text-sm font-medium text-gray-700 w-12 text-right">
                          {item.countPercent}%
                        </span>
                      </div>
                    </td>
                    <td className="py-4 px-4 text-right">
                      <span className="font-semibold text-emerald-600">
                        ¥{item.value.toLocaleString()}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <div className="w-24 h-2 bg-gray-100 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-emerald-400 rounded-full transition-all"
                            style={{ width: `${item.valuePercent}%` }}
                          />
                        </div>
                        <span className="text-sm font-medium text-gray-700 w-12 text-right">
                          {item.valuePercent}%
                        </span>
                      </div>
                    </td>
                    <td className="py-4 px-4 text-right">
                      <span className="font-medium text-gray-700">
                        {item.assigned}/{item.count}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center justify-center gap-2">
                        {item.coverage >= 80 ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                        ) : item.coverage >= 50 ? (
                          <Clock className="w-4 h-4 text-amber-500 flex-shrink-0" />
                        ) : (
                          <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
                        )}
                        <div className="flex-1 max-w-[120px]">
                          <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                            <div
                              className={cn(
                                'h-full rounded-full transition-all',
                                item.coverage >= 80
                                  ? 'bg-emerald-500'
                                  : item.coverage >= 50
                                  ? 'bg-amber-500'
                                  : 'bg-red-500'
                              )}
                              style={{ width: `${item.coverage}%` }}
                            />
                          </div>
                        </div>
                        <span
                          className={cn(
                            'text-sm font-semibold w-12 text-right',
                            item.coverage >= 80
                              ? 'text-emerald-600'
                              : item.coverage >= 50
                              ? 'text-amber-600'
                              : 'text-red-600'
                          )}
                        >
                          {item.coverage}%
                        </span>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {typeBreakdown.length === 0 && (
          <div className="text-center py-12">
            <FolderKanban className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">暂无资产数据</p>
          </div>
        )}
      </div>
    </div>
  );
}
