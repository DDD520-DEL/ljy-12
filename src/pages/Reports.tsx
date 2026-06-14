import { useState, useMemo, useEffect, useRef } from 'react';
import {
  PieChart as PieIcon,
  BarChart3,
  Network,
  X,
  User,
  Users,
  Scale,
  FolderKanban,
  ChevronRight,
  TrendingUp,
  FileText,
  Share2,
  Cloud,
  Wallet,
  Repeat,
  Mail,
  Folder,
  Tag,
} from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import {
  ASSET_TYPE_LABELS,
  RELATIONSHIP_LABELS,
} from '@/constants';
import { cn } from '@/lib/utils';
import type { AssetType, DigitalAsset, Heir, Witness } from '@/types';
import { Link } from 'react-router-dom';

const typeIcons: Record<AssetType, typeof Share2> = {
  social_media: Share2,
  cloud_storage: Cloud,
  crypto_wallet: Wallet,
  subscription: Repeat,
  email: Mail,
  other: Folder,
};

const typeColors: Record<AssetType, string> = {
  social_media: '#3B82F6',
  cloud_storage: '#06B6D4',
  crypto_wallet: '#F59E0B',
  subscription: '#8B5CF6',
  email: '#10B981',
  other: '#6B7280',
};

interface PieSlice {
  type: AssetType;
  label: string;
  value: number;
  totalValue: number;
  count: number;
  percentage: number;
  color: string;
  startAngle: number;
  endAngle: number;
}

interface BarItem {
  heirId: string;
  heirName: string;
  relationship: string;
  assetCount: number;
  assetValue: number;
  color: string;
}

type DrillDownType = 'pie' | 'bar' | 'network' | null;

interface DrillDownData {
  type: DrillDownType;
  title: string;
  assets?: DigitalAsset[];
  heir?: Heir;
  node?: NetworkNode;
}

type NodeKind = 'owner' | 'heir' | 'witness' | 'asset';

interface NetworkNode {
  id: string;
  kind: NodeKind;
  label: string;
  sublabel?: string;
  color: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  ref?: Heir | Witness | DigitalAsset;
  fixed?: boolean;
}

interface NetworkLink {
  source: string;
  target: string;
  kind: 'owner-heir' | 'owner-witness' | 'heir-asset' | 'witness-will';
}

const HEIR_COLORS = ['#10B981', '#3B82F6', '#F59E0B', '#8B5CF6', '#EC4899', '#14B8A6'];

function polarToCartesian(cx: number, cy: number, r: number, angleDeg: number) {
  const angleRad = ((angleDeg - 90) * Math.PI) / 180;
  return {
    x: cx + r * Math.cos(angleRad),
    y: cy + r * Math.sin(angleRad),
  };
}

function describeArc(cx: number, cy: number, r: number, startAngle: number, endAngle: number) {
  const start = polarToCartesian(cx, cy, r, endAngle);
  const end = polarToCartesian(cx, cy, r, startAngle);
  const largeArcFlag = endAngle - startAngle <= 180 ? '0' : '1';
  return [
    'M', cx, cy,
    'L', start.x, start.y,
    'A', r, r, 0, largeArcFlag, 0, end.x, end.y,
    'Z',
  ].join(' ');
}

export default function Reports() {
  const assets = useAppStore((state) => state.assets);
  const heirs = useAppStore((state) => state.heirs);
  const witnesses = useAppStore((state) => state.witnesses);
  const will = useAppStore((state) => state.will);
  const currentUser = useAppStore((state) => state.currentUser);

  const [drillDown, setDrillDown] = useState<DrillDownData | null>(null);
  const [hoveredPieSlice, setHoveredPieSlice] = useState<AssetType | null>(null);
  const [hoveredBarItem, setHoveredBarItem] = useState<string | null>(null);
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);

  const svgRef = useRef<SVGSVGElement>(null);
  const animFrameRef = useRef<number | null>(null);
  const nodesRef = useRef<NetworkNode[]>([]);
  const [, setTick] = useState(0);

  const totalAssetValue = useMemo(
    () => assets.reduce((sum, a) => sum + (a.value || 0), 0),
    [assets]
  );

  const pieData: PieSlice[] = useMemo(() => {
    const groups = new Map<AssetType, { count: number; value: number }>();
    assets.forEach((a) => {
      const cur = groups.get(a.type) || { count: 0, value: 0 };
      cur.count += 1;
      cur.value += a.value || 0;
      groups.set(a.type, cur);
    });

    const totalValue = Array.from(groups.values()).reduce((s, g) => s + g.value, 0) || 1;
    const totalCount = assets.length || 1;

    let cumulativeAngle = 0;
    return Array.from(groups.entries()).map(([type, data]) => {
      const percentage = (data.count / totalCount) * 100;
      const angleSpan = (data.count / totalCount) * 360;
      const slice: PieSlice = {
        type,
        label: ASSET_TYPE_LABELS[type],
        value: data.value,
        totalValue,
        count: data.count,
        percentage,
        color: typeColors[type],
        startAngle: cumulativeAngle,
        endAngle: cumulativeAngle + angleSpan,
      };
      cumulativeAngle += angleSpan;
      return slice;
    }).sort((a, b) => b.count - a.count);
  }, [assets]);

  const barData: BarItem[] = useMemo(() => {
    return heirs.map((heir, idx) => {
      const heirAssets = assets.filter((a) => a.heirChain.includes(heir.id));
      const assetCount = heirAssets.filter((a) => a.heirChain[0] === heir.id).length;
      const assetValue = heirAssets
        .filter((a) => a.heirChain[0] === heir.id)
        .reduce((s, a) => s + (a.value || 0), 0);
      return {
        heirId: heir.id,
        heirName: heir.name,
        relationship: RELATIONSHIP_LABELS[heir.relationship],
        assetCount,
        assetValue,
        color: HEIR_COLORS[idx % HEIR_COLORS.length],
      };
    }).sort((a, b) => b.assetCount - a.assetCount);
  }, [heirs, assets]);

  const unassignedAssets = useMemo(
    () => assets.filter((a) => a.heirChain.length === 0),
    [assets]
  );

  const maxBarCount = useMemo(
    () => Math.max(...barData.map((b) => b.assetCount), 1),
    [barData]
  );

  const initialNetworkData = useMemo(() => {
    const nodes: NetworkNode[] = [];
    const links: NetworkLink[] = [];
    const ownerId = 'owner';

    nodes.push({
      id: ownerId,
      kind: 'owner',
      label: currentUser?.name || '资产所有人',
      sublabel: 'Owner',
      color: '#059669',
      x: 0,
      y: 0,
      vx: 0,
      vy: 0,
      fixed: true,
    });

    heirs.forEach((heir, idx) => {
      const angle = (idx / Math.max(heirs.length, 1)) * Math.PI * 2 - Math.PI / 2;
      nodes.push({
        id: `heir-${heir.id}`,
        kind: 'heir',
        label: heir.name,
        sublabel: RELATIONSHIP_LABELS[heir.relationship],
        color: HEIR_COLORS[idx % HEIR_COLORS.length],
        x: Math.cos(angle) * 150,
        y: Math.sin(angle) * 150 - 30,
        vx: 0,
        vy: 0,
        ref: heir,
      });
      links.push({ source: ownerId, target: `heir-${heir.id}`, kind: 'owner-heir' });
    });

    witnesses.forEach((wit, idx) => {
      const angle = ((idx + 0.5) / Math.max(witnesses.length, 1)) * Math.PI * 2 + Math.PI / 2;
      nodes.push({
        id: `wit-${wit.id}`,
        kind: 'witness',
        label: wit.name,
        sublabel: wit.isLawyer ? '律师' : '见证人',
        color: wit.isLawyer ? '#7C3AED' : '#0891B2',
        x: Math.cos(angle) * 180,
        y: Math.sin(angle) * 180 + 60,
        vx: 0,
        vy: 0,
        ref: wit,
      });
      links.push({ source: ownerId, target: `wit-${wit.id}`, kind: 'owner-witness' });
    });

    assets.forEach((asset, idx) => {
      if (asset.heirChain.length > 0) {
        const angle = (idx / Math.max(assets.length, 1)) * Math.PI * 2;
        nodes.push({
          id: `asset-${asset.id}`,
          kind: 'asset',
          label: asset.name,
          sublabel: ASSET_TYPE_LABELS[asset.type],
          color: typeColors[asset.type],
          x: Math.cos(angle) * 260,
          y: Math.sin(angle) * 260,
          vx: 0,
          vy: 0,
          ref: asset,
        });
        asset.heirChain.slice(0, 1).forEach((heirId) => {
          links.push({ source: `heir-${heirId}`, target: `asset-${asset.id}`, kind: 'heir-asset' });
        });
      }
    });

    return { nodes, links };
  }, [currentUser, heirs, witnesses, assets]);

  useEffect(() => {
    nodesRef.current = initialNetworkData.nodes.map((n) => ({ ...n }));
    const nodes = nodesRef.current;
    const links = initialNetworkData.links;
    const linkPairs = links.map((l) => ({
      s: nodes.findIndex((n) => n.id === l.source),
      t: nodes.findIndex((n) => n.id === l.target),
      kind: l.kind,
    })).filter((l) => l.s !== -1 && l.t !== -1);

    const step = () => {
      const width = 520;
      const height = 420;
      const cx = width / 2;
      const cy = height / 2;

      for (let i = 0; i < nodes.length; i++) {
        if (nodes[i].fixed) continue;
        nodes[i].vx += (cx - nodes[i].x) * 0.0005;
        nodes[i].vy += (cy - nodes[i].y) * 0.0005;
        for (let j = 0; j < nodes.length; j++) {
          if (i === j) continue;
          const dx = nodes[i].x - nodes[j].x;
          const dy = nodes[i].y - nodes[j].y;
          const dist2 = dx * dx + dy * dy + 0.01;
          const force = 1200 / dist2;
          nodes[i].vx += (dx / Math.sqrt(dist2)) * force;
          nodes[i].vy += (dy / Math.sqrt(dist2)) * force;
        }
      }

      linkPairs.forEach(({ s, t }) => {
        const dx = nodes[t].x - nodes[s].x;
        const dy = nodes[t].y - nodes[s].y;
        const dist = Math.sqrt(dx * dx + dy * dy) + 0.01;
        const target = 110;
        const force = (dist - target) * 0.008;
        const fx = (dx / dist) * force;
        const fy = (dy / dist) * force;
        if (!nodes[s].fixed) { nodes[s].vx += fx; nodes[s].vy += fy; }
        if (!nodes[t].fixed) { nodes[t].vx -= fx; nodes[t].vy -= fy; }
      });

      for (let i = 0; i < nodes.length; i++) {
        if (nodes[i].fixed) continue;
        nodes[i].vx *= 0.85;
        nodes[i].vy *= 0.85;
        nodes[i].x += nodes[i].vx;
        nodes[i].y += nodes[i].vy;
        const pad = 40;
        nodes[i].x = Math.max(pad, Math.min(width - pad, nodes[i].x));
        nodes[i].y = Math.max(pad, Math.min(height - pad, nodes[i].y));
      }

      setTick((t) => t + 1);
      animFrameRef.current = requestAnimationFrame(step);
    };

    animFrameRef.current = requestAnimationFrame(step);
    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [initialNetworkData]);

  const nodes = nodesRef.current;
  const links = initialNetworkData.links;

  const handlePieClick = (slice: PieSlice) => {
    const filtered = assets.filter((a) => a.type === slice.type);
    setDrillDown({
      type: 'pie',
      title: `${slice.label} - 资产明细`,
      assets: filtered,
    });
  };

  const handleBarClick = (item: BarItem) => {
    const heir = heirs.find((h) => h.id === item.heirId);
    const filtered = assets.filter((a) => a.heirChain[0] === item.heirId);
    setDrillDown({
      type: 'bar',
      title: `${item.heirName}（${item.relationship}）- 继承资产`,
      assets: filtered,
      heir,
    });
  };

  const handleNodeClick = (node: NetworkNode) => {
    if (node.kind === 'asset' && node.ref) {
      setDrillDown({
        type: 'network',
        title: `资产详情 - ${node.label}`,
        assets: [node.ref as DigitalAsset],
        node,
      });
    } else if (node.kind === 'heir' && node.ref) {
      const heir = node.ref as Heir;
      const filtered = assets.filter((a) => a.heirChain.includes(heir.id));
      setDrillDown({
        type: 'network',
        title: `继承人 - ${heir.name}`,
        assets: filtered,
        heir,
        node,
      });
    } else if (node.kind === 'witness' && node.ref) {
      setDrillDown({
        type: 'network',
        title: `见证人 - ${node.label}`,
        node,
      });
    } else if (node.kind === 'owner') {
      setDrillDown({
        type: 'network',
        title: `${currentUser?.name} - 资产所有人`,
        assets,
        node,
      });
    }
  };

  const statCards = [
    {
      title: '资产类型',
      value: pieData.length,
      icon: Tag,
      color: 'from-blue-500 to-cyan-500',
      subtitle: '种不同分类',
    },
    {
      title: '继承关系',
      value: barData.reduce((s, b) => s + (b.assetCount > 0 ? 1 : 0), 0),
      icon: Users,
      color: 'from-emerald-500 to-teal-500',
      subtitle: '位继承人已分配资产',
    },
    {
      title: '关联网络',
      value: nodes.length,
      icon: Network,
      color: 'from-purple-500 to-pink-500',
      subtitle: `个节点 / ${links.length} 条连线`,
    },
    {
      title: '资产估值',
      value: `¥${totalAssetValue.toLocaleString()}`,
      icon: TrendingUp,
      color: 'from-amber-500 to-orange-500',
      subtitle: '总资产价值',
    },
  ];

  const getNodeRadius = (kind: NodeKind) => {
    switch (kind) {
      case 'owner': return 34;
      case 'heir': return 26;
      case 'witness': return 24;
      case 'asset': return 20;
    }
  };

  const getNodeIcon = (kind: NodeKind) => {
    switch (kind) {
      case 'owner': return <User className="w-5 h-5 text-white" />;
      case 'heir': return <Users className="w-4 h-4 text-white" />;
      case 'witness': return <Scale className="w-4 h-4 text-white" />;
      case 'asset': return <FolderKanban className="w-3.5 h-3.5 text-white" />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">资产分布与继承关系报表</h1>
          <p className="text-gray-500 mt-1">可视化分析资产分布、继承结构与关联网络</p>
        </div>
        {will && (
          <div className="text-sm text-gray-500">
            <FileText className="w-4 h-4 inline mr-1" />
            关联遗嘱：{will.title}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((card, idx) => {
          const Icon = card.icon;
          return (
            <div key={idx} className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
              <div className="flex items-start justify-between">
                <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${card.color} flex items-center justify-center`}>
                  <Icon className="w-5 h-5 text-white" />
                </div>
              </div>
              <div className="mt-3">
                <div className="text-2xl font-bold text-gray-900">{card.value}</div>
                <div className="text-sm font-medium text-gray-600 mt-1">{card.title}</div>
                <div className="text-xs text-gray-400 mt-1">{card.subtitle}</div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-lg bg-blue-100 flex items-center justify-center">
                <PieIcon className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-900">资产类型分布</h2>
                <p className="text-xs text-gray-500">点击扇区查看该类型资产明细</p>
              </div>
            </div>
          </div>

          {pieData.length === 0 ? (
            <div className="h-72 flex items-center justify-center text-gray-400">
              暂无资产数据
            </div>
          ) : (
            <div className="flex flex-col md:flex-row items-center gap-6">
              <div className="relative shrink-0">
                <svg width="260" height="260" viewBox="0 0 260 260">
                  {pieData.map((slice) => {
                    const isHovered = hoveredPieSlice === slice.type;
                    const midAngle = (slice.startAngle + slice.endAngle) / 2;
                    const offset = isHovered ? 10 : 0;
                    const offsetX = Math.cos((midAngle - 90) * Math.PI / 180) * offset;
                    const offsetY = Math.sin((midAngle - 90) * Math.PI / 180) * offset;
                    return (
                      <g key={slice.type} transform={`translate(${offsetX}, ${offsetY})`}>
                        <path
                          d={describeArc(130, 130, 100, slice.startAngle, slice.endAngle)}
                          fill={slice.color}
                          stroke="white"
                          strokeWidth="3"
                          className="cursor-pointer transition-all duration-200"
                          style={{
                            filter: isHovered ? 'brightness(1.1) drop-shadow(0 4px 12px rgba(0,0,0,0.15))' : 'none',
                          }}
                          onMouseEnter={() => setHoveredPieSlice(slice.type)}
                          onMouseLeave={() => setHoveredPieSlice(null)}
                          onClick={() => handlePieClick(slice)}
                        />
                      </g>
                    );
                  })}
                  <circle cx="130" cy="130" r="58" fill="white" />
                  <text x="130" y="122" textAnchor="middle" className="fill-gray-500 text-xs">
                    资产总数
                  </text>
                  <text x="130" y="148" textAnchor="middle" className="fill-gray-900 font-bold text-2xl">
                    {assets.length}
                  </text>
                </svg>
                {hoveredPieSlice && (
                  <div className="absolute top-2 right-2 bg-gray-900 text-white text-xs rounded-lg px-3 py-2 shadow-lg">
                    {pieData.find((s) => s.type === hoveredPieSlice)?.label}
                    <div className="font-bold text-sm mt-0.5">
                      {pieData.find((s) => s.type === hoveredPieSlice)?.count} 项
                      （{pieData.find((s) => s.type === hoveredPieSlice)?.percentage.toFixed(1)}%）
                    </div>
                  </div>
                )}
              </div>

              <div className="flex-1 w-full space-y-2">
                {pieData.map((slice) => {
                  const isHovered = hoveredPieSlice === slice.type;
                  return (
                    <button
                      key={slice.type}
                      onMouseEnter={() => setHoveredPieSlice(slice.type)}
                      onMouseLeave={() => setHoveredPieSlice(null)}
                      onClick={() => handlePieClick(slice)}
                      className={cn(
                        'w-full flex items-center justify-between px-3 py-2.5 rounded-lg transition-all text-left',
                        isHovered ? 'bg-gray-50 ring-1 ring-gray-200' : 'hover:bg-gray-50'
                      )}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className="w-3.5 h-3.5 rounded-sm shrink-0"
                          style={{ backgroundColor: slice.color }}
                        />
                        <div>
                          <div className="text-sm font-medium text-gray-900">{slice.label}</div>
                          <div className="text-xs text-gray-400">
                            {slice.value > 0 ? `¥${slice.value.toLocaleString()}` : '无价资产'}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-semibold text-gray-900">{slice.count} 项</div>
                        <div className="text-xs text-gray-400">{slice.percentage.toFixed(1)}%</div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-lg bg-emerald-100 flex items-center justify-center">
                <BarChart3 className="w-5 h-5 text-emerald-600" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-900">继承人资产分布</h2>
                <p className="text-xs text-gray-500">按第一顺位继承统计，点击查看详情</p>
              </div>
            </div>
          </div>

          {barData.length === 0 ? (
            <div className="h-72 flex items-center justify-center text-gray-400">
              暂无继承人数据
            </div>
          ) : (
            <div className="space-y-4">
              <div className="space-y-3">
                {barData.map((item) => {
                  const isHovered = hoveredBarItem === item.heirId;
                  const widthPercent = (item.assetCount / maxBarCount) * 100;
                  return (
                    <button
                      key={item.heirId}
                      onMouseEnter={() => setHoveredBarItem(item.heirId)}
                      onMouseLeave={() => setHoveredBarItem(null)}
                      onClick={() => handleBarClick(item)}
                      className={cn(
                        'w-full text-left p-3 rounded-xl transition-all',
                        isHovered ? 'bg-gray-50' : 'hover:bg-gray-50'
                      )}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <div
                            className="w-7 h-7 rounded-full flex items-center justify-center shrink-0"
                            style={{ backgroundColor: item.color + '22' }}
                          >
                            <User className="w-3.5 h-3.5" style={{ color: item.color }} />
                          </div>
                          <div>
                            <div className="text-sm font-semibold text-gray-900">{item.heirName}</div>
                            <div className="text-xs text-gray-400">{item.relationship}</div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-bold text-gray-900">{item.assetCount} 项</div>
                          <div className="text-xs text-emerald-600 font-medium">
                            {item.assetValue > 0 ? `¥${item.assetValue.toLocaleString()}` : ''}
                          </div>
                        </div>
                      </div>
                      <div className="h-7 bg-gray-100 rounded-lg overflow-hidden relative">
                        <div
                          className="h-full rounded-lg transition-all duration-500 flex items-center justify-end pr-2"
                          style={{
                            width: `${Math.max(widthPercent, item.assetCount > 0 ? 8 : 0)}%`,
                            backgroundColor: item.color,
                            minWidth: item.assetCount > 0 ? '40px' : '0',
                          }}
                        >
                          {item.assetCount > 0 && (
                            <span className="text-white text-xs font-bold">{item.assetCount}</span>
                          )}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>

              {unassignedAssets.length > 0 && (
                <div className="pt-3 border-t border-gray-100">
                  <button
                    onClick={() => setDrillDown({
                      type: 'bar',
                      title: '未分配继承人的资产',
                      assets: unassignedAssets,
                    })}
                    className="w-full flex items-center justify-between px-3 py-2.5 rounded-lg bg-amber-50 hover:bg-amber-100 transition-colors text-left"
                  >
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-amber-200 flex items-center justify-center shrink-0">
                        <Tag className="w-3.5 h-3.5 text-amber-700" />
                      </div>
                      <div>
                        <div className="text-sm font-semibold text-amber-900">未分配资产</div>
                        <div className="text-xs text-amber-600">尚未指定继承人</div>
                      </div>
                    </div>
                    <div className="text-sm font-bold text-amber-800">
                      {unassignedAssets.length} 项
                    </div>
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-5">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-lg bg-purple-100 flex items-center justify-center">
              <Network className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">关联网络图谱</h2>
              <p className="text-xs text-gray-500">用户、继承人、见证人、资产之间的继承关系网络 · 点击节点查看详情</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-3 text-xs">
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-full bg-emerald-600" />
              <span className="text-gray-600">所有人</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-full bg-emerald-500" />
              <span className="text-gray-600">继承人</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-full bg-violet-600" />
              <span className="text-gray-600">律师</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-full bg-cyan-600" />
              <span className="text-gray-600">见证人</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-full bg-blue-500" />
              <span className="text-gray-600">资产</span>
            </div>
          </div>
        </div>

        <div className="relative bg-gradient-to-br from-slate-50 via-blue-50/30 to-emerald-50/30 rounded-xl border border-gray-100 overflow-hidden">
          <svg ref={svgRef} viewBox="0 0 520 420" className="w-full" style={{ minHeight: '420px', maxHeight: '520px' }}>
            <defs>
              {links.map((link, idx) => {
                const source = nodes.find((n) => n.id === link.source);
                const target = nodes.find((n) => n.id === link.target);
                if (!source || !target) return null;
                return (
                  <linearGradient
                    key={`grad-${idx}`}
                    id={`link-grad-${idx}`}
                    x1={source.x} y1={source.y}
                    x2={target.x} y2={target.y}
                    gradientUnits="userSpaceOnUse"
                  >
                    <stop offset="0%" stopColor={source.color} stopOpacity="0.6" />
                    <stop offset="100%" stopColor={target.color} stopOpacity="0.6" />
                  </linearGradient>
                );
              })}
            </defs>

            {links.map((link, idx) => {
              const source = nodes.find((n) => n.id === link.source);
              const target = nodes.find((n) => n.id === link.target);
              if (!source || !target) return null;
              const isHovered = hoveredNode === source.id || hoveredNode === target.id;
              return (
                <line
                  key={`link-${idx}`}
                  x1={source.x}
                  y1={source.y}
                  x2={target.x}
                  y2={target.y}
                  stroke={`url(#link-grad-${idx})`}
                  strokeWidth={isHovered ? 3 : 2}
                  opacity={hoveredNode ? (isHovered ? 1 : 0.15) : 0.75}
                  className="transition-all duration-200"
                />
              );
            })}

            {nodes.map((node) => {
              const isHovered = hoveredNode === node.id;
              const r = getNodeRadius(node.kind);
              const opacity = hoveredNode ? (isHovered ? 1 : 0.3) : 1;
              return (
                <g
                  key={node.id}
                  className="cursor-pointer"
                  onMouseEnter={() => setHoveredNode(node.id)}
                  onMouseLeave={() => setHoveredNode(null)}
                  onClick={() => handleNodeClick(node)}
                  style={{ opacity }}
                >
                  {isHovered && (
                    <circle
                      cx={node.x}
                      cy={node.y}
                      r={r + 8}
                      fill={node.color}
                      opacity="0.18"
                    />
                  )}
                  <circle
                    cx={node.x}
                    cy={node.y}
                    r={r}
                    fill={node.color}
                    stroke="white"
                    strokeWidth={node.kind === 'owner' ? 4 : 3}
                    className="transition-all duration-200"
                    style={{
                      filter: isHovered ? 'drop-shadow(0 6px 16px rgba(0,0,0,0.2))' : 'drop-shadow(0 2px 6px rgba(0,0,0,0.08))',
                    }}
                  />
                  <foreignObject
                    x={node.x - r / 2}
                    y={node.y - r / 2}
                    width={r}
                    height={r}
                  >
                    <div className="w-full h-full flex items-center justify-center">
                      {getNodeIcon(node.kind)}
                    </div>
                  </foreignObject>
                  <text
                    x={node.x}
                    y={node.y + r + 14}
                    textAnchor="middle"
                    className="fill-gray-800 text-[11px] font-semibold pointer-events-none"
                  >
                    {node.label.length > 6 ? node.label.slice(0, 6) + '…' : node.label}
                  </text>
                  {node.sublabel && (
                    <text
                      x={node.x}
                      y={node.y + r + 26}
                      textAnchor="middle"
                      className="fill-gray-400 text-[9px] pointer-events-none"
                    >
                      {node.sublabel}
                    </text>
                  )}
                </g>
              );
            })}
          </svg>

          {hoveredNode && (() => {
            const node = nodes.find((n) => n.id === hoveredNode);
            if (!node) return null;
            const connectedLinks = links.filter(
              (l) => l.source === node.id || l.target === node.id
            );
            return (
              <div className="absolute top-4 left-4 bg-white rounded-xl shadow-lg border border-gray-200 px-4 py-3 max-w-xs">
                <div className="flex items-center gap-2 mb-1">
                  <div
                    className="w-6 h-6 rounded-full flex items-center justify-center"
                    style={{ backgroundColor: node.color }}
                  >
                    <div className="scale-75">{getNodeIcon(node.kind)}</div>
                  </div>
                  <span className="font-semibold text-gray-900 text-sm">{node.label}</span>
                </div>
                {node.sublabel && (
                  <div className="text-xs text-gray-500 mb-2 ml-8">{node.sublabel}</div>
                )}
                <div className="text-xs text-gray-600 ml-8 border-t border-gray-100 pt-2">
                  {connectedLinks.length} 条关联关系
                </div>
              </div>
            );
          })()}
        </div>
      </div>

      {drillDown && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-3xl max-h-[85vh] overflow-hidden shadow-2xl flex flex-col">
            <div className="flex items-center justify-between p-5 border-b border-gray-100 bg-gradient-to-r from-slate-50 to-emerald-50">
              <div>
                <h3 className="text-xl font-bold text-gray-900">{drillDown.title}</h3>
                {drillDown.assets && (
                  <p className="text-sm text-gray-500 mt-0.5">共 {drillDown.assets.length} 项资产</p>
                )}
              </div>
              <button
                onClick={() => setDrillDown(null)}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-white rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 overflow-y-auto flex-1">
              {drillDown.heir && (
                <div className="mb-5 p-4 bg-emerald-50 rounded-xl border border-emerald-100">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-emerald-500 flex items-center justify-center">
                      <User className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <div className="font-semibold text-gray-900 text-lg">{drillDown.heir.name}</div>
                      <div className="text-sm text-gray-500 mt-0.5">
                        {RELATIONSHIP_LABELS[drillDown.heir.relationship]} · {drillDown.heir.email}
                        {drillDown.heir.phone && ` · ${drillDown.heir.phone}`}
                      </div>
                    </div>
                    <div className={cn(
                      'px-3 py-1.5 rounded-full text-xs font-medium',
                      drillDown.heir.isVerified
                        ? 'bg-emerald-200 text-emerald-800'
                        : 'bg-amber-200 text-amber-800'
                    )}>
                      {drillDown.heir.isVerified ? '已验证' : '待验证'}
                    </div>
                    <Link
                      to="/heirs"
                      className="text-sm text-emerald-600 hover:text-emerald-700 inline-flex items-center gap-1 font-medium ml-2"
                    >
                      管理 <ChevronRight className="w-4 h-4" />
                    </Link>
                  </div>
                </div>
              )}

              {drillDown.node && drillDown.node.kind === 'witness' && drillDown.node.ref && (() => {
                const wit = drillDown.node.ref as Witness;
                return (
                  <div className="mb-5 p-4 bg-violet-50 rounded-xl border border-violet-100">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-full bg-violet-600 flex items-center justify-center">
                        <Scale className="w-6 h-6 text-white" />
                      </div>
                      <div className="flex-1">
                        <div className="font-semibold text-gray-900 text-lg">{wit.name}</div>
                        <div className="text-sm text-gray-500 mt-0.5">
                          {wit.isLawyer ? (
                            <>律师 · {wit.firmName} {wit.barNumber && `· 执业证号 ${wit.barNumber}`}</>
                          ) : (
                            <>见证人 · {wit.email}</>
                          )}
                        </div>
                      </div>
                      <Link
                        to="/witnesses"
                        className="text-sm text-violet-600 hover:text-violet-700 inline-flex items-center gap-1 font-medium ml-2"
                      >
                        管理 <ChevronRight className="w-4 h-4" />
                      </Link>
                    </div>
                  </div>
                );
              })()}

              {drillDown.assets && drillDown.assets.length > 0 ? (
                <div className="space-y-3">
                  {drillDown.assets.map((asset) => {
                    const Icon = typeIcons[asset.type];
                    return (
                      <div
                        key={asset.id}
                        className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors border border-gray-100"
                      >
                        <div
                          className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0"
                          style={{ backgroundColor: typeColors[asset.type] + '22' }}
                        >
                          <Icon className="w-6 h-6" style={{ color: typeColors[asset.type] }} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-semibold text-gray-900">{asset.name}</span>
                            <span className="text-xs px-2 py-0.5 rounded-full bg-white border border-gray-200 text-gray-600">
                              {ASSET_TYPE_LABELS[asset.type]}
                            </span>
                            {asset.value !== undefined && asset.value > 0 && (
                              <span className="text-sm font-semibold text-emerald-600 ml-auto">
                                ¥{asset.value.toLocaleString()}
                              </span>
                            )}
                          </div>
                          {asset.username && (
                            <div className="text-xs text-gray-500 mb-1">账号：{asset.username}</div>
                          )}
                          {asset.description && (
                            <div className="text-xs text-gray-500 line-clamp-1">{asset.description}</div>
                          )}
                          {asset.heirChain.length > 0 && (
                            <div className="flex items-center gap-1 mt-2 flex-wrap">
                              <span className="text-[10px] text-gray-400">继承链：</span>
                              {asset.heirChain.map((hid, idx) => {
                                const h = heirs.find((x) => x.id === hid);
                                return h ? (
                                  <span
                                    key={hid}
                                    className={cn(
                                      'text-[11px] px-1.5 py-0.5 rounded',
                                      idx === 0
                                        ? 'bg-emerald-100 text-emerald-700 font-medium'
                                        : 'bg-gray-200 text-gray-600'
                                    )}
                                  >
                                    {idx === 0 ? '①' : `②${idx}`} {h.name}
                                  </span>
                                ) : null;
                              })}
                            </div>
                          )}
                        </div>
                        <Link
                          to="/assets"
                          className="text-xs text-gray-500 hover:text-gray-700 shrink-0 inline-flex items-center gap-1"
                        >
                          查看 <ChevronRight className="w-3 h-3" />
                        </Link>
                      </div>
                    );
                  })}
                </div>
              ) : drillDown.assets ? (
                <div className="text-center py-12 text-gray-400">
                  <FolderKanban className="w-12 h-12 mx-auto mb-3 opacity-40" />
                  <p>暂无资产数据</p>
                </div>
              ) : drillDown.node?.kind === 'witness' ? (
                <div className="text-center py-12 text-gray-400">
                  <Scale className="w-12 h-12 mx-auto mb-3 opacity-40" />
                  <p>见证人信息卡片已展示</p>
                  <Link
                    to="/will"
                    className="text-sm text-emerald-600 hover:text-emerald-700 inline-flex items-center gap-1 mt-3"
                  >
                    查看遗嘱配置 <ChevronRight className="w-4 h-4" />
                  </Link>
                </div>
              ) : null}
            </div>

            <div className="p-4 border-t border-gray-100 bg-gray-50 flex items-center justify-end gap-2">
              <button
                onClick={() => setDrillDown(null)}
                className="px-5 py-2 bg-white border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium"
              >
                关闭
              </button>
              {drillDown.type === 'pie' && (
                <Link
                  to="/assets"
                  className="px-5 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium inline-flex items-center gap-1.5"
                >
                  <FolderKanban className="w-4 h-4" /> 跳转到资产管理
                </Link>
              )}
              {(drillDown.type === 'bar' || drillDown.heir) && (
                <Link
                  to="/heirs"
                  className="px-5 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors text-sm font-medium inline-flex items-center gap-1.5"
                >
                  <Users className="w-4 h-4" /> 跳转到继承人管理
                </Link>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
