import { useState, useMemo, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import ExcelJS from 'exceljs';
import {
  History,
  Search,
  Shield,
  CheckCircle,
  AlertTriangle,
  Clock,
  User,
  FileText,
  FolderKanban,
  Users,
  Zap,
  ChevronDown,
  ChevronUp,
  Copy,
  Download,
  Calendar,
  Filter,
  X,
  Share2,
  TrendingUp,
  PieChart,
  RotateCcw,
} from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import {
  AUDIT_ACTION_LABELS,
  USER_ROLE_LABELS,
  formatDate,
  getResourceTypeLabel,
} from '@/constants';
import { cn } from '@/lib/utils';
import type { AuditActionType, AuditLogEntry, UserRole } from '@/types';
import LineChart, { LineChartPoint } from '@/components/LineChart';
import DonutChart, { DonutChartItem } from '@/components/DonutChart';

type TimeRangePreset = '7d' | '14d' | '30d' | 'custom' | 'all';

const CHART_COLORS = [
  '#0ea5e9', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6',
  '#ec4899', '#14b8a6', '#f97316', '#6366f1', '#84cc16',
];

const TIME_PRESETS: { label: string; value: TimeRangePreset }[] = [
  { label: '最近7天', value: '7d' },
  { label: '最近14天', value: '14d' },
  { label: '最近30天', value: '30d' },
  { label: '全部', value: 'all' },
  { label: '自定义', value: 'custom' },
];

const renderSvgToPng = (svgElement: SVGSVGElement, width: number, height: number): Promise<string> => {
  return new Promise((resolve) => {
    const clone = svgElement.cloneNode(true) as SVGSVGElement;
    clone.setAttribute('width', String(width));
    clone.setAttribute('height', String(height));
    clone.setAttribute('xmlns', 'http://www.w3.org/2000/svg');

    const inlineStyles = (el: Element, source: Element) => {
      const computed = window.getComputedStyle(source);
      Array.from(computed).forEach((prop) => {
        el.setAttribute(prop, computed.getPropertyValue(prop));
      });
      Array.from(el.children).forEach((child, i) => {
        if (source.children[i]) inlineStyles(child, source.children[i]);
      });
    };
    inlineStyles(clone, svgElement);

    const serializer = new XMLSerializer();
    const svgString = serializer.serializeToString(clone);
    const svgBlob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(svgBlob);

    const img = new Image();
    img.onload = () => {
      const scale = 2;
      const canvas = document.createElement('canvas');
      canvas.width = width * scale;
      canvas.height = height * scale;

      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.scale(scale, scale);
        ctx.drawImage(img, 0, 0, width, height);
      }

      URL.revokeObjectURL(url);
      const pngBase64 = canvas.toDataURL('image/png').split(',')[1];
      resolve(pngBase64);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      resolve('');
    };
    img.src = url;
  });
};

export default function AuditLog() {
  const auditLogs = useAppStore((state) => state.auditLogs);
  const [searchParams, setSearchParams] = useSearchParams();

  const chartContainerRef = useRef<HTMLDivElement>(null);

  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '');
  const [filterAction, setFilterAction] = useState<AuditActionType | 'all'>(
    (searchParams.get('action') as AuditActionType | 'all') || 'all'
  );
  const [filterRole, setFilterRole] = useState<UserRole | 'all'>(
    (searchParams.get('role') as UserRole | 'all') || 'all'
  );
  const [filterResource, setFilterResource] = useState<string>(
    searchParams.get('resource') || 'all'
  );
  const [timePreset, setTimePreset] = useState<TimeRangePreset>(
    (searchParams.get('time') as TimeRangePreset) || '30d'
  );
  const [customStart, setCustomStart] = useState(searchParams.get('start') || '');
  const [customEnd, setCustomEnd] = useState(searchParams.get('end') || '');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [copiedHash, setCopiedHash] = useState<string | null>(null);
  const [copiedShareUrl, setCopiedShareUrl] = useState(false);

  useEffect(() => {
    const params: Record<string, string> = {};
    if (searchQuery) params.q = searchQuery;
    if (filterAction !== 'all') params.action = filterAction;
    if (filterRole !== 'all') params.role = filterRole;
    if (filterResource !== 'all') params.resource = filterResource;
    params.time = timePreset;
    if (timePreset === 'custom') {
      if (customStart) params.start = customStart;
      if (customEnd) params.end = customEnd;
    }
    setSearchParams(params, { replace: true });
  }, [searchQuery, filterAction, filterRole, filterResource, timePreset, customStart, customEnd, setSearchParams]);

  const resourceTypes = useMemo(() => {
    const types = new Set<string>();
    auditLogs.forEach((log) => {
      if (log.resourceType) types.add(log.resourceType);
    });
    return Array.from(types);
  }, [auditLogs]);

  const timeRangeBounds = useMemo(() => {
    const now = new Date();
    if (timePreset === 'all') return { start: null, end: null };
    if (timePreset === 'custom') {
      return {
        start: customStart ? new Date(customStart + 'T00:00:00') : null,
        end: customEnd ? new Date(customEnd + 'T23:59:59') : null,
      };
    }
    const days = timePreset === '7d' ? 7 : timePreset === '14d' ? 14 : 30;
    const start = new Date(now);
    start.setDate(start.getDate() - days + 1);
    start.setHours(0, 0, 0, 0);
    return { start, end: now };
  }, [timePreset, customStart, customEnd]);

  const filteredLogs = useMemo(() => {
    return auditLogs.filter((log) => {
      const matchesSearch =
        !searchQuery ||
        log.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        log.userId.toLowerCase().includes(searchQuery.toLowerCase()) ||
        log.transactionHash.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesAction = filterAction === 'all' || log.action === filterAction;
      const matchesRole = filterRole === 'all' || log.userRole === filterRole;
      const matchesResource = filterResource === 'all' || log.resourceType === filterResource;

      const logTime = new Date(log.timestamp);
      const matchesStart = !timeRangeBounds.start || logTime >= timeRangeBounds.start;
      const matchesEnd = !timeRangeBounds.end || logTime <= timeRangeBounds.end;

      return matchesSearch && matchesAction && matchesRole && matchesResource && matchesStart && matchesEnd;
    });
  }, [auditLogs, searchQuery, filterAction, filterRole, filterResource, timeRangeBounds]);

  const trendData = useMemo<LineChartPoint[]>(() => {
    if (filteredLogs.length === 0) return [];
    const dateMap = new Map<string, number>();

    let cursor: Date;
    let endDate: Date;
    if (timeRangeBounds.start && timeRangeBounds.end) {
      cursor = new Date(timeRangeBounds.start);
      endDate = new Date(timeRangeBounds.end);
    } else {
      const times = filteredLogs.map((l) => new Date(l.timestamp));
      cursor = new Date(Math.min(...times.map((t) => t.getTime())));
      endDate = new Date(Math.max(...times.map((t) => t.getTime())));
    }
    cursor.setHours(0, 0, 0, 0);
    endDate.setHours(0, 0, 0, 0);

    while (cursor <= endDate) {
      const key = `${cursor.getMonth() + 1}/${cursor.getDate()}`;
      dateMap.set(key, 0);
      cursor.setDate(cursor.getDate() + 1);
    }

    filteredLogs.forEach((log) => {
      const d = new Date(log.timestamp);
      const key = `${d.getMonth() + 1}/${d.getDate()}`;
      dateMap.set(key, (dateMap.get(key) || 0) + 1);
    });

    return Array.from(dateMap.entries())
      .sort(([a], [b]) => {
        const [ma, da] = a.split('/').map(Number);
        const [mb, db] = b.split('/').map(Number);
        return ma - mb || da - db;
      })
      .map(([label, value]) => ({ label, value }));
  }, [filteredLogs, timeRangeBounds]);

  const actionDistribution = useMemo<DonutChartItem[]>(() => {
    const countMap = new Map<AuditActionType, number>();
    filteredLogs.forEach((log) => {
      countMap.set(log.action, (countMap.get(log.action) || 0) + 1);
    });
    const entries = Array.from(countMap.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8);

    return entries.map(([action, count], i) => ({
      label: AUDIT_ACTION_LABELS[action] || action,
      value: count,
      color: CHART_COLORS[i % CHART_COLORS.length],
    }));
  }, [filteredLogs]);

  const verifyChainIntegrity = (): boolean => {
    for (let i = auditLogs.length - 1; i > 0; i--) {
      const current = auditLogs[i];
      const next = auditLogs[i - 1];
      if (current.transactionHash !== next.previousHash) {
        return false;
      }
    }
    return true;
  };

  const isChainValid = verifyChainIntegrity();

  const handleCopyHash = (hash: string) => {
    navigator.clipboard.writeText(hash);
    setCopiedHash(hash);
    setTimeout(() => setCopiedHash(null), 2000);
  };

  const handleCopyShareUrl = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopiedShareUrl(true);
    setTimeout(() => setCopiedShareUrl(false), 2000);
  };

  const handleResetFilters = () => {
    setSearchQuery('');
    setFilterAction('all');
    setFilterRole('all');
    setFilterResource('all');
    setTimePreset('30d');
    setCustomStart('');
    setCustomEnd('');
  };

  const handleExportReport = async () => {
    const trendSummary = trendData.reduce(
      (acc, d) => {
        acc.total += d.value;
        acc.max = Math.max(acc.max, d.value);
        acc.days = trendData.length;
        return acc;
      },
      { total: 0, max: 0, days: 0, avg: 0 }
    );
    trendSummary.avg = trendSummary.days > 0 ? Math.round(trendSummary.total / trendSummary.days) : 0;

    const svgs = chartContainerRef.current?.querySelectorAll('svg') || [];
    let lineChartPng = '';
    let donutChartPng = '';
    if (svgs[0]) lineChartPng = await renderSvgToPng(svgs[0] as SVGSVGElement, 600, 240);
    if (svgs[1]) donutChartPng = await renderSvgToPng(svgs[1] as SVGSVGElement, 200, 200);

    const workbook = new ExcelJS.Workbook();
    workbook.creator = '数字遗产平台';
    workbook.created = new Date();

    const ws1 = workbook.addWorksheet('报表摘要');
    ws1.getColumn(1).width = 22;
    ws1.getColumn(2).width = 42;
    const summaryRows = [
      ['项目', '值'],
      ['筛选结果总数', filteredLogs.length],
      ['统计天数', trendSummary.days],
      ['总操作次数', trendSummary.total],
      ['日均操作次数', trendSummary.avg],
      ['单日最高操作次数', trendSummary.max],
      ['时间范围', timePreset === 'all' ? '全部' : timePreset === 'custom' ? `${customStart || '-'} 至 ${customEnd || '-'}` : TIME_PRESETS.find((p) => p.value === timePreset)?.label || '-'],
      ['操作类型筛选', filterAction === 'all' ? '全部' : AUDIT_ACTION_LABELS[filterAction] || filterAction],
      ['用户角色筛选', filterRole === 'all' ? '全部' : USER_ROLE_LABELS[filterRole]],
      ['资源类型筛选', filterResource === 'all' ? '全部' : getResourceTypeLabel(filterResource)],
      ['关键词搜索', searchQuery || '-'],
      ['导出时间', new Date().toLocaleString('zh-CN')],
    ];
    summaryRows.forEach((row) => ws1.addRow(row));
    const headerRow1 = ws1.getRow(1);
    headerRow1.font = { bold: true, size: 12 };
    headerRow1.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE2E8F0' } };

    const ws2 = workbook.addWorksheet('操作频次趋势');
    ws2.getColumn(1).width = 16;
    ws2.getColumn(2).width = 16;
    ws2.addRow(['日期', '操作次数']);
    ws2.getRow(1).font = { bold: true, size: 11 };
    ws2.getRow(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE2E8F0' } };
    trendData.forEach((d) => ws2.addRow([d.label, d.value]));

    if (lineChartPng) {
      const lineImageId = workbook.addImage({ base64: lineChartPng, extension: 'png' });
      ws2.addImage(lineImageId, {
        tl: { col: 0, row: trendData.length + 3 },
        ext: { width: 720, height: 288 },
      });
    }

    const ws3 = workbook.addWorksheet('操作类型分布');
    ws3.getColumn(1).width = 22;
    ws3.getColumn(2).width = 12;
    ws3.getColumn(3).width = 12;
    ws3.addRow(['操作类型', '次数', '占比']);
    ws3.getRow(1).font = { bold: true, size: 11 };
    ws3.getRow(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE2E8F0' } };
    actionDistribution.forEach((d) => {
      ws3.addRow([d.label, d.value, `${((d.value / (filteredLogs.length || 1)) * 100).toFixed(1)}%`]);
    });

    if (donutChartPng) {
      const donutImageId = workbook.addImage({ base64: donutChartPng, extension: 'png' });
      ws3.addImage(donutImageId, {
        tl: { col: 0, row: actionDistribution.length + 3 },
        ext: { width: 300, height: 300 },
      });
    }

    const ws4 = workbook.addWorksheet('审计日志明细');
    const logHeaders = ['时间', '操作类型', '操作描述', '用户ID', '用户角色', '资源类型', '资源ID', 'IP地址', '交易哈希'];
    const logColWidths = [20, 16, 36, 14, 14, 14, 14, 16, 24];
    logColWidths.forEach((w, i) => (ws4.getColumn(i + 1).width = w));
    ws4.addRow(logHeaders);
    ws4.getRow(1).font = { bold: true, size: 11 };
    ws4.getRow(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE2E8F0' } };
    filteredLogs.forEach((log) => {
      ws4.addRow([
        formatDate(log.timestamp),
        AUDIT_ACTION_LABELS[log.action] || log.action,
        log.description,
        log.userId,
        USER_ROLE_LABELS[log.userRole],
        getResourceTypeLabel(log.resourceType),
        log.resourceId || '-',
        log.ipAddress || '-',
        log.transactionHash,
      ]);
    });

    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `审计日志报表_${new Date().toISOString().slice(0, 10)}.xlsx`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const getActionIcon = (action: AuditActionType) => {
    if (action.includes('healthcheck')) return Shield;
    if (action.includes('asset')) return FolderKanban;
    if (action.includes('heir')) return Users;
    if (action.includes('will')) return FileText;
    if (action.includes('mfa')) return Shield;
    if (action.includes('login') || action.includes('logout')) return User;
    if (action.includes('notification')) return Zap;
    return Zap;
  };

  const getActionColor = (action: AuditActionType) => {
    if (action.includes('deleted') || action.includes('removed') || action.includes('disabled')) {
      return 'bg-red-100 text-red-600';
    }
    if (action.includes('created') || action.includes('added') || action.includes('enabled') || action.includes('approved') || action.includes('verified')) {
      return 'bg-green-100 text-green-600';
    }
    if (action.includes('updated') || action.includes('triggered') || action.includes('reminder')) {
      return 'bg-amber-100 text-amber-600';
    }
    return 'bg-blue-100 text-blue-600';
  };

  const hasActiveFilters = (() => {
    if (searchQuery !== '') return true;
    if (filterAction !== 'all') return true;
    if (filterRole !== 'all') return true;
    if (filterResource !== 'all') return true;
    if (timePreset === 'custom') {
      if (customStart || customEnd) return true;
    }
    if (timePreset !== '30d' && timePreset !== 'custom') return true;
    return false;
  })();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">审计日志</h1>
          <p className="text-gray-500 mt-1">多维度筛选与趋势分析 · 不可篡改记录</p>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          <button
            onClick={handleCopyShareUrl}
            className={cn(
              'flex items-center gap-2 px-4 py-2 rounded-lg transition-colors border',
              copiedShareUrl
                ? 'bg-green-50 border-green-200 text-green-700'
                : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'
            )}
          >
            <Share2 className="w-4 h-4" />
            {copiedShareUrl ? '链接已复制' : '复制分享链接'}
          </button>
          <button
            onClick={handleExportReport}
            className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
          >
            <Download className="w-4 h-4" />
            导出报表
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
              <History className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{filteredLogs.length}</p>
              <p className="text-sm text-gray-500">筛选结果</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          <div className="flex items-center gap-3">
            <div className={cn(
              'w-12 h-12 rounded-xl flex items-center justify-center',
              isChainValid ? 'bg-green-100' : 'bg-red-100'
            )}>
              {isChainValid ? (
                <CheckCircle className="w-6 h-6 text-green-600" />
              ) : (
                <AlertTriangle className="w-6 h-6 text-red-600" />
              )}
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">
                {isChainValid ? '完整' : '异常'}
              </p>
              <p className="text-sm text-gray-500">区块链完整性</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-cyan-100 rounded-xl flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-cyan-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">
                {trendData.length > 0 ? trendData[trendData.length - 1].value : 0}
              </p>
              <p className="text-sm text-gray-500">今日操作</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
              <Shield className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">不可篡改</p>
              <p className="text-sm text-gray-500">哈希链式存储</p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
        <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-gray-500" />
            <h3 className="text-lg font-semibold text-gray-900">组合筛选器</h3>
          </div>
          {hasActiveFilters && (
            <button
              onClick={handleResetFilters}
              className="flex items-center gap-1 px-3 py-1.5 text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              重置筛选
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="搜索描述、哈希值..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <div>
            <select
              value={filterAction}
              onChange={(e) => setFilterAction(e.target.value as AuditActionType | 'all')}
              className="w-full px-3 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm bg-white"
            >
              <option value="all">全部操作类型</option>
              {Object.entries(AUDIT_ACTION_LABELS).map(([key, label]) => (
                <option key={key} value={key}>{label}</option>
              ))}
            </select>
          </div>

          <div>
            <select
              value={filterRole}
              onChange={(e) => setFilterRole(e.target.value as UserRole | 'all')}
              className="w-full px-3 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm bg-white"
            >
              <option value="all">全部用户角色</option>
              {Object.entries(USER_ROLE_LABELS).map(([key, label]) => (
                <option key={key} value={key}>{label}</option>
              ))}
            </select>
          </div>

          <div>
            <select
              value={filterResource}
              onChange={(e) => setFilterResource(e.target.value)}
              className="w-full px-3 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm bg-white"
            >
              <option value="all">全部资源类型</option>
              {resourceTypes.map((rt) => (
                <option key={rt} value={rt}>{getResourceTypeLabel(rt)}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="mt-4 flex items-center gap-3 flex-wrap">
          <Calendar className="w-4 h-4 text-gray-500" />
          <div className="flex flex-wrap items-center gap-2">
            {TIME_PRESETS.map((preset) => (
              <button
                key={preset.value}
                onClick={() => setTimePreset(preset.value)}
                className={cn(
                  'px-3 py-1.5 text-sm rounded-lg transition-colors',
                  timePreset === preset.value
                    ? 'bg-emerald-100 text-emerald-700 font-medium'
                    : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                )}
              >
                {preset.label}
              </button>
            ))}
          </div>
          {timePreset === 'custom' && (
            <div className="flex items-center gap-2 ml-2">
              <input
                type="date"
                value={customStart}
                onChange={(e) => setCustomStart(e.target.value)}
                className="px-3 py-1.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
              <span className="text-gray-400">至</span>
              <input
                type="date"
                value={customEnd}
                onChange={(e) => setCustomEnd(e.target.value)}
                className="px-3 py-1.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          )}
        </div>
      </div>

      <div ref={chartContainerRef} className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="w-5 h-5 text-cyan-500" />
            <h3 className="text-lg font-semibold text-gray-900">操作频次趋势</h3>
          </div>
          <LineChart data={trendData} color="#0ea5e9" height={240} />
        </div>

        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          <div className="flex items-center gap-2 mb-4">
            <PieChart className="w-5 h-5 text-purple-500" />
            <h3 className="text-lg font-semibold text-gray-900">操作类型占比</h3>
          </div>
          <div className="flex items-center justify-center py-2">
            <DonutChart
              data={actionDistribution}
              size={200}
              thickness={30}
              centerValue={filteredLogs.length}
              centerLabel="总操作数"
            />
          </div>
        </div>
      </div>

      <div className="bg-gradient-to-r from-slate-900 to-slate-800 rounded-2xl p-6 text-white">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center">
            <Shield className="w-8 h-8" />
          </div>
          <div className="flex-1">
            <h3 className="text-xl font-bold">区块链式审计日志</h3>
            <p className="text-slate-300 mt-1">
              每条操作记录都通过哈希算法与前一条记录链接，形成不可篡改的审计链。任何对历史记录的修改都会导致哈希验证失败。
            </p>
          </div>
          {isChainValid ? (
            <div className="flex items-center gap-2 px-4 py-2 bg-green-500/20 rounded-full">
              <CheckCircle className="w-5 h-5 text-green-400" />
              <span className="text-green-400 font-medium">链完整</span>
            </div>
          ) : (
            <div className="flex items-center gap-2 px-4 py-2 bg-red-500/20 rounded-full">
              <AlertTriangle className="w-5 h-5 text-red-400" />
              <span className="text-red-400 font-medium">已篡改</span>
            </div>
          )}
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">审计日志明细</h3>
          <span className="text-sm text-gray-500">共 {filteredLogs.length} 条记录</span>
        </div>
        {filteredLogs.length === 0 ? (
          <div className="p-12 text-center">
            <History className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">暂无符合条件的审计记录</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {filteredLogs.map((log: AuditLogEntry) => {
              const Icon = getActionIcon(log.action);
              const isExpanded = expandedId === log.id;
              return (
                <div key={log.id} className="hover:bg-gray-50 transition-colors">
                  <button
                    onClick={() => setExpandedId(isExpanded ? null : log.id)}
                    className="w-full p-4 text-left"
                  >
                    <div className="flex items-center gap-4">
                      <div className={cn('w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0', getActionColor(log.action))}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="font-medium text-gray-900">{log.description}</p>
                          <span className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded-full">
                            {AUDIT_ACTION_LABELS[log.action]}
                          </span>
                          {log.resourceType && (
                            <span className="px-2 py-0.5 bg-purple-50 text-purple-600 text-xs rounded-full">
                              {getResourceTypeLabel(log.resourceType)}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-4 mt-1 text-sm text-gray-500 flex-wrap">
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {formatDate(log.timestamp)}
                          </span>
                          <span className="flex items-center gap-1">
                            <User className="w-3 h-3" />
                            {USER_ROLE_LABELS[log.userRole]}
                          </span>
                          <span className="flex items-center gap-1 font-mono text-xs">
                            <Zap className="w-3 h-3 text-amber-500" />
                            {log.transactionHash.slice(0, 8)}
                          </span>
                        </div>
                      </div>
                      {isExpanded ? (
                        <ChevronUp className="w-5 h-5 text-gray-400 flex-shrink-0" />
                      ) : (
                        <ChevronDown className="w-5 h-5 text-gray-400 flex-shrink-0" />
                      )}
                    </div>
                  </button>

                  {isExpanded && (
                    <div className="px-4 pb-4">
                      <div className="ml-14 p-4 bg-gray-50 rounded-xl space-y-3">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <p className="text-xs text-gray-500 mb-1">用户ID</p>
                            <p className="text-sm font-mono text-gray-700">{log.userId}</p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500 mb-1">用户角色</p>
                            <p className="text-sm text-gray-700">{USER_ROLE_LABELS[log.userRole]}</p>
                          </div>
                          {log.resourceType && (
                            <div>
                              <p className="text-xs text-gray-500 mb-1">资源类型</p>
                              <p className="text-sm text-gray-700">{getResourceTypeLabel(log.resourceType)}</p>
                            </div>
                          )}
                          {log.resourceId && (
                            <div>
                              <p className="text-xs text-gray-500 mb-1">资源ID</p>
                              <p className="text-sm font-mono text-gray-700">{log.resourceId}</p>
                            </div>
                          )}
                        </div>

                        {log.ipAddress && (
                          <div>
                            <p className="text-xs text-gray-500 mb-1">IP地址</p>
                            <p className="text-sm font-mono text-gray-700">{log.ipAddress}</p>
                          </div>
                        )}

                        {log.userAgent && (
                          <div>
                            <p className="text-xs text-gray-500 mb-1">User Agent</p>
                            <p className="text-sm text-gray-700 break-all">{log.userAgent}</p>
                          </div>
                        )}

                        <div className="pt-2 border-t border-gray-200">
                          <div className="flex items-center justify-between mb-1">
                            <p className="text-xs text-gray-500">交易哈希</p>
                            <button
                              onClick={() => handleCopyHash(log.transactionHash)}
                              className="p-1 text-gray-400 hover:text-gray-600"
                            >
                              {copiedHash === log.transactionHash ? (
                                <CheckCircle className="w-3 h-3 text-green-500" />
                              ) : (
                                <Copy className="w-3 h-3" />
                              )}
                            </button>
                          </div>
                          <p className="text-xs font-mono text-emerald-600 break-all">
                            {log.transactionHash}
                          </p>
                        </div>

                        <div>
                          <p className="text-xs text-gray-500 mb-1">前一区块哈希</p>
                          <p className="text-xs font-mono text-gray-500 break-all">
                            {log.previousHash}
                          </p>
                        </div>

                        {log.previousValue && log.newValue && (
                          <div className="grid grid-cols-2 gap-4 pt-2 border-t border-gray-200">
                            <div>
                              <p className="text-xs text-gray-500 mb-1">变更前</p>
                              <p className="text-sm text-red-600 font-mono break-all">{log.previousValue}</p>
                            </div>
                            <div>
                              <p className="text-xs text-gray-500 mb-1">变更后</p>
                              <p className="text-sm text-green-600 font-mono break-all">{log.newValue}</p>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
